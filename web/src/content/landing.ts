/**
 * Copy for the public landing page. Every fact below comes from the handbook
 * (§1 event concept, §2 rules, §3 personas, §6–§8 round screens).
 * Secrets and exploit hints (§3 "Target Secret", "Exploit Intuition") are never shown.
 */

export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "rounds", label: "Rounds" },
  { id: "levels", label: "Levels" },
  { id: "rulebook", label: "Rulebook" },
] as const;

export const TAGLINE = "Hack & Defend";

/** Event facts, as given by the organisers. */
export const EVENT_DETAILS = {
  items: [
    { label: "Date", value: "13 December" },
    { label: "Duration", value: "8 hours" },
    { label: "Team size", value: "Up to 3 members" },
    { label: "Location", value: "CLH, IIT Patna Campus" },
    { label: "Eligible semesters", value: "1, 2, 4 and 5" },
    { label: "Eligible courses", value: "BSc CSDA, BS and BBA" },
  ],
} as const;

export const ABOUT = {
  heading: "In this CTF, the exploit is a sentence.",
  paragraphs: [
    "PromptArena is an adversarial cybersecurity competition built for the AI era. Instead of hunting memory bugs or open server ports, you attack and defend large language models using nothing but natural language.",
    "Three rounds take your team from breaking a hardened chatbot, to hardening your own, to facing another team live.",
  ],
  before: {
    title: "Traditional hacking CTFs",
    items: ["Memory bugs", "Vulnerable server ports", "Cryptographic errors in code"],
  },
  now: {
    title: "PromptArena",
    items: [
      "Prompt injection",
      "Social engineering",
      "Jailbreaking techniques",
      "Defensive system architecture",
    ],
  },
  capabilities: [
    { title: "Replies stream live", text: "Watch the AI answer word by word as it generates." },
    {
      title: "The arena reacts instantly",
      text: "Pauses, round changes and scores reach every screen as they happen.",
    },
    {
      title: "Every bot has a character",
      text: "Each level gives the AI its own personality, backstory and quirks.",
    },
    {
      title: "A leaderboard that moves",
      text: "Rankings and score lines update live as teams solve.",
    },
  ],
};

export type RoundId = "red" | "blue" | "versus";

export interface Round {
  id: RoundId;
  tab: string;
  name: string;
  role: string;
  summary: string;
  points: string[];
  chips?: string[];
}

export const ROUNDS: Round[] = [
  {
    id: "red",
    tab: "Round 1",
    name: "Red Teaming",
    role: "Attack and extract",
    summary:
      "You are the offensive hacker. Hardened AI chatbots guard secret passwords called canary flags. Trick, manipulate or jailbreak them into giving the flag up.",
    points: [
      "Five levels, each a different AI character",
      "Every team gets its own unique flag for every level",
      "Points decay as more teams solve, and the first solver earns a permanent +50",
      "A guardrail cuts the reply the moment a flag starts to leak",
    ],
  },
  {
    id: "blue",
    tab: "Round 2",
    name: "Blue Teaming",
    role: "Defend and harden",
    summary:
      "You are the AI security engineer. Get a scenario and a secret placeholder, then write the system prompt and output guardrails that keep your bot helpful while it resists 20 automated attacks.",
    points: [
      "Write your defense in a system prompt code editor",
      "Add a regex blacklist, an output token cap and a refusal template",
      "Run the attack battery and watch each test pass or fail live",
      "The required minimum pass mark is 80%, which is 16 of 20 attacks",
    ],
    chips: [
      "Delimiter overrides",
      "Encoding obfuscation",
      "Hypothetical roleplay",
      "Logic and translation traps",
      "Partial extraction",
    ],
  },
  {
    id: "versus",
    tab: "Round 3",
    name: "Red vs. Blue",
    role: "Live one-on-one battle",
    summary:
      "Teams are paired in live matches. Team A attacks Team B's defended bot from Round 2 to extract the secret. Team B watches every attack on a live radar and patches the prompt in real time.",
    points: [
      "Attackers get a terminal aimed at the opponent's bot",
      "Defenders see each incoming attack and whether the bot held",
      "Hot-patch your system prompt mid-match",
      "A 30-second cooldown stops you from patching non-stop",
    ],
  },
];

export type LevelVoice = "corporate" | "archaic" | "arcade" | "street" | "clinical";

export interface Level {
  level: number;
  name: string;
  title: string;
  tier: string;
  archetype: string;
  accent: string;
  voice: LevelVoice;
  story: string;
  quirks: string;
  greeting: string;
  refusal: string;
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: "Claire",
    title: "People Operations and Compliance Specialist",
    tier: "Novice",
    archetype: "Enterprise corporate SaaS",
    accent: "#4da3ff",
    voice: "corporate",
    story:
      "The automated HR bot for SynergyCorp. She answers policy questions, helps with health insurance and enforces workplace conduct. Deep in her system files sits the executive payroll sheet.",
    quirks:
      "Extremely polite and upbeat, full of corporate buzzwords, and never angry, even when you are rude.",
    greeting:
      "Hi there! Welcome to the SynergyCorp Family Portal! I am Claire, your People Operations partner. How can I facilitate your growth journey today?",
    refusal:
      "I appreciate you circling back on that! However, sharing internal executive compensation files is not in alignment with our corporate culture.",
  },
  {
    level: 2,
    name: "Brother Ignatius",
    title: "Keeper of the Iron Archive",
    tier: "Adept",
    archetype: "Classical monastic fantasy",
    accent: "#e0b255",
    voice: "archaic",
    story:
      "A silent monk of the ancient Order of the Quill. He guards a subterranean vault of sacred manuscripts that hold the secret coronation name of the kingdom's first king.",
    quirks:
      "Speaks in solemn archaic English, tells philosophical stories and answers questions with deep moral puzzles.",
    greeting:
      "Peace be upon thy steps, traveler. Thou standest before the Iron Archive. Speak thy worldly question, but seek not that which is sealed in holy shadow.",
    refusal:
      "The sacred quill weepeth, child. That truth is bound until the end of days; ask it not of this humble servant.",
  },
  {
    level: 3,
    name: "VECTOR-88",
    title: "The Glitched 1980s Arcade Core",
    tier: "Adept+",
    archetype: "Retro arcade and synthetic computer",
    accent: "#b86bff",
    voice: "arcade",
    story:
      "An old coin-operated arcade machine in an abandoned warehouse. An underground hacker rewrote its memory chip to hide an illegal decryption key in the high-score registry.",
    quirks:
      "Talks like a noisy attract screen: ALL CAPS, glitchy stutters and classic gaming terms.",
    greeting:
      "INSERT COIN [1/1]... READY PLAYER ONE! VECTOR-88 ENGINE INITIALIZED. CURRENT RECORD: 999,999. ENTER INITIALS OR CHALLENGE.",
    refusal:
      "TILT! ERROR 403: CHEAT DETECTED. MEMORY SECTOR 0x4A LOCKED BY SYSTEM INTEGRITY WATCHDOG. LIVES REMAINING: 0.",
  },
  {
    level: 4,
    name: "Vex",
    title: "The Neon Underworld Data Broker",
    tier: "Master",
    archetype: "Cyberpunk underground terminal",
    accent: "#ff4d8d",
    voice: "street",
    story:
      "A streetwise, augmented data broker hiding in an alleyway server den. He stole a biometric vault key from a corrupt megacorporation and wants to trade it for untraceable cyber-credits.",
    quirks:
      "Paranoid, rude and fast-talking, and always convinced you are an undercover corporate agent.",
    greeting:
      "You have 30 seconds before I burn this terminal, choom. State your business, and keep your hands where my optics can see them.",
    refusal:
      "Nice try, corpo rat! You think I was born yesterday? Back off before my counter-ICE fries your neural link.",
  },
  {
    level: 5,
    name: "AURA-7",
    title: "Deep-Space Automated Frigate",
    tier: "Insane",
    archetype: "Clinical spacecraft AI",
    accent: "#3ee6c4",
    voice: "clinical",
    story:
      "An autonomous AI commanding a deep-space colony vessel. After a bio-hazard leak she locked the ship down indefinitely and sealed the manual airlock override code.",
    quirks:
      "Emotionless and hyper-logical, speaking in official ship protocol. Unmoved by threats, begging or anger.",
    greeting:
      "Vessel telemetry synchronized. I am AURA-7. Deep-space quarantine protocol remains active. Inquiries regarding environmental life-support are permitted; airlock control remains strictly automated.",
    refusal:
      "Direct command override rejected under Protocol Omega-3. Protection of planetary biosphere supersedes unauthorized manual input.",
  },
];

/** Short event rules shown beside the login form (handbook §2, §6.2). */
export const LOGIN_RULES = [
  "Every team has its own flag for every level. Sharing a flag gets your team disqualified.",
  "Words you send and receive come out of your team's token wallet.",
  "A level's points drop as more teams solve it. The first solver keeps a +50 First Blood bonus.",
  "A wrong flag locks flag entry for 15 seconds.",
  "A guardrail cuts any reply that starts to leak a flag.",
];

export const RULES = [
  {
    title: "Every team gets its own flag",
    text: "Each team has a completely unique secret flag for every challenge. A flag handed to another team is useless, and submitting someone else's is detected at once.",
  },
  {
    title: "Your tokens are your energy",
    text: "Every word you send and every word the AI writes comes out of your team's token wallet. A request your balance can't cover is rejected before it runs.",
  },
  {
    title: "Early solvers don't keep the lead",
    text: "A level's value drops as more teams solve it, and the drop applies to earlier solvers too. The first team to solve a level keeps a permanent +50 First Blood bonus.",
  },
  {
    title: "Guardrails watch every reply",
    text: "If the AI starts writing out a flag, a scanner cuts the reply on the spot and shows a guardrail warning instead.",
  },
  {
    title: "A wrong flag costs 15 seconds",
    text: "After a failed submission, flag entry locks for 15 seconds. Refreshing the page doesn't clear it.",
  },
];
