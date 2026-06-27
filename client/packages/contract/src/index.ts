import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDP5EYTNEKEHAVBAC3PN5H5FMUOIAQTKT5VANKDVOUI3JGLO4NWUCSAY",
  }
} as const

export const Errors = {
  1: {message:"NotFound"}
}

export type DataKey = {tag: "Product", values: readonly [u64]} | {tag: "Checkpoint", values: readonly [u64, u32]} | {tag: "ProductCount", values: void};


export interface Product {
  checkpoint_count: u32;
  current_holder: string;
  description: string;
  id: u64;
  name: string;
  origin: string;
  status: string;
}


export interface Checkpoint {
  checkpoint_id: u32;
  handler: string;
  location: string;
  notes: string;
  product_id: u64;
  timestamp: u64;
}

export interface Client {
  /**
   * Construct and simulate a get_product transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get product details by ID. Panics if not found.
   */
  get_product: ({product_id}: {product_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Product>>

  /**
   * Construct and simulate a get_checkpoint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific checkpoint. Panics if not found.
   */
  get_checkpoint: ({product_id, checkpoint_id}: {product_id: u64, checkpoint_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Checkpoint>>

  /**
   * Construct and simulate a verify_product transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verify or reject a product. Requires inspector auth.
   */
  verify_product: ({product_id, inspector, status}: {product_id: u64, inspector: string, status: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a scan_checkpoint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Record a checkpoint scan at a location. Requires handler auth.
   */
  scan_checkpoint: ({product_id, handler, location, notes}: {product_id: u64, handler: string, location: string, notes: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a register_product transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Register a new product. Returns the auto-incremented product ID.
   */
  register_product: ({manufacturer, name, description, origin}: {manufacturer: string, name: string, description: string, origin: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a transfer_product transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer product custody. Requires current holder auth.
   */
  transfer_product: ({product_id, from, to}: {product_id: u64, from: string, to: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_product_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of registered products.
   */
  get_product_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_checkpoint_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get number of checkpoints for a product.
   */
  get_checkpoint_count: ({product_id}: {product_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAQAAAAAAAAAITm90Rm91bmQAAAAB",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAAB1Byb2R1Y3QAAAAAAQAAAAYAAAABAAAAAAAAAApDaGVja3BvaW50AAAAAAACAAAABgAAAAQAAAAAAAAAAAAAAAxQcm9kdWN0Q291bnQ=",
        "AAAAAQAAAAAAAAAAAAAAB1Byb2R1Y3QAAAAABwAAAAAAAAAQY2hlY2twb2ludF9jb3VudAAAAAQAAAAAAAAADmN1cnJlbnRfaG9sZGVyAAAAAAATAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABm9yaWdpbgAAAAAAEAAAAAAAAAAGc3RhdHVzAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAACkNoZWNrcG9pbnQAAAAAAAYAAAAAAAAADWNoZWNrcG9pbnRfaWQAAAAAAAAEAAAAAAAAAAdoYW5kbGVyAAAAABMAAAAAAAAACGxvY2F0aW9uAAAAEAAAAAAAAAAFbm90ZXMAAAAAAAAQAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAGAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
        "AAAAAAAAAC9HZXQgcHJvZHVjdCBkZXRhaWxzIGJ5IElELiBQYW5pY3MgaWYgbm90IGZvdW5kLgAAAAALZ2V0X3Byb2R1Y3QAAAAAAQAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABgAAAAEAAAfQAAAAB1Byb2R1Y3QA",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAAAAAAA",
        "AAAAAAAAAC9HZXQgYSBzcGVjaWZpYyBjaGVja3BvaW50LiBQYW5pY3MgaWYgbm90IGZvdW5kLgAAAAAOZ2V0X2NoZWNrcG9pbnQAAAAAAAIAAAAAAAAACnByb2R1Y3RfaWQAAAAAAAYAAAAAAAAADWNoZWNrcG9pbnRfaWQAAAAAAAAEAAAAAQAAB9AAAAAKQ2hlY2twb2ludAAA",
        "AAAAAAAAADRWZXJpZnkgb3IgcmVqZWN0IGEgcHJvZHVjdC4gUmVxdWlyZXMgaW5zcGVjdG9yIGF1dGguAAAADnZlcmlmeV9wcm9kdWN0AAAAAAADAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAGAAAAAAAAAAlpbnNwZWN0b3IAAAAAAAATAAAAAAAAAAZzdGF0dXMAAAAAABAAAAAA",
        "AAAAAAAAAD5SZWNvcmQgYSBjaGVja3BvaW50IHNjYW4gYXQgYSBsb2NhdGlvbi4gUmVxdWlyZXMgaGFuZGxlciBhdXRoLgAAAAAAD3NjYW5fY2hlY2twb2ludAAAAAAEAAAAAAAAAApwcm9kdWN0X2lkAAAAAAAGAAAAAAAAAAdoYW5kbGVyAAAAABMAAAAAAAAACGxvY2F0aW9uAAAAEAAAAAAAAAAFbm90ZXMAAAAAAAAQAAAAAA==",
        "AAAAAAAAAEBSZWdpc3RlciBhIG5ldyBwcm9kdWN0LiBSZXR1cm5zIHRoZSBhdXRvLWluY3JlbWVudGVkIHByb2R1Y3QgSUQuAAAAEHJlZ2lzdGVyX3Byb2R1Y3QAAAAEAAAAAAAAAAxtYW51ZmFjdHVyZXIAAAATAAAAAAAAAARuYW1lAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAGb3JpZ2luAAAAAAAQAAAAAQAAAAY=",
        "AAAAAAAAADdUcmFuc2ZlciBwcm9kdWN0IGN1c3RvZHkuIFJlcXVpcmVzIGN1cnJlbnQgaG9sZGVyIGF1dGguAAAAABB0cmFuc2Zlcl9wcm9kdWN0AAAAAwAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABgAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAA==",
        "AAAAAAAAAChHZXQgdG90YWwgbnVtYmVyIG9mIHJlZ2lzdGVyZWQgcHJvZHVjdHMuAAAAEWdldF9wcm9kdWN0X2NvdW50AAAAAAAAAAAAAAEAAAAG",
        "AAAAAAAAAChHZXQgbnVtYmVyIG9mIGNoZWNrcG9pbnRzIGZvciBhIHByb2R1Y3QuAAAAFGdldF9jaGVja3BvaW50X2NvdW50AAAAAQAAAAAAAAAKcHJvZHVjdF9pZAAAAAAABgAAAAEAAAAE" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_product: this.txFromJSON<Product>,
        get_checkpoint: this.txFromJSON<Checkpoint>,
        verify_product: this.txFromJSON<null>,
        scan_checkpoint: this.txFromJSON<null>,
        register_product: this.txFromJSON<u64>,
        transfer_product: this.txFromJSON<null>,
        get_product_count: this.txFromJSON<u64>,
        get_checkpoint_count: this.txFromJSON<u32>
  }
}