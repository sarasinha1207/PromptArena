"use client";

import { useEffect } from "react";
import { TournamentGateway } from "@/lib/realtime/gateway";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";

/** Opens the tournament WebSocket while a user is signed in and closes it on logout. */
export function RealtimeConnector() {
  const status = useStore(authStore, (s) => s.status);

  useEffect(() => {
    if (status !== "authenticated") return;
    const gateway = new TournamentGateway();
    gateway.connect();
    return () => gateway.disconnect();
  }, [status]);

  return null;
}
