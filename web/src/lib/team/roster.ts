import type { TeamProfile } from "@/types/api";

export interface RosterMember {
  name: string;
  isLeader: boolean;
}

/** All team members from the profile, with the leader flagged. Empty when the backend sends none. */
export function getRoster(profile: TeamProfile | null): RosterMember[] {
  if (!profile) return [];
  const leaderName = profile.leader_name?.trim() || null;

  const members: RosterMember[] = (profile.roster ?? [])
    .map((entry) =>
      typeof entry === "string"
        ? { name: entry.trim(), isLeader: false }
        : { name: entry.name?.trim() ?? "", isLeader: Boolean(entry.is_leader) },
    )
    .filter((member) => member.name.length > 0)
    .map((member) => ({
      ...member,
      isLeader: member.isLeader || (leaderName !== null && member.name === leaderName),
    }));

  if (leaderName && !members.some((member) => member.name === leaderName)) {
    members.unshift({ name: leaderName, isLeader: true });
  }
  return members;
}

export function getLeaderName(profile: TeamProfile | null): string | null {
  return getRoster(profile).find((member) => member.isLeader)?.name ?? null;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}
