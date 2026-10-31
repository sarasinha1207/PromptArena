import { apiFetch } from "@/lib/api/client";
import type { LoginResponse, TeamProfile } from "@/types/api";

/** POST /api/auth/login (handbook §12.1). Request field names are not defined by the handbook. */
export function loginRequest(
  userId: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { user_id: userId, password },
  });
}

/** GET /api/teams/me (handbook §12.1). */
export function fetchMyProfile(): Promise<TeamProfile> {
  return apiFetch<TeamProfile>("/api/teams/me");
}
