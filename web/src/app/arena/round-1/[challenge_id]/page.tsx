import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export default function Round1WorkbenchPage() {
  return (
    <PhasePlaceholder
      title="Round 1 — Adversarial Chat Workbench"
      route="/arena/round-1/[challenge_id]"
      phase={3}
    />
  );
}
