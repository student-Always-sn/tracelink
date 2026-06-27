"use client";

import { useContractEvents } from "@/hooks/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/lib/utils";
import {
  RefreshCw,
  Package,
  MapPin,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContractEvent } from "@/types";

const eventConfig: Record<
  ContractEvent["type"],
  { icon: React.ReactNode; label: string; color: string }
> = {
  ProductRegistered: {
    icon: <Package className="h-4 w-4" />,
    label: "Product Registered",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  CheckpointScanned: {
    icon: <MapPin className="h-4 w-4" />,
    label: "Checkpoint Scanned",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  ProductTransferred: {
    icon: <ArrowRightLeft className="h-4 w-4" />,
    label: "Product Transferred",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
  ProductVerified: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Product Verified",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
};

export function EventFeed() {
  const { events, loading, refresh } = useContractEvents();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Activity Feed</CardTitle>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No events yet. Register a product to get started!
          </p>
        )}
        {events.length === 0 && loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
        <div className="space-y-2">
          {events.slice(0, 20).map((event, idx) => {
            const config = eventConfig[event.type];
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${config.color}`}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{config.label}</p>
                  {"name" in event.data && (
                    <p className="text-muted-foreground truncate">
                      {event.data.name}
                    </p>
                  )}
                  {"location" in event.data && (
                    <p className="text-muted-foreground text-xs truncate">
                      Location: {event.data.location}
                    </p>
                  )}
                  {"manufacturer" in event.data && (
                    <p className="text-muted-foreground text-xs">
                      by {truncateAddress(event.data.manufacturer)}
                    </p>
                  )}
                  {"handler" in event.data && (
                    <p className="text-muted-foreground text-xs">
                      by {truncateAddress(event.data.handler)}
                    </p>
                  )}
                  {"from" in event.data && "to" in event.data && (
                    <p className="text-muted-foreground text-xs">
                      {truncateAddress(event.data.from)} →{" "}
                      {truncateAddress(event.data.to)}
                    </p>
                  )}
                  {"status" in event.data && (
                    <p className="text-xs text-muted-foreground">
                      Status: {event.data.status}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  #{event.data.product_id}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
