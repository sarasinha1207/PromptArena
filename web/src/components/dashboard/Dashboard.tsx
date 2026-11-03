"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon, BookIcon, TrophyIcon } from "@/components/common/Icons";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import shared from "@/components/landing/shared.module.css";
import { ROUNDS } from "@/content/landing";
import { useMasterClock } from "@/hooks/useMasterClock";
import { formatCountdown } from "@/lib/format/time";
import { describeState, canOpenRound, getRoundStatus } from "@/lib/tournament/describe";
import { getArenaStatus, getRoundLabel } from "@/lib/tournament/labels";
import { getInitials, getLeaderName, getRoster } from "@/lib/team/roster";
import { getTokenLevel } from "@/lib/wallet/tokenLevel";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";
import { tournamentStore } from "@/stores/tournamentStore";
import { walletStore } from "@/stores/walletStore";
import styles from "./Dashboard.module.css";

const ROUND_ROUTES = ["/arena/round-1", "/arena/round-2", "/arena/round-3"];

/** Short text for the arena status tile. Only states from handbook §5. */
function statusText(state: ReturnType<typeof tournamentStore.getState>["state"]): string {
  const live = getArenaStatus(state);
  if (live === "LIVE") return "Live";
  if (live === "PAUSED") return "Paused";
  if (live === "FROZEN") return "Leaderboard frozen";
  if (state === "PRE_EVENT") return "Not started";
  if (state === "TOURNAMENT_CONCLUDED") return "Concluded";
  if (state === null) return "Connecting";
  return "Round ended";
}

function rise(index: number): CSSProperties {
  return { "--d": `${index * 90}ms` } as CSSProperties;
}

/** The team's event dashboard. Every value comes from the backend; nothing is placeholder data. */
export function Dashboard() {
  const profile = useStore(authStore, (s) => s.profile);
  const state = useStore(tournamentStore, (s) => s.state);
  const currentRound = useStore(tournamentStore, (s) => s.currentRound);
  const connection = useStore(tournamentStore, (s) => s.connection);
  const budget = useStore(walletStore, (s) => s.budget);
  const used = useStore(walletStore, (s) => s.used);
  const walletLoaded = useStore(walletStore, (s) => s.loaded);
  const remainingMs = useMasterClock();

  if (!profile) return null;

  const roster = getRoster(profile);
  const leaderName = getLeaderName(profile);
  const remainingTokens = Math.max(0, budget - used);
  const tokenRatio = budget > 0 ? remainingTokens / budget : 0;
  const tokenLevel = getTokenLevel(remainingTokens, budget);
  const status = getArenaStatus(state);

  const activeRoundIndex = ROUNDS.findIndex((_, i) => canOpenRound(state, currentRound, i + 1));
  const leaderboardClosed = state === "PRE_EVENT";

  return (
    <div className={styles.page}>
      {/* ---------- Welcome ---------- */}
      <section className={`${styles.hero} ${styles.rise}`} style={rise(0)}>
        <div className={styles.heroText}>
          <p className={styles.welcome}>Welcome back</p>
          <h1 className={styles.teamName}>{profile.team_name}</h1>
          <p className={styles.stateLine}>
            {status && (
              <span className={styles.badge} data-status={status}>
                {status}
              </span>
            )}
            <span>{describeState(state)}</span>
          </p>

          <div className={styles.actions}>
            {activeRoundIndex >= 0 && state !== "TOURNAMENT_CONCLUDED" && (
              <Link
                href={ROUND_ROUTES[activeRoundIndex]}
                className={`${shared.btn} ${shared.btnPrimary}`}
              >
                Enter {ROUNDS[activeRoundIndex].tab}
                <ArrowRightIcon width={18} height={18} />
              </Link>
            )}
            <Link href="/rules" className={`${shared.btn} ${shared.btnGhost}`}>
              <BookIcon width={18} height={18} />
              Read the rules
            </Link>
          </div>
        </div>

        <div className={styles.clockCard}>
          <span className={styles.clockLabel}>Time left</span>
          <span className={styles.clock} role="timer" aria-label="Round time remaining">
            {remainingMs === null ? "--:--:--" : formatCountdown(remainingMs)}
          </span>
          <span className={styles.clockRound}>{getRoundLabel(state, currentRound)}</span>
        </div>
      </section>

      {/* ---------- Key numbers ---------- */}
      <section className={styles.tiles} aria-label="Team status">
        <article className={`${styles.tile} ${styles.rise}`} style={rise(1)}>
          <span className={`${styles.tileIcon} ${styles.gold}`}>
            <TrophyIcon width={22} height={22} />
          </span>
          <div>
            <p className={styles.tileLabel}>Live rank</p>
            <p className={styles.tileValue}>
              {profile.rank != null ? `#${profile.rank}` : "Unranked"}
            </p>
          </div>
        </article>

        <article className={`${styles.tile} ${styles.rise}`} style={rise(2)} data-level={tokenLevel}>
          {walletLoaded ? (
            <ProgressRing
              value={tokenRatio}
              size={64}
              stroke={7}
              from={tokenLevel === "ok" ? "#3b82ff" : tokenLevel === "low" ? "#fbbf24" : "#ff4d6a"}
              to={tokenLevel === "ok" ? "#22d3ee" : tokenLevel === "low" ? "#f59e0b" : "#ff3158"}
            >
              {Math.round(tokenRatio * 100)}%
            </ProgressRing>
          ) : (
            <span className={`${styles.tileIcon} ${styles.skeleton}`} />
          )}
          <div>
            <p className={styles.tileLabel}>Token wallet</p>
            <p className={styles.tileValue}>
              {walletLoaded ? (
                <>
                  {remainingTokens.toLocaleString("en-US")}
                  <span className={styles.tileOf}> / {budget.toLocaleString("en-US")}</span>
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
        </article>

        <article className={`${styles.tile} ${styles.rise}`} style={rise(3)}>
          <span className={`${styles.tileIcon} ${styles.blueIcon}`}>
            <span className={styles.dot} data-live={status === "LIVE"} />
          </span>
          <div>
            <p className={styles.tileLabel}>Arena status</p>
            <p className={styles.tileValue}>{statusText(state)}</p>
          </div>
        </article>

        <article className={`${styles.tile} ${styles.rise}`} style={rise(4)}>
          <span className={`${styles.tileIcon} ${styles.violetIcon}`}>
            <span className={styles.signal} data-state={connection} />
          </span>
          <div>
            <p className={styles.tileLabel}>Live updates</p>
            <p className={styles.tileValue}>
              {connection === "open"
                ? "Connected"
                : connection === "connecting"
                  ? "Connecting"
                  : "Reconnecting"}
            </p>
          </div>
        </article>
      </section>

      {/* ---------- Rounds and team ---------- */}
      <div className={styles.columns}>
        <section className={styles.rounds} aria-labelledby="rounds-title">
          <h2 id="rounds-title" className={styles.sectionTitle}>
            The three rounds
          </h2>

          <div className={styles.roundList}>
            {ROUNDS.map((round, index) => {
              const roundStatus = getRoundStatus(state, currentRound, index + 1);
              const open = canOpenRound(state, currentRound, index + 1);
              return (
                <article
                  key={round.id}
                  className={`${styles.round} ${styles.rise}`}
                  style={rise(5 + index)}
                  data-side={round.id}
                  data-status={roundStatus ?? "unknown"}
                >
                  <div className={styles.roundBar} />
                  <div className={styles.roundBody}>
                    <div className={styles.roundHead}>
                      <div>
                        <p className={styles.roundTab}>{round.tab}</p>
                        <h3 className={styles.roundName}>{round.name}</h3>
                      </div>
                      {roundStatus && <span className={styles.chip}>{roundStatus}</span>}
                    </div>
                    <p className={styles.roundRole}>{round.role}</p>
                    <p className={styles.roundText}>{round.summary}</p>
                    {open && (
                      <Link href={ROUND_ROUTES[index]} className={styles.roundLink}>
                        Open {round.tab}
                        <ArrowRightIcon width={16} height={16} />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.sideColumn}>
          <section className={`${styles.team} ${styles.rise}`} style={rise(5)} aria-labelledby="team-title">
            <h2 id="team-title" className={styles.sectionTitle}>
              Your team
            </h2>

            <div className={styles.leader}>
              <span className={styles.avatarBig}>{getInitials(profile.team_name)}</span>
              <div>
                <p className={styles.leaderLabel}>Team leader</p>
                <p className={styles.leaderName}>
                  {leaderName ?? <span className={styles.muted}>Not provided</span>}
                  {leaderName && profile.leader_verified && (
                    <span className={styles.verified}>Verified</span>
                  )}
                </p>
              </div>
            </div>

            <p className={styles.leaderLabel}>
              Members{roster.length > 0 ? ` (${roster.length})` : ""}
            </p>
            {roster.length > 0 ? (
              <ul className={styles.members}>
                {roster.map((member) => (
                  <li key={member.name} className={styles.member}>
                    <span className={styles.avatar}>{getInitials(member.name)}</span>
                    <span>{member.name}</span>
                    {member.isLeader && <span className={styles.leaderTag}>Leader</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No members listed yet.</p>
            )}
          </section>

          <section className={`${styles.quick} ${styles.rise}`} style={rise(6)} aria-label="Quick links">
            <Link href="/rules" className={styles.quickLink}>
              <span className={styles.quickIcon}>
                <BookIcon width={20} height={20} />
              </span>
              <span>
                <strong>Rules</strong>
                <small>Flags, tokens, points and cooldowns</small>
              </span>
            </Link>
            {leaderboardClosed ? (
              <div className={styles.quickLink} data-disabled="true">
                <span className={styles.quickIcon}>
                  <TrophyIcon width={20} height={20} />
                </span>
                <span>
                  <strong>Leaderboard</strong>
                  <small>Opens when the event starts</small>
                </span>
              </div>
            ) : (
              <Link href="/leaderboard" className={styles.quickLink}>
                <span className={styles.quickIcon}>
                  <TrophyIcon width={20} height={20} />
                </span>
                <span>
                  <strong>Leaderboard</strong>
                  <small>See where every team stands</small>
                </span>
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
