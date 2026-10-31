import styles from "./PhasePlaceholder.module.css";

interface PhasePlaceholderProps {
  title: string;
  route: string;
  /** Handbook §14 sprint that builds this screen. */
  phase: number;
}

/** Marks a route from the handbook's routing tree (§4.1) that a later phase will build. */
export function PhasePlaceholder({ title, route, phase }: PhasePlaceholderProps) {
  return (
    <section className={styles.box}>
      <p className={styles.phase}>Built in Phase {phase}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.route}>
        Route <code>{route}</code>
      </p>
    </section>
  );
}
