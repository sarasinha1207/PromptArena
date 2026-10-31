/** Tournament states exactly as listed in handbook §5. */
export const TOURNAMENT_STATES = [
  "PRE_EVENT",
  "ROUND_1_ACTIVE",
  "ROUND_1_PAUSED",
  "LEADERBOARD_FROZEN",
  "ROUND_1_ENDED",
  "ROUND_2_ACTIVE",
  "ROUND_2_ENDED",
  "ROUND_3_ACTIVE",
  "TOURNAMENT_CONCLUDED",
] as const;

export type TournamentState = (typeof TOURNAMENT_STATES)[number];

export function isTournamentState(value: unknown): value is TournamentState {
  return (
    typeof value === "string" &&
    (TOURNAMENT_STATES as readonly string[]).includes(value)
  );
}

/** Payload of the TOURNAMENT_STATE_CHANGE WebSocket event (handbook §12.6). */
export interface TournamentStateChangePayload {
  state: TournamentState;
  /** `tournaments.current_round` (handbook §11). */
  current_round?: number | null;
  /** Round end timestamp, epoch milliseconds. */
  target_end_epoch?: number | null;
}

/** Arena status badge values (handbook §4.2). */
export type ArenaStatus = "LIVE" | "PAUSED" | "FROZEN";
