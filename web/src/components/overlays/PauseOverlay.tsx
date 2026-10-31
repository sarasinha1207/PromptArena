"use client";

import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { isPausedState } from "@/lib/tournament/labels";
import styles from "./PauseOverlay.module.css";

/**
 * Full-screen pause banner for ROUND_1_PAUSED (handbook §5). It covers the page
 * so navigation and inputs are frozen, and clears itself when the state changes.
 */
export function PauseOverlay() {
  const paused = useStore(tournamentStore, (s) => isPausedState(s.state));
  if (!paused) return null;

  return (
    <div
      className={styles.overlay}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <h2 id="pause-title" className={styles.title}>
        Round Paused
      </h2>
      <p className={styles.message}>
        The organizers have paused the round. Stay on this page — play resumes
        automatically.
      </p>
    </div>
  );
}
