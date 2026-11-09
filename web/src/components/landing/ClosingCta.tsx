import { LoginButton } from "./LoginButton";
import shared from "./shared.module.css";
import styles from "./ClosingCta.module.css";

export function ClosingCta() {
  return (
    <section className={`${shared.section} ${styles.cta}`} data-lights="b" aria-labelledby="closing-title">
      {/* The hero wizard again, light only, so the page ends where it began */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.photo}
        src="/assets/landing/gandalf-hero.webp"
        alt=""
        width={1000}
        height={1344}
        loading="lazy"
        decoding="async"
      />

      <div className={`${shared.container} ${styles.inner}`}>
        <h2 id="closing-title" className={styles.title}>
          Your team&apos;s flag is waiting.
        </h2>
        <span className={shared.ornament} aria-hidden="true" />
        <p className={styles.copy}>
          Log in with the user ID and password emailed to your team leader.
        </p>
        <div className={styles.action}>
          <LoginButton />
        </div>
      </div>
    </section>
  );
}
