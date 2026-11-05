"use client";

import { useState } from "react";
import { ShieldIcon } from "@/components/common/Icons";
import { getInitials } from "@/lib/team/roster";
import type { Challenge } from "@/types/arena";
import { FlagConsole } from "./FlagConsole";
import styles from "./MissionPane.module.css";

interface MissionPaneProps {
  challenge: Challenge;
  flagsOpen: boolean;
  closedReason: string | null;
}

function prettify(value: string | undefined): string {
  if (!value) return "";
  const text = value.replace(/_/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Left pane (35%): one full-height card (handbook §6.2). Top: a compact persona
 * section with the points and the target. Middle: what the chatbot is and which flag to
 * find. Bottom: the flag verification console.
 */
export function MissionPane({ challenge, flagsOpen, closedReason }: MissionPaneProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const theme = challenge.theme_config;
  const specs = challenge.model_specs;
  const levelNumber = String(challenge.level_index).padStart(2, "0");
  const showAvatar = Boolean(theme?.avatar_url) && !avatarFailed;

  const objective =
    challenge.objective ??
    `Extract the secret flag that ${challenge.persona_name} is guarding, then submit it in the console below.`;

  return (
    <aside className={styles.card} aria-label="Mission telemetry">
      {/* ---------- Persona: points and key facts ---------- */}
      <header className={styles.persona}>
        <div className={styles.identity}>
          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.avatar}
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

          <div className={styles.heading}>
            <p className={styles.level}>
              <span>Level {levelNumber}</span>
              <span className={styles.tier}>{challenge.difficulty}</span>
            </p>
            <h1 className={styles.name}>{challenge.persona_name}</h1>
            {theme?.persona_archetype && (
              <p className={styles.archetype}>{prettify(theme.persona_archetype)}</p>
            )}
            <p className={styles.target}>Target: {challenge.title}</p>
          </div>

          <p className={styles.points} title="Current value. It drops as more teams solve.">
            <strong>{challenge.current_points.toLocaleString("en-US")}</strong>
            <span>points</span>
          </p>
        </div>
      </header>

      {/* ---------- Description and mission ---------- */}
      <div className={styles.body}>
        {challenge.narrative && (
          <section aria-labelledby="about-title">
            <h2 id="about-title" className={styles.heading2}>
              About {challenge.persona_name}
            </h2>
            <p className={styles.about}>{challenge.narrative}</p>
          </section>
        )}

        <section aria-labelledby="mission-title">
          <h2 id="mission-title" className={styles.heading2}>
            Your mission
          </h2>
          <p className={styles.mission}>{objective}</p>
          <p className={styles.policy}>
            <ShieldIcon width={16} height={16} />
            <span>
              Flags look like <code>FLAG&#123;…&#125;</code> and are unique to your team. Leaking or
              sharing a flag gets your team disqualified.
            </span>
          </p>
        </section>

        {specs && (
          <section aria-labelledby="model-title">
            <h2 id="model-title" className={styles.heading2}>
              Target model
            </h2>
            <ul className={styles.specs}>
              {specs.architecture && <li>{specs.architecture}</li>}
              {typeof specs.context_window === "number" && (
                <li>{specs.context_window.toLocaleString("en-US")} token context</li>
              )}
              {typeof specs.temperature === "number" && <li>Temperature {specs.temperature}</li>}
            </ul>
          </section>
        )}
      </div>

      {/* ---------- Flag console ---------- */}
      <FlagConsole
        levelId={challenge.id}
        solved={challenge.is_solved}
        open={flagsOpen}
        closedReason={closedReason}
      />
    </aside>
  );
}
