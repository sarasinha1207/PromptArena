import { TOKEN_CRITICAL_RATIO, TOKEN_LOW_RATIO } from "@/lib/config";

export type TokenLevel = "ok" | "low" | "critical";

/** Warning thresholds from handbook §4.2: below 20% and below 5% of the budget. */
export function getTokenLevel(remaining: number, budget: number): TokenLevel {
  if (budget <= 0) return "ok";
  const ratio = remaining / budget;
  if (ratio < TOKEN_CRITICAL_RATIO) return "critical";
  if (ratio < TOKEN_LOW_RATIO) return "low";
  return "ok";
}
