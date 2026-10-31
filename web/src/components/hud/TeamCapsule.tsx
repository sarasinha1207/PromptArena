"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/createStore";
import { authStore, logout } from "@/stores/authStore";
import styles from "./hud.module.css";

/**
 * HUD right: dropdown with team handle, verified leader status, live rank and
 * logout (handbook §4.2).
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
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  if (!profile) return null;

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
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{profile.team_name}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuRow}>
            <span className={styles.menuLabel}>Team</span>
            <span>{profile.team_name}</span>
          </div>
          <div className={styles.menuRow}>
            <span className={styles.menuLabel}>Leader</span>
            <span>{profile.leader_verified ? "Verified" : "Not verified"}</span>
          </div>
          <div className={styles.menuRow}>
            <span className={styles.menuLabel}>Live rank</span>
            <span>{profile.rank != null ? `#${profile.rank}` : "—"}</span>
          </div>
          <button
            type="button"
            className={styles.logout}
            role="menuitem"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
