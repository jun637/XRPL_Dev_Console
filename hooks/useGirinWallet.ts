import { useState } from "react";
import { useConnect, useRequest } from "@walletconnect/modal-sign-react";
import type { SessionTypes } from "@walletconnect/types";
import type { NetworkKey } from "@/lib/xrpl/constants";
import {
  GIRIN_REQUIRED_NAMESPACES,
  NETWORK_TO_WALLETCONNECT_CHAIN,
  type WalletConnectChainId,
} from "@/lib/girin/constants";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractAccountsFromSession = (
  session: SessionTypes.Struct,
): Partial<Record<WalletConnectChainId, string>> => {
  const map: Partial<Record<WalletConnectChainId, string>> = {};
  const accounts = session.namespaces.xrpl?.accounts ?? [];

  for (const entry of accounts) {
    const [namespace, chainSuffix, ...rest] = entry.split(":");
    if (namespace !== "xrpl" || !chainSuffix || rest.length === 0) {
      continue;
    }
    map[`xrpl:${chainSuffix}` as WalletConnectChainId] = rest.join(":");
  }

  return map;
};

export function useGirinWallet(network: NetworkKey, projectId?: string) {
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [accounts, setAccounts] = useState<
    Partial<Record<WalletConnectChainId, string>>
  >({});

  const isSupportedNetwork = network !== "devnet";
  const isConfigured = Boolean(projectId);

  if (!isConfigured) {
    const unavailable = async () => {
      throw new Error("Girin Wallet을 사용하려면 NEXT_PUBLIC_PROJECT_ID를 설정해야 합니다.");
    };

    return {
      isEnabled: false,
      isConnecting: false,
      isConnected: false,
      accountAddress: null,
      connect: unavailable,
      reset: () => {},
      submitViaGirin: unavailable,
    };
  }

  const { connect, loading: isConnecting } = useConnect({
    requiredNamespaces: GIRIN_REQUIRED_NAMESPACES,
  });

  const { request } = useRequest<Record<string, unknown>>({
    chainId: "xrpl:0",
    topic: "",
    request: {
      method: "xrpl_signTransaction",
      params: { tx_json: {} },
    },
  });

  const chainId = NETWORK_TO_WALLETCONNECT_CHAIN[network];
  const currentAccountAddress = chainId ? accounts[chainId] ?? null : null;
  const isEnabled = isSupportedNetwork && isConfigured;

  const connectGirin = async () => {
    if (!isEnabled) {
      throw new Error("현재 네트워크에서는 Girin Wallet을 사용할 수 없습니다.");
    }
    const nextSession = await connect();
    const nextAccounts = extractAccountsFromSession(nextSession);
    setSession(nextSession);
    setAccounts(nextAccounts);
    return nextAccounts;
  };

  const resetGirin = () => {
    setSession(null);
    setAccounts({});
  };

  const submitViaGirin = async (txJson: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    if (!session) {
      throw new Error("Girin Wallet 세션이 활성화되어 있지 않습니다.");
    }
    if (!chainId) {
      throw new Error("현재 네트워크는 Girin Wallet에서 지원되지 않습니다.");
    }

    const response = await request({
      chainId,
      topic: session.topic,
      request: {
        method: "xrpl_signTransaction",
        params: { tx_json: txJson },
      },
    });

    return isRecord(response) ? response : null;
  };


  return {
    isEnabled,
    isConnecting,
    isConnected: Boolean(session && currentAccountAddress),
    accountAddress: currentAccountAddress,
    connect: connectGirin,
    reset: resetGirin,
    submitViaGirin,
  };
}
