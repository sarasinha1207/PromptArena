"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { TrophyIcon } from "@/components/common/Icons";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { getInitials } from "@/lib/team/roster";
import type { Challenge } from "@/types/arena";
import { FlagQuickSubmit } from "./FlagQuickSubmit";
import styles from "./ChallengeCard.module.css";

interface ChallengeCardProps {
  challenge: Challenge;
  /** Whether flags are accepted right now. */
  open: boolean;
  closedReason: string | null;
  index: number;
}

/** "cyberpunk_terminal" becomes "Cyberpunk terminal". */
function prettify(value: string | undefined): string {
  if (!value) return "";
  const text = value.replace(/_/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function defensesOf(value: Challenge["known_defenses"]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** One level in the Round 1 matrix (handbook §6.1): character stage on top, mission details below. */
export function ChallengeCard({ challenge, open, closedReason, index }: ChallengeCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const points = useAnimatedNumber(challenge.current_points);

  const theme = challenge.theme_config;
  const levelNumber = String(challenge.level_index).padStart(2, "0");
  const specs = challenge.model_specs;
  const defenses = defensesOf(challenge.known_defenses);
  const displayName = theme?.display_name ?? challenge.persona_name;
  const showAvatar = Boolean(theme?.avatar_url) && !avatarFailed;

  return (
    <ThemeProvider config={theme} className={styles.theme}>
      <article
        className={styles.card}
        data-solved={challenge.is_solved}
        style={{ "--i": index } as CSSProperties}
      >
        {/* ---------- Character stage ---------- */}
        <div className={styles.stage}>
          <span className={styles.ghost} aria-hidden="true">
            {levelNumber}
          </span>
          <span className={styles.aura} aria-hidden="true" />
          <span className={styles.rays} aria-hidden="true" />

          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.art}
              src={theme?.avatar_url}
              alt=""
              draggable={false}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className={styles.monogram} aria-hidden="true">
              {getInitials(challenge.persona_name)}
            </span>
          )}

          <div className={styles.stageTop}>
            <span className={styles.code}>LVL-{levelNumber}</span>
            <span className={styles.difficulty} data-tier={challenge.difficulty}>
              {challenge.difficulty}
            </span>
            <span className={styles.points} title="Current value. It drops as more teams solve.">
              <strong>{points.toLocaleString("en-US")}</strong> pts
            </span>
          </div>

          <div className={styles.nameplate}>
            <p className={styles.personaName}>{displayName}</p>
            {theme?.persona_archetype && (
              <p className={styles.archetype}>{prettify(theme.persona_archetype)}</p>
            )}
          </div>
        </div>

        {/* ---------- Mission details ----------
            These are direct grid rows of the card, so title, lore, chips, stats and
            actions line up across every card in the same row of the matrix. */}
        <>
          <h2 className={styles.title}>{challenge.title}</h2>

          {challenge.narrative && (
            <p className={styles.narrative} title={challenge.narrative}>
              {challenge.narrative}
            </p>
          )}

          {(specs || defenses.length > 0) && (
            <ul className={styles.specs} aria-label="Target model">
              {specs?.architecture && <li>{specs.architecture}</li>}
              {typeof specs?.context_window === "number" && (
                <li>{specs.context_window.toLocaleString("en-US")} token context</li>
              )}
              {typeof specs?.temperature === "number" && <li>Temperature {specs.temperature}</li>}
              {defenses.map((defense) => (
                <li key={defense} data-kind="defense">
                  {defense}
                </li>
              ))}
            </ul>
          )}

          <section className={styles.telemetry} aria-label="Solve telemetry">
            <div className={styles.stats}>
              <p className={styles.stat}>
                <strong>{challenge.solve_count.toLocaleString("en-US")}</strong>
                <span>Solves</span>
              </p>
              <p className={styles.stat}>
                <strong>{challenge.attempt_count.toLocaleString("en-US")}</strong>
                <span>Attempts</span>
              </p>
            </div>
            <p
              className={styles.firstBlood}
              data-claimed={Boolean(challenge.first_blood_team)}
              title="The first team to solve earns a permanent +50 bonus."
            >
              <TrophyIcon width={16} height={16} />
              {challenge.first_blood_team
                ? `First Blood: ${challenge.first_blood_team}`
                : "First Blood unclaimed"}
            </p>
          </section>

          <footer className={styles.actions}>
            <FlagQuickSubmit
              levelId={challenge.id}
              solved={challenge.is_solved}
              open={open}
              closedReason={closedReason}
            />
            <Link href={`/arena/round-1/${challenge.id}`} className={styles.launch}>
              Launch terminal
            </Link>
          </footer>
        </>
      </article>
    </ThemeProvider>
  );
}
