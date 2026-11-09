/** Non-secret client configuration only (handbook §13.2). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws/tournament";

/** Coordinator email for password help. Optional. */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";

/** Heartbeat ping/pong interval for clock calibration (handbook §4.3). */
export const HEARTBEAT_INTERVAL_MS = 30_000;

/** Token gauge warning thresholds (handbook §4.2): below 20% and below 5%. */
export const TOKEN_LOW_RATIO = 0.2;
export const TOKEN_CRITICAL_RATIO = 0.05;
