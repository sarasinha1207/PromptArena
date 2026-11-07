import { EventBackdrop } from "@/components/dashboard/EventBackdrop";
import { RULE_GROUPS } from "@/content/rules";
import styles from "./rules.module.css";

/**
 * The same short rules as the header's Rules dropdown, for the public landing
 * and login pages to link to (handbook §4.1, content from §2 and §6.2).
 */
export default function RulesPage() {
  return (
    <article className={styles.page}>
      <EventBackdrop />
      <h1>Rules of Engagement</h1>

      {RULE_GROUPS.map((group) => (
        <section key={group.id}>
          <h2>{group.title}</h2>
          <ul>
            {group.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
