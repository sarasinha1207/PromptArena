import { createStore } from "@/stores/createStore";

export interface WalletState {
  budget: number;
  used: number;
  /** False until the backend has sent a wallet, so the UI never shows a made-up 0 / 0. */
  loaded: boolean;
}

export const walletStore = createStore<WalletState>({ budget: 0, used: 0, loaded: false });
