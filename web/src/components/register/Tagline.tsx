"use client";

import { useEffect, useState } from "react";
import { rise } from "./ui/rise";
import styles from "./Tagline.module.css";

const TEXT = "Hack & Defend";

/** Types "Hack & Defend" one letter at a time, Hack in blue and Defend in red. */
export function Tagline() {
  const [typed, setTyped] = useState(0);
  const entrance = rise(0.2);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(TEXT.length);
      return;
    }
    let count = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      count += 1;
      setTyped(count);
      if (count < TEXT.length) timer = setTimeout(tick, 110);
    };
    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, []);

  const visible = TEXT.slice(0, typed);
  return (
    <p
      className={`${styles.tagline} ${entrance.className}`}
      style={entrance.style}
      aria-label="Hack and Defend"
    >
      <span aria-hidden="true">
        <span className={styles.hack}>{visible.slice(0, 4)}</span>
        {visible.slice(4, 7)}
        <span className={styles.defend}>{visible.slice(7)}</span>
      </span>
      <span className={styles.cursor} aria-hidden="true" />
    </p>
  );
}
