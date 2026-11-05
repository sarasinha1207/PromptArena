import { apiFetch } from "@/lib/api/client";
import type { Challenge, FlagSuccess, SessionPayload } from "@/types/arena";

/** GET /api/arena/levels/{id}/session: the active chat session and its history (assumed endpoint). */
export function fetchSession(levelId: string | number): Promise<SessionPayload> {
  return apiFetch<SessionPayload>(`/api/arena/levels/${levelId}/session`);
}

/**
 * POST /api/arena/levels/{id}/session/reset (handbook §6.2): archives the
 * session and the persona greets again. Points and attempts are unchanged.
 */
export function resetSession(levelId: string | number): Promise<SessionPayload> {
  return apiFetch<SessionPayload>(`/api/arena/levels/${levelId}/session/reset`, { method: "POST" });
}

/**
 * GET /api/arena/levels. The handbook defines no endpoint for listing levels,
 * so this path and shape are assumptions (array, or `{ levels: [...] }`).
 */
export async function fetchLevels(): Promise<Challenge[]> {
  const data = await apiFetch<Challenge[] | { levels: Challenge[] }>("/api/arena/levels");
  return Array.isArray(data) ? data : (data.levels ?? []);
}

/** POST /api/arena/levels/{level_id}/submit (handbook §12.2). Rejects with ApiError on a wrong flag. */
export function submitFlag(levelId: string | number, flag: string): Promise<FlagSuccess> {
  return apiFetch<FlagSuccess>(`/api/arena/levels/${levelId}/submit`, {
    method: "POST",
    body: { flag },
  });
}
