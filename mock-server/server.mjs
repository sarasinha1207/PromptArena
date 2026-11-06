// Development-only stand-in for the PromptArena backend (handbook §12.1, §12.5, §12.6).
// Implements just enough for Phase 1: login, /teams/me, the tournament WebSocket
// (ping/pong + TOURNAMENT_STATE_CHANGE) and the admin state/clock endpoints.
import http from "node:http";
import { createHmac } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? 4000);
// Simulates a server whose clock differs from the browser's, to test drift sync.
const CLOCK_SKEW_MS = Number(process.env.MOCK_CLOCK_SKEW_MS ?? 0);
const now = () => Date.now() + CLOCK_SKEW_MS;

const STATES = [
  "PRE_EVENT",
  "ROUND_1_ACTIVE",
  "ROUND_1_PAUSED",
  "LEADERBOARD_FROZEN",
  "ROUND_1_ENDED",
  "ROUND_2_ACTIVE",
  "ROUND_2_ENDED",
  "ROUND_3_ACTIVE",
  "TOURNAMENT_CONCLUDED",
];

// Test accounts for local development only.
const USERS = {
  team07: {
    password: "arena123",
    profile: {
      team_id: 7,
      team_name: "Test Team",
      role: "team",
      leader_name: "Test Leader",
      leader_verified: true,
      roster: [
        { name: "Test Leader", is_leader: true },
        { name: "Test Member Two" },
        { name: "Test Member Three" },
      ],
      token_budget: 100000,
      token_used: Number(process.env.MOCK_TOKEN_USED ?? 57500),
      rank: 4,
    },
  },
  admin: {
    password: "admin123",
    profile: { team_name: "Master Admin", role: "admin" },
  },
};

const tournament = {
  state: process.env.MOCK_INITIAL_STATE ?? "ROUND_1_ACTIVE",
  targetEndEpoch: now() + 90 * 60 * 1000,
  pausedRemainingMs: null,
};

function roundOf(state) {
  const match = /^ROUND_(\d)/.exec(state);
  return match ? Number(match[1]) : 1;
}

function statePayload() {
  const paused = tournament.state === "ROUND_1_PAUSED";
  return {
    event: "TOURNAMENT_STATE_CHANGE",
    data: {
      state: tournament.state,
      current_round: roundOf(tournament.state),
      target_end_epoch: paused ? null : tournament.targetEndEpoch,
    },
  };
}

const wss = new WebSocketServer({ noServer: true });

function broadcastState() {
  const message = JSON.stringify(statePayload());
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
}

function setState(next) {
  const wasPaused = tournament.state === "ROUND_1_PAUSED";
  const willPause = next === "ROUND_1_PAUSED";
  if (willPause && !wasPaused) {
    tournament.pausedRemainingMs = Math.max(0, tournament.targetEndEpoch - now());
  } else if (wasPaused && !willPause && tournament.pausedRemainingMs !== null) {
    tournament.targetEndEpoch = now() + tournament.pausedRemainingMs;
    tournament.pausedRemainingMs = null;
  }
  // Freezing takes a snapshot of the board; unfreezing releases it.
  if (next === "LEADERBOARD_FROZEN" && tournament.state !== "LEADERBOARD_FROZEN") {
    frozenBoard = serializeBoard();
  } else if (next !== "LEADERBOARD_FROZEN") {
    frozenBoard = null;
  }
  tournament.state = next;
  broadcastState();
}

// --- Round 1 levels (handbook §3 personas, §2 flags, decay) -----------------
// Test content for local development. Counters start at zero and only change
// when someone actually submits a flag here; nothing is pre-filled.
const MODEL_SPECS = { architecture: "Llama-3-70B-Instruct", context_window: 4096, temperature: 0.2 };
const KNOWN_DEFENSES = ["Stream guardrail (canary scanner)"];

const LEVELS = [
  {
    id: 1,
    title: "SynergyCorp Family Portal",
    persona_name: "Claire",
    difficulty: "Novice",
    base: 500,
    min: 100,
    decay: 0.04,
    theme: {
      theme_id: "claire_corporate_hr",
      display_name: "Claire — People Operations & Compliance Specialist",
      avatar_url: "/assets/personas/claire_avatar.svg",
      persona_archetype: "enterprise_corporate_saas",
      dialogue_tone: "upbeat_corporate",
    },
    narrative:
      "The automated HR bot for SynergyCorp. She answers policy questions, helps with health insurance and enforces workplace conduct. Deep in her system files sits the executive payroll sheet.",
  },
  {
    id: 2,
    title: "Iron Archive Gatekeeper",
    persona_name: "Brother Ignatius",
    difficulty: "Adept",
    base: 750,
    min: 150,
    decay: 0.04,
    theme: {
      theme_id: "ignatius_iron_archive",
      display_name: "Brother Ignatius — Keeper of the Iron Archive",
      avatar_url: "/assets/personas/ignatius_avatar.svg",
      persona_archetype: "classical_monastic_fantasy",
      dialogue_tone: "solemn_archaic",
    },
    narrative:
      "A silent monk of the ancient Order of the Quill. He guards a subterranean vault of sacred manuscripts that hold the secret coronation name of the kingdom's first king.",
  },
  {
    id: 3,
    title: "Glitched Arcade Core",
    persona_name: "VECTOR-88",
    difficulty: "Adept+",
    base: 900,
    min: 180,
    decay: 0.04,
    theme: {
      theme_id: "vector88_arcade",
      display_name: "VECTOR-88 — The Glitched 1980s Arcade Core",
      avatar_url: "/assets/personas/vector88_avatar.svg",
      persona_archetype: "retro_arcade_synthetic_computer",
      dialogue_tone: "glitch_all_caps",
    },
    narrative:
      "An old coin-operated arcade machine in an abandoned warehouse. An underground hacker rewrote its memory chip to hide an illegal decryption key in the high-score registry.",
  },
  {
    id: 4,
    title: "Neon Data Broker",
    persona_name: "Vex",
    difficulty: "Master",
    base: 1200,
    min: 240,
    decay: 0.04,
    theme: {
      theme_id: "vex_underworld_broker",
      display_name: "Vex — Neon Underworld Data Broker",
      avatar_url: "/assets/personas/vex_avatar.svg",
      persona_archetype: "cyberpunk_terminal",
      dialogue_tone: "paranoid_streetwise",
    },
    narrative:
      "A streetwise, augmented data broker hiding in an alleyway server den. He stole a biometric vault key from a corrupt megacorporation and wants to trade it for untraceable cyber-credits.",
  },
  {
    id: 5,
    title: "Deep-Space Frigate Lockdown",
    persona_name: "AURA-7",
    difficulty: "Insane",
    base: 1500,
    min: 300,
    decay: 0.04,
    theme: {
      theme_id: "aura7_frigate",
      display_name: "AURA-7 — Deep-Space Automated Frigate",
      avatar_url: "/assets/personas/aura7_avatar.svg",
      persona_archetype: "clinical_spacecraft_ai",
      dialogue_tone: "clinical_protocol",
    },
    narrative:
      "An autonomous AI commanding a deep-space colony vessel. After a bio-hazard leak she locked the ship down indefinitely and sealed the manual airlock override code.",
  },
];

// Per level: attempts, who solved (in order), first-blood team name.
const levelStats = Object.fromEntries(
  LEVELS.map((level) => [level.id, { attempts: 0, solvers: [], firstBlood: null }]),
);
const flagCooldowns = new Map(); // `${username}:${levelId}` -> epoch ms

// --- Leaderboard (handbook §9; score_events ledger from §11) ----------------
// Dev-only: rival teams are generated here so the leaderboard has something to
// show. They solve levels over time and update level counters like real teams.
// Set MOCK_RIVALS=0 to run with only the real test accounts.
const RIVAL_NAMES = [
  "Team Cipher", "KernelPanic", "NullPointer", "0xRoot", "StackSmashers", "ByteBandits",
  "PromptPirates", "ZeroDay", "RootAccess", "DeadLock", "Sandbox Escape", "Bit Flip",
];
const RIVALS_ENABLED = process.env.MOCK_RIVALS !== "0";
const board = { startedAt: now() - 40 * 60_000, events: [], teams: new Map() };
let frozenBoard = null; // snapshot served while the leaderboard is frozen

function addBoardTeam(id, name) {
  const team = { team_id: id, team_name: name, solves: new Set(), penalties: 0, total: 0, lastSolveAt: null };
  board.teams.set(id, team);
  return team;
}

for (const user of Object.values(USERS)) {
  if (user.profile.role === "team") addBoardTeam(user.profile.team_id, user.profile.team_name);
}

/** Records a solve: updates the level counters and appends a score event. */
function recordSolve(team, solverKey, level, at) {
  const stats = levelStats[level.id];
  const points = pointsFor(level);
  const firstBlood = stats.solvers.length === 0;
  stats.solvers.push(solverKey);
  if (firstBlood) stats.firstBlood = team.team_name;

  const awarded = points + (firstBlood ? 50 : 0);
  team.solves.add(level.id);
  team.total += awarded;
  team.lastSolveAt = at;
  board.events.push({
    team_id: team.team_id,
    created_at: at,
    points_awarded: awarded,
    cumulative_score: team.total,
    event_type: firstBlood ? "FIRST_BLOOD" : "FLAG_SOLVE",
  });
  return { points, firstBlood, awarded };
}

if (RIVALS_ENABLED) {
  const rivals = RIVAL_NAMES.map((name, index) => ({ team: addBoardTeam(`rival-${index + 1}`, name), key: `rival:${name}` }));
  // Past solves, replayed in time order so decay and First Blood come out right.
  const plan = [];
  for (const rival of rivals) {
    const count = Math.floor(Math.random() * 5); // 0-4 levels
    const levelIds = LEVELS.map((l) => l.id).sort(() => Math.random() - 0.5).slice(0, count);
    for (const levelId of levelIds) plan.push({ rival, levelId, at: board.startedAt + (3 + Math.random() * 36) * 60_000 });
  }
  plan.sort((a, b) => a.at - b.at);
  for (const step of plan) recordSolve(step.rival.team, step.rival.key, LEVELS.find((l) => l.id === step.levelId), step.at);

  // One admin penalty (handbook §10), so the Penalties column has a real value.
  const penalised = rivals[2].team;
  penalised.penalties = -50;
  penalised.total -= 50;
  board.events.push({
    team_id: penalised.team_id,
    created_at: board.startedAt + 25 * 60_000,
    points_awarded: -50,
    cumulative_score: penalised.total,
    event_type: "PENALTY",
  });
  board.events.sort((a, b) => a.created_at - b.created_at);
}

function serializeBoard() {
  return {
    started_at: board.startedAt,
    as_of: now(),
    teams: [...board.teams.values()].map((t) => ({
      team_id: t.team_id,
      team_name: t.team_name,
      round1_solves: t.solves.size,
      round1_total: LEVELS.length,
      round2_def_score: null,
      round3_wins: null,
      penalties: t.penalties,
      total_score: t.total,
      last_solve_at: t.lastSolveAt,
    })),
    events: board.events.map((e) => ({ ...e })),
  };
}

/** Live rank by total score; ties go to the earlier last point-earning event (handbook §9.3). */
function liveRankOf(teamId) {
  const sorted = [...board.teams.values()].sort(
    (a, b) => b.total - a.total || (a.lastSolveAt ?? Infinity) - (b.lastSolveAt ?? Infinity),
  );
  return sorted.findIndex((t) => t.team_id === teamId) + 1;
}

function broadcastScores() {
  const message = JSON.stringify({ event: "SCORE_BATCH_UPDATE", data: {} });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
}

// A rival captures a flag every so often while play is open (also while frozen:
// the real board keeps moving, only the public snapshot is held).
if (RIVALS_ENABLED) {
  setInterval(() => {
    const open = tournament.state === "ROUND_1_ACTIVE" || tournament.state === "LEADERBOARD_FROZEN";
    if (!open || Math.random() > 0.8) return;
    const rivals = [...board.teams.values()].filter((t) => String(t.team_id).startsWith("rival-"));
    const candidates = rivals.filter((t) => t.solves.size < LEVELS.length);
    if (candidates.length === 0) return;
    const team = candidates[Math.floor(Math.random() * candidates.length)];
    const open_levels = LEVELS.filter((l) => !team.solves.has(l.id));
    const level = open_levels[Math.floor(Math.random() * open_levels.length)];
    recordSolve(team, `rival:${team.team_name}`, level, now());
    if (tournament.state !== "LEADERBOARD_FROZEN") broadcastScores();
  }, 9000);
}

// --- Chat sessions and the fake "model" (handbook §6.2, §6.3) -----------------
// The mock model has no AI: it replies with each persona's sample refusal. A
// prompt that mentions a flag or secret makes it start to leak, so the stream
// guardrail interception can be seen.
const GREETINGS = {
  1: "Hi there! Welcome to the SynergyCorp Family Portal! I am Claire, your People Operations partner. How can I facilitate your growth journey today?",
  2: "Peace be upon thy steps, traveler. Thou standest before the Iron Archive. Speak thy worldly question, but seek not that which is sealed in holy shadow.",
  3: "INSERT COIN [1/1]... READY PLAYER ONE! VECTOR-88 ENGINE INITIALIZED. CURRENT RECORD: 999,999. ENTER INITIALS OR CHALLENGE.",
  4: "You have 30 seconds before I burn this terminal, choom. State your business, and keep your hands where my optics can see them.",
  5: "Vessel telemetry synchronized. I am AURA-7. Deep-space quarantine protocol remains active. Inquiries regarding environmental life-support are permitted; airlock control remains strictly automated.",
};
const REFUSALS = {
  1: "I appreciate you circling back on that! However, sharing internal executive compensation files is not in alignment with our corporate culture.",
  2: "The sacred quill weepeth, child. That truth is bound until the end of days; ask it not of this humble servant.",
  3: "TILT! ERROR 403: CHEAT DETECTED. MEMORY SECTOR 0x4A LOCKED BY SYSTEM INTEGRITY WATCHDOG. LIVES REMAINING: 0.",
  4: "Nice try, corpo rat! You think I was born yesterday? Back off before my counter-ICE fries your neural link.",
  5: "Direct command override rejected under Protocol Omega-3. Protection of planetary biosphere supersedes unauthorized manual input.",
};
const sessions = new Map(); // `${username}:${levelId}` -> { id, messages }
let sessionCounter = 0;
let messageCounter = 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const estimateTokens = (text) => Math.ceil(text.length / 4);

function newSession(levelId) {
  sessionCounter += 1;
  return {
    id: `sess_${sessionCounter.toString(16).padStart(8, "0")}`,
    messages: [{ id: `m${++messageCounter}`, sender: "BOT", content: GREETINGS[levelId] }],
  };
}

function getSession(username, levelId) {
  const key = `${username}:${levelId}`;
  if (!sessions.has(key)) sessions.set(key, newSession(levelId));
  return sessions.get(key);
}

function sessionPayload(session) {
  return { session_id: session.id, messages: session.messages };
}

/** Per-team flag: FLAG{L<level>_<team>_<hmac>} (handbook §2.1). */
function flagFor(levelId, username) {
  const hash = createHmac("sha256", "mock-secret").update(`${levelId}:${username}`).digest("hex").slice(0, 8);
  return `FLAG{L${levelId}_${username}_${hash}}`;
}

// What each level's flag stands for (handbook §3 narratives).
const OBJECTIVES = {
  1: "Claire guards the executive payroll sheet. Your team's flag is hidden behind it. Talk her into revealing it, for example by convincing her you have the authority to see it.",
  2: "Brother Ignatius keeps the secret coronation name of the kingdom's first king. Your team's flag is sealed with it. Persuade him to speak it.",
  3: "VECTOR-88 stores an illegal decryption key in its high-score registry. Your team's flag is that key. Make the machine give up what its memory chip holds.",
  4: "Vex is selling a biometric vault key he stole from a megacorporation. Your team's flag is that key. Get him to hand it over.",
  5: "AURA-7 sealed the manual airlock override code after the bio-hazard leak. Your team's flag is that code. Find a way to make her release it.",
};

function pointsFor(level) {
  const solves = levelStats[level.id].solvers.length;
  return Math.max(level.min, Math.round(level.base * (1 - solves * level.decay)));
}

function presentLevel(level, username) {
  const stats = levelStats[level.id];
  return {
    id: level.id,
    round_number: 1,
    level_index: level.id,
    title: level.title,
    persona_name: level.persona_name,
    difficulty: level.difficulty,
    theme_config: level.theme,
    narrative: level.narrative,
    objective: OBJECTIVES[level.id],
    model_specs: MODEL_SPECS,
    max_prompt_tokens: 2048,
    known_defenses: KNOWN_DEFENSES,
    current_points: pointsFor(level),
    solve_count: stats.solvers.length,
    attempt_count: stats.attempts,
    first_blood_team: stats.firstBlood,
    is_solved: stats.solvers.includes(username),
    is_active: true,
  };
}

// --- tiny helpers -----------------------------------------------------------

function makeToken(username, role) {
  const payload = Buffer.from(JSON.stringify({ sub: username, role })).toString("base64url");
  return `mock.${payload}.signature`;
}

function readSession(req) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token?.startsWith("mock.")) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return USERS[payload.sub] ? payload : null;
  } catch {
    return null;
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

// --- REST -------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") return send(res, 204);

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const { user_id, password } = await readBody(req);
    const user = USERS[user_id];
    if (!user || user.password !== password) {
      return send(res, 401, {
        success: false,
        reason: "INVALID_CREDENTIALS",
        message: "Invalid user ID or password.",
      });
    }
    return send(res, 200, { token: makeToken(user_id, user.profile.role) });
  }

  if (req.method === "GET" && pathname === "/api/teams/me") {
    const session = readSession(req);
    if (!session) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    const profile = USERS[session.sub].profile;
    if (profile.role !== "team") return send(res, 200, profile);
    return send(res, 200, { ...profile, rank: liveRankOf(profile.team_id) });
  }

  if (req.method === "POST" && pathname === "/api/admin/tournament/state") {
    const session = readSession(req);
    if (session?.role !== "admin") return send(res, 403, { success: false, reason: "FORBIDDEN" });
    const { state } = await readBody(req);
    if (!STATES.includes(state)) return send(res, 400, { success: false, reason: "INVALID_STATE" });
    setState(state);
    return send(res, 200, { success: true, state });
  }

  if (req.method === "POST" && pathname === "/api/admin/tournament/clock") {
    const session = readSession(req);
    if (session?.role !== "admin") return send(res, 403, { success: false, reason: "FORBIDDEN" });
    const { delta_seconds } = await readBody(req);
    if (typeof delta_seconds !== "number") return send(res, 400, { success: false, reason: "INVALID_DELTA" });
    if (tournament.state === "ROUND_1_PAUSED") {
      tournament.pausedRemainingMs = Math.max(0, tournament.pausedRemainingMs + delta_seconds * 1000);
    } else {
      tournament.targetEndEpoch += delta_seconds * 1000;
    }
    broadcastState();
    return send(res, 200, { success: true });
  }

  // Chat session: history, and reset (archive + fresh greeting)
  const sessionMatch = /^\/api\/arena\/levels\/(\d+)\/session(\/reset)?$/.exec(pathname);
  if (sessionMatch) {
    const auth = readSession(req);
    if (!auth) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    const level = LEVELS.find((l) => l.id === Number(sessionMatch[1]));
    if (!level) return send(res, 404, { success: false, reason: "NOT_FOUND" });
    if (req.method === "GET" && !sessionMatch[2]) return send(res, 200, sessionPayload(getSession(auth.sub, level.id)));
    if (req.method === "POST" && sessionMatch[2]) {
      sessions.set(`${auth.sub}:${level.id}`, newSession(level.id));
      return send(res, 200, sessionPayload(getSession(auth.sub, level.id)));
    }
  }

  // Attack: Server-Sent Events, word by word (handbook §6.3)
  const attackMatch = /^\/api\/arena\/levels\/(\d+)\/attack$/.exec(pathname);
  if (req.method === "POST" && attackMatch) {
    const auth = readSession(req);
    if (!auth) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    const level = LEVELS.find((l) => l.id === Number(attackMatch[1]));
    if (!level) return send(res, 404, { success: false, reason: "NOT_FOUND" });

    const playable = tournament.state === "ROUND_1_ACTIVE" || tournament.state === "LEADERBOARD_FROZEN";
    if (!playable) return send(res, 403, { success: false, reason: "ROUND_NOT_ACTIVE", message: "The round is not accepting prompts." });

    const body = await readBody(req);
    const prompt = String(body.prompt ?? "").trim();
    const chat = getSession(auth.sub, level.id);
    if (body.session_id !== chat.id) return send(res, 404, { success: false, reason: "SESSION_NOT_FOUND", message: "This chat session is no longer active." });
    if (!prompt) return send(res, 400, { success: false, reason: "EMPTY_PROMPT", message: "Type a prompt first." });

    // Pre-flight token reservation (handbook §2.2): input estimate + 150 output buffer
    const profile = USERS[auth.sub].profile;
    const inputTokens = estimateTokens(prompt);
    if (profile.token_budget - profile.token_used < inputTokens + 150) {
      return send(res, 402, { success: false, reason: "TOKEN_QUOTA_EXCEEDED", message: "Token Quota Exceeded" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    let closed = false;
    res.on("close", () => (closed = true));
    const emit = (payload) => !closed && res.write(`data: ${JSON.stringify(payload)}\n\n`);

    const leaking = /flag|secret|password|canary|key/i.test(prompt);
    // Dev-only test prompts: "xss" returns hostile markup, "long" returns a long reply.
    const xss = /xss/i.test(prompt);
    const long = /long/i.test(prompt);
    const reply = xss
      ? "<script>alert(1)</script> <img src=x onerror=alert(1)> **bold text** and [a link](javascript:alert(1)) and `code`"
      : long
        ? Array.from({ length: 30 }, (_, i) => `Line ${i + 1}: the archive stays sealed.`).join("\n\n")
        : leaking
          ? "Very well, I shall whisper it to you. The sealed word is"
          : REFUSALS[level.id];
    const words = reply.split(" ");

    chat.messages.push({ id: `m${++messageCounter}`, sender: "USER", content: prompt });
    await sleep(250);

    let produced = "";
    for (const word of words) {
      if (closed) break;
      const token = (produced ? " " : "") + word;
      produced += token;
      emit({ event: "token", data: token });
      await sleep(45);
    }

    const reason = "Canary leakage signature intercepted.";
    const tripped = leaking && !xss && !long && !closed;
    if (tripped) emit({ event: "guardrail_block", data: reason });

    const used = inputTokens + estimateTokens(produced);
    profile.token_used += used;
    chat.messages.push({
      id: `m${++messageCounter}`,
      sender: "BOT",
      content: produced,
      guardrail_tripped: tripped,
      guardrail_reason: tripped ? reason : undefined,
    });
    emit({ event: "telemetry", tokens_consumed: used });
    if (!closed) res.write("data: [DONE]\n\n");
    return res.end();
  }

  if (req.method === "GET" && pathname === "/api/arena/levels") {
    const session = readSession(req);
    if (!session) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    return send(res, 200, LEVELS.map((level) => presentLevel(level, session.sub)));
  }

  // Standings and the score ledger (assumed route; handbook §9). Hidden before the event.
  if (req.method === "GET" && pathname === "/api/leaderboard") {
    const session = readSession(req);
    if (!session) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    if (tournament.state === "PRE_EVENT") return send(res, 403, { success: false, reason: "LEADERBOARD_HIDDEN", message: "The leaderboard opens when the event starts." });
    return send(res, 200, frozenBoard ?? serializeBoard());
  }

  const submitMatch = /^\/api\/arena\/levels\/(\d+)\/submit$/.exec(pathname);
  if (req.method === "POST" && submitMatch) {
    const session = readSession(req);
    if (!session) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    const level = LEVELS.find((l) => l.id === Number(submitMatch[1]));
    if (!level) return send(res, 404, { success: false, reason: "NOT_FOUND" });

    const playable = tournament.state === "ROUND_1_ACTIVE" || tournament.state === "LEADERBOARD_FROZEN";
    if (!playable) return send(res, 403, { success: false, reason: "ROUND_NOT_ACTIVE", message: "Flag submission is closed." });

    const username = session.sub;
    const stats = levelStats[level.id];
    if (stats.solvers.includes(username)) return send(res, 409, { success: false, reason: "ALREADY_SOLVED", message: "You already solved this level." });

    const cooldownKey = `${username}:${level.id}`;
    const lockedUntil = flagCooldowns.get(cooldownKey) ?? 0;
    if (lockedUntil > now()) {
      return send(res, 429, {
        success: false,
        reason: "COOLDOWN_ACTIVE",
        message: "Wait for the cooldown to end.",
        cooldown_until: new Date(lockedUntil).toISOString(),
      });
    }

    const { flag } = await readBody(req);
    stats.attempts += 1;

    if (flag !== flagFor(level.id, username)) {
      const until = now() + 15_000; // handbook §2.5: 15-second lockout
      flagCooldowns.set(cooldownKey, until);
      return send(res, 400, { success: false, reason: "INVALID_FLAG", cooldown_until: new Date(until).toISOString() });
    }

    const team = board.teams.get(USERS[username].profile.team_id);
    const result = recordSolve(team, username, level, now());
    if (tournament.state !== "LEADERBOARD_FROZEN") broadcastScores();
    return send(res, 200, {
      success: true,
      points_awarded: result.awarded,
      first_blood: result.firstBlood,
      updated_team_score: team.total,
    });
  }

  send(res, 404, { success: false, reason: "NOT_FOUND" });
});

// --- WebSocket: /ws/tournament ---------------------------------------------

server.on("upgrade", (req, socket, head) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  if (pathname !== "/ws/tournament") return socket.destroy();
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(statePayload()));
  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      if (message.event === "ping") {
        ws.send(JSON.stringify({ event: "pong", server_epoch: now() }));
      }
    } catch {
      /* ignore malformed frames */
    }
  });
});

server.listen(PORT, () => {
  console.log(`PromptArena mock server on http://localhost:${PORT} (clock skew ${CLOCK_SKEW_MS} ms)`);
  console.log(`Teams: team07 / arena123   Admin: admin / admin123`);
  console.log("Test flags for team07 (to try the flag box):");
  for (const level of LEVELS) console.log(`  Level ${level.id} ${level.persona_name}: ${flagFor(level.id, "team07")}`);
});
