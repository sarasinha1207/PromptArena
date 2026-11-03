"use client";

import { useMasterClock } from "@/hooks/useMasterClock";
import { formatCountdown } from "@/lib/format/time";
import styles from "./hud.module.css";

/** HUD centre: authoritative countdown derived from the server epoch (handbook §4.2, §4.3). */
export function MasterClock() {
  const remainingMs = useMasterClock();

  return (
    <div className={`${styles.segment} ${styles.clockWrap}`}>
      <span className={styles.clockLabel}>Time left</span>
      <span className={styles.clock} role="timer" aria-label="Round time remaining">
        {remainingMs === null ? "--:--:--" : formatCountdown(remainingMs)}
      </span>
    </div>
  );
}
