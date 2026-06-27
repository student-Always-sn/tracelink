import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  Address,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const server = new rpc.Server(RPC_URL, { allowHttp: false });

export function getContract() {
  return new Contract(CONTRACT_ADDRESS);
}

// ── ScVal conversion helpers ──

export function toScValString(v: string) {
  return nativeToScVal(v, { type: "string" });
}

export function toScValU32(v: number) {
  return nativeToScVal(v, { type: "u32" });
}

export function toScValU64(v: string | bigint) {
  return nativeToScVal(BigInt(v), { type: "u64" });
}

export function toScValI128(v: string | bigint) {
  return nativeToScVal(BigInt(v), { type: "i128" });
}

export function toScValAddress(v: string) {
  return new Address(v).toScVal();
}

// ── Read-only contract calls ──

export async function readContract(
  method: string,
  args: xdr.ScVal[],
  source?: string
): Promise<any> {
  const contract = getContract();
  const tx = new TransactionBuilder(
    await server.getAccount(
      source || "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    ),
    {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }
  )
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  const simAny = sim as any;
  if (simAny.error) throw new Error(simAny.error);
  if (!simAny.result) throw new Error("No simulation result");

  const resultVal = simAny.result.retval;
  return resultVal ? scValToNative(resultVal) : undefined;
}

// ── State-changing contract calls ──

export async function callContract(
  method: string,
  args: xdr.ScVal[],
  source: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<string> {
  const contract = getContract();
  const account = await server.getAccount(source);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  const simAny = sim as any;
  if (simAny.error) throw new Error(`Simulation error: ${simAny.error}`);

  if (!simAny.result) {
    throw new Error("Transaction simulation failed - no result");
  }

  const assembledTx: any = rpc.assembleTransaction(tx, sim);
  const signedXdr = await signTransaction(
    assembledTx.toEnvelope().toXDR("base64")
  );
  const txResponse: any = await (server.sendTransaction as any)(signedXdr);

  if (txResponse.error) throw new Error(`Send error: ${txResponse.error}`);

  return txResponse.hash as string;
}

// ── Wait for transaction completion ──

export async function waitForTransaction(
  hash: string,
  pollIntervalMs = 1000,
  maxAttempts = 60
): Promise<rpc.Api.GetTransactionResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await server.getTransaction(hash);
    if (result.status !== "NOT_FOUND") {
      return result;
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  throw new Error("Transaction not found after maximum attempts");
}
