export type AccountFlagConfigItem = {
  label: string;
  flagKey: string;
};

export const ACCOUNT_FLAG_CONFIG: AccountFlagConfigItem[] = [
  { label: "asfAccountTxnID", flagKey: "lsfAccountTxnID" },
  { label: "asfAllowTrustLineClawback", flagKey: "lsfAllowTrustLineClawback" },
  { label: "asfAllowTrustLineLocking", flagKey: "lsfAllowTrustLineLocking" },
  { label: "asfAuthorizedNFTokenMinter", flagKey: "lsfAuthorizedNFTokenMinter" },
  { label: "asfDefaultRipple", flagKey: "lsfDefaultRipple" },
  { label: "asfDepositAuth", flagKey: "lsfDepositAuth" },
  { label: "asfDisableMaster", flagKey: "lsfDisableMaster" },
  { label: "asfDisallowIncomingCheck", flagKey: "lsfDisallowIncomingCheck" },
  { label: "asfDisallowIncomingNFTokenOffer", flagKey: "lsfDisallowIncomingNFTokenOffer" },
  { label: "asfDisallowIncomingPayChan", flagKey: "lsfDisallowIncomingPayChan" },
  { label: "asfDisallowIncomingTrustline", flagKey: "lsfDisallowIncomingTrustline" },
  { label: "asfDisallowXRP", flagKey: "lsfDisallowXRP" },
  { label: "asfGlobalFreeze", flagKey: "lsfGlobalFreeze" },
  { label: "asfNoFreeze", flagKey: "lsfNoFreeze" },
  { label: "asfRequireAuth", flagKey: "lsfRequireAuth" },
  { label: "asfRequireDest", flagKey: "lsfRequireDestTag" },
];
