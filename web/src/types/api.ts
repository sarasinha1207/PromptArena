export type UserRole = "team" | "admin";

/** Response of POST /api/auth/login (handbook §12.1: "returns JWT token"). */
export interface LoginResponse {
  token: string;
}

/** A team member as returned in the roster. A plain string is also accepted. */
export interface TeamMember {
  name: string;
  is_leader?: boolean;
}

/**
 * Response of GET /api/teams/me (handbook §12.1: "team profile, wallet balance,
 * and roster"). Field names follow the `teams` table (§11); the roster and
 * leader name fields are assumptions the backend team must confirm.
 */
export interface TeamProfile {
  team_id?: string | number;
  team_name: string;
  role?: UserRole;
  leader_name?: string;
  leader_verified?: boolean;
  roster?: Array<string | TeamMember>;
  token_budget?: number;
  token_used?: number;
  rank?: number | null;
}
