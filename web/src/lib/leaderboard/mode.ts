import type { TournamentState } from "@/types/tournament";
import type { LeaderboardMode } from "@/types/leaderboard";

/** Maps the tournament state to leaderboard behaviour (handbook §5, "Public Leaderboard" column). */
export function getLeaderboardMode(state: TournamentState | null): LeaderboardMode {
  switch (state) {
    case null:
      return "loading";
    case "PRE_EVENT":
      return "closed"; // "Blank / Hidden"
    case "ROUND_1_ACTIVE":
    case "ROUND_2_ACTIVE":
    case "ROUND_3_ACTIVE":
      return "live";
    case "ROUND_1_PAUSED":
      return "paused"; // "Graph and rank positions paused in place"
    case "LEADERBOARD_FROZEN":
      return "frozen"; // "Visual snapshot frozen; scores obscured"
    case "ROUND_1_ENDED":
    case "ROUND_2_ENDED":
      return "round-final"; // "Final standings verified and locked"
    case "TOURNAMENT_CONCLUDED":
      return "final"; // "Final verified champions podium"
  }
}

/** Modes where the screen keeps showing its current snapshot. */
export function isHeldMode(mode: LeaderboardMode): boolean {
  return mode === "paused" || mode === "frozen";
}

export const MODE_LABEL: Record<LeaderboardMode, string> = {
  loading: "Connecting",
  closed: "Closed",
  live: "Live",
  paused: "Paused",
  frozen: "Frozen",
  "round-final": "Locked",
  final: "Final",
};

export const MODE_NOTE: Record<LeaderboardMode, string> = {
  loading: "Connecting to the arena…",
  closed: "The leaderboard opens when the event starts.",
  live: "Standings update the moment a score lands.",
  paused: "The round is paused. Standings are held in place until it resumes.",
  frozen: "The leaderboard is frozen for the final sprint. Scores are hidden.",
  "round-final": "This round has ended. Standings are verified and locked.",
  final: "The tournament has concluded. These are the verified final standings.",
};
