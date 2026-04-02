"use client";

import type { KeyboardEventHandler, MutableRefObject } from "react";
import type { TransactionSummary } from "@/types/transactions";
import { HoverTooltip } from "@/components/ui/HoverTooltip";
import { TOOLTIP_TEXTS } from "@/data/tooltipTexts";

type TxEditorProps = {
  accentKoreanClass: string;
  buttonBaseClass: string;
  buttonDisabledClass: string;
  girinSubmitButtonClass: string;
  historyButtonDisabled: boolean;
  isUsingGirinWallet: boolean;
  onOpenHistory: () => void;
  onChangeRawTx?: (value: string) => void;
  onChangeTxInput?: (value: string) => void;
  onKeyDownRawTx?: KeyboardEventHandler<HTMLTextAreaElement>;
  onKeyDownTxInput?: KeyboardEventHandler<HTMLTextAreaElement>;
  onSubmitTx: () => void;
  rawTx?: string;
  txInput?: string;
  txInputRef: MutableRefObject<HTMLTextAreaElement | null>;
  isSubmittingTx: boolean;
  txError: string | null;
  txResult: TransactionSummary | null;
  explorerBaseUrl?: string;
};

const noopKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = () => {};
const noopChange = (_value: string) => {};

export function TxEditor({
  accentKoreanClass,
  buttonBaseClass,
  buttonDisabledClass,
  girinSubmitButtonClass,
  historyButtonDisabled,
  isUsingGirinWallet,
  onOpenHistory,
  onChangeRawTx,
  onChangeTxInput,
  onKeyDownRawTx,
  onKeyDownTxInput,
  onSubmitTx,
  rawTx,
  txInput,
  txInputRef,
  isSubmittingTx,
  txError,
  txResult,
  explorerBaseUrl,
}: TxEditorProps) {
  const handleChange = onChangeRawTx ?? onChangeTxInput ?? noopChange;
  const handleKeyDown = onKeyDownRawTx ?? onKeyDownTxInput ?? noopKeyDown;
  const resolvedValue = rawTx ?? txInput ?? "";

  const historyButtonClass = `${buttonBaseClass} ${
    historyButtonDisabled ? buttonDisabledClass : ""
  } whitespace-nowrap`;
  const transactionSubmitButtonClass = `${isUsingGirinWallet ? girinSubmitButtonClass : buttonBaseClass} ${
    isSubmittingTx ? buttonDisabledClass : ""
  } self-start`;

  return (
    <section className="mt-2 flex-1 basis-0 min-w-0 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-5 shadow-lg shadow-black/40 backdrop-blur">
      <div className="min-w-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="sm:flex-2">
          <h2 className="text-2xl font-semibold text-white">Transaction Submit</h2>
          <p className={`mt-3 text-sm ${accentKoreanClass}`}>tx_json 데이터만 입력하세요.</p>
          <p className={`mt-1 text-sm whitespace-nowrap ${accentKoreanClass}`}>
            Account 필드가 비어 있으면 현재 연결된 지갑 주소가 자동으로 사용됩니다.
          </p>
        </div>

        <div className="min-w-0 flex sm:flex-col sm:items-end sm:justify-between sm:gap-4">
          <HoverTooltip text={TOOLTIP_TEXTS.txHistory}>
            <button
              type="button"
              onClick={onOpenHistory}
              disabled={historyButtonDisabled}
              className={historyButtonClass}
            >
              Transaction History
            </button>
          </HoverTooltip>
        </div>
      </div>

      <div className="min-w-0 flex flex-col gap-3 mt-4">
        <HoverTooltip text={TOOLTIP_TEXTS.txJsonEditor} maxWidth={760} interactive>
          <textarea
            ref={txInputRef}
            onKeyDown={handleKeyDown}
            value={resolvedValue}
            onChange={(event) => handleChange(event.target.value)}
            className="w-full min-h-[18rem] resize-y rounded-2xl border border-white/10 bg-black/40 px-5 py-6 font-mono text-sm text-white outline-none focus:border-white/40"
            spellCheck={false}
          />
        </HoverTooltip>
      </div>

      <div className="mt-4 min-w-0 flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
        <div className="md:flex-1 md:min-w-[400px]">
          {txError ? (
            <p className="w-full break-words text-base text-red-400 px-1 py-1 md:text-left">{txError}</p>
          ) : null}
        </div>
        <div className="flex justify-end md:-ml-15 md:min-w-[225px]">
          <HoverTooltip text={TOOLTIP_TEXTS.signAndSubmit}>
            <button
              type="button"
              onClick={onSubmitTx}
              disabled={isSubmittingTx}
              className={transactionSubmitButtonClass}
            >
              {isSubmittingTx ? "전송 중..." : isUsingGirinWallet ? "Submit via Girin Wallet" : "Transaction Submit"}
            </button>
          </HoverTooltip>
        </div>
      </div>
      {txResult ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 px-8 py-3 text-base text-slate-200">
          <p>
            TransactionResult:{" "}
            {typeof txResult.engineResult === "string" ? (
              <span
                className={`font-mono ${
                  txResult.engineResult === "tesSUCCESS" ? "text-[#66FF99]" : "text-red-400"
                }`}
              >
                {txResult.engineResult}
              </span>
            ) : (
              <span className="font-mono">-</span>
            )}
          </p>

          {txResult.engineResultMessage ? (
            <p className="mt-1">
              Message: <span className="font-mono">{txResult.engineResultMessage}</span>
            </p>
          ) : null}

          {txResult.hash ? (
            <p className="mt-1">
              Hash:{" "}
              {explorerBaseUrl ? (
                <a
                  href={`${explorerBaseUrl}/${txResult.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-[#D4FF9A] underline-offset-2 hover:underline"
                >
                  {txResult.hash}
                </a>
              ) : (
                <span className="break-all font-mono">{txResult.hash}</span>
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
