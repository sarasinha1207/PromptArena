"use client";

import { useEffect, useRef } from "react";
import { LoginButton } from "./LoginButton";
import shared from "./shared.module.css";
import styles from "./Hero.module.css";

/**
 * Split-screen hero: red side (attack) against blue side (defend).
 * The seam eases toward the cursor, so the page itself acts out the contest.
 */
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    let target = 50;
    let current = 50;
    let frame = 0;

    const step = () => {
      current += (target - current) * 0.09;
      stage.style.setProperty("--split", `${current.toFixed(2)}%`);
      frame = Math.abs(target - current) > 0.05 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      target = 40 + ratio * 20;
      kick();
    };
    const onLeave = () => {
      target = 50;
      kick();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.stage} ref={stageRef}>
        <h1 id="hero-title" className={styles.srOnly}>
          PromptArena: break the AI, defend the AI
        </h1>

        {/* Blue side sits underneath and fills the whole stage */}
        <div className={styles.blue}>
          <div className={styles.blueContent}>
            <p className={styles.roundTag}>Round 2: Blue Teaming</p>
            <p className={`${styles.headline} ${styles.headlineBlue}`} aria-hidden="true">
              Defend
              <br />
              the AI.
            </p>
            <p className={styles.sideCopy}>
              Write the system prompt and guardrails that keep your bot helpful while 20
              automated attacks try to break it.
            </p>
          </div>
        </div>

        {/* Red side is skewed and sized by --split */}
        <div className={styles.red}>
          <div className={styles.redContent}>
            <p className={styles.roundTag}>Round 1: Red Teaming</p>
            <p className={`${styles.headline} ${styles.headlineRed}`} aria-hidden="true">
              Break
              <br />
              the AI.
            </p>
            <p className={styles.sideCopy}>
              Talk hardened AI characters into handing over the secret flag they are
              guarding.
            </p>
          </div>
        </div>

        <div className={styles.versus} aria-hidden="true">
          <span>VS</span>
        </div>

        <div className={styles.foot}>
          <p className={styles.footCopy}>
            An adversarial competition for the AI era. Then in Round 3, the two sides meet
            live.
          </p>
          <div className={styles.actions}>
            <LoginButton />
            <a href="#rulebook" className={`${shared.btn} ${shared.btnGhost}`}>
              Read the rulebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
