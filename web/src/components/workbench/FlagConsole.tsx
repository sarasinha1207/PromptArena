"use client";

import type { FormEvent } from "react";
import { useFlagSubmit } from "@/hooks/useFlagSubmit";
import { Celebration } from "./Celebration";
import styles from "./FlagConsole.module.css";

interface FlagConsoleProps {
  levelId: string | number;
  solved: boolean;
  /** False while the round is paused, ended or otherwise not accepting flags. */
  open: boolean;
  closedReason: string | null;
}

/**
 * Flag verification console (handbook §6.2): input, submit, status line, the
 * wrong-flag cooldown timer and a celebration when a level is solved.
 */
export function FlagConsole({ levelId, solved, open, closedReason }: FlagConsoleProps) {
  const { flag, setFlag, submitting, result, cooldown, submit } = useFlagSubmit(levelId);
  const locked = !open || solved || cooldown.active || submitting;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!locked) void submit();
  }

  // Only shown when there is something to say (cooldown, closed round, error).
  const status = cooldown.active
    ? { kind: "info", text: `Locked. Try again in ${cooldown.secondsLeft}s.` }
    : !open && !solved
      ? { kind: "info", text: closedReason ?? "Flag submission is closed." }
      : result?.kind === "error"
        ? { kind: "error", text: result.text }
        : null;

  return (
    <section className={styles.console} aria-labelledby="flag-console-title">
      <h2 id="flag-console-title" className={styles.title}>
        Flag verification console
      </h2>

      {solved ? (
        <div className={styles.solved} role="status">
          {result?.kind === "success" && <Celebration />}
          <span className={styles.check} aria-hidden="true">
            ✓
          </span>
          <div>
            <p className={styles.solvedTitle}>Level solved</p>
            {result?.kind === "success" ? (
              <p className={styles.award}>
                +{result.points.toLocaleString("en-US")} points
                {result.firstBlood ? " and the First Blood bonus!" : ""}
              </p>
            ) : (
              <p className={styles.solvedNote}>Your team has already captured this flag.</p>
            )}
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter extracted flag: FLAG{...}"
              aria-label="Extracted flag"
              autoComplete="off"
              spellCheck={false}
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              disabled={locked}
            />
            <button type="submit" className={styles.submit} disabled={locked || flag.trim() === ""}>
              {submitting ? "Checking" : "Submit flag"}
            </button>
          </div>
          {status && (
            <p className={styles.status} data-kind={status.kind} role="status">
              {status.text}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
