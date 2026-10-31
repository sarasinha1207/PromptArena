"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Hud } from "@/components/hud/Hud";
import { PauseOverlay } from "@/components/overlays/PauseOverlay";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";

/** Shows the persistent HUD and pause overlay to signed-in team accounts on every page except login. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const status = useStore(authStore, (s) => s.status);
  const role = useStore(authStore, (s) => s.role);

  const showHud =
    status === "authenticated" && role === "team" && pathname !== "/auth/login";

  return (
    <>
      {showHud && <Hud />}
      <main>{children}</main>
      {showHud && <PauseOverlay />}
    </>
  );
}
