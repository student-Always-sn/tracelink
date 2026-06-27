"use client";

import { useCheckpointCount, useAllCheckpoints } from "@/hooks/useContract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress, parseTimestamp } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { Checkpoint } from "@/types";

interface CheckpointTimelineProps {
  productId: string;
}

const statusIcons: Record<number, React.ReactNode> = {
  0: <Package className="h-4 w-4" />, // First = origin
};

export function CheckpointTimeline({ productId }: CheckpointTimelineProps) {
  const { data: count, isLoading: countLoading } = useCheckpointCount(productId);
  const { data: checkpoints, isLoading: cpsLoading } = useAllCheckpoints(
    productId,
    count || 0
  );

  if (countLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supply Chain Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!count || count === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supply Chain Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MapPin className="h-10 w-10 mb-3" />
            <p className="text-sm">No checkpoints recorded yet</p>
            <p className="text-xs">Scan a checkpoint to start tracking.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cpsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supply Chain Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Supply Chain Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {checkpoints?.map((cp, idx) => (
              <div key={idx} className="relative pl-12">
                {/* Icon circle */}
                <div
                  className={`absolute left-3.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      idx === 0
                        ? "bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400"
                        : idx === (checkpoints?.length || 0) - 1
                        ? "bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400"
                        : "bg-muted border-muted-foreground/30"
                    }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>

                {/* Content */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-sm">{cp.location}</span>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      #{cp.checkpoint_id}
                    </Badge>
                  </div>

                  {cp.notes && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                      <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{cp.notes}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{truncateAddress(cp.handler)}</span>
                    </div>
                    {cp.timestamp && (
                      <span>{parseTimestamp(Number(cp.timestamp))}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
