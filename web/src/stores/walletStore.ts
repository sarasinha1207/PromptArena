import { createStore } from "@/stores/createStore";

export interface WalletState {
  budget: number;
  used: number;
}

export const walletStore = createStore<WalletState>({ budget: 0, used: 0 });
