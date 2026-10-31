"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";

/** `/` sends signed-in users to their area and everyone else to login. */
export default function RootPage() {
  const router = useRouter();
  const status = useStore(authStore, (s) => s.status);
  const role = useStore(authStore, (s) => s.role);

  useEffect(() => {
    if (status === "anonymous") router.replace("/auth/login");
    else if (status === "authenticated")
      router.replace(role === "admin" ? "/admin/dashboard" : "/arena");
  }, [status, role, router]);

  return <p style={{ padding: 24 }}>Loading…</p>;
}
