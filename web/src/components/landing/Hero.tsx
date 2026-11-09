"use client";

import { useEffect, useRef } from "react";
import { GlyphField } from "./GlyphField";
import { EVENT_DETAILS } from "@/content/landing";
import { LoginButton } from "./LoginButton";
import { RegisterButton } from "./RegisterButton";
import { SplitText } from "./SplitText";
import { Typewriter } from "./Typewriter";
import shared from "./shared.module.css";
import styles from "./Hero.module.css";

const PHRASES = [
  "break a hardened AI.",
  "harden your own prompt.",
  "face another team live.",
];

/**
 * Split-screen hero: red side (attack) against blue side (defend).
 * The seam eases toward the cursor, so the page itself acts out the contest.
 */
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // The red and blue background runs behind the details card, so the stage needs the card's height.
  useEffect(() => {
    const stage = stageRef.current;
    const card = detailsRef.current;
    if (!stage || !card) return;
    const sync = () => stage.style.setProperty("--details-h", `${card.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

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
          <div className={styles.blueFx} aria-hidden="true">
            <i className={styles.blueGrid} />
            <i className={`${styles.blob} ${styles.blobBlue}`} />
            <GlyphField tone="blue" />
          </div>
          <div className={styles.blueContent}>
            <p className={styles.roundTag}>Round 2: Blue Teaming</p>
            <p className={styles.headline} aria-hidden="true">
              <span className={styles.line}>
                <SplitText text="Defend" tone="blue" base={500} />
              </span>
              <span className={styles.line}>
                <SplitText text="the AI." tone="blue" base={850} />
              </span>
            </p>
            <p className={styles.sideCopy}>
              Write the system prompt and guardrails that keep your bot helpful while 20
              automated attacks try to break it.
            </p>
          </div>
        </div>

        {/* Red side is skewed and sized by --split */}
        <div className={styles.red}>
          <div className={styles.redFx} aria-hidden="true">
            <i className={styles.redStripes} />
            <i className={`${styles.blob} ${styles.blobRed}`} />
            <GlyphField tone="red" />
          </div>
          <div className={styles.redContent}>
            <p className={styles.roundTag}>Round 1: Red Teaming</p>
            <p className={styles.headline} aria-hidden="true">
              <span className={styles.line}>
                <SplitText text="Break" tone="red" base={250} />
              </span>
              <span className={styles.line}>
                <SplitText text="the AI." tone="red" base={600} />
              </span>
            </p>
            <p className={styles.sideCopy}>
              Talk hardened AI characters into handing over the secret flag they are
              guarding.
            </p>
          </div>
        </div>

        <div className={styles.floor} aria-hidden="true" />

        <div className={styles.versus} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.vs}>VS</span>
        </div>

        <div className={styles.foot}>
          <p className={styles.footCopy}>An adversarial competition for the AI era.</p>
          <p className={styles.typeLine}>
            <span>Your team will</span> <Typewriter phrases={PHRASES} />
          </p>
          <div className={styles.actions}>
            <RegisterButton />
            <LoginButton variant="ghost" />
            <a href="#rulebook" className={`${shared.btn} ${shared.btnGhost}`}>
              Read the rulebook
            </a>
          </div>
        </div>

      {/* Event details: one horizontal card along the bottom of the hero */}
      <div className={styles.detailsWrap} ref={detailsRef}>
        <dl className={styles.details} aria-label="Event details">
          {EVENT_DETAILS.items.map((item) => (
            <div key={item.label} className={styles.detail}>
              <dt className={styles.detailLabel}>{item.label}</dt>
              <dd className={styles.detailValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      </div>
    </section>
  );
}
