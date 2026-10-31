import { createStore } from "@/stores/createStore";

export interface ClockState {
  /** drift_offset = server_epoch + rtt/2 - t1 (handbook §4.3), in milliseconds. */
  driftOffsetMs: number;
  lastRttMs: number | null;
  synced: boolean;
}

export const clockStore = createStore<ClockState>({
  driftOffsetMs: 0,
  lastRttMs: null,
  synced: false,
});
