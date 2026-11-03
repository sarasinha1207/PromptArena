"use client";

import { getInitials } from "@/lib/team/roster";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";
import styles from "./WelcomeBanner.module.css";

interface WelcomeBannerProps {
  /** Page title, e.g. "Round 1: Red Teaming". */
  title: string;
  /** One line telling the team what to do here. */
  lead: string;
}

/** Slim welcome banner at the top of a round page. Uses only the signed-in team's real name. */
export function WelcomeBanner({ title, lead }: WelcomeBannerProps) {
  const teamName = useStore(authStore, (s) => s.profile?.team_name ?? null);

  return (
    <section className={styles.banner} aria-label="Welcome">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.welcome}>
        {teamName && (
          <span className={styles.avatar} aria-hidden="true">
            {getInitials(teamName)}
          </span>
        )}
        <p className={styles.greeting}>
          {teamName ? (
            <>
              Welcome, <strong>{teamName}</strong>
            </>
          ) : (
            "Welcome"
          )}
        </p>
      </div>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
    </section>
  );
}
