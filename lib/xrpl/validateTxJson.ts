import { TxJsonParseError } from "@/lib/xrpl/parseTx";

const isString = (value: unknown): value is string => typeof value === "string";
const isUIntString = (value: unknown): value is string => isString(value) && /^\d+$/.test(value);
const isIOUObject = (value: unknown): value is { currency: string; issuer: string; value: string } =>
  Boolean(
    value &&
      typeof value === "object" &&
      isString((value as { currency?: unknown }).currency) &&
      isString((value as { issuer?: unknown }).issuer) &&
      isString((value as { value?: unknown }).value),
  );

const isMPTAmount = (value: unknown): value is { mpt_issuance_id: string; value: string } =>
  Boolean(
    value &&
      typeof value === "object" &&
      isString((value as { mpt_issuance_id?: unknown }).mpt_issuance_id) &&
      isString((value as { value?: unknown }).value),
  );

export const validateTxJsonShapes = (tx: Record<string, unknown>): void => {
  const checkAmountish = (field: string) => {
    if (!(field in tx)) return;
    const value = tx[field as keyof typeof tx];
    const ok = isUIntString(value) || isIOUObject(value) || isMPTAmount(value);
    if (!ok) {
      throw new TxJsonParseError(
        `Invalid ${field}. Use drops as string (e.g. "10000000") for XRP, or IOU object {currency, issuer, value:"..."} with value as string.`,
      );
    }
  };

  ["Amount", "SendMax", "DeliverMin", "LimitAmount"].forEach(checkAmountish);

  if ("Fee" in tx && !isUIntString(tx.Fee)) {
    throw new TxJsonParseError(`Invalid Fee. Must be drops as string (e.g. "12").`);
  }
};
