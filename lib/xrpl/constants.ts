export type NetworkKey = "mainnet" | "testnet" | "devnet";

export interface NetworkConfig {
  key: NetworkKey;
  label: string;
  wsUrl: string;
  faucetHost?: string;
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  mainnet: {
    key: "mainnet",
    label: "Mainnet",
    wsUrl: "wss://xrplcluster.com",
  },
  testnet: {
    key: "testnet",
    label: "Testnet",
    wsUrl: "wss://s.altnet.rippletest.net:51233",
    faucetHost: "faucet.altnet.rippletest.net",
  },
  devnet: {
    key: "devnet",
    label: "Devnet",
    wsUrl: "wss://s.devnet.rippletest.net:51233",
    faucetHost: "faucet.devnet.rippletest.net",
  },
};

export const DEFAULT_NETWORK: NetworkKey = "testnet";

export const getNetworkConfig = (key: NetworkKey): NetworkConfig =>
  NETWORKS[key];

export const isFaucetAvailable = (network: NetworkConfig): boolean =>
  Boolean(network.faucetHost);
