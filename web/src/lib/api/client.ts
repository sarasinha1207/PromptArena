import { API_BASE_URL } from "@/lib/config";
import { readToken } from "@/lib/auth/tokenStorage";

export class ApiError extends Error {
  readonly status: number;
  readonly reason?: string;

  constructor(status: number, message: string, reason?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = reason;
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** Called when an authenticated request comes back 401 (expired or revoked session). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
    );
  }

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorBody = payload as { reason?: string; message?: string } | null;
    if (response.status === 401 && token) unauthorizedHandler?.();
    throw new ApiError(
      response.status,
      errorBody?.message ?? `Request failed (${response.status}).`,
      errorBody?.reason,
    );
  }

  return payload as T;
}
