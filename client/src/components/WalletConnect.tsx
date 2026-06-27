"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useWalletStore } from "@/store/walletStore";
import { truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Wallet, LogOut, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function WalletConnect() {
  const { connect, disconnect, wallet, isConnected, isConnecting, getBalance } =
    useWallet();
  const setConnecting = useWalletStore((s) => s.setConnecting);
  const [balance, setBalance] = useState("0");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && wallet) {
      getBalance().then(setBalance).catch(console.error);
    }
  }, [isConnected, wallet, getBalance]);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
      setConnecting(false);
    }
  };

  const handleCopy = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && wallet) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            {truncateAddress(wallet.address)}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                  {wallet.address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold">
                {Number(balance).toFixed(2)} XLM
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="text-sm">Testnet</p>
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={disconnect}
            >
              <LogOut className="h-4 w-4" /> Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} className="gap-2">
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" /> Connect Wallet
        </>
      )}
    </Button>
  );
}
