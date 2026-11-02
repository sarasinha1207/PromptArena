"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useInView } from "@/hooks/useInView";
import styles from "./SplitText.module.css";

interface SplitTextProps {
  text: string;
  tone?: "red" | "blue" | "white";
  /** Delay before the first letter, in ms. */
  base?: number;
  /** "mount" plays on load, "view" plays when scrolled into view. */
  trigger?: "mount" | "view";
  className?: string;
}

/** Animates a line of text letter by letter. */
export function SplitText({
  text,
  tone = "white",
  base = 0,
  trigger = "mount",
  className = "",
}: SplitTextProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const play = trigger === "mount" ? mounted : inView;
  const chars = Array.from(text);
  const total = chars.filter((c) => c !== " ").length;

  let index = 0;
  const words = text.split(" ");

  return (
    <span
      ref={ref}
      className={`${styles.root} ${className}`}
      data-tone={tone}
      data-play={play}
      aria-label={text}
      style={{ "--base": `${base}ms`, "--n": total } as CSSProperties}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={styles.word} aria-hidden="true">
          {Array.from(word).map((char) => {
            const i = index++;
            return (
              <span key={i} className={styles.char} style={{ "--i": i } as CSSProperties}>
                {char}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && <span className={styles.space}>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
