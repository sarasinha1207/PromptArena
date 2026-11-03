// Development-only stand-in for the PromptArena backend (handbook §12.1, §12.5, §12.6).
// Implements just enough for Phase 1: login, /teams/me, the tournament WebSocket
// (ping/pong + TOURNAMENT_STATE_CHANGE) and the admin state/clock endpoints.
import http from "node:http";
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
});
