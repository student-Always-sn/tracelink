"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "@/components/WalletConnect";
import { cn } from "@/lib/utils";
import { Package, PlusCircle, LayoutDashboard, Activity } from "lucide-react";

const navLinks = [
  { href: "/", label: "Products", icon: Package },
  { href: "/register", label: "Register", icon: PlusCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <Package className="h-5 w-5 text-primary" />
            <span>SupplyChain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
