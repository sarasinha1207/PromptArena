import { GlyphField } from "./GlyphField";
import { LoginButton } from "./LoginButton";
import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";
import shared from "./shared.module.css";
import styles from "./ClosingCta.module.css";

export function ClosingCta() {
  return (
    <section className={styles.cta} aria-labelledby="closing-title">
      {/* Background style: bright aurora with rising glyphs */}
      <i className={`${styles.aurora} ${styles.auroraRed}`} aria-hidden="true" />
      <i className={`${styles.aurora} ${styles.auroraBlue}`} aria-hidden="true" />
      <GlyphField tone="mixed" />

      <div className={`${shared.container} ${styles.inner}`}>
        <h2 id="closing-title" className={styles.title}>
          <SplitText text="Your team's" trigger="view" />
          <br />
          <SplitText text="flag is waiting." trigger="view" base={350} />
        </h2>

        <Reveal variant="up" delay={300}>
          <p className={styles.copy}>
            Log in with the user ID and password emailed to your team leader.
          </p>
        </Reveal>

        <Reveal variant="zoom" delay={450}>
          <div className={styles.action}>
            <span className={styles.ring} aria-hidden="true" />
            <LoginButton />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
