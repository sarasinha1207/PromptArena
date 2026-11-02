"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  variant?: "up" | "left" | "right" | "zoom" | "blur";
  /** Delay in ms, used to stagger siblings. */
  delay?: number;
  className?: string;
}

/** Fades content in the first time it scrolls into view. */
export function Reveal({ children, variant = "up", delay = 0, className = "" }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${className}`}
      data-variant={variant}
      data-in={inView}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
