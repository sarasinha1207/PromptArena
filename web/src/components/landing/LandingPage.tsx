import { AboutSection } from "./AboutSection";
import { ClosingCta } from "./ClosingCta";
import { CursorGlow } from "./CursorGlow";
import { Hero } from "./Hero";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LevelsSection } from "./LevelsSection";
import { Marquee } from "./Marquee";
import { RoundsSection } from "./RoundsSection";
import { RulebookSection } from "./RulebookSection";
import styles from "./LandingPage.module.css";

const KEYWORDS = [
  "Prompt injection",
  "Jailbreaking",
  "Social engineering",
  "Canary flags",
  "Guardrails",
  "First Blood",
  "Hot-patching",
  "Red team",
  "Blue team",
  "Live leaderboard",
];

/** Public landing page: header, hero (with the event details card), about, rounds, levels, rulebook, login call to action, footer. */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <CursorGlow />
      <LandingHeader />
      <Hero />
      <Marquee items={KEYWORDS} />
      <AboutSection />
      <RoundsSection />
      <Marquee items={[...KEYWORDS].reverse()} reverse tone="ghost" />
      <LevelsSection />
      <RulebookSection />
      <ClosingCta />
      <LandingFooter />
    </div>
  );
}
