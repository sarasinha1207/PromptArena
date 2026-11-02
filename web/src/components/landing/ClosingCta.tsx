import { LoginButton } from "./LoginButton";
import shared from "./shared.module.css";
import styles from "./ClosingCta.module.css";

export function ClosingCta() {
  return (
    <section className={styles.cta} aria-labelledby="closing-title">
      <div className={`${shared.container} ${styles.inner}`}>
        <h2 id="closing-title" className={styles.title}>
          Your team&apos;s flag is waiting.
        </h2>
        <p className={styles.copy}>
          Log in with the user ID and password emailed to your team leader.
        </p>
        <LoginButton />
      </div>
    </section>
  );
}
