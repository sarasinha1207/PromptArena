"use client";

import { useState, type CSSProperties } from "react";
import { LEVELS } from "@/content/landing";
import { Reveal } from "./Reveal";
import shared from "./shared.module.css";
import styles from "./LevelsSection.module.css";

export function LevelsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="levels" className={`${shared.section} ${styles.levels}`}>
      {/* Background style: glowing perspective floor */}
      <div className={styles.floor} aria-hidden="true" />
      <i className={styles.halo} aria-hidden="true" />

      <div className={shared.container}>
        <Reveal variant="blur">
          <h2 className={shared.heading}>Five levels. Five minds to break.</h2>
          <p className={shared.lead}>
            Round 1 puts you against five AI characters, each guarding a secret. Every level
            is harder than the last, and every character fights back in its own voice.
          </p>
        </Reveal>

        <Reveal variant="zoom" delay={150}>
          <div className={styles.rail}>
            {LEVELS.map((level, index) => {
              const active = index === activeIndex;
              return (
                <article
                  key={level.name}
                  className={styles.slat}
                  data-active={active}
                  data-voice={level.voice}
                  style={{ "--accent": level.accent } as CSSProperties}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setActiveIndex(index);
                  }}
                >
                  <button
                    type="button"
                    className={styles.slatButton}
                    aria-expanded={active}
                    aria-controls={`level-${level.level}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className={styles.slatNumber}>Level {level.level}</span>
                    <span className={styles.slatName}>{level.name}</span>
                  </button>

                  <div
                    id={`level-${level.level}`}
                    className={styles.detail}
                    aria-hidden={!active}
                  >
                    <p className={styles.levelTag}>Level {level.level}</p>
                    <h3 className={styles.name}>{level.name}</h3>
                    <p className={styles.title}>{level.title}</p>

                    <div className={styles.tier}>
                      <span className={styles.meter} aria-hidden="true">
                        {LEVELS.map((_, i) => (
                          <i key={i} data-on={i < level.level} style={{ "--k": i } as CSSProperties} />
                        ))}
                      </span>
                      <span>
                        {level.tier}. {level.archetype}.
                      </span>
                    </div>

                    <p className={styles.story}>{level.story}</p>
                    <p className={styles.quirks}>{level.quirks}</p>

                    <div className={styles.voice}>
                      <p className={styles.line}>{level.greeting}</p>
                      <p className={`${styles.line} ${styles.refusal}`}>{level.refusal}</p>
                    </div>

                    <p className={styles.secret}>
                      Secret flag: <span aria-label="hidden">██████████████</span> unique to
                      your team
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
