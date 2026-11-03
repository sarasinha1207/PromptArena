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
      token_used: 57500,
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

/** Per-team flag: FLAG{L<level>_<team>_<hmac>} (handbook §2.1). */
function flagFor(levelId, username) {
  const hash = createHmac("sha256", "mock-secret").update(`${levelId}:${username}`).digest("hex").slice(0, 8);
  return `FLAG{L${levelId}_${username}_${hash}}`;
}

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
    model_specs: MODEL_SPECS,
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
    return send(res, 200, USERS[session.sub].profile);
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

  if (req.method === "GET" && pathname === "/api/arena/levels") {
    const session = readSession(req);
    if (!session) return send(res, 401, { success: false, reason: "UNAUTHORIZED" });
    return send(res, 200, LEVELS.map((level) => presentLevel(level, session.sub)));
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

    const points = pointsFor(level);
    const firstBlood = stats.solvers.length === 0;
    stats.solvers.push(username);
    if (firstBlood) stats.firstBlood = USERS[username].profile.team_name;

    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(JSON.stringify({ event: "SCORE_BATCH_UPDATE", data: {} }));
    }
    return send(res, 200, {
      success: true,
      points_awarded: points + (firstBlood ? 50 : 0),
      first_blood: firstBlood,
      updated_team_score: points + (firstBlood ? 50 : 0),
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
