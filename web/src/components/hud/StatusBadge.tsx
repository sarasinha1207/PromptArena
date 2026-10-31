"use client";

import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { getArenaStatus } from "@/lib/tournament/labels";
import styles from "./hud.module.css";

/** HUD centre-left: LIVE, PAUSED or FROZEN (handbook §4.2). */
export function StatusBadge() {
  const status = useStore(tournamentStore, (s) => getArenaStatus(s.state));

  return (
    <div className={`${styles.segment} ${styles.status}`}>
      {status && (
        <span className={styles.badge} data-status={status}>
          {status}
        </span>
      )}
    </div>
  );
}
