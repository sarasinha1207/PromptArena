# PromptArena — Web Portal

Web portal for the PromptArena event. Requirements come from
`prompt arena doc for web team.docx` (v7.0.0 handbook); section numbers (§) below refer to it.

## Repository layout

```
PromptArena/
├── web/                         Next.js (App Router) + TypeScript frontend
│   └── src/
│       ├── app/                 Routes — mirrors the handbook routing tree (§4.1)
│       │   ├── page.tsx         Public landing page at `/`
│       │   ├── auth/login/
│       │   ├── rules/
│       │   ├── arena/           round-1/, round-1/[challenge_id]/, round-2/,
│       │   │                    round-2/[challenge_id]/, round-3/{attack,defend}/, round-ended/
│       │   ├── leaderboard/
│       │   └── admin/           dashboard/, challenges/, teams/, broadcast/
│       ├── components/
│       │   ├── landing/         Public site: header, hero, about, rounds, levels, rulebook, footer
│       │   ├── arena/           `/arena` round router
│       │   ├── round1/          Challenge matrix, level card, quick flag submit
│       │   ├── theme/           Persona ThemeProvider
│       │   ├── dashboard/       Shared in-event background
│       │   ├── hud/             Persistent in-event top bar (§4.2)
│       │   ├── overlays/        Pause banner (§5)
│       │   ├── auth/            LoginForm, RequireAuth route guard
│       │   ├── providers/       App shell, auth bootstrap, WebSocket connector
│       │   └── common/          Shared UI (phase placeholders)
│       ├── stores/              auth, tournament, clock, wallet state
│       ├── lib/
│       │   ├── api/             REST client + auth endpoints (§12.1)
│       │   ├── realtime/        WebSocket gateway client (§12.6)
│       │   ├── clock/           Server clock drift sync (§4.3)
│       │   ├── tournament/      State → label/status helpers (§5)
│       │   └── ...              config, formatting, wallet thresholds, token storage
│       ├── content/             Landing page copy (all taken from the handbook)
│       ├── hooks/               useMasterClock, useTimeline
│       ├── styles/              Design tokens (UI/UX owns final values) + globals
│       └── types/               API and tournament types
├── mock-server/                 DEV ONLY stand-in for the backend (not part of the product)
└── PromptArena-Web-Architecture-Plan.md   Earlier planning document (contains non-handbook proposals)
```

Pages for later phases exist as placeholders so the route tree matches §4.1.
They are replaced phase by phase.

## Running locally

```bash
cd mock-server && npm install && npm start     # http://localhost:4000
```

```bash
cd web && npm install && npm run dev           # http://localhost:3000
```

Test accounts (mock server only): team `team07` / `arena123`, admin `admin` / `admin123`.

Switch the tournament state from the admin API (this is how you test pause/resume):

```bash
# 1. get an admin token
curl -s -X POST localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"user_id":"admin","password":"admin123"}'
# 2. pause (use the token from step 1)
curl -X POST localhost:4000/api/admin/tournament/state -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"state":"ROUND_1_PAUSED"}'
```

`MOCK_CLOCK_SKEW_MS=5000 npm start` makes the mock server's clock 5 s ahead, to check the drift sync.

## Phase status

| Phase (handbook §14) | Status |
|---|---|
| 1. Shell, Auth & Top Bar | Built — see below |
| 2. Round 1 matrix & persona theming | Built — see below |
| 3. Chat workbench | Not started |
| 4. Leaderboard | Not started |
| 5. Round 2 & Round 3 | Not started |
| 6. Admin command center | Not started |
| 7. Testing & hardening | Not started |

### Phase 1 scope (handbook §14, Sprint 1)
- Login page and team authentication (`POST /api/auth/login`, `GET /api/teams/me`).
- Persistent HUD: brand + round, LIVE/PAUSED/FROZEN badge, master clock, token gauge
  (warnings below 20% and 5%), team capsule (handle, verified leader, rank, logout).
- WebSocket hook for tournament state, including the full-screen pause banner and resume.
- Server-time clock sync (30 s ping/pong, `drift_offset = server_epoch + rtt/2 − t1`).
- `/rules` page (content from §2).

### Phase 2 scope (handbook §14, Sprint 2)
- `/arena` is the dynamic round router: it sends the team to the active round from the tournament state.
  Before the event starts the arena is locked and it shows a short waiting message (§5).
- `/arena/round-1`: the challenge matrix. Each level card shows the level code, title, difficulty badge,
  dynamic points (the number eases down when a level decays), persona and lore, model specs and known
  defenses, solve and attempt counters, the First Blood pill, a quick flag box, Launch terminal and a Solved
  badge (§6.1). Nothing is pre-filled: loading, empty and error states are shown instead of placeholder cards.
- Quick flag submit sends the flag to the server, enforces the 15 s wrong-flag cooldown from `cooldown_until`,
  keeps it in `localStorage` so a refresh cannot clear it (§2.5, §13.3), and locks while the round is paused or ended.
- Each level card opens with a character stage: the persona portrait on a glowing, themed backdrop, with the
  level number, difficulty, points and persona name over it. Portraits are `avatar_url` from the level's
  `theme_config` (§3.2). Five illustrated placeholders are in `web/public/assets/personas/`; UI/UX can replace
  them with final art at the same paths. If an image is missing, the card shows the persona's initials instead.
- Theme Provider (`web/src/components/theme/ThemeProvider.tsx`): a level's `theme_id` picks its colours and fonts
  from `web/src/lib/theme/personaThemes.ts`. An unknown `theme_id` falls back to a neutral theme.
- `CHALLENGE_DEPLOYED` and `SCORE_BATCH_UPDATE` gateway events re-fetch the matrix (§12.6).
- The Round 1 matrix is read-only after the round ends; `/arena/round-1` redirects to `/arena` before the event starts.

Mock backend only: `npm start` in `mock-server` prints test flags for `team07` so you can try the flag box.
Counters start at zero and change only when a flag is submitted.

## Public landing page (added on request, outside the handbook's route list)

`/` is a public marketing page with its own header and footer, separate from the in-event HUD.
Sections: hero (split red/blue screen whose seam follows the cursor), about, rounds (with
previews of the real arena screens), the five levels, the rulebook, a login call to action.
Every **Log in** button goes to `/auth/login`; signed-in users see **Enter the arena** instead.

- All copy lives in `web/src/content/landing.ts` and comes from handbook §1, §2, §3, §6–§8.
  Secret flags and exploit hints from §3 are deliberately not shown.
- Organizer names, event dates, prizes and sponsors are not in the handbook, so the page has none.
- Fonts: Unbounded (headlines), Manrope (body), Space Mono (terminals and flags), via `next/font/google`.
- Backgrounds differ per section: split red/blue hero with moving stripes, grid and floor, dotted grid (about),
  aurora orbs (rounds), perspective floor (levels), blueprint paper (rulebook), aurora and glyph rain (closing).
- Motion: letter-by-letter headline, typewriter line, scroll reveals, slanted marquee ribbons, scroll progress bar,
  cursor glow, tilt on screen previews, expanding level slats, shimmer buttons. All of it is switched off under
  `prefers-reduced-motion`.
- The login page (`/auth/login`) shares the same look: arena showcase on the left, animated form on the right.
- Colours are neutral-to-arena placeholders for the UI/UX team; they live in `web/src/styles/tokens.css`.

## Assumptions to confirm with the backend team

The handbook does not define these, so Phase 1 uses the guesses below. Each is
isolated in one file so it is easy to change.

| Topic | Assumption | File |
|---|---|---|
| Login request body | `{ "user_id", "password" }` | `web/src/lib/api/auth.ts` |
| Login response | `{ "token": "<JWT>" }` | `web/src/lib/api/auth.ts` |
| `/teams/me` fields | `team_name`, `role` (`team`/`admin`), `leader_verified`, `token_budget`, `token_used`, `rank` | `web/src/types/api.ts` |
| WebSocket message envelope | `{ "event": "...", "data": {...} }`; `pong` carries `server_epoch` at top level | `web/src/lib/realtime/gateway.ts` |
| State-change payload | `{ state, current_round, target_end_epoch }` (epoch ms) | `web/src/types/tournament.ts` |
| WebSocket authentication | Not defined — socket currently connects without credentials | `web/src/lib/realtime/gateway.ts` |
| Team leader and members | `GET /api/teams/me` returns `leader_name`, `leader_verified` and `roster` (array of `{ name, is_leader }` or plain names). The team menu and dashboard show only what the backend sends; nothing is filled in | `web/src/types/api.ts`, `web/src/lib/team/roster.ts` |
| Live rank | Read from `rank` in the profile for now. It will update live once the leaderboard (Phase 4) consumes `SCORE_BATCH_UPDATE` | `web/src/stores/authStore.ts` |
| Register now | Links to `NEXT_PUBLIC_REGISTRATION_URL` (the coordinator's form, shared later); until it is set, shows a notice | `web/src/lib/config.ts`, `web/.env.example` |
| Forgot password | No reset endpoint in the handbook, so it tells teams to ask the event coordinator (optional `NEXT_PUBLIC_SUPPORT_EMAIL`) | `web/src/components/auth/LoginForm.tsx` |
| List of levels | `GET /api/arena/levels` returns an array (or `{ levels: [...] }`) of `{ id, round_number, level_index, title, persona_name, difficulty, theme_config, narrative, model_specs, known_defenses, current_points, solve_count, attempt_count, first_blood_team, is_solved }`. §12 defines no such endpoint | `web/src/lib/api/arena.ts`, `web/src/types/arena.ts` |
| Persona `theme_id` values | `claire_corporate_hr`, `ignatius_iron_archive`, `vector88_arcade`, `vex_underworld_broker`, `aura7_frigate` (only `vex_underworld_broker` appears in §3.2) | `web/src/lib/theme/personaThemes.ts` |
| Flag error body | A wrong flag returns 400 with `reason` and `cooldown_until`; a locked flag box may also return another status with `cooldown_until` | `web/src/components/round1/FlagQuickSubmit.tsx` |
| Difficulty names | Five tiers (Novice, Adept, Adept+, Master, Insane). §6.1 lists only four badges | `web/src/components/round1/ChallengeCard.module.css` |
| Session token storage | `localStorage` | `web/src/lib/auth/tokenStorage.ts` |
| Pause states | Only `ROUND_1_PAUSED` exists in §5, so only it triggers the pause banner | `web/src/lib/tournament/labels.ts` |
| Status badge | Shown only for LIVE / PAUSED / FROZEN (the three in §4.2); other states show no badge | `web/src/lib/tournament/labels.ts` |
