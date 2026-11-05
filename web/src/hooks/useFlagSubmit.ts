"use client";

import { useCallback, useState } from "react";
import { useFlagCooldown } from "@/hooks/useFlagCooldown";
import { ApiError } from "@/lib/api/client";
import { submitFlag } from "@/lib/api/arena";
import { markChallengeSolved, scheduleChallengeRefresh } from "@/stores/challengesStore";

export type FlagResult =
  | { kind: "success"; points: number; firstBlood: boolean }
  | { kind: "error"; text: string }
  | null;

/**
 * Flag submission shared by the level card and the workbench. The server
 * decides if a flag is right (handbook §13.2); this only sends it and keeps
 * the 15 s wrong-flag cooldown (§2.5).
 */
export function useFlagSubmit(levelId: string | number) {
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FlagResult>(null);
  const cooldown = useFlagCooldown(levelId);
  const startCooldown = cooldown.start;

  const submit = useCallback(async () => {
    const value = flag.trim();
    if (value === "") return;
    setSubmitting(true);
    setResult(null);
    try {
      const response = await submitFlag(levelId, value);
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
        if (body?.cooldown_until) startCooldown(body.cooldown_until);
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
  }, [flag, levelId, startCooldown]);

  return { flag, setFlag, submitting, result, cooldown, submit };
}
