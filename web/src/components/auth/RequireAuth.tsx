"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";
import type { UserRole } from "@/types/api";

interface RequireAuthProps {
  /** When set, only this role may view the children. */
  role?: UserRole;
  children: ReactNode;
}

/** Route guard: sends anonymous visitors to login and wrong-role users to their home page. */
export function RequireAuth({ role, children }: RequireAuthProps) {
  const router = useRouter();
  const status = useStore(authStore, (s) => s.status);
  const userRole = useStore(authStore, (s) => s.role);

  const wrongRole = status === "authenticated" && role && userRole !== role;

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/auth/login");
    } else if (wrongRole) {
      router.replace(userRole === "admin" ? "/admin/dashboard" : "/arena");
    }
  }, [status, wrongRole, userRole, router]);

  if (status !== "authenticated" || wrongRole) {
    return <p style={{ padding: 24 }}>Loading…</p>;
  }
  return <>{children}</>;
}
