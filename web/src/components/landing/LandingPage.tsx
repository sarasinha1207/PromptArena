import { AboutSection } from "./AboutSection";
import { ClosingCta } from "./ClosingCta";
import { Hero } from "./Hero";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LevelsSection } from "./LevelsSection";
import { RoundsSection } from "./RoundsSection";
import { RulebookSection } from "./RulebookSection";
import styles from "./LandingPage.module.css";

/** Public landing page: header, hero, about, rounds, levels, rulebook, login call to action, footer. */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingHeader />
      <Hero />
      <AboutSection />
      <RoundsSection />
      <LevelsSection />
      <RulebookSection />
      <ClosingCta />
      <LandingFooter />
    </div>
  );
}
