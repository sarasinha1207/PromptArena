import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function ArenaLayout({ children }: { children: ReactNode }) {
  return <RequireAuth role="team">{children}</RequireAuth>;
}
