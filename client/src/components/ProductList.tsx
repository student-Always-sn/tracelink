"use client";

import { useProductCount, useAllProducts } from "@/hooks/useContract";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { AlertCircle, Inbox } from "lucide-react";

export function ProductList() {
  const { data: count, isLoading: countLoading, error: countError } = useProductCount();
  const { data: products, isLoading: productsLoading } = useAllProducts(count || 0);

  if (countLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (countError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Error loading products</p>
        <p className="text-sm">
          Please make sure your wallet is connected and the contract is deployed.
        </p>
      </div>
    );
  }

  if (!count || count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No products yet</p>
        <p className="text-sm">
          Register a product to start tracking its supply chain.
        </p>
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products?.map((product, idx) => (
        <ProductCard key={idx} product={product} id={String(idx + 1)} />
      ))}
    </div>
  );
}
