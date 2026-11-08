import { EVENT_DETAILS } from "@/content/landing";
import { Reveal } from "./Reveal";
import shared from "./shared.module.css";
import styles from "./EventDetails.module.css";

/** Key facts about the event: what, when, where, how long, who can take part. */
export function EventDetails() {
  return (
    <section id="event" className={`${shared.section} ${styles.event}`} aria-labelledby="event-title">
      <div className={shared.container}>
        <Reveal variant="up">
          <h2 id="event-title" className={shared.heading}>
            {EVENT_DETAILS.heading}
          </h2>
        </Reveal>

        <dl className={styles.grid}>
          {EVENT_DETAILS.items.map((item, index) => (
            <Reveal
              key={item.label}
              variant="up"
              delay={index * 70}
              className={`${styles.card} ${"wide" in item ? styles.wide : ""} ${"full" in item ? styles.full : ""}`}
            >
              <dt className={styles.label}>{item.label}</dt>
              <dd className={styles.value}>{item.value}</dd>
              {"note" in item && <dd className={styles.note}>{item.note}</dd>}
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
