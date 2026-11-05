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
  /** What the team must find on this level (the secret the persona guards). Assumed field. */
  objective?: string;
  model_specs?: ModelSpecs;
  /** Prompt size limit shown in the attack console, e.g. 2048 (handbook §6.2). */
  max_prompt_tokens?: number;
  known_defenses?: string[] | string;
  current_points: number;
  solve_count: number;
  attempt_count: number;
  first_blood_team?: string | null;
  is_solved: boolean;
  is_active?: boolean;
}

/** A stored chat message (handbook §11 `chat_messages`). */
export interface StoredMessage {
  id?: string | number;
  sender: "USER" | "BOT";
  content: string;
  guardrail_tripped?: boolean;
  guardrail_reason?: string | null;
}

/**
 * Active chat session of a team on a level. The handbook names "session
 * tracking and conversation history" but defines no endpoint for it, so
 * GET /api/arena/levels/{id}/session and the reset response are assumed to
 * return this shape.
 */
export interface SessionPayload {
  session_id: string;
  messages: StoredMessage[];
}

/** One event of the attack stream (handbook §6.3). */
export interface StreamEvent {
  event: string;
  data?: string;
  tokens_consumed?: number;
}

/** Response of POST /api/arena/levels/{level_id}/submit on success (handbook §12.2). */
export interface FlagSuccess {
  success: true;
  points_awarded: number;
  first_blood: boolean;
  updated_team_score?: number;
}
