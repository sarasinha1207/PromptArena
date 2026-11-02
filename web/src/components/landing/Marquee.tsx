import styles from "./Marquee.module.css";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  tone?: "gradient" | "ghost";
}

/** Slanted, endlessly scrolling ribbon of keywords between sections. */
export function Marquee({ items, reverse = false, tone = "gradient" }: MarqueeProps) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.band} data-tone={tone} data-reverse={reverse}>
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <ul key={copy} className={styles.list}>
              {items.map((item) => (
                <li key={`${copy}-${item}`}>{item}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
