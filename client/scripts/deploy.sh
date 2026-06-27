#!/bin/bash
set -euo pipefail

# ──────────────────────────────────────────────────
# Supply Chain Tracker — Contract Deployment Script
# ──────────────────────────────────────────────────

NETWORK="${1:-testnet}"
KEY_NAME="${2:-dev}"
WASM_PATH="../contract/target/wasm32v1-none/release/crowdfunding.wasm"

echo "🔧 Building contract..."
cd "$(dirname "$0")/../.."
stellar contract build

echo "📦 Deploying to $NETWORK..."
DEPLOY_OUTPUT=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account "$KEY_NAME" \
  --network "$NETWORK" 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract contract address from output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE 'C[A-Z0-9]{55}' | head -1)

if [ -n "$CONTRACT_ADDRESS" ]; then
  echo ""
  echo "✅ Contract deployed at: $CONTRACT_ADDRESS"
  echo ""
  echo "Add this to your .env.local:"
  echo "  NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
  echo ""
  echo "No constructor call needed — the supply chain contract has no init args."
else
  echo ""
  echo "⚠️  Could not extract contract address. Check output above."
fi
