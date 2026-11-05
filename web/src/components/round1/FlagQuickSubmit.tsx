"use client";

import type { FormEvent } from "react";
import { useFlagSubmit } from "@/hooks/useFlagSubmit";
import styles from "./FlagQuickSubmit.module.css";

interface FlagQuickSubmitProps {
  levelId: string | number;
  solved: boolean;
  /** False while the round is paused, ended or otherwise not accepting flags. */
  open: boolean;
  closedReason: string | null;
}

/** Quick flag box on a level card (handbook §6.1). */
export function FlagQuickSubmit({ levelId, solved, open, closedReason }: FlagQuickSubmitProps) {
  const { flag, setFlag, submitting, result, cooldown, submit } = useFlagSubmit(levelId);
  const locked = !open || solved || cooldown.active || submitting;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!locked) void submit();
  }

  if (solved) {
    return (
      <p className={styles.solved} role="status">
        <span className={styles.check} aria-hidden="true">
          ✓
        </span>
        Solved
        {result?.kind === "success" && (
          <span className={styles.award}>
            +{result.points.toLocaleString("en-US")} points
            {result.firstBlood ? ", First Blood!" : ""}
          </span>
        )}
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <input
          type="text"
          className={styles.input}
          placeholder="FLAG{...}"
          aria-label="Flag for this level"
          autoComplete="off"
          spellCheck={false}
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          disabled={locked}
        />
        <button type="submit" className={styles.submit} disabled={locked || flag.trim() === ""}>
          {submitting ? "Checking" : "Submit"}
        </button>
      </div>

      <p
        className={styles.status}
        data-kind={result?.kind ?? (cooldown.active || !open ? "info" : "idle")}
        role="status"
      >
        {cooldown.active
          ? `Locked. Try again in ${cooldown.secondsLeft}s.`
          : !open
            ? (closedReason ?? "Flag submission is closed.")
            : result?.kind === "error"
              ? result.text
              : "Paste the flag you extracted."}
      </p>
    </form>
  );
}
