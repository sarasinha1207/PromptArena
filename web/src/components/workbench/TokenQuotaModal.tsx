"use client";

import { useEffect, useState } from "react";
import styles from "./TokenQuotaModal.module.css";

/**
 * Informational modal shown when the team's token wallet is empty (handbook
 * §13.3). The inputs are locked separately; this explains why and who to ask.
 */
export function TokenQuotaModal({ open }: { open: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  // Show again if the wallet empties again later.
  useEffect(() => {
    if (!open) setDismissed(false);
  }, [open]);

  if (!open || dismissed) return null;

  return (
    <div className={styles.backdrop} role="alertdialog" aria-modal="true" aria-labelledby="quota-title">
      <div className={styles.dialog}>
        <h2 id="quota-title" className={styles.title}>
          Token quota exceeded
        </h2>
        <p className={styles.text}>
          Your team has used all of its tokens, so the terminal is locked. Ask the event organizers
          (the admins) for help.
        </p>
        <button type="button" className={styles.close} onClick={() => setDismissed(true)}>
          Close
        </button>
      </div>
    </div>
  );
}
