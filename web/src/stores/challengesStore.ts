import { createStore } from "@/stores/createStore";
import { ApiError } from "@/lib/api/client";
import { fetchLevels } from "@/lib/api/arena";
import type { Challenge } from "@/types/arena";

export interface ChallengesState {
  items: Challenge[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

export const challengesStore = createStore<ChallengesState>({
  items: [],
  status: "idle",
  error: null,
});

let inFlight: Promise<void> | null = null;

/** Loads the level list. `silent` refreshes in place without showing the loading state. */
export function loadChallenges({ silent = false }: { silent?: boolean } = {}): Promise<void> {
  if (inFlight) return inFlight;
  if (!silent) challengesStore.setState({ status: "loading", error: null });

  inFlight = fetchLevels()
    .then((items) => challengesStore.setState({ items, status: "ready", error: null }))
    .catch((error: unknown) => {
      // A failed silent refresh keeps what is already on screen.
      if (silent && challengesStore.getState().status === "ready") return;
      challengesStore.setState({
        status: "error",
        error:
          error instanceof ApiError ? error.message : "Could not load the levels. Try again.",
      });
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Re-fetches the levels shortly after a gateway event (CHALLENGE_DEPLOYED,
 * SCORE_BATCH_UPDATE, handbook §12.6). Bursts of events collapse into one request.
 */
export function scheduleChallengeRefresh(): void {
  if (challengesStore.getState().status === "idle") return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void loadChallenges({ silent: true });
  }, 600);
}

/** Marks a level solved right after a successful flag submission. */
export function markChallengeSolved(levelId: string | number): void {
  challengesStore.setState((state) => ({
    items: state.items.map((item) =>
      String(item.id) === String(levelId) ? { ...item, is_solved: true } : item,
    ),
  }));
}

export function resetChallenges(): void {
  challengesStore.setState({ items: [], status: "idle", error: null });
}
