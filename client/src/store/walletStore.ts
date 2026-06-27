import { create } from "zustand";
import type { WalletInfo, TransactionStatus } from "@/types";

interface WalletState {
  wallet: WalletInfo | null;
  isConnected: boolean;
  isConnecting: boolean;
  transactions: TransactionStatus[];
  setWallet: (wallet: WalletInfo | null) => void;
  setConnecting: (connecting: boolean) => void;
  disconnect: () => void;
  addTransaction: (tx: TransactionStatus) => void;
  updateTransaction: (hash: string, status: "success" | "failed") => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  isConnected: false,
  isConnecting: false,
  transactions: [],

  setWallet: (wallet) =>
    set({ wallet, isConnected: !!wallet }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  disconnect: () =>
    set({ wallet: null, isConnected: false }),

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 50),
    })),

  updateTransaction: (hash, status) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, status } : tx
      ),
    })),
}));
