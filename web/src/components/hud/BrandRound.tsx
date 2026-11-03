"use client";

import Link from "next/link";
import { LogoMark } from "@/components/landing/LogoMark";
import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { getRoundLabel } from "@/lib/tournament/labels";
import styles from "./hud.module.css";

/** HUD left segment: platform name and current tournament phase (handbook §4.2). */
export function BrandRound() {
  const state = useStore(tournamentStore, (s) => s.state);
  const currentRound = useStore(tournamentStore, (s) => s.currentRound);

  return (
    <Link href="/arena" className={`${styles.segment} ${styles.brand}`} aria-label="Event dashboard">
      <LogoMark size={34} />
      <span className={styles.brandText}>
        <span className={styles.logo}>PromptArena</span>
        <span className={styles.round}>{getRoundLabel(state, currentRound)}</span>
      </span>
    </Link>
  );
}
