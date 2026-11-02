"use client";

import { useEffect, useState } from "react";
import styles from "./Typewriter.module.css";

/** Types each phrase, holds, deletes it, then moves to the next. */
export function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState(phrases[0] ?? "");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    (async () => {
      let index = 0;
      while (!cancelled) {
        const phrase = phrases[index % phrases.length];
        for (let i = 0; i <= phrase.length; i++) {
          if (cancelled) return;
          setText(phrase.slice(0, i));
          await wait(52);
        }
        await wait(1800);
        for (let i = phrase.length; i >= 0; i--) {
          if (cancelled) return;
          setText(phrase.slice(0, i));
          await wait(26);
        }
        await wait(280);
        index += 1;
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phrases]);

  return (
    <span className={styles.wrap}>
      <span aria-live="off">{text}</span>
      <span className={styles.caret} aria-hidden="true" />
    </span>
  );
}
