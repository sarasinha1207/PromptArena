import type { CSSProperties } from "react";
import styles from "./Celebration.module.css";

const COLORS = ["#ff3158", "#3b82ff", "#ffc447", "#34d399", "#8a3dff", "#22d3ee"];
const PIECES = 30;

/** Confetti burst for a solved level. Decorative; pieces fly out once. */
export function Celebration() {
  return (
    <div className={styles.burst} aria-hidden="true">
      <span className={styles.ring} />
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2 + (i % 3) * 0.2;
        const distance = 90 + (i % 5) * 30;
        const style = {
          "--dx": `${Math.round(Math.cos(angle) * distance)}px`,
          "--dy": `${Math.round(Math.sin(angle) * distance - 24)}px`,
          "--r": `${(i * 47) % 360}deg`,
          background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 7) * 30}ms`,
        } as CSSProperties;
        return <i key={i} className={styles.piece} style={style} />;
      })}
    </div>
  );
}
