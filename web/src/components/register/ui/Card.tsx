"use client";

import { useId, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  /** Card heading. Without it the card is just a surface. */
  title?: string;
  description?: string;
  /** Extra class for the outer element, e.g. the entrance animation. */
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Frosted glass surface used by every block on the registration page. */
export function Card({ title, description, className = "", style, children }: CardProps) {
  const titleId = useId();

  // Moves the soft cursor light to the pointer.
  const followPointer = (event: PointerEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <section
      className={`${styles.card} ${className}`}
      style={style}
      aria-labelledby={title ? titleId : undefined}
      onPointerMove={followPointer}
    >
      {title && (
        <h2 className={styles.title} id={titleId}>
          <i />
          {title}
        </h2>
      )}
      {description && <p className={styles.description}>{description}</p>}
      <div className={title ? styles.body : undefined}>{children}</div>
    </section>
  );
}
