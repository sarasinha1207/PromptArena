import type { ArenaStatus, TournamentState } from "@/types/tournament";

const ROUND_NAMES: Record<number, string> = {
  1: "Red Teaming",
  2: "Blue Teaming",
  3: "Red vs. Blue",
};

export function getRoundFromState(state: TournamentState): number | null {
  if (state.startsWith("ROUND_1")) return 1;
  if (state.startsWith("ROUND_2")) return 2;
  if (state.startsWith("ROUND_3")) return 3;
  return null;
}

/** Left HUD segment text, e.g. "Round 1: Red Teaming" (handbook §4.2). */
export function getRoundLabel(
  state: TournamentState | null,
  currentRound: number | null,
): string {
  if (state === null) return "Connecting…";
  if (state === "PRE_EVENT") return "Pre-Event";
  if (state === "TOURNAMENT_CONCLUDED") return "Tournament Concluded";
  const round = getRoundFromState(state) ?? currentRound;
  if (round && ROUND_NAMES[round]) return `Round ${round}: ${ROUND_NAMES[round]}`;
  return "Tournament";
}

/** Status badge is LIVE, PAUSED or FROZEN (handbook §4.2). Other states show no badge. */
export function getArenaStatus(state: TournamentState | null): ArenaStatus | null {
  switch (state) {
    case "ROUND_1_ACTIVE":
    case "ROUND_2_ACTIVE":
    case "ROUND_3_ACTIVE":
      return "LIVE";
    case "ROUND_1_PAUSED":
      return "PAUSED";
    case "LEADERBOARD_FROZEN":
      return "FROZEN";
    default:
      return null;
  }
}

export function isPausedState(state: TournamentState | null): boolean {
  return state === "ROUND_1_PAUSED";
}
