import { NETWORKS, type NetworkKey } from "@/lib/xrpl/constants";

export const networkList = Object.values(NETWORKS);

export const NETWORK_EXPLORER_BASES: Record<NetworkKey, string> = {
  mainnet: "https://livenet.xrpl.org/transactions",
  testnet: "https://testnet.xrpl.org/transactions",
  devnet: "https://devnet.xrpl.org/transactions",
};
