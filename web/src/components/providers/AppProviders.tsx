"use client";

import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/providers/AppShell";
import { RealtimeConnector } from "@/components/providers/RealtimeConnector";
import { bootstrapAuth } from "@/stores/authStore";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void bootstrapAuth();
  }, []);

  return (
    <>
      <RealtimeConnector />
      <AppShell>{children}</AppShell>
    </>
  );
}
