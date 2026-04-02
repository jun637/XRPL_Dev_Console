import { custodialPayment } from "./custodialPayment";
import { crossBorder } from "./crossBorder";
import { stablecoin } from "./stablecoin";
import { escrow } from "./escrow";
import { rewardToken } from "./rewardToken";
import { artTokenization } from "./artTokenization";
import { regulatedToken } from "./regulatedToken";
import { kycCredential } from "./kycCredential";
import type { ScenarioDef } from "./types";

export const SCENARIOS: ScenarioDef[] = [
  custodialPayment,
  crossBorder,
  stablecoin,
  escrow,
  rewardToken,
  artTokenization,
  regulatedToken,
  kycCredential,
];
