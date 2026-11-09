import { ABOUT } from "@/content/landing";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import shared from "./shared.module.css";
import styles from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section id="about" className={shared.section} data-lights="a">
      <div className={shared.container}>
        <div className={styles.grid}>
          <figure className={styles.portrait}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/landing/gandalf-portrait.webp"
              alt="An old wizard in a wide-brimmed hat with a long beard, a staff and a pipe"
              width={1000}
              height={1300}
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className={styles.story}>
            <SectionHeader title={ABOUT.heading} />
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.copy}>
                {paragraph}
              </p>
            ))}
          </div>

          <Reveal variant="up" className={styles.versusWrap}>
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
          </Reveal>
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
