"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, TrophyIcon } from "@/components/common/Icons";
import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { RulesMenu } from "./RulesMenu";
import styles from "./hud.module.css";

/**
 * Icon buttons: Rules (opens a short dropdown) and Leaderboard (a link). The
 * icons are simple placeholders; the UI/UX team will supply the final design.
 */
export function HudLinks() {
  const pathname = usePathname();
  const state = useStore(tournamentStore, (s) => s.state);
  const [rulesOpen, setRulesOpen] = useState(false);
  const rulesRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on outside click, Escape, or when the page changes.
  useEffect(() => {
    if (!rulesOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      if (!rulesRef.current?.contains(event.target as Node)) setRulesOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRulesOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [rulesOpen]);

  useEffect(() => {
    setRulesOpen(false);
  }, [pathname]);

  // Handbook §5: the leaderboard is hidden until the event starts.
  const leaderboardClosed = state === "PRE_EVENT";

  return (
    <nav className={`${styles.segment} ${styles.links}`} aria-label="Event pages">
      <div className={styles.rulesWrap} ref={rulesRef}>
        <button
          type="button"
          className={styles.iconButton}
          data-tip="Rules"
          data-active={rulesOpen}
          aria-label="Rules"
          aria-expanded={rulesOpen}
          aria-controls={rulesOpen ? menuId : undefined}
          onClick={() => setRulesOpen((value) => !value)}
        >
          <BookIcon />
        </button>
        {rulesOpen && <RulesMenu id={menuId} />}
      </div>

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
