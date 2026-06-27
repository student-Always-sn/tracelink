"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/lib/utils";
import {
  Package,
  MapPin,
  User,
  CheckCircle,
  Truck,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  id: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" | "success" }
> = {
  Created: {
    label: "Created",
    icon: <Package className="h-3 w-3" />,
    variant: "outline",
  },
  InTransit: {
    label: "In Transit",
    icon: <Truck className="h-3 w-3" />,
    variant: "secondary",
  },
  Delivered: {
    label: "Delivered",
    icon: <CheckCircle className="h-3 w-3" />,
    variant: "success",
  },
  Verified: {
    label: "Verified",
    icon: <CheckCircle className="h-3 w-3" />,
    variant: "success",
  },
  Rejected: {
    label: "Rejected",
    icon: <AlertTriangle className="h-3 w-3" />,
    variant: "destructive",
  },
};

export function ProductCard({ product, id }: ProductCardProps) {
  const cfg = statusConfig[product.status] || {
    label: product.status,
    icon: <Clock className="h-3 w-3" />,
    variant: "outline" as const,
  };

  return (
    <Link href={`/products/${id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              {product.name}
            </CardTitle>
            <Badge variant={cfg.variant} className="gap-1 shrink-0">
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{product.origin}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{truncateAddress(product.current_holder)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3 w-3 shrink-0" />
            <span>{product.checkpoint_count} checkpoint{product.checkpoint_count !== 1 ? "s" : ""}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  );
}
