import { BrandRound } from "./BrandRound";
import { HudLinks } from "./HudLinks";
import { StatusBadge } from "./StatusBadge";
import { MasterClock } from "./MasterClock";
import { TokenGauge } from "./TokenGauge";
import { TeamCapsule } from "./TeamCapsule";
import styles from "./hud.module.css";

/**
 * Persistent top navigation HUD (handbook §4.2).
 * Left to right: brand + round, status badge, master clock, token gauge,
 * then the Rules and Leaderboard buttons and the team menu.
 */
export function Hud() {
  return (
    <header className={styles.hud}>
      <div className={styles.bar}>
        <BrandRound />
        <StatusBadge />
        <MasterClock />
        <TokenGauge />
        <div className={styles.spacer} />
        <HudLinks />
        <TeamCapsule />
      </div>
    </header>
  );
}
