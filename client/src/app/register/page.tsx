"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useRegisterProduct } from "@/hooks/useContract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterProduct() {
  const { wallet, isConnected, connect } = useWallet();
  const registerProduct = useRegisterProduct();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || !origin) {
      toast.error("Name and origin are required");
      return;
    }

    try {
      await registerProduct.mutateAsync({
        manufacturer: wallet.address,
        name,
        description,
        origin,
      });
      toast.success(`Product "${name}" registered successfully!`);
      setName("");
      setDescription("");
      setOrigin("");
    } catch (err: any) {
      toast.error(err.message || "Failed to register product");
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Register a Product</CardTitle>
            <CardDescription>
              Connect your wallet to register a new product on the supply chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="w-full gap-2">
              <Package className="h-4 w-4" /> Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Register a Product</CardTitle>
          <CardDescription>
            Add a new product to the supply chain tracker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Organic Coffee Beans"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the product"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin *</Label>
              <Input
                id="origin"
                placeholder="e.g. Bogota, Colombia"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={registerProduct.isPending}
            >
              {registerProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" /> Register Product
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            <Link href="/" className="underline hover:text-foreground">
              View all products
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
