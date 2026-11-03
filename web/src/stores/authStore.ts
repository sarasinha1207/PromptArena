import { createStore } from "@/stores/createStore";
import { walletStore } from "@/stores/walletStore";
import { resetTournamentState } from "@/stores/tournamentStore";
import { resetChallenges } from "@/stores/challengesStore";
import { fetchMyProfile, loginRequest } from "@/lib/api/auth";
import { ApiError, setUnauthorizedHandler } from "@/lib/api/client";
import { clearToken, readToken, writeToken } from "@/lib/auth/tokenStorage";
import type { TeamProfile, UserRole } from "@/types/api";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthState {
  status: AuthStatus;
  profile: TeamProfile | null;
  role: UserRole | null;
}

export const authStore = createStore<AuthState>({
  status: "loading",
  profile: null,
  role: null,
});

function applyProfile(profile: TeamProfile): void {
  authStore.setState({
    status: "authenticated",
    profile,
    role: profile.role ?? "team",
  });
  walletStore.setState({
    budget: profile.token_budget ?? 0,
    used: profile.token_used ?? 0,
    loaded: typeof profile.token_budget === "number",
  });
}

function setAnonymous(): void {
  authStore.setState({ status: "anonymous", profile: null, role: null });
  walletStore.setState({ budget: 0, used: 0, loaded: false });
  resetTournamentState();
  resetChallenges();
}

/** Restores a session from a stored token on page load. */
export async function bootstrapAuth(): Promise<void> {
  if (!readToken()) {
    setAnonymous();
    return;
  }
  try {
    applyProfile(await fetchMyProfile());
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) clearToken();
    setAnonymous();
  }
}

/** Authenticates a team leader or admin and loads their profile. */
export async function login(userId: string, password: string): Promise<UserRole> {
  const { token } = await loginRequest(userId, password);
  writeToken(token);
  try {
    const profile = await fetchMyProfile();
    applyProfile(profile);
    return profile.role ?? "team";
  } catch (error) {
    clearToken();
    throw error;
  }
}

export function logout(): void {
  clearToken();
  setAnonymous();
}

setUnauthorizedHandler(logout);
