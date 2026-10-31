"use client";

import { useStore } from "@/stores/createStore";
import { walletStore } from "@/stores/walletStore";
import { getTokenLevel } from "@/lib/wallet/tokenLevel";
import styles from "./hud.module.css";

/**
 * HUD centre-right: remaining team tokens, e.g. "42,500 / 100,000", with a
 * progress meter and warning levels below 20% and below 5% (handbook §4.2).
 */
export function TokenGauge() {
  const budget = useStore(walletStore, (s) => s.budget);
  const used = useStore(walletStore, (s) => s.used);
  const remaining = Math.max(0, budget - used);
  const percent = budget > 0 ? Math.min(100, (remaining / budget) * 100) : 0;
  const level = getTokenLevel(remaining, budget);

  return (
    <div className={`${styles.segment} ${styles.gauge}`} data-level={level}>
      <div className={styles.gaugeLabel}>
        <span>Tokens</span>
        <span className={styles.gaugeValue}>
          {remaining.toLocaleString("en-US")} / {budget.toLocaleString("en-US")}
        </span>
      </div>
      <div
        className={styles.meter}
        role="meter"
        aria-label="Token balance"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={remaining}
      >
        <div className={styles.meterFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
