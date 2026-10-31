import { BrandRound } from "./BrandRound";
import { StatusBadge } from "./StatusBadge";
import { MasterClock } from "./MasterClock";
import { TokenGauge } from "./TokenGauge";
import { TeamCapsule } from "./TeamCapsule";
import styles from "./hud.module.css";

/**
 * Persistent top navigation HUD (handbook §4.2).
 * Left to right: brand + round, status badge, master clock, token gauge, team capsule.
 */
export function Hud() {
  return (
    <header className={styles.hud}>
      <BrandRound />
      <StatusBadge />
      <MasterClock />
      <TokenGauge />
      <div className={styles.spacer} />
      <TeamCapsule />
    </header>
  );
}
