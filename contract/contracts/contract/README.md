# Supply Chain Tracker — Soroban Smart Contract

A Soroban smart contract for decentralized supply chain tracking with checkpoint scanning, tamper-evident history, and multi-party verification.

## Methods

- `__constructor()` — No initialization needed
- `register_product(manufacturer, name, description, origin)` — Create a new product (returns product ID)
- `scan_checkpoint(product_id, handler, location, notes)` — Record a checkpoint scan
- `transfer_product(product_id, from, to)` — Transfer custody to another party
- `verify_product(product_id, inspector, status)` — Verify or reject ("Verified" / "Rejected")
- `get_product(product_id)` — Get product details
- `get_checkpoint(product_id, checkpoint_id)` — Get a specific checkpoint
- `get_checkpoint_count(product_id)` — Get number of checkpoints
- `get_product_count()` — Get total registered products

## Events

- `ProductRegistered` — Emitted when a new product is registered
- `CheckpointScanned` — Emitted when a checkpoint is scanned
- `ProductTransferred` — Emitted when custody is transferred
- `ProductVerified` — Emitted when a product is verified or rejected

## Storage

- **Persistent**: Products and checkpoints (per-key TTL)
- **Instance**: Product counter

## Auth

All state-changing methods require the calling address to authenticate:
- `register_product` → manufacturer
- `scan_checkpoint` → handler
- `transfer_product` → current holder (from)
- `verify_product` → inspector

## Testing

```bash
cargo test
```

## Build

```bash
stellar contract build
```

## Deploy (testnet)

```bash
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/crowdfunding.wasm \
  --source-account dev \
  --network testnet
```

No constructor initialization needed — the contract is ready to use after deploy.
