"use client";

import { useEffect, useMemo, useRef } from "react";
import { MODE_LABEL, MODE_NOTE, getLeaderboardMode, isHeldMode } from "@/lib/leaderboard/mode";
import { rankTeams } from "@/lib/leaderboard/standings";
import { leaderboardStore, loadLeaderboard } from "@/stores/leaderboardStore";
import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { Podium } from "./Podium";
import { RankingsTable } from "./RankingsTable";
import styles from "./LeaderboardPage.module.css";

export function LeaderboardPage() {
  const tournamentState = useStore(tournamentStore, (s) => s.state);
  const data = useStore(leaderboardStore, (s) => s.data);
  const status = useStore(leaderboardStore, (s) => s.status);
  const error = useStore(leaderboardStore, (s) => s.error);

  const mode = getLeaderboardMode(tournamentState);
  const available = mode !== "loading" && mode !== "closed";

  // First load once the arena is open.
  useEffect(() => {
    if (available && status === "idle") void loadLeaderboard();
  }, [available, status]);

  // Leaving a pause or freeze: pick up the standings that moved meanwhile.
  const previousMode = useRef(mode);
  useEffect(() => {
    const before = previousMode.current;
    previousMode.current = mode;
    if (available && isHeldMode(before) && !isHeldMode(mode)) {
      void loadLeaderboard({ silent: true });
    }
  }, [mode, available]);

  const ranked = useMemo(() => (data ? rankTeams(data.teams) : []), [data]);

  const masked = mode === "frozen";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{mode === "final" ? "Final Standings" : "Leaderboard"}</h1>
          {available && <p className={styles.note}>{MODE_NOTE[mode]}</p>}
        </div>
        {available && (
          <span className={styles.mode} data-mode={mode}>
            <i aria-hidden="true" />
            {MODE_LABEL[mode]}
          </span>
        )}
      </header>

      {!available && (
        <section className={styles.panel}>
          <p className={styles.state}>
            {mode === "closed"
              ? "The leaderboard opens when the event starts."
              : "Connecting to the arena…"}
          </p>
        </section>
      )}

      {available && (status === "idle" || (status === "loading" && !data)) && (
        <section className={styles.panel} aria-busy="true">
          <div className={styles.skeleton} />
          <p className={styles.state}>Loading standings…</p>
        </section>
      )}

      {available && status === "error" && !data && (
        <section className={styles.panel} role="alert">
          <p className={styles.state}>{error}</p>
          <button type="button" className={styles.retry} onClick={() => void loadLeaderboard()}>
            Try again
          </button>
        </section>
      )}

      {available && data && (
        <>
          {ranked.length === 0 ? (
            <section className={styles.panel}>
              <p className={styles.state}>No scores yet. Standings appear with the first capture.</p>
            </section>
          ) : (
            <>
              <section className={`${styles.panel} ${styles.podiumPanel}`}>
                <Podium teams={ranked} maskScores={masked} champions={mode === "final"} />
              </section>

              <section className={styles.panel} aria-labelledby="table-title">
                <h2 id="table-title" className={styles.sectionTitle}>
                  Rankings
                </h2>
                <RankingsTable teams={ranked} maskScores={masked} />
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
