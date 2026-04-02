import type { Client } from "xrpl";

export type ConnectionStatus = "connecting" | "connected" | "error";

export type FundWalletResponse = Awaited<ReturnType<Client["fundWallet"]>>;

export type MutableTx = Record<string, unknown> & {
  Account?: string;
  TransactionType?: string;
};

export interface RippledError extends Error {
  data?: {
    error?: string;
    error_message?: string;
  };
}
