"use client";

import { useEffect, useState } from "react";
import { serverNow } from "@/lib/clock/serverClock";
import { isPausedState } from "@/lib/tournament/labels";
import { useStore } from "@/stores/createStore";
import { tournamentStore } from "@/stores/tournamentStore";

/**
 * Remaining round time in ms, derived from the server end epoch and the
 * calibrated drift offset (handbook §4.3). Frozen while the round is paused.
 * Returns null when no end time is known.
 */
export function useMasterClock(): number | null {
  const targetEnd = useStore(tournamentStore, (s) => s.targetEndEpoch);
  const frozen = useStore(tournamentStore, (s) => s.frozenRemainingMs);
  const paused = useStore(tournamentStore, (s) => isPausedState(s.state));
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const compute = (): number | null => {
      if (paused) return frozen;
      if (targetEnd === null) return null;
      return Math.max(0, targetEnd - serverNow());
    };

    setRemaining(compute());
    if (paused || targetEnd === null) return;

    const id = setInterval(() => setRemaining(compute()), 250);
    return () => clearInterval(id);
  }, [targetEnd, frozen, paused]);

  return remaining;
}
