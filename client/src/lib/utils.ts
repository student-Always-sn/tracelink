import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatXlm(amount: string | number): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return (num / 10_000_000).toFixed(2);
}

export function explorerTxUrl(hash: string, network = "testnet"): string {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

export function explorerContractUrl(
  contractId: string,
  network = "testnet"
): string {
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
}

export function parseTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}
