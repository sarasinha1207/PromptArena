import Link from "next/link";
import { RULES } from "@/content/landing";
import { FlagDemo } from "./FlagDemo";
import { Reveal } from "./Reveal";
import shared from "./shared.module.css";
import styles from "./RulebookSection.module.css";

export function RulebookSection() {
  return (
    <section id="rulebook" className={`${shared.section} ${styles.rulebook}`}>
      {/* Background style: blueprint graph paper */}
      <div className={styles.paper} aria-hidden="true" />
      <i className={styles.gold} aria-hidden="true" />

      <div className={shared.container}>
        <div className={styles.layout}>
          <div className={styles.text}>
            <Reveal variant="left">
              <h2 className={shared.heading}>The rulebook, short version.</h2>
              <p className={shared.lead}>
                The rules exist to keep the contest fair and the servers standing. Read the
                full rulebook before your first attack.
              </p>
            </Reveal>

            <dl className={styles.rules}>
              {RULES.map((rule, index) => (
                <Reveal key={rule.title} variant="left" delay={index * 90} className={styles.rule}>
                  <dt>{rule.title}</dt>
                  <dd>{rule.text}</dd>
                </Reveal>
              ))}
            </dl>

            <Reveal variant="up">
              <Link href="/rules" className={`${shared.btn} ${shared.btnGhost}`}>
                Read the full rulebook
              </Link>
            </Reveal>
          </div>

          <aside className={styles.side} aria-label="Scoring and flag examples">
            <Reveal variant="right" delay={100}>
              <div className={styles.formula}>
                <p className={styles.formulaTitle}>How a level&apos;s points are set</p>
                <p className={styles.equation}>
                  points = max( <i>minimum</i>, <i>base</i> &times; (1 &minus; <i>solves</i>{" "}
                  &times; <i>decay rate</i>) )
                </p>
                <p className={styles.formulaNote}>
                  When a new solve lowers the value, it drops for every earlier solver too.
                </p>
              </div>
            </Reveal>

            <Reveal variant="right" delay={220}>
              <FlagDemo />
            </Reveal>

            <Reveal variant="right" delay={340}>
              <p className={styles.warning}>
                Leaking or sharing flags results in immediate team disqualification.
              </p>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
}
