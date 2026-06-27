"use client";

import { useCallback } from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { RabetModule } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import { useWalletStore } from "@/store/walletStore";
import { RPC_URL, NETWORK_PASSPHRASE } from "@/lib/client";
import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

const walletModules = [
  new FreighterModule(),
  new xBullModule(),
  new AlbedoModule(),
  new LobstrModule(),
  new RabetModule(),
];

export function useWallet() {
  const {
    wallet,
    isConnected,
    isConnecting,
    setWallet,
    setConnecting,
    disconnect,
  } = useWalletStore();

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      StellarWalletsKit.init({
        modules: walletModules,
        network: Networks.TESTNET,
      });

      const result = await StellarWalletsKit.authModal();
      const address = result.address;

      setWallet({
        address,
        network: "testnet",
        networkPassphrase: NETWORK_PASSPHRASE,
        rpcUrl: RPC_URL,
      });

      return address;
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("closed") || msg.includes("close")) {
        return null;
      }
      throw new Error(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, [setWallet, setConnecting]);

  const disconnectWallet = useCallback(async () => {
    try {
      StellarWalletsKit.disconnect();
    } catch {
      // ignore
    }
    disconnect();
  }, [disconnect]);

  const getBalance = useCallback(async () => {
    if (!wallet?.address) return "0";
    try {
      const horizon = new Horizon.Server(HORIZON_URL);
      const account = await horizon.loadAccount(wallet.address);
      const balance = account.balances.find(
        (b: any) => b.asset_type === "native"
      );
      return balance?.balance || "0";
    } catch {
      return "0";
    }
  }, [wallet?.address]);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      return signedTxXdr;
    },
    []
  );

  return {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    getBalance,
    signTransaction,
  };
}
