/**
 * Contract configuration.
 *
 * After deploying the contract to testnet, set NEXT_PUBLIC_CONTRACT_ADDRESS
 * in your .env.local file with the returned C... address.
 *
 * To deploy:
 *   1. cd ~/project/contract && stellar contract build
 *   2. stellar keys generate dev --network testnet --fund
 *   3. stellar contract deploy \
 *        --wasm target/wasm32v1-none/release/crowdfunding.wasm \
 *        --source-account dev --network testnet
 *   4. Copy the contract address into .env.local
 *
 * No __constructor initialization needed — the supply chain contract
 * does not require any constructor args.
 */

export const CONTRACT_DEPLOY_HELP = `
To deploy the contract:
  1. cd ~/project/contract && stellar contract build
  2. stellar keys generate dev --network testnet --fund
  3. stellar contract deploy \\
      --wasm target/wasm32v1-none/release/crowdfunding.wasm \\
      --source-account dev \\
      --network testnet
  4. Copy the returned contract address (C...) into .env.local as NEXT_PUBLIC_CONTRACT_ADDRESS

The supply chain contract has no constructor initialization — it's ready to use right after deploy.
`;
