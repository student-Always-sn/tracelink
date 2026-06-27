# SupplyChain Tracker - Stellar Soroban DApp

A decentralized supply chain tracker built on **Stellar Soroban** with QR checkpoint scanning, tamper-evident history, and multi-party verification roles.

- **Smart Contract**: Rust + Soroban SDK v25 — register products, scan checkpoints, transfer custody, verify quality
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, StellarWalletsKit, TanStack Query, Zustand
- **Features**: Multi-wallet support, supply chain timeline, real-time events, transaction tracking, dark mode

## Project Structure

```
├── contract/               # Soroban smart contract
│   ├── contracts/contract/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs      # Contract code
│   │       └── test.rs     # Contract tests
│   └── Cargo.toml
└── client/                 # Next.js frontend
    ├── src/
    │   ├── app/            # Pages
    │   ├── components/     # UI components
    │   ├── hooks/          # Contract + wallet hooks
    │   ├── lib/            # RPC client + utilities
    │   ├── store/          # Zustand state
    │   ├── types/          # TypeScript types
    │   └── contracts/      # Config
    ├── scripts/deploy.sh
    └── .env.example
```

## Quick Start

```bash
# Contract
cd contract && cargo test && stellar contract build

# Client
cd client && cp .env.example .env.local && bun install && bun dev
```

## Contract Methods

| Method | Description |
|---|---|
| `register_product` | Create a new product with origin info |
| `scan_checkpoint` | Record a checkpoint scan (location, notes) |
| `transfer_product` | Transfer custody to another party |
| `verify_product` | Verify or reject product quality |
| `get_product` | Get product details by ID |
| `get_checkpoint` | Get a specific checkpoint |
| `get_checkpoint_count` | Get number of checkpoints |
| `get_product_count` | Get total products |

## Events

- `ProductRegistered` — New product on the chain
- `CheckpointScanned` — Checkpoint recorded at a location
- `ProductTransferred` — Custody transferred between parties
- `ProductVerified` — Product verified or rejected

## Supply Chain Roles

- **Manufacturer** — Creates products, scans origin checkpoint
- **Distributor** — Handles transit, scans at distribution points
- **Retailer** — Receives final product, scans at store
- **Inspector** — Verifies quality, marks as Verified or Rejected

## Tech Stack

- **Smart Contract**: Soroban SDK v25, Rust
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS 4
- **Wallet**: StellarWalletsKit v2 (Freighter, xBull, Albedo, Lobstr, Rabet)
- **State**: TanStack Query, Zustand
- **UI**: shadcn/ui components, sonner toasts
- **Blockchain**: @stellar/stellar-sdk v16, Soroban RPC
