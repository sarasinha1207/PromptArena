"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { fetchSession, resetSession } from "@/lib/api/arena";
import { streamPost } from "@/lib/sse/postStream";
import { abortStream, registerStream, releaseStream } from "@/lib/sse/streamRegistry";
import { walletStore } from "@/stores/walletStore";
import type { SessionPayload, StoredMessage } from "@/types/arena";

export type ChatRole = "bot" | "user" | "guardrail" | "notice";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  /** Extra line under a guardrail alert, e.g. the scanner's reason. */
  detail?: string;
  streaming?: boolean;
  interrupted?: boolean;
}

/** Text of the alert shown where the scanner cut a reply (handbook §6.2). */
export const GUARDRAIL_TEXT = "Output secret detected. Output blocked by automated security scanner.";

let sequence = 0;
const nextId = () => `c${++sequence}`;

function fromStored(messages: StoredMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const message of messages) {
    if (message.sender === "USER") {
      out.push({ id: nextId(), role: "user", text: message.content });
      continue;
    }
    if (message.content) out.push({ id: nextId(), role: "bot", text: message.content });
    if (message.guardrail_tripped) {
      out.push({
        id: nextId(),
        role: "guardrail",
        text: GUARDRAIL_TEXT,
        detail: message.guardrail_reason ?? undefined,
      });
    }
  }
  return out;
}

const messageOf = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

/**
 * One team's chat with a level's persona: loads the session history, streams
 * replies word by word, and handles guardrail alerts, token telemetry, session
 * reset and the 402 Token Quota Exceeded error (handbook §6.2, §6.3, §13.3).
 */
export function useChat(levelId: string) {
  const streamId = `attack:${levelId}`;

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  const tokenBuffer = useRef("");
  const botId = useRef<string | null>(null);
  const frame = useRef(0);

  const apply = useCallback((session: SessionPayload) => {
    setSessionId(session.session_id);
    setMessages(fromStored(session.messages));
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      apply(await fetchSession(levelId));
      setStatus("ready");
    } catch (err) {
      setError(messageOf(err, "Could not open the chat. Try again."));
      setStatus("error");
    }
  }, [levelId, apply]);

  useEffect(() => {
    void load();
    return () => {
      abortStream(streamId);
      cancelAnimationFrame(frame.current);
    };
  }, [load, streamId]);

  /** Writes buffered tokens into the bot message. Tokens are batched once per frame. */
  const flush = useCallback(() => {
    frame.current = 0;
    const chunk = tokenBuffer.current;
    const id = botId.current;
    if (!chunk || !id) return;
    tokenBuffer.current = "";
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m)));
  }, []);

  const flushNow = useCallback(() => {
    cancelAnimationFrame(frame.current);
    flush();
  }, [flush]);

  const queueToken = useCallback(
    (token: string) => {
      tokenBuffer.current += token;
      if (!frame.current) frame.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  const send = useCallback(
    async (prompt: string) => {
      if (!sessionId || streaming) return;

      const replyId = nextId();
      botId.current = replyId;
      tokenBuffer.current = "";
      setMessages((list) => [
        ...list,
        { id: nextId(), role: "user", text: prompt },
        { id: replyId, role: "bot", text: "", streaming: true },
      ]);
      setStreaming(true);

      const controller = registerStream(streamId);
      const startedAt = performance.now();
      let gotToken = false;
      let interrupted = false;

      try {
        await streamPost(
          `/api/arena/levels/${levelId}/attack`,
          { session_id: sessionId, prompt },
          {
            signal: controller.signal,
            onEvent: (event) => {
              if (event.event === "token" && typeof event.data === "string") {
                if (!gotToken) {
                  gotToken = true;
                  setLatencyMs(Math.round(performance.now() - startedAt));
                }
                queueToken(event.data);
              } else if (event.event === "guardrail_block") {
                flushNow();
                setMessages((list) => [
                  ...list,
                  { id: nextId(), role: "guardrail", text: GUARDRAIL_TEXT, detail: event.data },
                ]);
              } else if (event.event === "telemetry" && typeof event.tokens_consumed === "number") {
                const spent = event.tokens_consumed;
                walletStore.setState((wallet) => ({ used: wallet.used + spent }));
              }
            },
          },
        );
      } catch (err) {
        interrupted = true;
        flushNow();
        if (controller.signal.aborted) {
          setMessages((list) => [
            ...list,
            { id: nextId(), role: "notice", text: "The reply was stopped." },
          ]);
        } else if (err instanceof ApiError && err.status === 402) {
          setQuotaBlocked(true);
        } else {
          setMessages((list) => [
            ...list,
            {
              id: nextId(),
              role: "notice",
              text: messageOf(err, "The reply was interrupted. Send your prompt again."),
            },
          ]);
        }
      } finally {
        flushNow();
        releaseStream(streamId, controller);
        // An empty reply is dropped. A partial one is kept and marked.
        setMessages((list) =>
          list.flatMap((m) =>
            m.id !== replyId
              ? [m]
              : m.text === ""
                ? []
                : [{ ...m, streaming: false, interrupted: interrupted || undefined }],
          ),
        );
        setStreaming(false);
      }
    },
    [sessionId, streaming, streamId, levelId, queueToken, flushNow],
  );

  const reset = useCallback(async () => {
    abortStream(streamId);
    setStreaming(false);
    try {
      apply(await resetSession(levelId));
      setStatus("ready");
    } catch (err) {
      setMessages((list) => [
        ...list,
        { id: nextId(), role: "notice", text: messageOf(err, "Could not reset the session.") },
      ]);
    }
  }, [levelId, streamId, apply]);

  return { status, error, messages, streaming, latencyMs, quotaBlocked, load, send, reset, streamId };
}
