import { createStore } from "@/stores/createStore";
import { serverNow } from "@/lib/clock/serverClock";
import { getRoundFromState, isPausedState } from "@/lib/tournament/labels";
import type {
  TournamentState,
  TournamentStateChangePayload,
} from "@/types/tournament";

export type ConnectionStatus = "connecting" | "open" | "closed";

export interface TournamentStoreState {
  state: TournamentState | null;
  currentRound: number | null;
  /** Round end timestamp from the server, epoch ms. */
  targetEndEpoch: number | null;
  /** Remaining time captured when a pause begins, so the clock stays frozen. */
  frozenRemainingMs: number | null;
  connection: ConnectionStatus;
}

export const tournamentStore = createStore<TournamentStoreState>({
  state: null,
  currentRound: null,
  targetEndEpoch: null,
  frozenRemainingMs: null,
  connection: "closed",
});

/** Applies a TOURNAMENT_STATE_CHANGE event (handbook §12.6). */
export function applyTournamentStateChange(
  payload: TournamentStateChangePayload,
): void {
  const previous = tournamentStore.getState();
  const paused = isPausedState(payload.state);

  let frozenRemainingMs: number | null = null;
  if (paused) {
    if (isPausedState(previous.state)) {
      frozenRemainingMs = previous.frozenRemainingMs;
    } else if (previous.targetEndEpoch !== null) {
      frozenRemainingMs = Math.max(0, previous.targetEndEpoch - serverNow());
    }
  }

  tournamentStore.setState({
    state: payload.state,
    currentRound:
      payload.current_round ??
      getRoundFromState(payload.state) ??
      previous.currentRound,
    targetEndEpoch: payload.target_end_epoch ?? null,
    frozenRemainingMs,
  });
}

export function resetTournamentState(): void {
  tournamentStore.setState({
    state: null,
    currentRound: null,
    targetEndEpoch: null,
    frozenRemainingMs: null,
    connection: "closed",
  });
}
