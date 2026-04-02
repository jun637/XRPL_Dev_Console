const GIRIN_HASH_KEYS = ["tx_hash", "txHash", "txId", "hash"] as const;

export const extractGirinHash = (
  payload: Record<string, unknown> | null | undefined,
): string | null => {
  if (!payload) {
    return null;
  }

  for (const key of GIRIN_HASH_KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  if ("result" in payload) {
    const nested = payload.result;
    if (nested && typeof nested === "object") {
      return extractGirinHash(nested as Record<string, unknown>);
    }
  }

  return null;
};
