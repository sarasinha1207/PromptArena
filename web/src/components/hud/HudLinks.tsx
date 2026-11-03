"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, TrophyIcon } from "@/components/common/Icons";
import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import styles from "./hud.module.css";

/**
 * Icon buttons for the Rules page and the Leaderboard. The icons are simple
 * placeholders; the UI/UX team will supply the final design.
 */
export function HudLinks() {
  const pathname = usePathname();
  const state = useStore(tournamentStore, (s) => s.state);

  // Handbook §5: the leaderboard is hidden until the event starts.
  const leaderboardClosed = state === "PRE_EVENT";

  return (
    <nav className={`${styles.segment} ${styles.links}`} aria-label="Event pages">
      <Link
        href="/rules"
        className={styles.iconButton}
        data-tip="Rules"
        data-active={pathname.startsWith("/rules")}
        aria-label="Rules"
      >
        <BookIcon />
      </Link>

      {leaderboardClosed ? (
        <span
          className={styles.iconButton}
          role="link"
          aria-disabled="true"
          aria-label="Leaderboard, opens when the event starts"
          data-tip="Opens when the event starts"
          tabIndex={0}
        >
          <TrophyIcon />
        </span>
      ) : (
        <Link
          href="/leaderboard"
          className={styles.iconButton}
          data-tip="Leaderboard"
          data-active={pathname.startsWith("/leaderboard")}
          aria-label="Leaderboard"
        >
          <TrophyIcon />
        </Link>
      )}
    </nav>
  );
}
