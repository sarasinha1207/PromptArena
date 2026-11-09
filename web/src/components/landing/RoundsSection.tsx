"use client";

import { useState } from "react";
import { ROUNDS, type RoundId } from "@/content/landing";
import { BluePreview, RedPreview, VersusPreview } from "./RoundPreviews";
import { SectionHeader } from "./SectionHeader";
import { TiltCard } from "./TiltCard";
import shared from "./shared.module.css";
import styles from "./RoundsSection.module.css";

const PREVIEWS: Record<RoundId, () => React.JSX.Element> = {
  red: RedPreview,
  blue: BluePreview,
  versus: VersusPreview,
};

export function RoundsSection() {
  const [activeId, setActiveId] = useState<RoundId>("red");
  const round = ROUNDS.find((r) => r.id === activeId) ?? ROUNDS[0];
  const Preview = PREVIEWS[round.id];

  return (
    <section id="rounds" className={shared.section} data-lights="b">
      {/* Background: the wizard on the hill, faint, under a slow red and blue light mesh */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.hill}
        src="/assets/landing/gandalf-shire.webp"
        alt=""
        width={1440}
        height={1240}
        loading="lazy"
        decoding="async"
      />

      <div className={shared.container}>
        <SectionHeader
          title="Three rounds. Two sides. One winner."
          lead="Pick a round to see what you do and a preview of the screen you will play on."
        />

        <div className={styles.tabs} role="tablist" aria-label="Rounds">
            {ROUNDS.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                id={`round-tab-${r.id}`}
                aria-selected={r.id === activeId}
                aria-controls="round-panel"
                className={styles.tab}
                data-side={r.id}
                data-active={r.id === activeId}
                onClick={() => setActiveId(r.id)}
              >
                <span className={styles.tabRound}>{r.tab}</span>
                <span className={styles.tabName}>{r.name}</span>
              </button>
            ))}
        </div>

        <div
          key={round.id}
          id="round-panel"
          role="tabpanel"
          aria-labelledby={`round-tab-${round.id}`}
          className={styles.panel}
        >
          <div className={styles.copy}>
            <p className={styles.role} data-side={round.id}>
              {round.role}
            </p>
            <p className={styles.summary}>{round.summary}</p>
            <ul className={styles.points}>
              {round.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {round.chips && (
              <div className={styles.chips} aria-label="Attack groups">
                {round.chips.map((chip) => (
                  <span key={chip} className={styles.chip}>
                    {chip}
                  </span>
                ))}
              </div>
            )}
            {round.id === "red" && (
              <a href="#levels" className={styles.jump}>
                Meet the five levels
              </a>
            )}
          </div>

          <div className={styles.preview}>
            <TiltCard>
              <Preview />
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
