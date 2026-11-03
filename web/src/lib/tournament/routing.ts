import type { TournamentState } from "@/types/tournament";

export type ArenaTarget =
  | { kind: "wait" }
  | { kind: "lobby" }
  | { kind: "redirect"; to: string };

/**
 * Where `/arena` sends a team for the current state (handbook §4.1: "dynamic
 * round router, routes to active round"; §5 state table).
 */
export function getArenaTarget(
  state: TournamentState | null,
  currentRound: number | null,
): ArenaTarget {
  switch (state) {
    case null:
      return { kind: "wait" };
    case "PRE_EVENT":
      return { kind: "lobby" };
    case "ROUND_1_ACTIVE":
    case "ROUND_1_PAUSED":
      return { kind: "redirect", to: "/arena/round-1" };
    case "LEADERBOARD_FROZEN":
      return {
        kind: "redirect",
        to: `/arena/round-${currentRound && currentRound >= 1 && currentRound <= 3 ? currentRound : 1}`,
      };
    case "ROUND_1_ENDED":
    case "ROUND_2_ENDED":
      return { kind: "redirect", to: "/arena/round-ended" };
    case "ROUND_2_ACTIVE":
      return { kind: "redirect", to: "/arena/round-2" };
    case "ROUND_3_ACTIVE":
      return { kind: "redirect", to: "/arena/round-3" };
    case "TOURNAMENT_CONCLUDED":
      return { kind: "redirect", to: "/leaderboard" };
  }
}

/** Arena routes are locked before the event starts (handbook §5). */
export function isArenaOpen(state: TournamentState | null): boolean {
  return state !== null && state !== "PRE_EVENT";
}

/**
 * True while a round accepts input: its ACTIVE state, or a frozen leaderboard
 * during that round ("challenges remain fully playable", handbook §5).
 */
export function isRoundPlayable(
  state: TournamentState | null,
  currentRound: number | null,
  round: number,
): boolean {
  if (state === `ROUND_${round}_ACTIVE`) return true;
  return state === "LEADERBOARD_FROZEN" && currentRound === round;
}
