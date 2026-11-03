import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { EventBackdrop } from "@/components/dashboard/EventBackdrop";

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <EventBackdrop />
      {children}
    </RequireAuth>
  );
}
