import Link from "next/link";
import { NAV_LINKS } from "@/content/landing";
import { LogoMark } from "./LogoMark";
import shared from "./shared.module.css";
import styles from "./LandingFooter.module.css";

/** Public site footer. Separate from the in-event HUD. */
export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${shared.container} ${styles.top}`}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>
            <LogoMark size={36} />
            <span className={styles.brandName}>PromptArena</span>
          </div>
          <p className={styles.tagline}>
            Attack and defend large language models with nothing but language.
          </p>
        </div>

        <nav className={styles.column} aria-label="About the event">
          <h2 className={styles.columnTitle}>The event</h2>
          {NAV_LINKS.filter((link) => link.id !== "rulebook").map((link) => (
            <a key={link.id} href={`#${link.id}`} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className={styles.column} aria-label="For participants">
          <h2 className={styles.columnTitle}>For teams</h2>
          <Link href="/auth/login" className={styles.link}>
            Log in
          </Link>
          <Link href="/rules" className={styles.link}>
            Full rulebook
          </Link>
        </nav>
      </div>

      <div className={`${shared.container} ${styles.notice}`}>
        <p>Flags are unique to each team. Sharing a flag gets your team disqualified.</p>
        <p>&copy; 2026 PromptArena</p>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        PromptArena
      </div>
    </footer>
  );
}
