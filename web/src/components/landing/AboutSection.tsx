import { ABOUT } from "@/content/landing";
import shared from "./shared.module.css";
import styles from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section id="about" className={`${shared.section} ${styles.about}`}>
      <div className={shared.container}>
        <div className={styles.grid}>
          <div className={styles.story}>
            <h2 className={shared.heading}>{ABOUT.heading}</h2>
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className={shared.lead}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.versus}>
            <div className={styles.before}>
              <h3 className={styles.sideTitle}>{ABOUT.before.title}</h3>
              <ul className={styles.list}>
                {ABOUT.before.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.now}>
              <h3 className={styles.sideTitle}>{ABOUT.now.title}</h3>
              <ul className={styles.list}>
                {ABOUT.now.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <dl className={styles.capabilities}>
          {ABOUT.capabilities.map((item) => (
            <div key={item.title} className={styles.capability}>
              <dt>{item.title}</dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
