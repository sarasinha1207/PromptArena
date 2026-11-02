"use client";

import { useState } from "react";
import styles from "./FlagDemo.module.css";

/*
 * Illustrates handbook §2.1: each team has its own flag per challenge, and
 * submitting another team's flag is detected. The example flag is from the
 * handbook; the second one is illustrative.
 */
const TEAM_7_FLAG = "FLAG{L1_team07_89d3a7e2}";
const TEAM_8_FLAG = "FLAG{L1_team08_5c1e40b7}";

export function FlagDemo() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={styles.demo}>
      <div className={styles.flags}>
        <div className={styles.flag}>
          <span className={styles.who}>Team 07&apos;s flag for Level 1</span>
          <code>{TEAM_7_FLAG}</code>
        </div>
        <div className={styles.flag}>
          <span className={styles.who}>Team 08&apos;s flag for Level 1</span>
          <code>{TEAM_8_FLAG}</code>
        </div>
      </div>

      <button
        type="button"
        className={styles.button}
        onClick={() => setSubmitted(true)}
        disabled={submitted}
      >
        Team 08 submits Team 07&apos;s flag
      </button>

      <p className={styles.result} data-shown={submitted} role="status">
        {submitted
          ? "Flag mismatch. The server records an audit alert and flags the submission for cheating penalties."
          : "Try it: see what happens when a team shares its flag."}
      </p>

      {submitted && (
        <button type="button" className={styles.reset} onClick={() => setSubmitted(false)}>
          Reset
        </button>
      )}
    </div>
  );
}
