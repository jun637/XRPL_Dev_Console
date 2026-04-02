import type { ReactNode } from "react";

export type WalletRole = "issuer" | "receiver" | "platform" | "user" | "sender" | "unauthorized";

export type InfoStepDef = {
  type: "info";
  title: string;
  content: ReactNode;
};

export type WalletStepDef = {
  type: "wallet";
  role: WalletRole;
  label: string;
  description?: string;
};

export type TxStepDef = {
  type: "tx";
  role: WalletRole;
  title: string;
  explanation: ReactNode;
  /** Function that receives wallet addresses and returns the tx JSON object. */
  buildTx: (wallets: Record<string, string>) => Record<string, unknown>;
  /** If true, this TX is expected to fail (for demo purposes). */
  expectFailure?: boolean;
};

export type CompleteStepDef = {
  type: "complete";
  summary: ReactNode;
};

export type ScenarioStep = InfoStepDef | WalletStepDef | TxStepDef | CompleteStepDef;

export type ScenarioDef = {
  id: string;
  title: string;
  subtitle: string;
  description: ReactNode;
  steps: ScenarioStep[];
};
