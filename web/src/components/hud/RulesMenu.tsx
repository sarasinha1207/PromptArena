import { RULE_GROUPS } from "@/content/rules";
import styles from "./hud.module.css";

/** The short rules dropdown that opens from the header's Rules button. */
export function RulesMenu({ id }: { id: string }) {
  return (
    <div className={styles.rulesMenu} id={id} role="region" aria-label="Rules">
      <p className={styles.rulesTitle}>Rules of engagement</p>
      {RULE_GROUPS.map((group) => (
        <section key={group.id} className={styles.ruleGroup}>
          <h3 className={styles.ruleHeading}>{group.title}</h3>
          <ul className={styles.rulePoints}>
            {group.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
