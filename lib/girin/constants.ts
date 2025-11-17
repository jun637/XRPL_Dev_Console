import type { WalletConnectModalSignConnectArguments } from "@walletconnect/modal-sign-html";
import type { SignClientTypes } from "@walletconnect/types";
import type { NetworkKey } from "@/lib/xrpl/constants";

export type WalletConnectChainId = "xrpl:0" | "xrpl:1";

export const NETWORK_TO_WALLETCONNECT_CHAIN: Partial<
  Record<NetworkKey, WalletConnectChainId>
> = {
  mainnet: "xrpl:0",
  testnet: "xrpl:1",
};

export const GIRIN_REQUIRED_NAMESPACES: WalletConnectModalSignConnectArguments["requiredNamespaces"] =
  {
    xrpl: {
      chains: ["xrpl:0", "xrpl:1"],
      methods: ["xrpl_signTransaction"],
      events: ["chainChanged", "accountsChanged"],
    },
  };

export const GIRIN_METADATA: SignClientTypes.Metadata = {
  name: "XRPL Dev Console",
  description: "Experimental XRPL developer console",
  url: "https://jun637.github.io/XRPL_Dev_Console/",
  icons: ["https://jun637.github.io/XRPL_Dev_Console/xrpl-logo.svg"],
};
