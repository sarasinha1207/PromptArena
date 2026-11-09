import styles from "./ProgressBar.module.css";

/** How much of the form is filled in, as a percentage. */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-label="Form progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className={styles.top}>
        <span>Form progress</span>
        <span>{percent}%</span>
      </div>
      <div className={styles.bar}>
        <span className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
