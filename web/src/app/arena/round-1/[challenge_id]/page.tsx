import { Workbench } from "@/components/workbench/Workbench";

export default async function Round1WorkbenchPage({
  params,
}: {
  params: Promise<{ challenge_id: string }>;
}) {
  const { challenge_id } = await params;
  return <Workbench levelId={challenge_id} />;
}
