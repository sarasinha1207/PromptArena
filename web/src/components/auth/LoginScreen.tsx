import Link from "next/link";
import { GlyphField } from "@/components/landing/GlyphField";
import { LogoMark } from "@/components/landing/LogoMark";
import { LOGIN_RULES } from "@/content/landing";
import { LoginForm } from "./LoginForm";
import styles from "./LoginScreen.module.css";

/**
 * Full-page login. Left: event name, short description and event rules.
 * Right: the login card. The background is a fixed layer, so it always
 * fills the window however tall the content is.
 */
export function LoginScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.bgLeft}>
          <i className={`${styles.orb} ${styles.orbRed}`} />
          <i className={`${styles.orb} ${styles.orbBlue}`} />
          <div className={styles.floor} />
          <GlyphField tone="mixed" />
        </div>
        <div className={styles.bgRight}>
          <i className={`${styles.orb} ${styles.orbViolet}`} />
          <div className={styles.dots} />
        </div>
        {/* Wizard picture, coloured from black and white, standing on the line between the two halves */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.wizardPhoto}
          src="/assets/landing/gandalf-hero.webp"
          alt=""
          width={1000}
          height={1344}
          decoding="async"
        />
      </div>

      <aside className={styles.showcase}>
        <div className={styles.top}>
          <Link href="/" className={styles.mark} aria-label="PromptArena home">
            <LogoMark size={56} />
          </Link>
          <h2 className={styles.name}>PromptArena</h2>
          <p className={styles.desc}>
            An adversarial competition for the AI era.
            <br />
            Attack and defend large language models with prompts.
          </p>
        </div>

        <section className={styles.rules} aria-labelledby="login-rules-title">
          <div className={styles.rulesHead}>
            <h3 id="login-rules-title" className={styles.rulesTitle}>
              Event rules
            </h3>
            <Link href="/rules" className={styles.rulesLink}>
              Full rulebook
            </Link>
          </div>
          <ul className={styles.rulesList}>
            {LOGIN_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      </aside>

      <section className={styles.formSide}>
        <Link href="/" className={styles.back}>
          Back to home
        </Link>

        <LoginForm />

        <p className={styles.legal}>
          Flags are unique to each team. Sharing a flag gets your team disqualified.
        </p>
      </section>
    </div>
  );
}
