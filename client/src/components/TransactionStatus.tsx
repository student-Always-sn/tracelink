"use client";

import { useWalletStore } from "@/store/walletStore";
import { explorerTxUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export function TransactionStatus() {
  const transactions = useWalletStore((s) => s.transactions);

  if (transactions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.slice(0, 10).map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm"
            >
              <div className="shrink-0">
                {tx.status === "pending" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {tx.status === "success" && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {tx.status === "failed" && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{tx.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {tx.hash}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={
                    tx.status === "pending"
                      ? "secondary"
                      : tx.status === "success"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {tx.status}
                </Badge>
                <a
                  href={explorerTxUrl(tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
