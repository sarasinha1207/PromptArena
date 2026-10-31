import { HEARTBEAT_INTERVAL_MS, WS_URL } from "@/lib/config";
import { applyClockSample } from "@/lib/clock/serverClock";
import {
  applyTournamentStateChange,
  tournamentStore,
} from "@/stores/tournamentStore";
import { isTournamentState } from "@/types/tournament";

const MAX_RECONNECT_DELAY_MS = 10_000;

/**
 * Client for the central WebSocket gateway `/ws/tournament` (handbook §5, §12.6).
 *
 * Phase 1 handles: heartbeat ping/pong (clock calibration) and
 * TOURNAMENT_STATE_CHANGE. The remaining gateway events (SCORE_BATCH_UPDATE,
 * FIRST_BLOOD_ALERT, CHALLENGE_DEPLOYED, GLOBAL_ANNOUNCEMENT,
 * INBOUND_ATTACK_TELEMETRY) are ignored until the phases that consume them.
 *
 * NOTE: the handbook does not define how the socket authenticates. Add it in
 * `handleOpen` once the backend team decides.
 */
export class TournamentGateway {
  private socket: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private closedByUser = false;
  private pingSentAt: number | null = null;

  connect(): void {
    this.closedByUser = false;
    this.open();
  }

  disconnect(): void {
    this.closedByUser = true;
    this.clearTimers();
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    tournamentStore.setState({ connection: "closed" });
  }

  private open(): void {
    tournamentStore.setState({ connection: "connecting" });
    const socket = new WebSocket(WS_URL);
    this.socket = socket;

    socket.onopen = () => this.handleOpen();
    socket.onmessage = (event) => this.handleMessage(event.data);
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.clearTimers();
      tournamentStore.setState({ connection: "closed" });
      if (!this.closedByUser) this.scheduleReconnect();
    };
  }

  private handleOpen(): void {
    this.reconnectAttempts = 0;
    tournamentStore.setState({ connection: "open" });
    this.sendPing();
    this.heartbeatTimer = setInterval(
      () => this.sendPing(),
      HEARTBEAT_INTERVAL_MS,
    );
  }

  /** Records t0 and sends `ping`; the matching `pong` completes the sample. */
  private sendPing(): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.pingSentAt = Date.now();
    this.socket.send(JSON.stringify({ event: "ping" }));
  }

  private handleMessage(raw: unknown): void {
    if (typeof raw !== "string") return;
    let message: unknown;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }
    if (typeof message !== "object" || message === null) return;
    const { event, data, server_epoch } = message as {
      event?: unknown;
      data?: unknown;
      server_epoch?: unknown;
    };

    if (event === "pong") {
      if (typeof server_epoch !== "number" || this.pingSentAt === null) return;
      applyClockSample(this.pingSentAt, Date.now(), server_epoch);
      this.pingSentAt = null;
      return;
    }

    if (event === "TOURNAMENT_STATE_CHANGE") {
      const payload = data as {
        state?: unknown;
        current_round?: unknown;
        target_end_epoch?: unknown;
      } | null;
      if (!payload || !isTournamentState(payload.state)) return;
      applyTournamentStateChange({
        state: payload.state,
        current_round:
          typeof payload.current_round === "number" ? payload.current_round : null,
        target_end_epoch:
          typeof payload.target_end_epoch === "number"
            ? payload.target_end_epoch
            : null,
      });
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      MAX_RECONNECT_DELAY_MS,
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
  }
}
