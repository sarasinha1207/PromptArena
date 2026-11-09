"use client";

import { useEffect, useRef } from "react";
import { launchConfetti } from "@/lib/registration/confetti";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import styles from "./SuccessCard.module.css";

interface SuccessCardProps {
  teamName: string;
  registrationId: string;
  csvUrl: string;
  onAnother: () => void;
}

/** Confirmation shown after a team registers. */
export function SuccessCard({ teamName, registrationId, csvUrl, onAnother }: SuccessCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const celebrated = useRef(false);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Development mode runs effects twice; celebrate once.
    if (celebrated.current) return;
    celebrated.current = true;
    launchConfetti(styles.confetti);
  }, []);

  return (
    <Card>
      <div ref={ref} className={styles.success} aria-live="polite">
        <svg className={styles.check} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" />
          <path d="M30 52l14 14 27-30" />
        </svg>
        <h2 className={styles.heading}>
          You&apos;re in, <span>{teamName}</span>!
        </h2>
        <p className={styles.message}>
          Your registration has been recorded. See you at CLH on 13 December.
        </p>
        <div className={styles.id}>
          ID: <span>{registrationId}</span>
        </div>
        <div className={styles.actions}>
          <ButtonLink
            variant="primary"
            href={csvUrl}
            download="promptarena-registration.csv"
          >
            Download a copy (CSV)
          </ButtonLink>
          <Button variant="secondary" onClick={onAnother}>
            Register another team
          </Button>
        </div>
      </div>
    </Card>
  );
}
