import type { AccountLinesResponse } from "xrpl";
import type { AccountTransactionEntry } from "@/types/account";

const rippleEpoch = 946684800;

export const dropsToXrp = (drops: string): string => {
  const asNumber = Number(drops);
  if (Number.isNaN(asNumber)) {
    return "-";
  }
  return (asNumber / 1_000_000).toFixed(6);
};

export const summarizeIssuedBalances = (
  lines: AccountLinesResponse["result"]["lines"],
): { iouTotal: number; mptTotal: number } => {
  let iouTotal = 0;
  let mptTotal = 0;

  for (const line of lines) {
    const amount = Number(line.balance);
    if (Number.isNaN(amount)) {
      continue;
    }
    const issuanceId =
      (line as { mpt_issuance_id?: unknown }).mpt_issuance_id;
    if (typeof issuanceId === "string" && issuanceId.length > 0) {
      mptTotal += amount;
      continue;
    }

    const currency =
      typeof line.currency === "string" ? line.currency.toUpperCase() : "";
    if (currency) {
      iouTotal += amount;
    }
  }

  return { iouTotal, mptTotal };
};

export const formatIssuedBalance = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const fixed = value.toFixed(6);
  return fixed === "-0.000000" ? "0.000000" : fixed;
};

export const unixToRippleTime = (unix: number): number => unix - rippleEpoch;

// TransactionType별 Ripple Epoch 기준 시간 필드 화이트리스트
const RIPPLE_TIME_FIELDS: Record<string, readonly string[]> = {
  EscrowCreate: ["FinishAfter", "CancelAfter"],
  OfferCreate: ["Expiration"],
  CheckCreate: ["Expiration"],
  NFTokenCreateOffer: ["Expiration"],
  PaymentChannelCreate: ["CancelAfter"],
  PaymentChannelFund: ["Expiration"],
  CredentialCreate: ["Expiration"],
};

// 사용자가 UNIX 초로 입력한 시간 필드를 Ripple Epoch 기준으로 정규화한다.
// 이미 Ripple Epoch 값(작은 수)이면 건드리지 않아 이중 변환을 방지한다.
export const normalizeTxTimeFields = (tx: Record<string, unknown>): void => {
  const type = tx.TransactionType;
  if (typeof type !== "string") return;
  const fields = RIPPLE_TIME_FIELDS[type];
  if (!fields) return;
  for (const field of fields) {
    const v = tx[field];
    if (typeof v === "number" && v > rippleEpoch) {
      tx[field] = v - rippleEpoch;
    }
  }
};

export const formatRippleTimeKST = (raw: unknown): string => {
  if (typeof raw !== "number") return "-";
  const unixTime = raw + rippleEpoch;
  const date = new Date(unixTime * 1000);
  if (Number.isNaN(date.getTime())) return "-";

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const pick = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const yyyy = pick("year");
  const mm = pick("month").padStart(2, "0");
  const dd = pick("day").padStart(2, "0");
  const hh = pick("hour").padStart(2, "0");
  const mi = pick("minute").padStart(2, "0");
  const ss = pick("second").padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} KST`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getTxResult = (entry: AccountTransactionEntry): string | null => {
  const m = entry.meta as any;
  if (!m) return null;
  if (typeof m?.TransactionResult === "string") return m.TransactionResult;
  if (typeof m?.transaction_result === "string") return m.transaction_result;
  return null;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
