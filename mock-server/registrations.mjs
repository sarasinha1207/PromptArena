// Team registration API for the /register page. Ported from the standalone
// "PromptArena Registration" service so the website and its backend live together.
//
//   POST /api/registrations              register a team (public, rate limited)
//   GET  /api/admin/registrations        all registrations as JSON  (needs REGISTRATION_ADMIN_TOKEN)
//   GET  /api/admin/registrations.csv    all registrations as CSV   (needs REGISTRATION_ADMIN_TOKEN)
//
// Registrations are saved to a JSON file (default mock-server/data/registrations.json).
// On hosts with a temporary disk (Render's free plan) that file is wiped on every redeploy
// or restart, so export the CSV before redeploying, or move the store to a database.
import { createHash, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;

const EVENT = {
  maxTeamSize: 3,
  courses: ["BSc CSDA", "BS", "BBA"],
  semesters: ["1", "2", "4", "5"],
};

const SETTINGS = {
  dataFile: path.resolve(here, env.REGISTRATION_FILE || "data/registrations.json"),
  // Only accept college emails from this domain, e.g. "iitp.ac.in" (empty = any).
  allowedEmailDomain: (env.ALLOWED_EMAIL_DOMAIN || "").trim().toLowerCase(),
  // Stop accepting teams after this many (0 = unlimited).
  maxTeams: Number(env.MAX_TEAMS) || 0,
  // Needed for the /api/admin/registrations endpoints. Empty = those endpoints are off.
  adminToken: env.REGISTRATION_ADMIN_TOKEN || "",
};

class AppError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// --- Validation (same rules and messages as the original service) -------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body) {
  const issues = [];
  const add = (field, message) => issues.push({ field, message });
  const text = (value) => (typeof value === "string" ? value.trim() : null);

  const teamName = text(body?.teamName);
  if (teamName === null || teamName === "") add("teamName", teamName === null ? "Team name is required" : "Team name is too short");
  else if (teamName.length < 2) add("teamName", "Team name is too short");
  else if (teamName.length > 60) add("teamName", "Team name is too long");

  const teamSize = Number(body?.teamSize);
  if (!Number.isInteger(teamSize) || teamSize < 1) add("teamSize", "Select the number of team members");
  else if (teamSize > EVENT.maxTeamSize) add("teamSize", `A team can have at most ${EVENT.maxTeamSize} members`);

  const rawMembers = Array.isArray(body?.members) ? body.members : null;
  if (!rawMembers || rawMembers.length < 1) add("members", "At least the team leader is required");
  else if (rawMembers.length > EVENT.maxTeamSize) add("members", `A team can have at most ${EVENT.maxTeamSize} members`);

  const members = [];
  (rawMembers ?? []).slice(0, EVENT.maxTeamSize).forEach((raw, i) => {
    const field = (key) => `members.${i}.${key}`;
    const name = text(raw?.name);
    if (name === null) add(field("name"), "Name is required");
    else if (name.length < 2) add(field("name"), "Enter the full name");
    else if (name.length > 80) add(field("name"), "Name is too long");

    if (!EVENT.courses.includes(raw?.course)) add(field("course"), "Select a valid course");
    if (!EVENT.semesters.includes(raw?.semester)) add(field("semester"), "Select a valid semester");

    const email = text(raw?.email)?.toLowerCase() ?? null;
    if (email === null) add(field("email"), "College email is required");
    else if (!EMAIL_PATTERN.test(email)) add(field("email"), "Enter a valid email address");
    else if (SETTINGS.allowedEmailDomain && !email.endsWith(`@${SETTINGS.allowedEmailDomain}`)) {
      add(field("email"), `Use your college email (@${SETTINGS.allowedEmailDomain})`);
    }

    const phone = text(raw?.phone);
    if (phone === null) add(field("phone"), "Phone number is required");
    else if (!/^\d{10}$/.test(phone)) add(field("phone"), "Enter a 10-digit phone number");

    members.push({ name, course: raw?.course, semester: raw?.semester, email, phone });
  });

  if (rawMembers && Number.isInteger(teamSize) && rawMembers.length !== teamSize) {
    add("teamSize", "Number of members does not match the team size");
  }
  for (const key of ["email", "phone"]) {
    const seen = new Set();
    members.forEach((member, i) => {
      if (member[key] && seen.has(member[key])) {
        add(`members.${i}.${key}`, `Each member needs a different ${key === "email" ? "email" : "phone number"}`);
      }
      seen.add(member[key]);
    });
  }

  if (issues.length) throw new AppError(400, "Please check the highlighted details.", issues);
  return { teamName, teamSize, members };
}

// --- Storage: a JSON file, writes queued and atomic ---------------------------------------------

let queue = Promise.resolve();
const enqueue = (task) => {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
};

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(SETTINGS.dataFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(SETTINGS.dataFile), { recursive: true });
  const temp = `${SETTINGS.dataFile}.tmp`;
  await fs.writeFile(temp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(temp, SETTINGS.dataFile);
}

function addRegistration({ teamName, teamSize, members }) {
  return enqueue(async () => {
    const list = await readAll();

    if (SETTINGS.maxTeams > 0 && list.length >= SETTINGS.maxTeams) {
      throw new AppError(409, "Registrations are full. Thank you for your interest!");
    }
    if (list.some((r) => r.teamName.toLowerCase() === teamName.toLowerCase())) {
      throw new AppError(409, "That team name is already taken. Please choose another.", [
        { field: "teamName", message: "Team name already taken" },
      ]);
    }

    const emails = new Set(list.flatMap((r) => r.members.map((m) => m.email)));
    const phones = new Set(list.flatMap((r) => r.members.map((m) => m.phone)));
    const errors = [];
    members.forEach((m, i) => {
      if (emails.has(m.email)) errors.push({ field: `members.${i}.email`, message: "This email is already registered" });
      if (phones.has(m.phone)) errors.push({ field: `members.${i}.phone`, message: "This phone number is already registered" });
    });
    if (errors.length) {
      throw new AppError(409, "A member of your team is already registered with another team.", errors);
    }

    const record = {
      id: `PA-${String(list.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      teamName,
      teamSize,
      members: members.map((m, i) => ({ role: i === 0 ? "Leader" : "Member", ...m })),
    };
    list.push(record);
    await writeAll(list);
    return record;
  });
}

// --- CSV export for organisers -------------------------------------------------------------------

const CSV_HEADERS = [
  "Registration ID", "Registered At", "Team Name", "Team Size",
  "Role", "Name", "Course", "Semester", "College Email", "Phone",
];

// A leading =, +, - or @ would run as a formula in a spreadsheet, so it is prefixed with '.
function csvCell(value) {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(registrations) {
  const rows = [CSV_HEADERS];
  for (const r of registrations) {
    for (const m of r.members) {
      rows.push([r.id, r.createdAt, r.teamName, r.teamSize, m.role, m.name, m.course, m.semester, m.email, m.phone]);
    }
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

// --- HTTP ----------------------------------------------------------------------------------------

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(body));
}

function readJson(req, limit = 10 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > limit) {
        reject(new AppError(413, "Request is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new AppError(400, "Malformed request."));
      }
    });
    req.on("error", () => reject(new AppError(400, "Malformed request.")));
  });
}

// At most 30 attempts per address every 15 minutes.
const attempts = new Map();
function rateLimited(req) {
  const key = req.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 30;
}

const digest = (value) => createHash("sha256").update(String(value)).digest();

function isAdmin(req) {
  if (!SETTINGS.adminToken) return false;
  const header = req.headers.authorization ?? "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : String(req.headers["x-admin-token"] ?? "");
  return timingSafeEqual(digest(supplied), digest(SETTINGS.adminToken));
}

/** Handles the registration routes. Returns true when the request was one of them. */
export async function handleRegistrationRoutes(req, res, pathname) {
  const isCreate = req.method === "POST" && pathname === "/api/registrations";
  const isList = req.method === "GET" && pathname === "/api/admin/registrations";
  const isCsv = req.method === "GET" && pathname === "/api/admin/registrations.csv";
  if (!isCreate && !isList && !isCsv) return false;

  try {
    if (isCreate) {
      if (rateLimited(req)) {
        throw new AppError(429, "Too many attempts. Please try again in a few minutes.");
      }
      const record = await addRegistration(validate(await readJson(req)));
      sendJson(res, 201, { id: record.id, teamName: record.teamName, message: "Registration successful" });
      return true;
    }

    if (!SETTINGS.adminToken) throw new AppError(404, "Not found");
    if (!isAdmin(req)) throw new AppError(401, "Unauthorized");
    const registrations = await enqueue(readAll);
    if (isList) {
      sendJson(res, 200, { count: registrations.length, registrations });
    } else {
      res.writeHead(200, {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="promptarena-registrations.csv"',
        ...CORS,
      });
      res.end(toCsv(registrations));
    }
  } catch (error) {
    if (error instanceof AppError) {
      sendJson(res, error.status, { message: error.message, errors: error.errors });
    } else {
      console.error(error);
      sendJson(res, 500, { message: "Something went wrong on our side. Please try again.", errors: [] });
    }
  }
  return true;
}
