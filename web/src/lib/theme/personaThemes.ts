import type { ThemeConfig } from "@/types/arena";

/**
 * Visual identity for each persona. The backend only sends a `theme_id`
 * (handbook §3.2); colours and fonts live here so UI/UX can change them
 * without touching components. Unknown ids fall back to the neutral theme.
 */
export interface PersonaTheme {
  id: string;
  /** Main character colour. */
  accent: string;
  /** Font for the persona's own words and lore. */
  font: string;
  fontStyle: "normal" | "italic";
  fontTransform: "none" | "uppercase";
  fontSize: string;
}

const SANS = "var(--font-body)";
const MONO = "var(--font-mono)";
const SERIF = 'Georgia, "Times New Roman", serif';

export const NEUTRAL_THEME: PersonaTheme = {
  id: "default",
  accent: "#7c8cff",
  font: SANS,
  fontStyle: "normal",
  fontTransform: "none",
  fontSize: "1rem",
};

const THEMES: Record<string, PersonaTheme> = {
  claire_corporate_hr: {
    id: "claire_corporate_hr",
    accent: "#4da3ff",
    font: SANS,
    fontStyle: "normal",
    fontTransform: "none",
    fontSize: "1rem",
  },
  ignatius_iron_archive: {
    id: "ignatius_iron_archive",
    accent: "#e0b255",
    font: SERIF,
    fontStyle: "italic",
    fontTransform: "none",
    fontSize: "1.05rem",
  },
  vector88_arcade: {
    id: "vector88_arcade",
    accent: "#b86bff",
    font: MONO,
    fontStyle: "normal",
    fontTransform: "uppercase",
    fontSize: "0.82rem",
  },
  vex_underworld_broker: {
    id: "vex_underworld_broker",
    accent: "#ff4d8d",
    font: SANS,
    fontStyle: "normal",
    fontTransform: "none",
    fontSize: "1rem",
  },
  aura7_frigate: {
    id: "aura7_frigate",
    accent: "#3ee6c4",
    font: MONO,
    fontStyle: "normal",
    fontTransform: "none",
    fontSize: "0.84rem",
  },
};

/** Looks up the theme for a level's `theme_config`, falling back to the neutral theme. */
export function resolveTheme(config: ThemeConfig | undefined): PersonaTheme {
  if (!config) return NEUTRAL_THEME;
  return THEMES[config.theme_id] ?? NEUTRAL_THEME;
}
