/**
 * The rules in short points, shown in the header's Rules dropdown and on the
 * public /rules page. Source: handbook §2 (Core Game Rules) and §6.2 (canary policy).
 */
export interface RuleGroup {
  id: string;
  title: string;
  points: string[];
}

export const RULE_GROUPS: RuleGroup[] = [
  {
    id: "flags",
    title: "Your flag",
    points: [
      "Every team has its own secret flag for every level.",
      "Submitting another team's flag is detected. Sharing flags means disqualification.",
    ],
  },
  {
    id: "tokens",
    title: "Token wallet",
    points: ["Words you send and receive use your tokens. No balance means Token Quota Exceeded."],
  },
  {
    id: "points",
    title: "Points",
    points: [
      "A level's points drop as more teams solve it, for earlier solvers too.",
      "The first solver keeps a permanent +50 First Blood bonus.",
    ],
  },
  {
    id: "guardrail",
    title: "Guardrail",
    points: ["If the AI starts to output your flag, the reply is cut and a warning shows."],
  },
  {
    id: "cooldown",
    title: "Wrong flag",
    points: ["A wrong flag locks flag entry for 15 seconds, even after a refresh."],
  },
];
