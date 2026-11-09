"use client";

import { useEffect, useRef } from "react";
import { LoginButton } from "./LoginButton";
import { SplitText } from "./SplitText";
import { Typewriter } from "./Typewriter";
import shared from "./shared.module.css";
import styles from "./Hero.module.css";

const PHRASES = [
  "break a hardened AI.",
  "harden your own prompt.",
  "face another team live.",
];

// Drifting sparks: left %, size px, duration s, delay s, colour.
const SPARKS: Array<[number, number, number, number, "gold" | "red" | "blue"]> = [
  [5, 4, 15, 0, "red"],
  [12, 3, 18, 3, "gold"],
  [21, 5, 13, 6, "blue"],
  [30, 3, 19, 1, "gold"],
  [41, 4, 15, 8, "red"],
  [52, 3, 18, 4, "gold"],
  [61, 5, 14, 9, "blue"],
  [70, 3, 17, 2, "gold"],
  [79, 4, 19, 7, "red"],
  [88, 5, 13, 5, "blue"],
  [95, 3, 17, 10, "gold"],
];

/**
 * Cinematic hero: the PromptArena wordmark in gold, the two rounds as the headline,
 * and a colourised Gandalf-style wizard lit red from the left and blue from the right.
 * Light patches and the portrait drift a few pixels with the cursor.
 */
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;

    const step = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      stage.style.setProperty("--mx", x.toFixed(3));
      stage.style.setProperty("--my", y.toFixed(3));
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
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
        {/* Light patches and drifting sparks */}
        <div className={styles.lights} aria-hidden="true">
          <i className={`${styles.patch} ${styles.patchRed}`} />
          <i className={`${styles.patch} ${styles.patchBlue}`} />
          <i className={`${styles.patch} ${styles.patchGold}`} />
          {SPARKS.map(([left, size, duration, delay, tone], index) => (
            <b
              key={index}
              className={`${styles.spark} ${styles[`spark_${tone}`]}`}
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>

        {/* Colourised from a black-and-white picture of the wizard */}
        <div className={styles.figure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/assets/landing/gandalf-hero.webp"
            alt="A wizard in a pointed hat, smoking a pipe, in profile against a bright mist"
            width={1000}
            height={1344}
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div className={styles.content}>
          <h1 id="hero-title" className={styles.wordmark}>
            PromptArena
          </h1>
          <span className={styles.rule} aria-hidden="true" />

          <p className={styles.headline} aria-label="Break the AI. Defend the AI.">
            <span className={styles.line} aria-hidden="true">
              <SplitText text="Break the AI." tone="red" base={200} />
            </span>
            <span className={styles.line} aria-hidden="true">
              <SplitText text="Defend the AI." tone="blue" base={650} />
            </span>
          </p>

          <p className={styles.lead}>An adversarial competition for the AI era.</p>
          <p className={styles.typeLine}>
            <span>Your team will</span> <Typewriter phrases={PHRASES} />
          </p>

          <div className={styles.actions}>
            <LoginButton />
            <a href="#rulebook" className={`${shared.btn} ${shared.btnGhost}`}>
              Read the rulebook
            </a>
          </div>

          <div className={styles.rounds}>
            <article className={`${styles.round} ${styles.roundRed}`}>
              <p className={styles.roundTag}>Round 1: Red Teaming</p>
              <p className={styles.roundCopy}>
                Talk hardened AI characters into handing over the secret flag they are guarding.
              </p>
            </article>
            <article className={`${styles.round} ${styles.roundBlue}`}>
              <p className={styles.roundTag}>Round 2: Blue Teaming</p>
              <p className={styles.roundCopy}>
                Write the system prompt and guardrails that keep your bot helpful while 20
                automated attacks try to break it.
              </p>
            </article>
          </div>
        </div>

        <a href="#about" className={styles.cue} aria-label="Scroll to About">
          <span className={styles.cueDot} />
        </a>
      </div>
    </section>
  );
}
