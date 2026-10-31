import { clockStore } from "@/stores/clockStore";

/**
 * Handbook §4.3 heartbeat calibration:
 *   t0 = Date.now() when ping is sent, t1 = Date.now() when pong arrives
 *   round_trip_latency = t1 - t0
 *   drift_offset = server_epoch + round_trip_latency / 2 - t1
 */
export function applyClockSample(
  t0: number,
  t1: number,
  serverEpoch: number,
): void {
  const rtt = t1 - t0;
  clockStore.setState({
    driftOffsetMs: serverEpoch + rtt / 2 - t1,
    lastRttMs: rtt,
    synced: true,
  });
}

/** Current server time in epoch ms. Never read the local clock directly for timers. */
export function serverNow(): number {
  return Date.now() + clockStore.getState().driftOffsetMs;
}
