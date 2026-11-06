import type {
  LeaderboardData,
  ScoreEvent,
  StandingRow,
  TeamId,
} from "@/types/leaderboard";

export interface RankedTeam extends StandingRow {
  rank: number;
}

/**
 * Orders teams by total score. Teams tied on points are ranked strictly by the
 * earlier timestamp of their last point-earning event (handbook §9.3).
 * A team that never scored sorts after a team that did; names settle the rest
 * so the order never flickers between renders.
 */
export function rankTeams(teams: readonly StandingRow[]): RankedTeam[] {
  return [...teams]
    .sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (a.last_solve_at !== b.last_solve_at) {
        if (a.last_solve_at === null) return 1;
        if (b.last_solve_at === null) return -1;
        return a.last_solve_at - b.last_solve_at;
      }
      return a.team_name.localeCompare(b.team_name);
    })
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

/* ---------- Time-series graph (handbook §9.2) ---------- */

/** Graph colours are reused after eight teams, with a dashed line as the second cue. */
export const GRAPH_SLOTS = 10;

export interface GraphPoint {
  t: number;
  score: number;
}

export interface GraphSeries {
  teamId: TeamId;
  name: string;
  rank: number;
  /** 0-9. Slots 8 and 9 reuse the first two colours and draw dashed. */
  slot: number;
  /** Step points in time order, starting from the cumulative score of the first event. */
  points: GraphPoint[];
  firstBloods: GraphPoint[];
}

export interface GraphModel {
  series: GraphSeries[];
  start: number;
  end: number;
  minScore: number;
  maxScore: number;
}

/**
 * Keeps each team on the same graph colour for as long as it stays in the top
 * ten, so a rank swap never repaints a line. The map is owned by the caller.
 */
export function assignSlots(
  teamIds: readonly TeamId[],
  slots: Map<TeamId, number>,
): void {
  const keep = new Set(teamIds);
  for (const id of [...slots.keys()]) if (!keep.has(id)) slots.delete(id);

  const used = new Set(slots.values());
  for (const id of teamIds) {
    if (slots.has(id)) continue;
    let slot = 0;
    while (used.has(slot) && slot < GRAPH_SLOTS) slot += 1;
    slots.set(id, slot);
    used.add(slot);
  }
}

/** Builds the step-line series for the top ten teams from the score ledger. */
export function buildGraph(
  data: LeaderboardData,
  ranked: readonly RankedTeam[],
  slots: Map<TeamId, number>,
  end: number,
): GraphModel {
  const top = ranked.slice(0, GRAPH_SLOTS);
  assignSlots(
    top.map((team) => team.team_id),
    slots,
  );

  const byTeam = new Map<TeamId, ScoreEvent[]>();
  for (const event of data.events) {
    const list = byTeam.get(event.team_id);
    if (list) list.push(event);
    else byTeam.set(event.team_id, [event]);
  }

  let earliest = Infinity;
  for (const event of data.events) earliest = Math.min(earliest, event.at);
  const start = data.started_at ?? (Number.isFinite(earliest) ? earliest : end);

  let minScore = 0;
  let maxScore = 0;
  const series: GraphSeries[] = top.map((team) => {
    const events = (byTeam.get(team.team_id) ?? []).sort((a, b) => a.at - b.at);
    const points = events.map((event) => ({ t: event.at, score: event.cumulative_score }));
    const firstBloods = events
      .filter((event) => event.is_first_blood)
      .map((event) => ({ t: event.at, score: event.cumulative_score }));
    for (const point of points) {
      minScore = Math.min(minScore, point.score);
      maxScore = Math.max(maxScore, point.score);
    }
    return {
      teamId: team.team_id,
      name: team.team_name,
      rank: team.rank,
      slot: slots.get(team.team_id) ?? 0,
      points,
      firstBloods,
    };
  });

  return { series, start, end: Math.max(end, start + 1), minScore, maxScore };
}

/** Cumulative score of a series at time `t` (a step function; zero before its first event). */
export function scoreAt(series: GraphSeries, t: number): number {
  let score = 0;
  for (const point of series.points) {
    if (point.t > t) break;
    score = point.score;
  }
  return score;
}

/** Rounds an axis maximum up to a tidy tick step. Returns the ticks. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  const span = Math.max(1, max - min);
  const rough = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
  const first = Math.floor(min / step) * step;
  const last = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = first; value <= last + step / 2; value += step) ticks.push(value);
  return ticks;
}
