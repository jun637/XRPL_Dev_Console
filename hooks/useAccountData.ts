"use client";

import { useCallback, useEffect, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  AccountInfoAccountFlags,
  AccountInfoRequest,
  AccountInfoResponse,
  AccountLinesRequest,
  AccountLinesResponse,
  AccountObjectsRequest,
  AccountObjectsResponse,
  Client,
} from "xrpl";
import { parseAccountRootFlags } from "xrpl";
import type { AccountDataState, AccountSnapshot, MptHolding } from "@/types/account";
import { dropsToXrp, formatIssuedBalance, summarizeIssuedBalances } from "@/lib/xrpl/formatters";
import { getErrorMessage } from "@/lib/utils/errors";

type UseAccountDataArgs = {
  clientRef: MutableRefObject<Client | null>;
  account: string | null;
  autoRefreshEnabled: boolean;
};

export const useAccountData = ({
  clientRef,
  account,
  autoRefreshEnabled,
}: UseAccountDataArgs) => {
  const [accountInfo, setAccountInfo] = useState<AccountSnapshot | null>(null);
  const [accountLines, setAccountLines] = useState<AccountLinesResponse["result"]["lines"]>([]);
  const [mptHoldings, setMptHoldings] = useState<MptHolding[]>([]);
  const [accountState, setAccountState] = useState<AccountDataState>("idle");
  const [accountError, setAccountError] = useState<string | null>(null);

  const resetAccountState = useCallback(() => {
    setAccountInfo(null);
    setAccountLines([]);
    setMptHoldings([]);
    setAccountState("idle");
    setAccountError(null);
  }, []);

  const refreshAccountData = useCallback(
    async (accountOverride?: string | null) => {
      const client = clientRef.current;
      const targetAccount = accountOverride ?? account;
      if (!client || !targetAccount) {
        return;
      }

      setAccountState("loading");
      setAccountError(null);

      try {
        const [infoResponse, linesResponse, mptResponse] = await Promise.all([
          client.request<AccountInfoRequest>({
            command: "account_info",
            account: targetAccount,
            ledger_index: "validated",
          }),
          client.request<AccountLinesRequest>({
            command: "account_lines",
            account: targetAccount,
            ledger_index: "validated",
          }),
          client.request<AccountObjectsRequest>({
            command: "account_objects",
            account: targetAccount,
            type: "mptoken",
            ledger_index: "validated",
          }),
        ]);

        const infoResult = (infoResponse as AccountInfoResponse).result;
        const linesResult = (linesResponse as AccountLinesResponse).result;
        const objectsResult = (mptResponse as AccountObjectsResponse).result;
        const parsedHoldings: MptHolding[] = Array.isArray(objectsResult?.account_objects)
          ? objectsResult.account_objects
              .map((entry) => {
                if (
                  typeof entry !== "object" ||
                  entry === null ||
                  (entry as { LedgerEntryType?: unknown }).LedgerEntryType !== "MPToken"
                ) {
                  return null;
                }
                const issuanceId = typeof (entry as { MPTokenIssuanceID?: unknown }).MPTokenIssuanceID === "string"
                  ? (entry as { MPTokenIssuanceID: string }).MPTokenIssuanceID
                  : null;
                if (!issuanceId) {
                  return null;
                }
                const amountValue = (() => {
                  const raw = (entry as { MPTAmount?: unknown }).MPTAmount;
                  if (typeof raw === "string") {
                    return raw;
                  }
                  if (
                    raw &&
                    typeof raw === "object" &&
                    typeof (raw as { value?: unknown }).value === "string"
                  ) {
                    return (raw as { value: string }).value;
                  }
                  return "0";
                })();
                return {
                  issuanceId,
                  balance: amountValue,
                };
              })
              .filter((holding): holding is MptHolding => Boolean(holding))
          : [];

        const { iouTotal, mptTotal } = summarizeIssuedBalances(linesResult.lines);
        const parsedMptTotal =
          parsedHoldings.reduce((acc, holding) => acc + Number(holding.balance) || 0, 0) || mptTotal;

        setAccountInfo({
          balanceXrp: dropsToXrp(infoResult.account_data.Balance),
          iouBalance: formatIssuedBalance(iouTotal),
          mptBalance: formatIssuedBalance(parsedMptTotal),
          sequence: infoResult.account_data.Sequence,
          ownerCount: infoResult.account_data.OwnerCount,
          flags: parseAccountRootFlags(infoResult.account_data.Flags ?? 0) as Partial<AccountInfoAccountFlags>,
        });
        setAccountLines(linesResult.lines);
        setMptHoldings(parsedHoldings);
        setAccountState("ready");
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "data" in error &&
          (error as { data?: { error?: string } }).data?.error === "actNotFound"
        ) {
          setAccountInfo(null);
          setAccountLines([]);
          setAccountState("not_found");
          setAccountError("계정을 찾을 수 없습니다.");
          return;
        }

        setAccountInfo(null);
        setAccountLines([]);
        setMptHoldings([]);
        setAccountState("error");
        setAccountError(getErrorMessage(error, "계정 정보를 불러오는 데 실패했습니다."));
      }
    },
    [account, clientRef],
  );

  useEffect(() => {
    if (!account) {
      resetAccountState();
      return;
    }
    if (!autoRefreshEnabled) {
      return;
    }
    void refreshAccountData(account);
  }, [account, autoRefreshEnabled, refreshAccountData, resetAccountState]);

  return {
    accountInfo,
    accountLines,
    mptHoldings,
    accountState,
    accountError,
    refreshAccountData,
    resetAccountState,
  };
};
