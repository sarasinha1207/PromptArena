"use client";

import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { getRoundLabel } from "@/lib/tournament/labels";
import styles from "./hud.module.css";

/** HUD left segment: platform name and current tournament phase (handbook §4.2). */
export function BrandRound() {
  const state = useStore(tournamentStore, (s) => s.state);
  const currentRound = useStore(tournamentStore, (s) => s.currentRound);

  return (
    <div className={`${styles.segment} ${styles.brand}`}>
      <span className={styles.logo}>PromptArena</span>
      <span className={styles.round}>{getRoundLabel(state, currentRound)}</span>
    </div>
  );
}
