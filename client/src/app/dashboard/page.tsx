"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useProductCount } from "@/hooks/useContract";
import { TransactionStatus } from "@/components/TransactionStatus";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, Package, Activity, ExternalLink } from "lucide-react";
import { explorerContractUrl, explorerTxUrl } from "@/lib/utils";
import { CONTRACT_ADDRESS } from "@/lib/client";
import Link from "next/link";

export default function Dashboard() {
  const { wallet, isConnected, connect, getBalance } = useWallet();
  const { data: productCount } = useProductCount();
  const [balance, setBalance] = useState("0");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && wallet) {
      getBalance().then(setBalance).catch(console.error);
    }
  }, [isConnected, wallet, getBalance]);

  const handleCopy = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your dashboard.
            </p>
            <Button onClick={connect} className="gap-2">
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your wallet and supply chain overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Wallet Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <div className="flex items-center gap-1">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate">
                    {wallet?.address}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">
                  {Number(balance).toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    XLM
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Network</p>
                <p className="text-sm">Testnet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tracked Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productCount ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total products on the supply chain
            </p>
            <Link href="/" className="text-xs text-primary hover:underline mt-2 inline-block">
              View all products →
            </Link>
          </CardContent>
        </Card>

        {/* Contract Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contract</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {CONTRACT_ADDRESS ? (
              <div className="space-y-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded block truncate">
                  {CONTRACT_ADDRESS}
                </code>
                <a
                  href={explorerContractUrl(CONTRACT_ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No contract configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <TransactionStatus />
    </div>
  );
}
