"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { isArenaOpen, isRoundPlayable } from "@/lib/tournament/routing";
import { abortAllStreams } from "@/lib/sse/streamRegistry";
import { useStore } from "@/stores/createStore";
import { challengesStore, loadChallenges } from "@/stores/challengesStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { MissionPane } from "./MissionPane";
import { Terminal } from "./Terminal";
import styles from "./Workbench.module.css";

/**
 * `/arena/round-1/[challenge_id]`: split-screen adversarial chat workbench
 * (handbook §6.2). Mission telemetry on the left, attack terminal on the right.
 */
export function Workbench({ levelId }: { levelId: string }) {
  const router = useRouter();
  const state = useStore(tournamentStore, (s) => s.state);
  const currentRound = useStore(tournamentStore, (s) => s.currentRound);
  const items = useStore(challengesStore, (s) => s.items);
  const status = useStore(challengesStore, (s) => s.status);
  const error = useStore(challengesStore, (s) => s.error);

  const arenaOpen = isArenaOpen(state);

  useEffect(() => {
    if (state === "PRE_EVENT") router.replace("/arena");
  }, [state, router]);

  useEffect(() => {
    if (arenaOpen) void loadChallenges({ silent: challengesStore.getState().status === "ready" });
  }, [arenaOpen]);

  // A pause aborts every open stream (handbook §5).
  useEffect(() => {
    if (state === "ROUND_1_PAUSED") abortAllStreams();
  }, [state]);

  const challenge = items.find((item) => String(item.id) === levelId);
  const playable = isRoundPlayable(state, currentRound, 1);
  const closedReason =
    state === "ROUND_1_PAUSED"
      ? "The round is paused."
      : state === "ROUND_1_ENDED"
        ? "Round 1 has ended. This workbench is read-only."
        : "The round is closed.";

  let body;
  if (!arenaOpen || (status !== "ready" && status !== "error")) {
    body = (
      <p className={styles.note} role="status">
        Opening the workbench…
      </p>
    );
  } else if (status === "error" && !challenge) {
    body = (
      <div className={styles.note} role="alert">
        <p>{error}</p>
        <button type="button" className={styles.retry} onClick={() => void loadChallenges()}>
          Try again
        </button>
      </div>
    );
  } else if (!challenge) {
    body = (
      <div className={styles.note} role="alert">
        <p>This level isn&apos;t available.</p>
        <Link href="/arena/round-1" className={styles.retry}>
          Back to Round 1
        </Link>
      </div>
    );
  } else {
    body = (
      <ThemeProvider config={challenge.theme_config} className={styles.theme}>
        <div className={styles.layout}>
          <MissionPane challenge={challenge} flagsOpen={playable} closedReason={closedReason} />
          <Terminal
            key={String(challenge.id)}
            challenge={challenge}
            playable={playable}
            closedReason={closedReason}
          />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/arena/round-1">Round 1: Red Teaming</Link>
        <span aria-hidden="true">/</span>
        <span>{challenge ? challenge.title : "Level"}</span>
      </nav>
      {body}
    </div>
  );
}
