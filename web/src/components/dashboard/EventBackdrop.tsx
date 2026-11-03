import styles from "./EventBackdrop.module.css";

/** Fixed aurora and grid behind the in-event pages. Purely decorative. */
export function EventBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <i className={`${styles.orb} ${styles.red}`} />
      <i className={`${styles.orb} ${styles.blue}`} />
      <i className={`${styles.orb} ${styles.violet}`} />
      <div className={styles.grid} />
    </div>
  );
}
