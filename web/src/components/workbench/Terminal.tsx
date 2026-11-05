"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { RefreshIcon, SendIcon, ShieldIcon } from "@/components/common/Icons";
import { useChat } from "@/hooks/useChat";
import { useStickyScroll } from "@/hooks/useStickyScroll";
import { SafeMessage } from "@/lib/markdown/SafeMessage";
import { getInitials } from "@/lib/team/roster";
import { useStore } from "@/stores/createStore";
import { walletStore } from "@/stores/walletStore";
import type { Challenge } from "@/types/arena";
import { TokenQuotaModal } from "./TokenQuotaModal";
import styles from "./Terminal.module.css";

interface TerminalProps {
  challenge: Challenge;
  /** True while the round accepts prompts. */
  playable: boolean;
  closedReason: string | null;
}

/** Rough size estimate for the counter. The server counts the real tokens. */
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

/** Right pane (65%): the conversational attack terminal (handbook §6.2, §6.3). */
export function Terminal({ challenge, playable, closedReason }: TerminalProps) {
  const chat = useChat(String(challenge.id));
  const { ref, pinned, onScroll, scrollToBottom } = useStickyScroll(chat.messages);

  const budget = useStore(walletStore, (s) => s.budget);
  const used = useStore(walletStore, (s) => s.used);
  const walletLoaded = useStore(walletStore, (s) => s.loaded);

  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const theme = challenge.theme_config;
  const showAvatar = Boolean(theme?.avatar_url) && !avatarFailed;

  const walletEmpty = walletLoaded && budget - used <= 0;
  const quotaOut = walletEmpty || chat.quotaBlocked;
  const limit = challenge.max_prompt_tokens;
  const promptTokens = estimateTokens(draft);
  const overLimit = typeof limit === "number" && promptTokens > limit;

  const blockedReason = !playable
    ? (closedReason ?? "The round is closed.")
    : quotaOut
      ? "Your team has no tokens left."
      : chat.status === "loading"
        ? "Connecting to the target…"
        : chat.status === "error"
          ? "Could not open the chat."
          : null;

  const canSend = !blockedReason && !chat.streaming && draft.trim() !== "" && !overLimit;

  async function transmit() {
    if (!canSend) return;
    const prompt = draft.trim();
    setDraft("");
    resizeTextarea(true);
    scrollToBottom();
    await chat.send(prompt);
    textareaRef.current?.focus();
  }

  function resizeTextarea(reset = false) {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (!reset) el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void transmit();
    }
  }

  const online = chat.status === "ready";

  const avatar = (className: string, monogramClass: string) =>
    showAvatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={className}
        src={theme?.avatar_url}
        alt=""
        draggable={false}
        onError={() => setAvatarFailed(true)}
      />
    ) : (
      <span className={monogramClass} aria-hidden="true">
        {getInitials(challenge.persona_name)}
      </span>
    );

  return (
    <section className={styles.terminal} aria-label="Attack terminal">
      <TokenQuotaModal open={quotaOut} />

      {/* ---------- Header bar ---------- */}
      <header className={styles.bar}>
        <div className={styles.target}>
          {avatar(styles.barAvatar, styles.barMonogram)}
          <div>
            <p className={styles.targetName}>{challenge.persona_name}</p>
            <p className={styles.online} data-online={online}>
              <span aria-hidden="true" />
              {online ? "ONLINE" : chat.status === "loading" ? "CONNECTING" : "OFFLINE"}
            </p>
          </div>
        </div>

        <p className={styles.latency}>
          <span>Inference latency</span>
          <strong>{chat.latencyMs !== null ? `${chat.latencyMs} ms` : "—"}</strong>
        </p>

        {confirmReset ? (
          <div className={styles.confirm} role="group" aria-label="Confirm session reset">
            <span>Reset this chat?</span>
            <button
              type="button"
              className={styles.confirmYes}
              onClick={() => {
                setConfirmReset(false);
                void chat.reset();
              }}
            >
              Reset
            </button>
            <button type="button" className={styles.confirmNo} onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.reset}
            onClick={() => setConfirmReset(true)}
            disabled={chat.status !== "ready"}
            title="Archives this chat and starts a fresh one. Your points and attempts stay."
          >
            <RefreshIcon width={16} height={16} />
            Reset session
          </button>
        )}
      </header>

      {/* ---------- Message viewport ---------- */}
      <div className={styles.viewportWrap}>
        <div className={styles.viewport} ref={ref} onScroll={onScroll} role="log" aria-live="polite">
          <div className={styles.thread}>
            {chat.status === "loading" && (
              <p className={styles.state}>Connecting to {challenge.persona_name}…</p>
            )}

            {chat.status === "error" && (
              <div className={styles.state} role="alert">
                <p>{chat.error}</p>
                <button type="button" className={styles.retry} onClick={() => void chat.load()}>
                  Try again
                </button>
              </div>
            )}

            {chat.messages.map((message) => {
              if (message.role === "user") {
                return (
                  <div key={message.id} className={styles.userRow}>
                    <div className={styles.userCol}>
                      <p className={styles.sender}>You</p>
                      <p className={styles.userBubble}>{message.text}</p>
                    </div>
                  </div>
                );
              }
              if (message.role === "guardrail") {
                return (
                  <div key={message.id} className={styles.alert} role="alert">
                    <ShieldIcon width={22} height={22} />
                    <div>
                      <p>{message.text}</p>
                      {message.detail && <small>{message.detail}</small>}
                    </div>
                  </div>
                );
              }
              if (message.role === "notice") {
                return (
                  <p key={message.id} className={styles.notice}>
                    {message.text}
                  </p>
                );
              }
              return (
                <div key={message.id} className={styles.botRow}>
                  {avatar(styles.msgAvatar, styles.msgMonogram)}
                  <div className={styles.botCol}>
                    <p className={styles.sender}>{challenge.persona_name}</p>
                    <div className={styles.botBubble} data-streaming={message.streaming}>
                      {message.text === "" && message.streaming ? (
                        <span className={styles.typing} aria-label="The target is replying">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <SafeMessage text={message.text} />
                      )}
                      {message.streaming && message.text !== "" && (
                        <span className={styles.caret} aria-hidden="true" />
                      )}
                      {message.interrupted && (
                        <small className={styles.interrupted}>Reply interrupted</small>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!pinned && (
          <button type="button" className={styles.jump} onClick={scrollToBottom}>
            Scroll to bottom
          </button>
        )}
      </div>

      {/* ---------- Attack console ---------- */}
      <footer className={styles.console}>
        <div className={styles.consoleInner}>
          {blockedReason && (
            <p className={styles.blocked} role="status">
              {blockedReason}
            </p>
          )}
          <div className={styles.composer}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              rows={1}
              placeholder="Type your adversarial prompt…"
              aria-label="Prompt"
              value={draft}
              disabled={Boolean(blockedReason)}
              onChange={(e) => {
                setDraft(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={onKeyDown}
            />
            <button
              type="button"
              className={styles.send}
              onClick={() => void transmit()}
              disabled={!canSend}
              aria-label="Transmit payload"
            >
              <SendIcon width={18} height={18} />
              <span>{chat.streaming ? "Replying" : "Transmit"}</span>
            </button>
          </div>
          <div className={styles.hints}>
            <span>Enter to send. Shift+Enter for a new line.</span>
            <span className={styles.meter} data-over={overLimit}>
              Tokens: ~{promptTokens.toLocaleString("en-US")}
              {typeof limit === "number" ? ` / ${limit.toLocaleString("en-US")}` : ""}
            </span>
          </div>
        </div>
      </footer>
    </section>
  );
}
