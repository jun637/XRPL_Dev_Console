import type { AccountInfoAccountFlags } from "xrpl";

export type AccountDataState = "idle" | "loading" | "ready" | "not_found" | "error";

export interface AccountSnapshot {
  balanceXrp: string;
  iouBalance: string;
  mptBalance: string;
  sequence: number;
  ownerCount?: number;
  flags?: Partial<AccountInfoAccountFlags>;
}

export interface AccountTransactionEntry {
  tx: Record<string, unknown>;
  meta?: Record<string, unknown>;
  validated: boolean;
  hash: string | null;
  transactionType: string | null;
  date: number | null;
}

export interface SavedWallet {
  name: string;
  classicAddress: string;
  publicKey: string;
  seed: string;
}

export interface MptHolding {
  issuanceId: string;
  balance: string;
}
