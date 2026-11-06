"use client";

import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { RankedTeam } from "@/lib/leaderboard/standings";
import { TeamEmblem } from "./TeamEmblem";
import styles from "./Podium.module.css";

interface PodiumProps {
  teams: readonly RankedTeam[];
  /** Hides point totals while the leaderboard is frozen. */
  maskScores: boolean;
  /** Final champions wording once the tournament has concluded. */
  champions: boolean;
}

const MEDAL: Record<number, string> = { 1: "gold", 2: "silver", 3: "bronze" };
// Visual order: silver, gold, bronze, so the winner stands in the middle.
const ORDER = [2, 1, 3];

function Points({ value, masked }: { value: number; masked: boolean }) {
  const shown = useAnimatedNumber(value);
  if (masked) {
    return (
      <span className={styles.points} aria-label="Score hidden while the leaderboard is frozen">
        <span aria-hidden="true">••••</span>
      </span>
    );
  }
  return <span className={styles.points}>{shown.toLocaleString()}</span>;
}

/** Ranks 1 to 3 on gold, silver and bronze stages (handbook §9.1). */
export function Podium({ teams, maskScores, champions }: PodiumProps) {
  const places = ORDER.map((rank) => teams.find((team) => team.rank === rank)).filter(
    (team): team is RankedTeam => Boolean(team),
  );

  return (
    <section className={styles.podium} aria-label={champions ? "Champions podium" : "Top three teams"}>
      {places.map((team) => (
        <article
          key={team.team_id}
          className={styles.place}
          data-rank={team.rank}
          data-medal={MEDAL[team.rank]}
        >
          <div className={styles.identity}>
            <TeamEmblem
              teamId={team.team_id}
              name={team.team_name}
              avatarUrl={team.avatar_url}
              size="lg"
            />
            <h3 className={styles.name} title={team.team_name}>
              {team.team_name}
            </h3>
            <p className={styles.stats}>
              <Points value={team.total_score} masked={maskScores} />
              <span className={styles.unit}>points</span>
            </p>
            <p className={styles.solves}>
              {team.round1_solves} {team.round1_solves === 1 ? "solve" : "solves"}
            </p>
          </div>
          <div className={styles.stage}>
            <span className={styles.rankNumber}>{team.rank}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
