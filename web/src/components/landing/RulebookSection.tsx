import Link from "next/link";
import { RULES } from "@/content/landing";
import { FlagDemo } from "./FlagDemo";
import { SectionHeader } from "./SectionHeader";
import shared from "./shared.module.css";
import styles from "./RulebookSection.module.css";

export function RulebookSection() {
  return (
    <section id="rulebook" className={shared.section} data-lights="b">
      <div className={shared.container}>
        <div className={styles.layout}>
          <div className={styles.text}>
            <SectionHeader
              title="The rulebook, short version."
              lead="The rules exist to keep the contest fair and the servers standing. Read the full rulebook before your first attack."
            />

            <dl className={styles.rules}>
              {RULES.map((rule) => (
                <div key={rule.title} className={styles.rule}>
                  <dt>{rule.title}</dt>
                  <dd>{rule.text}</dd>
                </div>
              ))}
            </dl>

            <Link href="/rules" className={`${shared.btn} ${shared.btnGhost}`}>
              Read the full rulebook
            </Link>
          </div>

          <aside className={styles.side} aria-label="Scoring and flag examples">
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

            <FlagDemo />

            <p className={styles.warning}>
              Leaking or sharing flags results in immediate team disqualification.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
