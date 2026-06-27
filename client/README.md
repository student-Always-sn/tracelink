# SupplyChain Tracker — Frontend

A Next.js frontend for the Stellar Soroban supply chain tracker DApp.

## Features

- **Multi-Wallet Support**: Connect with Freighter, xBull, Albedo, Lobstr, or Rabet
- **Product Management**: Register products, track through supply chain
- **Checkpoint Timeline**: Visual timeline of every scan and transfer
- **Custody Transfer**: Transfer products between supply chain parties
- **Quality Verification**: Inspectors can verify or reject products
- **Real-Time Events**: Automatic polling for contract events (10s intervals)
- **Transaction Tracking**: Pending → success/failed with explorer links
- **Dark Mode**: Full CSS variable support

## Pages

| Route | Description |
|---|---|
| `/` | Product list with activity feed |
| `/register` | Register a new product |
| `/products/[id]` | Product detail with timeline and actions |
| `/dashboard` | Wallet info, balances, contract info, transaction history |
| `/activity` | Full event feed and transaction history |

## Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_RPC_URL` | Soroban RPC endpoint (default: testnet) |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | Network passphrase (default: Testnet) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address (C...) |

## Development

```bash
bun install
bun dev
```

## Build

```bash
bun run build
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Set the environment variables in the Vercel dashboard.
