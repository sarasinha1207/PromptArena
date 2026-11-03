"use client";

import { useCallback, useEffect, useState } from "react";
import { serverNow } from "@/lib/clock/serverClock";

const keyFor = (levelId: string | number) => `promptarena.cooldown.${levelId}`;

function readStored(levelId: string | number): number | null {
  try {
    const raw = window.localStorage.getItem(keyFor(levelId));
    const until = raw ? Number(raw) : NaN;
    return Number.isFinite(until) ? until : null;
  } catch {
    return null;
  }
}

/**
 * Wrong-flag lockout (handbook §2.5, §13.3). The server sends `cooldown_until`;
 * it is saved in localStorage so a page refresh cannot clear the timer, and
 * compared against server time, not the local clock.
 */
export function useFlagCooldown(levelId: string | number) {
  const [until, setUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const stored = readStored(levelId);
    if (stored !== null && stored > serverNow()) setUntil(stored);
  }, [levelId]);

  useEffect(() => {
    if (until === null) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => {
      const left = Math.ceil((until - serverNow()) / 1000);
      if (left <= 0) {
        setUntil(null);
        try {
          window.localStorage.removeItem(keyFor(levelId));
        } catch {
          /* storage unavailable */
        }
      } else {
        setSecondsLeft(left);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [until, levelId]);

  /** Starts a lockout from the server's `cooldown_until` ISO timestamp. */
  const start = useCallback(
    (cooldownUntil: string) => {
      const timestamp = Date.parse(cooldownUntil);
      if (!Number.isFinite(timestamp)) return;
      try {
        window.localStorage.setItem(keyFor(levelId), String(timestamp));
      } catch {
        /* storage unavailable: the timer still runs until reload */
      }
      setUntil(timestamp);
    },
    [levelId],
  );

  return { secondsLeft, active: until !== null && secondsLeft > 0, start };
}
