import { getRoundFromState } from "@/lib/tournament/labels";
import type { TournamentState } from "@/types/tournament";

/** Plain-language line for the current tournament state (handbook §5). */
export function describeState(state: TournamentState | null): string {
  switch (state) {
    case null:
      return "Connecting to the arena…";
    case "PRE_EVENT":
      return "The event hasn't started. The arena opens when the organizers begin Round 1.";
    case "ROUND_1_ACTIVE":
      return "Round 1 is live.";
    case "ROUND_1_PAUSED":
      return "Round 1 is paused by the organizers. Play resumes automatically.";
    case "LEADERBOARD_FROZEN":
      return "The leaderboard is frozen for the final sprint. Challenges are still playable.";
    case "ROUND_1_ENDED":
      return "Round 1 has ended. The workbenches are read-only.";
    case "ROUND_2_ACTIVE":
      return "Round 2 is live.";
    case "ROUND_2_ENDED":
      return "Round 2 has ended. Defense submissions are locked.";
    case "ROUND_3_ACTIVE":
      return "Round 3 is live.";
    case "TOURNAMENT_CONCLUDED":
      return "The tournament has concluded.";
  }
}

export type RoundStatus = "Live now" | "Paused" | "Ended" | "Completed" | "Upcoming" | "Not started";

/** Where a given round stands, derived only from the tournament state. Null while unknown. */
export function getRoundStatus(
  state: TournamentState | null,
  currentRound: number | null,
  round: number,
): RoundStatus | null {
  if (state === null) return null;
  if (state === "PRE_EVENT") return "Not started";
  if (state === "TOURNAMENT_CONCLUDED") return "Completed";

  const current = currentRound ?? getRoundFromState(state);
  if (current === null) return null;
  if (round < current) return "Completed";
  if (round > current) return "Upcoming";

  if (state === "ROUND_1_PAUSED") return "Paused";
  if (state.endsWith("_ENDED")) return "Ended";
  return "Live now";
}

/** Whether a team can open the screens of a round right now (handbook §5). */
export function canOpenRound(
  state: TournamentState | null,
  currentRound: number | null,
  round: number,
): boolean {
  if (state === null || state === "PRE_EVENT") return false;
  if (state === "TOURNAMENT_CONCLUDED") return true;
  const current = currentRound ?? getRoundFromState(state);
  return current === round;
}
