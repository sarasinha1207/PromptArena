import { apiFetch } from "@/lib/api/client";
import type { Challenge, FlagSuccess } from "@/types/arena";

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
