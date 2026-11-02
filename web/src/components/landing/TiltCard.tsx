"use client";

import { useRef, type ReactNode } from "react";
import styles from "./TiltCard.module.css";

/** Tilts its content toward the pointer, with a moving glare. Desktop pointers only. */
export function TiltCard({ children }: { children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const canTilt = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || !canTilt()) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${((0.5 - py) * 9).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((px - 0.5) * 11).toFixed(2)}deg`);
    card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  return (
    <div className={styles.scene} onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <div ref={cardRef} className={styles.card}>
        {children}
        <span className={styles.glare} aria-hidden="true" />
      </div>
    </div>
  );
}
