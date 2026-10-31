import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAuth role="admin">{children}</RequireAuth>;
}
