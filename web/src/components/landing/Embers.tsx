import styles from "./Embers.module.css";

// Drifting lights across the whole page: left %, size px, duration s, delay s, colour.
const EMBERS: Array<[number, number, number, number, "gold" | "red" | "blue"]> = [
  [3, 3, 24, 0, "gold"],
  [9, 4, 30, 6, "blue"],
  [16, 3, 26, 12, "gold"],
  [23, 5, 32, 3, "red"],
  [31, 3, 28, 15, "gold"],
  [38, 4, 34, 9, "blue"],
  [46, 3, 25, 18, "gold"],
  [53, 5, 31, 1, "red"],
  [60, 3, 27, 21, "gold"],
  [67, 4, 33, 7, "blue"],
  [74, 3, 26, 13, "gold"],
  [81, 5, 30, 4, "red"],
  [88, 3, 29, 17, "gold"],
  [94, 4, 35, 10, "blue"],
];

/** Fixed layer of slowly rising gold, red and blue sparks behind the whole landing page. */
export function Embers() {
  return (
    <div className={styles.embers} aria-hidden="true">
      {EMBERS.map(([left, size, duration, delay, tone], index) => (
        <b
          key={index}
          className={`${styles.ember} ${styles[tone]}`}
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
