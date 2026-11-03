"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getArenaTarget } from "@/lib/tournament/routing";
import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import styles from "./ArenaRouter.module.css";

/**
 * `/arena`: sends the team to the active round (handbook §4.1). Before the
 * event starts the arena is locked, so it shows a short waiting message.
 */
export function ArenaRouter() {
  const router = useRouter();
  const state = useStore(tournamentStore, (s) => s.state);
  const currentRound = useStore(tournamentStore, (s) => s.currentRound);

  const target = getArenaTarget(state, currentRound);
  const redirectTo = target.kind === "redirect" ? target.to : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (target.kind === "lobby") {
    return (
      <section className={styles.lobby}>
        <h1 className={styles.title}>The arena opens soon</h1>
        <p className={styles.text}>
          The event hasn&apos;t started. This page moves you into Round 1 as soon as the
          organizers begin it.
        </p>
      </section>
    );
  }

  return (
    <p className={styles.loading} role="status">
      Entering the arena…
    </p>
  );
}
