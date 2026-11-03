import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { EventBackdrop } from "@/components/dashboard/EventBackdrop";

export default function ArenaLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="team">
      <EventBackdrop />
      {children}
    </RequireAuth>
  );
}
