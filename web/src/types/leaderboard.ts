/**
 * Leaderboard data (handbook §9, §11 `score_events`, §12.6).
 *
 * The handbook defines the screen and the `score_events` table but no REST
 * route for reading standings, so `GET /api/leaderboard` and this shape are
 * assumptions to confirm with the backend team (see README).
 */

export type TeamId = string | number;

/** One row of the Rankings Matrix Table (handbook §9.3). */
export interface StandingRow {
  team_id: TeamId;
  team_name: string;
  /** Optional emblem image. Teams without one get their initials. */
  avatar_url: string | null;
  /** Round 1 levels solved by this team. */
  round1_solves: number;
  /** Number of Round 1 levels, for the "5 / 5 Levels" cell. */
  round1_total: number | null;
  /** Round 2 defence score. `null` until Round 2 has produced one. */
  round2_def_score: number | null;
  /** Round 3 match wins. `null` until Round 3 has produced one. */
  round3_wins: number | null;
  /** Sum of admin penalties, zero or negative. */
  penalties: number;
  total_score: number;
  /** Time of the last point-earning event, epoch ms. Used by the tie-break. */
  last_solve_at: number | null;
}

/** One row of the append-only `score_events` ledger (handbook §11). */
export interface ScoreEvent {
  team_id: TeamId;
  /** `created_at`, epoch ms. */
  at: number;
  cumulative_score: number;
  points_awarded: number;
  is_first_blood: boolean;
}

export interface LeaderboardData {
  teams: StandingRow[];
  events: ScoreEvent[];
  /** Start of the tournament timeline (the graph's left edge), epoch ms. */
  started_at: number | null;
  /** Server time the snapshot describes, epoch ms. */
  as_of: number | null;
  /** Client time of the fetch, used when the server sends no `as_of`. */
  fetched_at: number;
}

/** How the leaderboard behaves in each tournament state (handbook §5). */
export type LeaderboardMode =
  | "loading"
  | "closed"
  | "live"
  | "paused"
  | "frozen"
  | "round-final"
  | "final";
