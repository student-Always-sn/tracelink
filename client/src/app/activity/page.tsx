"use client";

import { EventFeed } from "@/components/EventFeed";
import { TransactionStatus } from "@/components/TransactionStatus";

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground mt-1">
          Real-time supply chain events and transaction history
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <EventFeed />
        <TransactionStatus />
      </div>
    </div>
  );
}
