"use client";

import { useLayoutEffect, useRef } from "react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { RankedTeam } from "@/lib/leaderboard/standings";
import type { TeamId } from "@/types/leaderboard";
import { TeamEmblem } from "./TeamEmblem";
import styles from "./RankingsTable.module.css";

interface RankingsTableProps {
  teams: readonly RankedTeam[];
  /** Hides point values while the leaderboard is frozen. */
  maskScores: boolean;
}

const timeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const NONE = "—";

function Hidden() {
  return (
    <span aria-label="Hidden while the leaderboard is frozen">
      <span aria-hidden="true">••••</span>
    </span>
  );
}

function TotalScore({ value, masked }: { value: number; masked: boolean }) {
  const shown = useAnimatedNumber(value);
  if (masked) return <Hidden />;
  return <>{shown.toLocaleString()} Points</>;
}

function points(value: number | null, masked: boolean) {
  if (value === null) return NONE;
  if (masked) return <Hidden />;
  return `${value.toLocaleString()} Points`;
}

/**
 * Rankings Matrix Table (handbook §9.3). When a score event changes the order,
 * rows glide to their new position (FLIP), and a row that climbed flashes.
 */
export function RankingsTable({ teams, maskScores }: RankingsTableProps) {
  const rowRefs = useRef(new Map<TeamId, HTMLTableRowElement>());
  const lastTops = useRef(new Map<TeamId, number>());

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<TeamId, number>();

    rowRefs.current.forEach((row, id) => {
      const top = row.offsetTop;
      next.set(id, top);
      const before = lastTops.current.get(id);
      if (reduce || before === undefined || before === top || !row.animate) return;

      row.animate(
        [{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }],
        { duration: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
      if (before > top) {
        row.animate(
          [{ backgroundColor: "rgba(52, 211, 153, 0.22)" }, { backgroundColor: "rgba(52, 211, 153, 0)" }],
          { duration: 1400, easing: "ease-out" },
        );
      }
    });

    lastTops.current = next;
  }, [teams]);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>Team standings</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.rank}>Rank</th>
            <th scope="col">Team Name</th>
            <th scope="col">Round 1 Solves</th>
            <th scope="col">Round 2 Def Score</th>
            <th scope="col">Round 3 Matches</th>
            <th scope="col">Penalties</th>
            <th scope="col" className={styles.total}>Total Score</th>
            <th scope="col">Last Solve Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr
              key={String(team.team_id)}
              ref={(node) => {
                if (node) rowRefs.current.set(team.team_id, node);
                else rowRefs.current.delete(team.team_id);
              }}
              data-podium={team.rank <= 3}
            >
              <td className={styles.rank}>
                <span className={styles.badge} data-rank={team.rank <= 3 ? team.rank : undefined}>
                  {team.rank}
                </span>
              </td>
              <th scope="row">
                <div className={styles.team}>
                  <TeamEmblem
                    teamId={team.team_id}
                    name={team.team_name}
                    avatarUrl={team.avatar_url}
                  />
                  <span className={styles.teamName} title={team.team_name}>
                    {team.team_name}
                  </span>
                </div>
              </th>
              <td data-label="Round 1 Solves">
                {team.round1_total !== null
                  ? `${team.round1_solves} / ${team.round1_total} Levels`
                  : `${team.round1_solves} ${team.round1_solves === 1 ? "Level" : "Levels"}`}
              </td>
              <td data-label="Round 2 Def Score">{points(team.round2_def_score, maskScores)}</td>
              <td data-label="Round 3 Matches">
                {team.round3_wins === null
                  ? NONE
                  : `${team.round3_wins} ${team.round3_wins === 1 ? "Win" : "Wins"}`}
              </td>
              <td data-label="Penalties" data-negative={team.penalties < 0}>{points(team.penalties, maskScores)}</td>
              <td className={styles.total} data-label="Total Score">
                <TotalScore value={team.total_score} masked={maskScores} />
              </td>
              <td className={styles.time} data-label="Last Solve Timestamp">
                {team.last_solve_at === null ? NONE : timeFormat.format(team.last_solve_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
