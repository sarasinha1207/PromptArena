import { ABOUT } from "@/content/landing";
import { Reveal } from "./Reveal";
import shared from "./shared.module.css";
import styles from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section id="about" className={`${shared.section} ${styles.about}`}>
      <div className={styles.dots} aria-hidden="true" />
      <i className={styles.glow} aria-hidden="true" />

      <div className={shared.container}>
        <div className={styles.grid}>
          <div className={styles.story}>
            <Reveal variant="left">
              <h2 className={shared.heading}>{ABOUT.heading}</h2>
            </Reveal>
            {ABOUT.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph} variant="left" delay={120 + index * 120}>
                <p className={shared.lead}>{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal variant="right" delay={150}>
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
                  {ABOUT.now.items.map((item, index) => (
                    <li key={item} style={{ animationDelay: `${index * 0.12}s` }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        <dl className={styles.capabilities}>
          {ABOUT.capabilities.map((item, index) => (
            <Reveal key={item.title} variant="up" delay={index * 110} className={styles.capability}>
              <dt>{item.title}</dt>
              <dd>{item.text}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
