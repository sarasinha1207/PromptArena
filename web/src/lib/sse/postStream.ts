import { API_BASE_URL } from "@/lib/config";
import { readToken } from "@/lib/auth/tokenStorage";
import { ApiError, notifyUnauthorized } from "@/lib/api/client";
import type { StreamEvent } from "@/types/arena";

interface StreamOptions {
  signal: AbortSignal;
  onEvent: (event: StreamEvent) => void;
}

/**
 * POSTs JSON and reads the `text/event-stream` response (handbook §6.3).
 * `EventSource` cannot POST or send an Authorization header, so this reads the
 * response body itself. Resolves "done" on `data: [DONE]`, "closed" if the
 * server ended the stream without it. Throws ApiError for HTTP errors (such as
 * 402 Token Quota Exceeded) and rethrows aborts.
 */
export async function streamPost(
  path: string,
  body: unknown,
  { signal, onEvent }: StreamOptions,
): Promise<"done" | "closed"> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ApiError(
      0,
      "Cannot reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    let payload: { reason?: string; message?: string } | null = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (response.status === 401 && token) notifyUnauthorized();
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed (${response.status}).`,
      payload?.reason,
      payload,
    );
  }

  if (!response.body) {
    throw new ApiError(0, "The server sent an empty response.", "EMPTY_STREAM");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");

      const dataLines = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());
      if (dataLines.length === 0) continue;

      const payload = dataLines.join("\n");
      if (payload === "[DONE]") return "done";
      try {
        onEvent(JSON.parse(payload) as StreamEvent);
      } catch {
        /* ignore a malformed frame */
      }
    }
  }
  return "closed";
}
