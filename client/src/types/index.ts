export interface Product {
  id: string;
  name: string;
  description: string;
  origin: string;
  current_holder: string;
  status: string;
  checkpoint_count: number;
}

export interface Checkpoint {
  product_id: string;
  checkpoint_id: number;
  handler: string;
  location: string;
  notes: string;
  timestamp: string;
}

export interface ProductRegisteredEvent {
  product_id: string;
  manufacturer: string;
  name: string;
}

export interface CheckpointScannedEvent {
  product_id: string;
  handler: string;
  location: string;
  checkpoint_id: number;
}

export interface ProductTransferredEvent {
  product_id: string;
  from: string;
  to: string;
}

export interface ProductVerifiedEvent {
  product_id: string;
  inspector: string;
  status: string;
}

export type ContractEvent =
  | { type: "ProductRegistered"; data: ProductRegisteredEvent }
  | { type: "CheckpointScanned"; data: CheckpointScannedEvent }
  | { type: "ProductTransferred"; data: ProductTransferredEvent }
  | { type: "ProductVerified"; data: ProductVerifiedEvent };

export interface TransactionStatus {
  hash: string;
  status: "pending" | "success" | "failed";
  label: string;
  timestamp: number;
}

export type WalletKey =
  | "freier"
  | "xbull"
  | "albedo"
  | "lobstr"
  | "wallet_connect"
  | "rabet"
  | "soroban_horizon"
  | "stellar_type";

export interface WalletInfo {
  address: string;
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
}
