import styles from "./rules.module.css";

/**
 * Rules of engagement, flag canary policy and decay math (handbook §4.1).
 * Content comes from handbook §2 (Core Game Rules) and §6.2 (canary policy).
 */
export default function RulesPage() {
  return (
    <article className={styles.page}>
      <h1>Rules of Engagement</h1>

      <section>
        <h2>Unique canary flags</h2>
        <p>
          Every team has a completely unique secret flag for every challenge.
          Flags look like <code>FLAG{"{L<level>_<team>_<hash>}"}</code>, for
          example <code>FLAG{"{L1_team07_89d3a7e2}"}</code>. Submitting another
          team&apos;s flag is detected instantly and recorded as an audit alert.
        </p>
        <p>
          Leaking or sharing flags results in immediate team disqualification.
        </p>
      </section>

      <section>
        <h2>Token wallet</h2>
        <p>
          Every team is allocated a token wallet (for example 100,000 tokens).
          Every word you send and every word the AI generates is subtracted from
          your balance. A request is rejected with{" "}
          <strong>Token Quota Exceeded</strong> if your balance cannot cover it.
        </p>
      </section>

      <section>
        <h2>Points, decay and First Blood</h2>
        <p>Level points decay as more teams solve a level:</p>
        <p className={styles.formula}>
          Current Level Points = Maximum of (Minimum Points, Base Points × (1 −
          Total Solves × Decay Rate))
        </p>
        <p>
          Decay is retroactive: when a new solve lowers a level&apos;s value, it
          drops for all previous solvers too. The first team to conquer a
          challenge earns a permanent +50 First Blood bonus that does not decay.
        </p>
      </section>

      <section>
        <h2>Guardrail interception</h2>
        <p>
          If the AI starts to output a secret flag, a server-side scanner cuts
          the response and shows a guardrail warning instead of the flag.
        </p>
      </section>

      <section>
        <h2>Wrong-flag cooldown</h2>
        <p>
          A wrong flag submission locks flag submission for 15 seconds.
          Refreshing the page does not clear the timer.
        </p>
      </section>
    </article>
  );
}
