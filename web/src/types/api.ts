export type UserRole = "team" | "admin";

/** Response of POST /api/auth/login (handbook §12.1: "returns JWT token"). */
export interface LoginResponse {
  token: string;
}

/** Response of GET /api/teams/me (handbook §12.1). Field names follow the `teams` table (§11). */
export interface TeamProfile {
  team_id?: string | number;
  team_name: string;
  role?: UserRole;
  leader_verified?: boolean;
  token_budget?: number;
  token_used?: number;
  rank?: number | null;
}
