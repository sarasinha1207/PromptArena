import styles from "./RegisterBackground.module.css";

/** Fixed, decorative backdrop behind the registration page. */
export function RegisterBackground() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={`${styles.blob} ${styles.b1}`} />
      <div className={`${styles.blob} ${styles.b2}`} />
      <div className={`${styles.blob} ${styles.b3}`} />
      <div className={`${styles.blob} ${styles.b4}`} />
      <div className={styles.grid} />
    </div>
  );
}
