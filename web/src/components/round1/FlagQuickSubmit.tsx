"use client";

import { useState, type FormEvent } from "react";
import { useFlagCooldown } from "@/hooks/useFlagCooldown";
import { ApiError } from "@/lib/api/client";
import { submitFlag } from "@/lib/api/arena";
import { markChallengeSolved, scheduleChallengeRefresh } from "@/stores/challengesStore";
import styles from "./FlagQuickSubmit.module.css";

interface FlagQuickSubmitProps {
  levelId: string | number;
  solved: boolean;
  /** False while the round is paused, ended or otherwise not accepting flags. */
  open: boolean;
  closedReason: string | null;
}

type Result =
  | { kind: "success"; points: number; firstBlood: boolean }
  | { kind: "error"; text: string }
  | null;

/**
 * Quick flag box on a level card (handbook §6.1). The server decides whether
 * a flag is right; the browser only sends it and enforces the cooldown timer.
 */
export function FlagQuickSubmit({ levelId, solved, open, closedReason }: FlagQuickSubmitProps) {
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const cooldown = useFlagCooldown(levelId);

  const locked = !open || solved || cooldown.active || submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked || flag.trim() === "") return;
    setSubmitting(true);
    setResult(null);
    try {
      const response = await submitFlag(levelId, flag.trim());
      setResult({
        kind: "success",
        points: response.points_awarded,
        firstBlood: response.first_blood,
      });
      setFlag("");
      markChallengeSolved(levelId);
      scheduleChallengeRefresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { cooldown_until?: string } | null;
        if (body?.cooldown_until) cooldown.start(body.cooldown_until);
        setResult({
          kind: "error",
          text:
            error.reason === "INVALID_FLAG"
              ? "That isn't the flag for this level."
              : error.message,
        });
      } else {
        setResult({ kind: "error", text: "Could not submit the flag. Try again." });
      }
    } finally {
      setSubmitting(false);
    }
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

      <p className={styles.status} data-kind={result?.kind ?? (cooldown.active || !open ? "info" : "idle")} role="status">
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
