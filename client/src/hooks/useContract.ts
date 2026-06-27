"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, networks } from "contract";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";
import type { Product, Checkpoint } from "@/types";
import { RPC_URL, NETWORK_PASSPHRASE } from "@/lib/client";
import { useWallet } from "./useWallet";
import { useWalletStore } from "@/store/walletStore";

// ── Generated Client ──

let clientInstance: Client | null = null;

function getClient(): Client {
  if (!clientInstance) {
    clientInstance = new Client({
      rpcUrl: RPC_URL,
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId: networks.testnet.contractId,
    });
  }
  return clientInstance;
}

/** Convert a string/number ID to u64 (bigint) */
function toU64(id: string | number): bigint {
  return BigInt(id);
}

// ── Read Queries ──

export function useProduct(productId: string) {
  return useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const tx = await getClient().get_product({ product_id: toU64(productId) });
      return tx.result as unknown as Product;
    },
    enabled: !!productId,
  });
}

export function useCheckpoint(productId: string, checkpointId: number) {
  return useQuery<Checkpoint>({
    queryKey: ["checkpoint", productId, checkpointId],
    queryFn: async () => {
      const tx = await getClient().get_checkpoint({
        product_id: toU64(productId),
        checkpoint_id: checkpointId,
      });
      return tx.result as unknown as Checkpoint;
    },
    enabled: !!productId && checkpointId >= 0,
  });
}

export function useCheckpointCount(productId: string) {
  return useQuery<number>({
    queryKey: ["checkpointCount", productId],
    queryFn: async () => {
      const tx = await getClient().get_checkpoint_count({
        product_id: toU64(productId),
      });
      return Number(tx.result);
    },
    enabled: !!productId,
  });
}

export function useProductCount() {
  return useQuery<number>({
    queryKey: ["productCount"],
    queryFn: async () => {
      const tx = await getClient().get_product_count();
      return Number(tx.result);
    },
  });
}

export function useAllProducts(count: number) {
  return useQuery<Product[]>({
    queryKey: ["allProducts", count],
    queryFn: async () => {
      if (count === 0) return [];
      const products: Product[] = [];
      for (let i = 1; i <= count; i++) {
        const tx = await getClient().get_product({ product_id: toU64(i) });
        products.push(tx.result as unknown as Product);
      }
      return products;
    },
    enabled: count > 0,
  });
}

export function useAllCheckpoints(productId: string, count: number) {
  return useQuery<Checkpoint[]>({
    queryKey: ["allCheckpoints", productId, count],
    queryFn: async () => {
      if (count === 0) return [];
      const checkpoints: Checkpoint[] = [];
      for (let i = 0; i < count; i++) {
        const tx = await getClient().get_checkpoint({
          product_id: toU64(productId),
          checkpoint_id: i,
        });
        checkpoints.push(tx.result as unknown as Checkpoint);
      }
      return checkpoints;
    },
    enabled: !!productId && count > 0,
  });
}

// ── Helpers ──

async function sendTx<T>(
  txPromise: Promise<AssembledTransaction<T>>,
  label: string,
  signTransaction: (xdr: string) => Promise<string>,
  addTransaction: (tx: {
    hash: string;
    status: "pending" | "success" | "failed";
    label: string;
    timestamp: number;
  }) => void,
  updateTransaction: (hash: string, status: "success" | "failed") => void
) {
  const tx = await txPromise;
  const sent = await tx.signAndSend({
    signTransaction: async (xdr: string) => {
      const signedTxXdr = await signTransaction(xdr);
      return { signedTxXdr };
    },
  });
  const hash = sent.sendTransactionResponse?.hash || "";
  const success = sent.getTransactionResponse?.status === "SUCCESS";
  addTransaction({
    hash,
    status: success ? "success" : "pending",
    label,
    timestamp: Date.now(),
  });
  if (!success) {
    updateTransaction(hash, "failed");
  }
  return { hash, sent, success };
}

// ── Mutations ──

export function useRegisterProduct() {
  const queryClient = useQueryClient();
  const { signTransaction } = useWallet();
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  return useMutation({
    mutationFn: async ({
      manufacturer,
      name,
      description,
      origin,
    }: {
      manufacturer: string;
      name: string;
      description: string;
      origin: string;
    }) => {
      return sendTx(
        getClient().register_product({ manufacturer, name, description, origin }),
        `Registering product "${name}"`,
        signTransaction,
        addTransaction,
        updateTransaction
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCount"] });
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useScanCheckpoint() {
  const queryClient = useQueryClient();
  const { signTransaction } = useWallet();
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  return useMutation({
    mutationFn: async ({
      productId,
      handler,
      location,
      notes,
    }: {
      productId: string;
      handler: string;
      location: string;
      notes: string;
    }) => {
      return sendTx(
        getClient().scan_checkpoint({
          product_id: toU64(productId),
          handler,
          location,
          notes,
        }),
        `Scanning checkpoint for product #${productId}`,
        signTransaction,
        addTransaction,
        updateTransaction
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["product", vars.productId] });
      queryClient.invalidateQueries({
        queryKey: ["checkpointCount", vars.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["allCheckpoints", vars.productId],
      });
    },
  });
}

export function useTransferProduct() {
  const queryClient = useQueryClient();
  const { wallet, signTransaction } = useWallet();
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  return useMutation({
    mutationFn: async ({
      productId,
      to,
    }: {
      productId: string;
      to: string;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      return sendTx(
        getClient().transfer_product({
          product_id: toU64(productId),
          from: wallet.address,
          to,
        }),
        `Transferring product #${productId}`,
        signTransaction,
        addTransaction,
        updateTransaction
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["product", vars.productId] });
    },
  });
}

export function useVerifyProduct() {
  const queryClient = useQueryClient();
  const { wallet, signTransaction } = useWallet();
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  return useMutation({
    mutationFn: async ({
      productId,
      status,
    }: {
      productId: string;
      status: string;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      return sendTx(
        getClient().verify_product({
          product_id: toU64(productId),
          inspector: wallet.address,
          status,
        }),
        `Verifying product #${productId} as "${status}"`,
        signTransaction,
        addTransaction,
        updateTransaction
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["product", vars.productId] });
    },
  });
}
