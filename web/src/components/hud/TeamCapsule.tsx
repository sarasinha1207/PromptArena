"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, LogoutIcon, TrophyIcon } from "@/components/common/Icons";
import { getInitials, getLeaderName, getRoster } from "@/lib/team/roster";
import { useStore } from "@/stores/createStore";
import { authStore, logout } from "@/stores/authStore";
import styles from "./hud.module.css";

/**
 * HUD right: team menu with the team name, team leader, every member, live
 * rank and logout (handbook §4.2). Only real profile data is shown.
 */
export function TeamCapsule() {
  const router = useRouter();
  const profile = useStore(authStore, (s) => s.profile);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!profile) return null;

  const roster = getRoster(profile);
  const leaderName = getLeaderName(profile);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <div className={`${styles.segment} ${styles.capsule}`} ref={containerRef}>
      <button
        type="button"
        className={styles.capsuleButton}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.avatar}>{getInitials(profile.team_name)}</span>
        <span className={styles.capsuleName}>{profile.team_name}</span>
        <ChevronDownIcon className={styles.chevron} width={16} height={16} />
      </button>

      {open && (
        <div className={styles.menu} aria-label="Team menu">
          <div className={styles.menuHead}>
            <span className={styles.avatarLarge}>{getInitials(profile.team_name)}</span>
            <div className={styles.teamBlock}>
              <p className={styles.teamName}>{profile.team_name}</p>
              <p className={styles.teamSub}>Team name</p>
            </div>
            <div className={styles.rank} title="Live rank">
              <span className={styles.rankValue}>
                <TrophyIcon width={15} height={15} />
                {profile.rank != null ? `#${profile.rank}` : "Unranked"}
              </span>
              <span className={styles.rankLabel}>Live rank</span>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Team leader</p>
            <p className={styles.sectionValue}>
              {leaderName ?? <span className={styles.muted}>Not provided</span>}
              {leaderName && profile.leader_verified && (
                <span className={styles.verified}>Verified</span>
              )}
            </p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>
              Members{roster.length > 0 ? ` (${roster.length})` : ""}
            </p>
            {roster.length > 0 ? (
              <ul className={styles.members}>
                {roster.map((member) => (
                  <li key={member.name} className={styles.member}>
                    <span className={styles.avatar}>{getInitials(member.name)}</span>
                    <span>{member.name}</span>
                    {member.isLeader && <span className={styles.leaderTag}>Leader</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${styles.sectionValue} ${styles.muted}`}>No members listed yet.</p>
            )}
          </div>

          <button type="button" className={styles.logout} onClick={handleLogout}>
            <LogoutIcon width={18} height={18} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
