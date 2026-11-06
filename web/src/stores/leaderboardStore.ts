import { createStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { ApiError } from "@/lib/api/client";
import { fetchLeaderboard } from "@/lib/api/leaderboard";
import { getLeaderboardMode, isHeldMode } from "@/lib/leaderboard/mode";
import type { LeaderboardData } from "@/types/leaderboard";

export interface LeaderboardStoreState {
  data: LeaderboardData | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

export const leaderboardStore = createStore<LeaderboardStoreState>({
  data: null,
  status: "idle",
  error: null,
});

let inFlight: Promise<void> | null = null;

/** Loads the standings. `silent` refreshes in place without the loading state. */
export function loadLeaderboard({ silent = false }: { silent?: boolean } = {}): Promise<void> {
  if (inFlight) return inFlight;
  if (!silent) leaderboardStore.setState({ status: "loading", error: null });

  inFlight = fetchLeaderboard()
    .then((data) => leaderboardStore.setState({ data, status: "ready", error: null }))
    .catch((error: unknown) => {
      // A failed background refresh keeps what is already on screen.
      if (silent && leaderboardStore.getState().status === "ready") return;
      leaderboardStore.setState({
        status: "error",
        error:
          error instanceof ApiError
            ? error.message
            : "Could not load the leaderboard. Try again.",
      });
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Re-fetches standings shortly after SCORE_BATCH_UPDATE (handbook §12.6);
 * bursts collapse into one request. While paused or frozen the screen holds its
 * snapshot, so the update is ignored (handbook §5).
 */
export function scheduleLeaderboardRefresh(): void {
  const { status } = leaderboardStore.getState();
  if (status === "idle") return;

  const { state } = tournamentStore.getState();
  if (status === "ready" && isHeldMode(getLeaderboardMode(state))) return;

  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void loadLeaderboard({ silent: true });
  }, 500);
}

export function resetLeaderboard(): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
  leaderboardStore.setState({ data: null, status: "idle", error: null });
}
