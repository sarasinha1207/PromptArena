import { apiFetch } from "@/lib/api/client";
import { serverNow } from "@/lib/clock/serverClock";
import type {
  LeaderboardData,
  ScoreEvent,
  StandingRow,
  TeamId,
} from "@/types/leaderboard";

/* ---------- Lenient readers: the payload is untrusted input ---------- */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Accepts epoch milliseconds or an ISO date string. */
function readTime(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function readTeamId(value: unknown): TeamId | null {
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function readTeam(raw: unknown): StandingRow | null {
  if (!isRecord(raw)) return null;
  const teamId = readTeamId(raw.team_id);
  if (teamId === null || typeof raw.team_name !== "string") return null;
  return {
    team_id: teamId,
    team_name: raw.team_name,
    avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
    round1_solves: readNumber(raw.round1_solves) ?? 0,
    round1_total: readNumber(raw.round1_total),
    round2_def_score: readNumber(raw.round2_def_score),
    round3_wins: readNumber(raw.round3_wins),
    penalties: readNumber(raw.penalties) ?? 0,
    total_score: readNumber(raw.total_score) ?? 0,
    last_solve_at: readTime(raw.last_solve_at),
  };
}

function readEvent(raw: unknown): ScoreEvent | null {
  if (!isRecord(raw)) return null;
  const teamId = readTeamId(raw.team_id);
  const at = readTime(raw.created_at ?? raw.at);
  const cumulative = readNumber(raw.cumulative_score);
  if (teamId === null || at === null || cumulative === null) return null;
  return {
    team_id: teamId,
    at,
    cumulative_score: cumulative,
    points_awarded: readNumber(raw.points_awarded) ?? 0,
    // Assumed marker: `is_first_blood: true` or `event_type: "FIRST_BLOOD"`.
    is_first_blood: raw.is_first_blood === true || raw.event_type === "FIRST_BLOOD",
  };
}

function readList<T>(value: unknown, read: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const item of value) {
    const parsed = read(item);
    if (parsed) out.push(parsed);
  }
  return out;
}

/**
 * GET /api/leaderboard (assumed route). Expected body:
 * `{ teams: [...], events: [...], started_at, as_of }`.
 * While the leaderboard is frozen the server must return the frozen snapshot,
 * never live scores (handbook §5).
 */
export async function fetchLeaderboard(): Promise<LeaderboardData> {
  const raw = await apiFetch<unknown>("/api/leaderboard");
  const body = isRecord(raw) ? raw : {};
  return {
    teams: readList(body.teams, readTeam),
    events: readList(body.events, readEvent),
    started_at: readTime(body.started_at),
    as_of: readTime(body.as_of),
    fetched_at: serverNow(),
  };
}
