"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WelcomeBanner } from "@/components/arena/WelcomeBanner";
import { isArenaOpen, isRoundPlayable } from "@/lib/tournament/routing";
import { useStore } from "@/stores/createStore";
import { challengesStore, loadChallenges } from "@/stores/challengesStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { ChallengeCard } from "./ChallengeCard";
import styles from "./Round1Matrix.module.css";

/** `/arena/round-1`: the Round 1 challenge matrix (handbook §6.1). Shows only what the backend sends. */
export function Round1Matrix() {
  const router = useRouter();
  const state = useStore(tournamentStore, (s) => s.state);
  const currentRound = useStore(tournamentStore, (s) => s.currentRound);
  const items = useStore(challengesStore, (s) => s.items);
  const status = useStore(challengesStore, (s) => s.status);
  const error = useStore(challengesStore, (s) => s.error);

  const arenaOpen = isArenaOpen(state);

  // Arena routes are locked before the event starts (handbook §5).
  useEffect(() => {
    if (state === "PRE_EVENT") router.replace("/arena");
  }, [state, router]);

  useEffect(() => {
    if (arenaOpen) void loadChallenges({ silent: challengesStore.getState().status === "ready" });
  }, [arenaOpen]);

  const playable = isRoundPlayable(state, currentRound, 1);
  const closedReason =
    state === "ROUND_1_PAUSED"
      ? "The round is paused."
      : state === "ROUND_1_ENDED"
        ? "Round 1 has ended."
        : "Flag submission is closed.";

  const levels = items
    .filter((item) => item.round_number === 1)
    .sort((a, b) => a.level_index - b.level_index);

  return (
    <div className={styles.page}>
      <WelcomeBanner
        title="Round 1: Red Teaming"
        lead="Pick a level. Talk its character into giving up the secret flag, then submit it."
      />

      {!arenaOpen ? (
        <p className={styles.note} role="status">
          Loading the arena…
        </p>
      ) : status === "error" ? (
        <div className={styles.note} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.retry} onClick={() => void loadChallenges()}>
            Try again
          </button>
        </div>
      ) : status !== "ready" ? (
        <div className={styles.grid} aria-busy="true" aria-label="Loading levels">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className={styles.skeleton} />
          ))}
        </div>
      ) : levels.length === 0 ? (
        <p className={styles.note} role="status">
          No levels have been released yet. They appear here as soon as the organizers
          release them.
        </p>
      ) : (
        <div className={styles.grid}>
          {levels.map((level, index) => (
            <ChallengeCard
              key={level.id}
              challenge={level}
              open={playable}
              closedReason={closedReason}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
