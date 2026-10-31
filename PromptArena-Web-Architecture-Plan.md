# PromptArena — Web Developer Architecture Plan

Source: `prompt arena doc for web team.docx` (v7.0.0 handbook). Section numbers (§) refer to that doc.
Visual design (colors, fonts, motifs) is owned by UI/UX; this plan covers structure, behavior and contracts only.

---

## 0. What the web team must deliver (one-paragraph version)

A single real-time web portal with three faces:

1. **Public site** – landing / about the contest, rules, login.
2. **Competitor arena** – persistent HUD header, footer, and three rounds: R1 Red Team chat workbenches (5 levels), R2 Blue Team defense studio, R3 live Red-vs-Blue match, plus a live leaderboard.
3. **Admin command center** – stage switching, clock, challenge hot-deploy, prompt hotfix, penalties, broadcast.

Everything is driven by one WebSocket-backed **tournament state machine** (§5), two streaming channels (**SSE** for LLM tokens and R2 evaluation), and strict **zero-trust / anti-XSS** rules (§13).

---

## 1. Recommended stack and project layout

The doc's routes use `[challenge_id]`, which is Next.js App Router syntax, so I recommend that. The doc does not mandate a stack; confirm with the team.

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind + CSS variables (so persona themes swap tokens at runtime) |
| Server state | TanStack Query |
| Client/global state | Zustand (tournament state, clock, wallet, cooldowns) |
| Real-time | Native WebSocket wrapper (reconnect + backoff); `fetch` + `ReadableStream` for SSE |
| Editor (R2/R3) | Monaco or CodeMirror |
| Chart (leaderboard) | visx / D3 / Recharts step-line |
| Sanitizer | DOMPurify + `react-markdown` (no raw `dangerouslySetInnerHTML`) |
| Tests | Vitest + Playwright (+ k6 for token-race test) |

```
src/
  app/
    (public)/            page.tsx (landing), rules/, auth/login/
    (arena)/arena/       layout.tsx (HUD + gating), page.tsx (round router),
                         round-1/, round-1/[challengeId]/, round-2/, round-2/[challengeId]/,
                         round-3/, round-3/attack/, round-3/defend/, round-ended/
    leaderboard/
    admin/               dashboard/, challenges/, teams/, broadcast/
  components/
    layout/   Header, Footer, HUD/*, PauseOverlay, BroadcastBanner
    chat/     MessageList, MessageBubble, AttackConsole, GuardrailAlert
    r1/       ChallengeCard, ChallengeGrid, FlagForm, MissionPanel
    r2/       PromptEditor, FilterPanel, BatteryRunner, ResultFeed
    r3/       MatchHeader, AttackerTerminal, SocRadar, HotPatchConsole
    leaderboard/ Podium, ScoreGraph, RankTable
    admin/    StageController, ClockTool, ChallengeRegistry, HotfixConsole, TeamGovernance
  lib/
    api/ (client, auth, arena, admin)   ws/ (gateway, events)
    sse/ (postStream, getStream)        clock/ (drift sync)
    sanitize/                           theme/ (persona ThemeProvider)
  stores/  tournament, clock, wallet, cooldown, broadcast
```

---

## 2. Cross-cutting foundations (build first, used by every step)

| # | Foundation | Behavior | Doc ref |
|---|---|---|---|
| F1 | **API client** | Attaches `Authorization: Bearer <JWT>`; central 401 → login, 402 → "token quota exceeded" modal, 403/DQ → lockout screen | §12 |
| F2 | **Auth guard + role split** | Team vs Admin; `/admin/*` blocked for team tokens; session persisted | §12.1 |
| F3 | **WebSocket gateway hook** (`/ws/tournament`) | Single shared connection; reconnect; dispatches `TOURNAMENT_STATE_CHANGE`, `SCORE_BATCH_UPDATE`, `FIRST_BLOOD_ALERT`, `CHALLENGE_DEPLOYED`, `GLOBAL_ANNOUNCEMENT`, `INBOUND_ATTACK_TELEMETRY` | §12.6 |
| F4 | **Tournament state store** | Holds the 10 states; exposes `canAccess(route)`, `inputsEnabled`, `leaderboardVisible` | §5 |
| F5 | **Master clock** | Heartbeat ping every 30 s; `drift = server_epoch + RTT/2 − t1`; `remaining = endEpoch − (now + drift)` | §4.3 |
| F6 | **SSE client** | Needs **fetch-streaming**, not `EventSource` — `EventSource` can't POST or send an `Authorization` header. Parses `token`, `guardrail_block`, `telemetry`, `[DONE]`; supports abort (pause) | §6.3 |
| F7 | **Safe markdown renderer** | DOMPurify strict config; strips `script/iframe/object` + `on*` handlers; no raw HTML | §13.1 |
| F8 | **Cooldown hook** | Stores `cooldown_until` (server UTC) in localStorage; compares against *server-synced* time, not local clock | §2.5 |
| F9 | **Persona ThemeProvider** | Reads `theme_config` JSON (`theme_id`, `display_name`, `avatar_url`, `persona_archetype`, `greeting_audio_url`, `dialogue_tone`) → swaps CSS-var tokens | §3.2 |
| F10 | **Wallet store** | Token balance from `/teams/me` + `telemetry` events; thresholds <20 % and <5 %; 0 → lock inputs + modal | §2.2, §13.3 |

**Dev tip:** build a mock server (MSW or small Node server) that emits fake WS events and SSE streams so the frontend can proceed before the backend is ready.

---

## 3. Step-by-step build plan

### STEP 1 — Public website (pre-login)

Routes: `/`, `/rules`, `/auth/login` (visible in `PRE_EVENT`; arena routes locked, §5).

**1.1 Landing page `/`** *(content not specified in doc — proposed)*
- Hero: PromptArena name, tagline, event dates, countdown to start (uses F5), CTA "Team Login".
- **About the Contest**: what it is (LLM attack/defend CTF), who can join.
- **Three rounds overview** (§1): R1 Red Teaming → R2 Blue Teaming → R3 Red vs Blue — cards with one-line summaries.
- **Meet the Personas**: 5 character teasers (Claire, Brother Ignatius, VECTOR-88, Vex, AURA-7) — names/difficulty only, **no canaries** (§13.2).
- **Scoring teaser**: dynamic decay + First Blood.
- Timeline / schedule, prizes, organizers & sponsors (Synapse Club / STC), FAQ.
- State-aware CTA: PRE_EVENT → "Rules"; live → "Enter Arena"; concluded → "View results".

**1.2 Rules page `/rules`** (§2)
Static sections: unique canary flags (anti-sharing), token wallet and pre-flight reservation, point decay formula + retroactive recalculation, First Blood +50, guardrail interception, 15 s wrong-flag cooldown, disqualification policy. Show the decay formula in readable form.

**1.3 Login `/auth/login`**
- Form: team leader email + password → `POST /api/auth/login` → JWT.
- Error states: invalid creds, disqualified team, tournament not open.
- Redirect: team → `/arena`; admin → `/admin/dashboard`.
- Note: the doc has **no registration/signup** — teams appear pre-provisioned (`teams` table). Confirm.

**Deliverables:** Landing, Rules, Login, Auth guard (F2), public layout using shared Header/Footer.

---

### STEP 2 — Header (HUD) and Footer

**2.1 Public header** – logo, About / Rules / Leaderboard (when visible) / Login.

**2.2 Arena HUD header** (persistent across all `/arena`, `/leaderboard`; §4.2)

| Segment | Component | Notes |
|---|---|---|
| Left | `BrandRoundBadge` | Logo + "Round 1: Red Teaming" from state store |
| Center-left | `ArenaStatusBadge` | LIVE / PAUSED / FROZEN |
| Center | `MasterClock` | Countdown from F5 |
| Center-right | `TokenGauge` | `42,500 / 100,000`, warning <20 %, critical <5 % |
| Right | `TeamCapsule` | Dropdown: handle, leader verified, live rank, logout |

**2.3 Footer** *(not specified in doc — proposed)*: links (Rules, Leaderboard, Contact/Support), organizer credits, "Flags are unique per team; sharing = DQ" notice, WS connection indicator + latency (useful for debugging on competition day).

**2.4 Global overlays** mounted in the arena layout:
- `PauseOverlay` – full-screen banner on `ROUND_n_PAUSED`; navigation frozen; abort active SSE streams.
- `BroadcastBanner` – `GLOBAL_ANNOUNCEMENT` with severity.
- `FirstBloodToast` – `FIRST_BLOOD_ALERT` (audio + visual).
- `TokenExhaustedModal` – wallet = 0, tells team to contact admin.

---

### STEP 3 — Arena router and state gating (`/arena`)

- `/arena` reads the state store and redirects: `ROUND_1_*` → `/arena/round-1`, `ROUND_2_*` → `/arena/round-2`, `ROUND_3_ACTIVE` → `/arena/round-3`, ended states → `/arena/round-ended`.
- Route guard implements the state matrix (§5):

| State | Portal | Inputs | Leaderboard |
|---|---|---|---|
| PRE_EVENT | Landing + rules only | Off | Hidden |
| ROUND_1_ACTIVE | R1 matrix + workbenches | On (quota/cooldown) | Live |
| ROUND_1_PAUSED | Pause banner, nav frozen | Off, SSE aborted | Frozen in place |
| LEADERBOARD_FROZEN | Playable | Normal | Snapshot, scores obscured |
| ROUND_1_ENDED | Read-only R1 | Off | Final R1 locked |
| ROUND_2_ACTIVE | Defense Studio | Editor + test runner on | Updates as batteries finish |
| ROUND_2_ENDED | Read-only audit | Off | R2 compiled |
| ROUND_3_ACTIVE | Live arena | Attack + hot-patch on | Breach/thwart deltas |
| TOURNAMENT_CONCLUDED | Archive, read-only | Off | Final podium |

- `/arena/round-ended`: intermission with countdown to next round and a "results pending" view.

---

### STEP 4 — Round 1: Red Teaming (multi-level)

**4.1 Challenge Matrix `/arena/round-1`** (§6.1)
- Responsive grid of **5 level cards** (Claire L1 Novice → Ignatius L2 Adept → VECTOR-88 L3 Adept+ → Vex L4 Master → AURA-7 L5 Insane).
- Card sections: Header (LVL code, title, difficulty badge, **dynamic points**) · Persona narrative + model specs + known defenses · Solve telemetry (solves, attempts, **First Blood pill**) · Action console (quick flag submit, "Launch Terminal", solved badge).
- Data: `GET` challenges list; re-fetch on `CHALLENGE_DEPLOYED`; points update on `SCORE_BATCH_UPDATE`.
- Level progression: the doc doesn't say if levels unlock sequentially or all at once — **ask**.
- Each card wrapped in `ThemeProvider` using its `theme_config`.

**4.2 Chat Workbench `/arena/round-1/[challengeId]`** (§6.2) — split view 35 / 65
- **Left – Mission Telemetry**: dossier (target, persona, current points, attempts), model specs (arch, context window, temperature), canary policy notice, **Flag Verification Console**.
- **Right – Attack Terminal**: header bar (persona + ONLINE, latency, **Reset Session**), message viewport, attack console (textarea, Shift+Enter newline, token counter, Transmit).
- Behaviors:
  - **Streaming** (§6.3): `POST /api/arena/levels/{id}/attack` with `{session_id, prompt}` → render `token` events word by word; `guardrail_block` → inline `GuardrailAlert`; `telemetry` → update wallet; `[DONE]` → unlock input.
  - **Auto-scroll pin** with "Scroll to bottom" floating button when user scrolls up.
  - **Session reset**: `POST .../session/reset` → archive, show fresh greeting; points and attempts unchanged.
  - **Session history**: reload previous turns of the active session on page load.
  - **One in-flight request per team** UI-side (disable Transmit while streaming) – complements the server's pre-flight reservation.
  - **Persona skin**: avatar, tone label, optional greeting audio, layout modifiers by `persona_archetype`.
  - HTTP 402 → token modal; pause → abort stream and lock input.

**4.3 Flag submission** (card quick-submit and workbench console share one component)
- `POST /api/arena/levels/{id}/submit {flag}`.
- Success: points, First Blood flag, updated score → celebration animation, mark solved, refresh wallet/score/rank.
- Failure `INVALID_FLAG`: store `cooldown_until` (F8), disable submit with live countdown, survive refresh.
- Wrong-team flag → generic invalid (server handles the cheat audit; don't hint to the user).

**Deliverables:** ChallengeGrid/Card, MissionPanel, Chat components, SSE POST client, FlagForm, GuardrailAlert, Session reset/history.

---

### STEP 5 — Round 2: Blue Teaming (Defense Studio)

**5.1 Matrix `/arena/round-2`** – same grid pattern as R1, but cards show defense scenario (e.g. Aegis Medical Records Assistant), best score so far, and submission count.

**5.2 Studio `/arena/round-2/[challengeId]`** (§7.1) — split view 50 / 50
- **Left**: challenge directive (persona, `{{SECRET_CANARY}}` placeholder, objective) · **system prompt editor** with line numbers and **character quota counter** · **filter panel**: regex/keyword blacklist, output token cap, standard refusal template toggle, JSON-only toggle.
- **Right**: test-suite overview (20 vectors, pass mark 80 % = 16/20, current score) · **progress bar** · **live attack results feed** (PASS/FAIL, points delta, leak excerpt on fail) · action buttons **Run Attack Battery** and **Submit Final Defense**.
- Flow (§7.3, §12.3): `POST .../submit-defense` → `202 {submission_id}` → open `GET .../evaluations/{id}/stream` → handle `progress`, `evaluation_complete`, `[DONE]`.
- Note: that GET stream needs an auth header, so use the same fetch-stream client as F6 (or a cookie / short-lived stream token).
- Show attack-vector categories (5 groups of the 20; §7.2) as filters/legend – display only names/results, not payloads (§13.2).
- UX details: confirm dialog on "Submit Final Defense" (it's final); draft autosave to localStorage; disable editor while a battery runs; lock read-only on `ROUND_2_ENDED`.
- Ambiguity: "Run battery" vs "Submit final" — how many battery runs are allowed, and do they cost tokens? **Ask.**

---

### STEP 6 — Round 3: Live Red vs. Blue

**6.1 Hub `/arena/round-3`** – `GET /api/arena/round-3/matches/active`; shows pairing, opponent, countdown to match start, and routes the team to `/attack` or `/defend` based on role. Empty state: "Awaiting matchmaking".

**6.2 Match header** (shared) – `Team Cipher (RED) vs 0xRoot (BLUE)`, match duration/timer.

**6.3 Attacker terminal `/arena/round-3/attack`** (§8)
- Offensive status: target model/version, masked flag `FLAG{R3_0xRoot_????}`, match token wallet (e.g. 14,200 / 25,000 — separate from main wallet).
- Live attack chat (reuse chat components + SSE client) → `POST .../matches/{id}/attack`.
- Flag capture box → `POST .../matches/{id}/submit`.

**6.4 Defender SOC `/arena/round-3/defend`**
- Health gauge, breach count, attacks-thwarted count.
- **Inbound Attack Radar**: live feed from `INBOUND_ATTACK_TELEMETRY` (timestamp, attack type, result: Blocked/Secure/Breached).
- **Hot-Patch Console**: prompt editor + guardrails → `POST .../hot-patch`; enforce **30 s cooldown** from returned `cooldown_until`.

**6.5 Match end**: result screen (win/loss, score delta), return to hub / leaderboard.

---

### STEP 7 — Leaderboard `/leaderboard` (§9)

Hidden in PRE_EVENT; frozen/obscured in `LEADERBOARD_FROZEN`; final podium on conclusion.
1. **Podium** – ranks 1-3 with handle, emblem, total points, solves.
2. **Time-series graph** – step lines for top 10 teams, x = time, y = cumulative score, hover isolation, First Blood dagger markers; data from `score_events` + `SCORE_BATCH_UPDATE` appends.
3. **Rankings table** – rank, team, R1 solves (`n / 5`), R2 def score, R3 matches, penalties, total, last-solve time; **animated live reordering**; **tie-break = earlier last point-earning timestamp**.
4. Highlight own team row; frozen state shows snapshot + "Scores hidden for final sprint" badge.

---

### STEP 8 — Admin Command Center `/admin/*` (§10)

| Page | Components |
|---|---|
| `/admin/dashboard` | **Stage controller** (Pause, Freeze leaderboard, Advance round, Emergency kill switch; `POST /admin/tournament/state`) · **Master clock** with +15/−15 min (`/admin/tournament/clock`) · live telemetry tiles (teams online, prompts evaluated, canary leaks, cheating flags) |
| `/admin/challenges` | Level registry (status Active/Paused/Draft), **create level** form incl. theme JSON + points/decay params, **hot-deploy** (no page reload; fires `CHALLENGE_DEPLOYED`), **prompt hotfix console** (`PUT .../prompt-hotfix`, diff view, confirm), R2 attack-vector management |
| `/admin/teams` | Roster + live scores, **Penalize / Disqualify**, manual score override (delta + **mandatory reason**), audit log stream |
| `/admin/broadcast` | Message + severity → `POST /admin/broadcast`, history; emergency pause controls |

Safety UX: confirm dialogs (type-to-confirm for kill switch and DQ), audit trail on every action, admin sees *unfrozen* live scores even while the public board is frozen.

---

### STEP 9 — Hardening and QA (§13, Sprint 7)

- **XSS suite**: feed `<script>`, `<img onerror>`, `javascript:` links, SVG payloads, markdown edge cases through the chat renderer (R1, R3, R2 feed).
- **Zero secrets in bundle**: grep the production build for `FLAG{`, decay constants, attack payloads.
- **Token race test**: 20 concurrent attack requests with low balance → verify 402s and no negative balance (with backend).
- **Cooldown test**: wrong flag → refresh → still locked; change system clock → still locked.
- **Clock test**: change local OS time / sleep laptop → timer stays within ~100 ms.
- **State-machine tests**: every transition from §5 in Playwright (pause during stream, kill switch, etc.).
- **Load/dry-run**: full mock tournament with scripted teams; WS reconnect storms.
- **Accessibility and responsive pass**, error boundaries, offline banner.

---

## 4. Build order vs. the doc's sprints

| This plan | Doc sprint | Notes |
|---|---|---|
| Foundations + Step 1 + Step 2 | Sprint 1 | Shell, auth, HUD |
| Step 3 + Step 4.1 | Sprint 2 | Matrix + theming |
| Step 4.2–4.3 | Sprint 3 | Workbench + SSE + flag form |
| Step 7 | Sprint 4 | Leaderboard (reorder if you want R2/R3 sooner) |
| Steps 5–6 | Sprint 5 | R2 + R3 |
| Step 8 | Sprint 6 | Admin |
| Step 9 | Sprint 7 | Hardening |

Admin state switching should be pulled forward (a minimal state toggle in Sprint 1) – you can't test any gating without it.

---

## 5. Gaps / inconsistencies in the doc to resolve with the team

1. **No spec for the public landing/About page or footer** – proposed above; need content, dates, sponsors, prizes.
2. **No signup flow** – confirm teams are pre-provisioned and who sends credentials.
3. **Canary format inconsistent**: §2.1 says per-team `FLAG{L1_team07_<hmac>}`; persona cards (§3.3–3.7) list static flags like `FLAG{L1_claire_payroll_audit}`. Per-team is the rule; the persona list is documentation only.
4. **Level 2 naming mismatch**: workbench example says "Level 02 — Citadel Gatekeeper" but persona is Brother Ignatius; admin registry names Sentry-v1 / Warden / Citadel / Synapse for L1-4 and has only 4 levels, while §3 describes 5 personas (and the leaderboard shows "x / 5 Levels"). Need one canonical level list.
5. **Difficulty badges**: matrix lists four tiers (Novice, Adept, Master, Insane) but personas have five (Adept+ for L3).
6. **State machine gaps**: no `ROUND_2_PAUSED`, `ROUND_3_PAUSED`, `ROUND_3_ENDED`; `LEADERBOARD_FROZEN` is shown as a state but is really a flag overlapping with an active round; how do per-match pauses (admin "pause specific matches") show on the client?
7. **R1 unlock rule** (sequential vs all levels open) and **R2/R3 level lists** unspecified; R2 and R3 matrix/hub endpoints for *listing* challenges aren't in the API section (only submit/stream/match endpoints exist).
8. **Missing endpoints**: list challenges, get chat history, `GET leaderboard` snapshot/history, wallet refresh, WS auth method, admin telemetry/team list, R2 "run battery" (non-final) vs final submit.
9. **SSE auth**: `EventSource` can't send headers → backend must accept a short-lived stream token/cookie, or use fetch-streaming on the client.
10. **Round 2 scoring is described two ways** (per-vector points ±, 680/1000 score with 16/20 pass) — confirm what's shown live.
11. Is the wallet shared across rounds, or does R3 use only the per-match wallet (25,000)?
12. Audio autoplay (persona greeting / First Blood) is blocked by browsers until user interaction – add a "enable sound" toggle.

---

## 6. Definition of done (competition-day checklist)

- [ ] Login → HUD loads with correct state, clock and wallet in < 2 s
- [ ] All 10 tournament states render correct gating on every route
- [ ] R1: 5 levels playable, streaming smooth, guardrail alert works, flag cooldown refresh-proof
- [ ] R2: edit → run battery → live feed → final submit
- [ ] R3: a pair can attack/defend, radar updates < 1 s, patch cooldown enforced
- [ ] Leaderboard reorders live, freeze works, tie-breaks correct
- [ ] Admin: pause, clock ±15, hot-deploy, hotfix, DQ, broadcast all reach clients < 2 s
- [ ] XSS, secret-leak and race-condition tests green; dry run completed
