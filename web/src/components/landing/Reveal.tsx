"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  variant?: "up" | "left" | "right" | "zoom" | "blur";
  /** Delay in ms, used to stagger siblings. */
  delay?: number;
  className?: string;
}

/**
 * Fades content in as it scrolls into view. Content is visible from the first
 * paint, so a slow script load never leaves a blank page. Once the page is
 * interactive, only blocks that are still below the fold are hidden, and they
 * animate in when reached.
 */
export function Reveal({ children, variant = "up", delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // "static": visible, no animation. "armed": hidden until scrolled to. "in": revealed.
  const [phase, setPhase] = useState<"static" | "armed" | "in">("static");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const belowFold = element.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (reduceMotion || !belowFold || !("IntersectionObserver" in window)) return;

    setPhase("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("in");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${className}`}
      data-variant={variant}
      data-phase={phase}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
