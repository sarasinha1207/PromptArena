/**
 * Persona theme configuration delivered inside each challenge (handbook §3.2).
 */
export interface ThemeConfig {
  theme_id: string;
  display_name: string;
  avatar_url?: string;
  persona_archetype?: string;
  greeting_audio_url?: string;
  dialogue_tone?: string;
}

/** Target model specifications shown on the card and workbench (handbook §6.1, §6.2). */
export interface ModelSpecs {
  architecture?: string;
  context_window?: number;
  temperature?: number;
}

/**
 * A level as listed in the Round 1 matrix (handbook §6.1). Column names follow
 * the `challenges` table (§11); the computed fields (points, counters,
 * first blood, solved) are assumptions the backend team must confirm because
 * §12 defines no endpoint that lists levels.
 */
export interface Challenge {
  id: string | number;
  round_number: number;
  level_index: number;
  title: string;
  persona_name: string;
  difficulty: string;
  theme_config: ThemeConfig;
  narrative?: string;
  model_specs?: ModelSpecs;
  known_defenses?: string[] | string;
  current_points: number;
  solve_count: number;
  attempt_count: number;
  first_blood_team?: string | null;
  is_solved: boolean;
  is_active?: boolean;
}

/** Response of POST /api/arena/levels/{level_id}/submit on success (handbook §12.2). */
export interface FlagSuccess {
  success: true;
  points_awarded: number;
  first_blood: boolean;
  updated_team_score?: number;
}
