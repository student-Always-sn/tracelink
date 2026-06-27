import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stellar SDK needs node built-ins
  serverExternalPackages: ["@stellar/stellar-sdk"],
};

export default nextConfig;
