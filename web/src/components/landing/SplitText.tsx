"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./SplitText.module.css";

interface SplitTextProps {
  text: string;
  tone?: "red" | "blue" | "white";
  /** Delay before the first letter, in ms. */
  base?: number;
  /** "mount" plays on load (pure CSS, so it needs no script), "view" plays when scrolled into view. */
  trigger?: "mount" | "view";
  className?: string;
}

/** Animates a line of text letter by letter. The text is readable even if scripts load late. */
export function SplitText({
  text,
  tone = "white",
  base = 0,
  trigger = "mount",
  className = "",
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // mount: plays from the first paint. view: stays visible until the script arms it.
  const [phase, setPhase] = useState<"idle" | "armed" | "play">(trigger === "mount" ? "play" : "idle");

  useEffect(() => {
    if (trigger !== "view") return;
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const belowFold = element.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (reduceMotion || !belowFold || !("IntersectionObserver" in window)) {
      setPhase(reduceMotion ? "idle" : "play");
      return;
    }

    setPhase("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("play");
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [trigger]);

  const chars = Array.from(text);
  const total = chars.filter((c) => c !== " ").length;

  let index = 0;
  const words = text.split(" ");

  return (
    <span
      ref={ref}
      className={`${styles.root} ${className}`}
      data-tone={tone}
      data-phase={phase}
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
