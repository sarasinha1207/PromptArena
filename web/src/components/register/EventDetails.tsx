import type { ReactNode } from "react";
import { Card } from "./ui/Card";
import { rise } from "./ui/rise";
import styles from "./EventDetails.module.css";

const FACTS: Array<{ label: string; value: string; icon: ReactNode }> = [
  {
    label: "Max team size",
    value: "3 members",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.4c2 .8 3.5 2.6 3.5 5.6" />
      </>
    ),
  },
  {
    label: "Date",
    value: "13 December",
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 2.5v4M16 2.5v4" />
      </>
    ),
  },
  {
    label: "Duration",
    value: "8 hours",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
  },
  {
    label: "Location",
    value: "CLH, IIT Patna",
    icon: (
      <>
        <path d="M12 21s-7-5.6-7-11a7 7 0 0114 0c0 5.4-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  {
    label: "Eligible semesters",
    value: "1, 2, 4 and 5",
    icon: (
      <>
        <path d="M2 9l10-5 10 5-10 5z" />
        <path d="M6 11.5v4.5c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" />
      </>
    ),
  },
  {
    label: "Eligible courses",
    value: "BSc CSDA, BS and BBA",
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 006.5 18H20v3H6.5A2.5 2.5 0 014 20.5z" />
      </>
    ),
  },
];

/** The event's key facts in one horizontal card. */
export function EventDetails() {
  const entrance = rise(0.3);
  return (
    <Card title="Event details" className={entrance.className} style={entrance.style}>
      <dl className={styles.facts}>
        {FACTS.map((tile) => (
          <div className={styles.fact} key={tile.label}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {tile.icon}
            </svg>
            <div>
              <dt>{tile.label}</dt>
              <dd>{tile.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}
