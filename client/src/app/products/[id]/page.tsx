"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useProduct, useScanCheckpoint, useTransferProduct, useVerifyProduct } from "@/hooks/useContract";
import { useWallet } from "@/hooks/useWallet";
import { CheckpointTimeline } from "@/components/CheckpointTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/lib/utils";
import {
  Package,
  MapPin,
  User,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Scan,
  Send,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
  Created: { label: "Created", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" },
  InTransit: { label: "In Transit", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  Delivered: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  Verified: { label: "Verified", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  Rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
};

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { wallet, isConnected } = useWallet();
  const { data: product, isLoading, error } = useProduct(productId);

  const scanCheckpoint = useScanCheckpoint();
  const transferProduct = useTransferProduct();
  const verifyProduct = useVerifyProduct();

  const [scanLocation, setScanLocation] = useState("");
  const [scanNotes, setScanNotes] = useState("");
  const [transferTo, setTransferTo] = useState("");

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The product with ID #{productId} does not exist.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const statusStyle = statusConfig[product.status] || {
    label: product.status,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  };
  const isOwner = wallet?.address === product.current_holder;

  const handleScan = async () => {
    if (!wallet) { toast.error("Connect wallet first"); return; }
    if (!scanLocation) { toast.error("Location is required"); return; }
    try {
      await scanCheckpoint.mutateAsync({
        productId,
        handler: wallet.address,
        location: scanLocation,
        notes: scanNotes,
      });
      toast.success("Checkpoint scanned!");
      setScanLocation("");
      setScanNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to scan checkpoint");
    }
  };

  const handleTransfer = async () => {
    if (!wallet) { toast.error("Connect wallet first"); return; }
    if (!transferTo) { toast.error("Recipient address is required"); return; }
    try {
      await transferProduct.mutateAsync({ productId, to: transferTo });
      toast.success("Product transferred!");
      setTransferTo("");
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer product");
    }
  };

  const handleVerify = async (status: string) => {
    if (!wallet) { toast.error("Connect wallet first"); return; }
    try {
      await verifyProduct.mutateAsync({ productId, status });
      toast.success(`Product marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || `Failed to verify product`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>

      {/* Product Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <Badge
                  className={`${statusStyle.color} border-0`}
                >
                  {statusStyle.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Origin</p>
                <p className="font-medium">{product.origin}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Current Holder</p>
                <p className="font-medium text-sm">
                  {truncateAddress(product.current_holder)}
                  {isOwner && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Checkpoints</p>
                <p className="font-medium">{product.checkpoint_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Product ID</p>
                <p className="font-medium">#{product.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions (only if wallet is the current holder) */}
      {isConnected && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Scan Checkpoint */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Scan Checkpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Miami Port"
                  value={scanLocation}
                  onChange={(e) => setScanLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={scanNotes}
                  onChange={(e) => setScanNotes(e.target.value)}
                />
              </div>
              <Button
                onClick={handleScan}
                className="w-full gap-2"
                disabled={scanCheckpoint.isPending}
                size="sm"
              >
                {scanCheckpoint.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Scan className="h-4 w-4" />
                )}
                Scan
              </Button>
            </CardContent>
          </Card>

          {/* Transfer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Send className="h-4 w-4" />
                Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="G... or C..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                />
              </div>
              <Button
                onClick={handleTransfer}
                className="w-full gap-2"
                disabled={transferProduct.isPending}
                size="sm"
              >
                {transferProduct.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Transfer
              </Button>
            </CardContent>
          </Card>

          {/* Verify */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Verify
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Mark this product as verified or rejected.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleVerify("Verified")}
                  variant="default"
                  className="gap-2"
                  disabled={verifyProduct.isPending}
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify
                </Button>
                <Button
                  onClick={() => handleVerify("Rejected")}
                  variant="destructive"
                  className="gap-2"
                  disabled={verifyProduct.isPending}
                  size="sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline */}
      <CheckpointTimeline productId={productId} />
    </div>
  );
}
