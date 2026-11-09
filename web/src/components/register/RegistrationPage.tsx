"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RegistrationPayload, RegistrationResult } from "@/lib/api/registration";
import { registrationToCsv } from "@/lib/registration/csv";
import { EventDetails } from "./EventDetails";
import { RegisterBackground } from "./RegisterBackground";
import { RegisterHeader } from "./RegisterHeader";
import { RegistrationForm } from "./form/RegistrationForm";
import { SuccessCard } from "./success/SuccessCard";
import styles from "./RegistrationPage.module.css";

interface Registered {
  teamName: string;
  id: string;
  csvUrl: string;
}

/** Public team registration page: event details, then the team form, then a confirmation. */
export function RegistrationPage() {
  const [registered, setRegistered] = useState<Registered | null>(null);
  // Changing this remounts the form, which clears it for "Register another team".
  const [formKey, setFormKey] = useState(0);

  // Release the CSV download link when it is replaced or the page closes.
  useEffect(() => {
    const url = registered?.csvUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [registered]);

  const onRegistered = (payload: RegistrationPayload, result: RegistrationResult) => {
    const csv = registrationToCsv({ ...payload, id: result.id });
    setRegistered({
      teamName: result.teamName,
      id: result.id,
      csvUrl: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    });
  };

  const registerAnother = () => {
    setRegistered(null);
    setFormKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.page}>
      <RegisterBackground />

      <noscript>
        <p className={styles.noscript}>
          JavaScript is required to register. Please enable it and reload the page.
        </p>
      </noscript>

      <main className={styles.wrap}>
        <Link href="/" className={styles.back}>
          &larr; Back to PromptArena
        </Link>

        <RegisterHeader />
        <EventDetails />

        {registered ? (
          <SuccessCard
            teamName={registered.teamName}
            registrationId={registered.id}
            csvUrl={registered.csvUrl}
            onAnother={registerAnother}
          />
        ) : (
          <RegistrationForm key={formKey} onRegistered={onRegistered} />
        )}

        <footer className={styles.foot}>
          PromptArena &nbsp;·&nbsp; <b>Hack</b> &amp; Defend &nbsp;·&nbsp; IIT Patna
        </footer>
      </main>
    </div>
  );
}
