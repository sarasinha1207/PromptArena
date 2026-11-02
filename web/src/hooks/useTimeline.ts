"use client";

import { useEffect, useState } from "react";

/**
 * Returns an increasing step counter that advances through the given delays
 * (ms before each step), then holds. Used for the looping round previews.
 * With reduced motion enabled, jumps straight to the final step.
 */
export function useTimeline(delays: number[], loopAfterMs?: number): number {
  const [step, setStep] = useState(0);
  const key = delays.join(",");

  useEffect(() => {
    const total = delays.length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(total);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setStep(0);
      let elapsed = 0;
      delays.forEach((delay, index) => {
        elapsed += delay;
        timers.push(
          setTimeout(() => {
            if (!cancelled) setStep(index + 1);
          }, elapsed),
        );
      });
      if (loopAfterMs !== undefined) {
        timers.push(
          setTimeout(() => {
            if (!cancelled) run();
          }, elapsed + loopAfterMs),
        );
      }
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, loopAfterMs]);

  return step;
}
