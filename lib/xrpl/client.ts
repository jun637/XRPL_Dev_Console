import { Client } from "xrpl";
import type { NetworkConfig } from "@/lib/xrpl/constants";

export const createXRPLClient = (config: NetworkConfig): Client => {
  return new Client(config.wsUrl);
};
