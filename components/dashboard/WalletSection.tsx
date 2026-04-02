"use client";

import { useState } from "react";
import type { Wallet } from "xrpl";
import { ConnectDropdownButton } from "@/components/dashboard/ConnectDropdownButton";
import type { AccountDataState, AccountSnapshot } from "@/types/account";
import { HoverTooltip } from "@/components/ui/HoverTooltip";
import { TOOLTIP_TEXTS } from "@/data/tooltipTexts";

type GirinState = {
  available: boolean;
  connecting: boolean;
  connected: boolean;
};

type WalletSectionProps = {
  buttonBaseClass: string;
  buttonDisabledClass: string;
  smallButtonClass: string;
  accentKoreanClass: string;
  girinState: GirinState;
  onCreateWallet: () => void;
  onLoadWallet: () => void;
  onConnectGirin?: () => void;
  onOpenSavedWalletModal: () => void;
  onFaucet: () => void;
  isFaucetLoading: boolean;
  isFaucetDisabled: boolean;
  wallet: Wallet | null;
  walletMessage: string | null;
  walletError: string | null;
  faucetError: string | null;
  currentAccountAddress: string | null;
  isUsingGirinWallet: boolean;
  accountState: AccountDataState;
  accountInfo: AccountSnapshot | null;
  accountError: string | null;
  onRefreshAccount: () => void;
  onOpenSaveModal: () => void;
  onOpenFlagsModal: () => void;
  onOpenTrustlinesModal: () => void;
  onOpenIouBalancesModal: () => void;
  onOpenMptBalancesModal: () => void;
  hasAccountLines: boolean;
  hasMptHoldings: boolean;
  faucetBalance: number | null;
};

export function WalletSection({
  buttonBaseClass,
  buttonDisabledClass,
  smallButtonClass,
  accentKoreanClass,
  girinState,
  onCreateWallet,
  onLoadWallet,
  onConnectGirin,
  onOpenSavedWalletModal,
  onFaucet,
  isFaucetLoading,
  isFaucetDisabled,
  wallet,
  walletMessage,
  walletError,
  faucetError,
  currentAccountAddress,
  isUsingGirinWallet,
  accountState,
  accountInfo,
  accountError,
  onRefreshAccount,
  onOpenSaveModal,
  onOpenFlagsModal,
  onOpenTrustlinesModal,
  onOpenIouBalancesModal,
  onOpenMptBalancesModal,
  hasAccountLines,
  hasMptHoldings,
  faucetBalance,
}: WalletSectionProps) {
  const [seedVisible, setSeedVisible] = useState(false);
  const connectWalletButtonClass = `${buttonBaseClass} whitespace-nowrap px-5 md:px-6`;
  const faucetButtonClass = `${buttonBaseClass} whitespace-nowrap px-5 md:px-6 ${
    isFaucetDisabled ? buttonDisabledClass : ""
  }`.trim();

  return (
    <section className="mt-2 flex-1 basis-0 min-w-0 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/10 px-5 py-5 shadow-lg shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start md:gap-17">
        <h2 className="text-left text-2xl font-semibold text-white md:self-start md:ml-2">
          Wallet
        </h2>
        <div className="flex flex-wrap items-center justify-start gap-3 md:flex-nowrap md:ml-11">
          <HoverTooltip text={TOOLTIP_TEXTS.connectWallet}>
            <ConnectDropdownButton
              onCreate={onCreateWallet}
              onLoad={onLoadWallet}
              onGirin={onConnectGirin}
              girinState={girinState}
              className={connectWalletButtonClass}
            />
          </HoverTooltip>
          <HoverTooltip text={TOOLTIP_TEXTS.savedWallet}>
            <button
              type="button"
              className={connectWalletButtonClass}
              onClick={onOpenSavedWalletModal}
            >
              Saved Wallet
            </button>
          </HoverTooltip>
          <HoverTooltip text={TOOLTIP_TEXTS.faucet}>
            <button
              type="button"
              onClick={onFaucet}
              disabled={isFaucetDisabled}
              className={faucetButtonClass}
            >
              {isFaucetLoading ? "요청 중..." : "Faucet"}
            </button>
          </HoverTooltip>
        </div>
      </div>

      {walletMessage ? <p className={`text-base ${accentKoreanClass}`}>{walletMessage}</p> : null}
      {walletError ? <p className="text-base text-red-400">{walletError}</p> : null}
      {faucetError ? <p className="text-base text-red-400">{faucetError}</p> : null}

      {currentAccountAddress ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
          <div>
            <HoverTooltip text={TOOLTIP_TEXTS.walletAddress}>
              <p className="text-xs uppercase tracking-wide text-white cursor-help">Current Wallet</p>
            </HoverTooltip>
            <p className="break-all text-sm text-[#D4FF9A]">{currentAccountAddress}</p>
          </div>
          {!isUsingGirinWallet && wallet ? (
            <>
              <div>
                <HoverTooltip text={TOOLTIP_TEXTS.publicKey}>
                  <p className="text-xs uppercase tracking-wide text-white cursor-help">Public Key</p>
                </HoverTooltip>
                <p className="break-all text-sm text-[#C6F4FF]">{wallet.publicKey}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <HoverTooltip text={TOOLTIP_TEXTS.seed}>
                    <p className="text-xs uppercase tracking-wide text-white cursor-help">Seed</p>
                  </HoverTooltip>
                  <button
                    type="button"
                    onClick={() => setSeedVisible((v) => !v)}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/70 transition hover:bg-white/20 hover:text-white"
                  >
                    {seedVisible ? "숨기기" : "보기"}
                  </button>
                </div>
                <p className="break-all text-sm text-[#FFB788]">
                  {seedVisible ? wallet.seed : "●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"}
                </p>
              </div>
            </>
          ) : null}
          {isUsingGirinWallet ? (
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
              Girin Wallet 연결 시 Public Key 및 Seed 정보는 제공되지 않습니다.
            </div>
          ) : null}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-semibold text-white">Account Info</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={smallButtonClass}
                  onClick={onRefreshAccount}
                  disabled={!currentAccountAddress}
                >
                  Refresh
                </button>
                <HoverTooltip text={TOOLTIP_TEXTS.saveWallet}>
                  <button
                    type="button"
                    onClick={onOpenSaveModal}
                    disabled={!wallet}
                    className={`${smallButtonClass} ${wallet ? "" : "opacity-40 cursor-not-allowed"}`}
                  >
                    Save Wallet
                  </button>
                </HoverTooltip>
                <HoverTooltip text={TOOLTIP_TEXTS.flags}>
                  <button
                    type="button"
                    onClick={onOpenFlagsModal}
                    className={`${smallButtonClass} ${
                      currentAccountAddress ? "" : "opacity-40 cursor-not-allowed"
                    }`}
                    disabled={!currentAccountAddress}
                  >
                    Flags
                  </button>
                </HoverTooltip>
                <HoverTooltip text={TOOLTIP_TEXTS.trustline}>
                  <button
                    type="button"
                    onClick={onOpenTrustlinesModal}
                    className={`${smallButtonClass} ${
                      currentAccountAddress ? "" : "opacity-40 cursor-not-allowed"
                    }`}
                    disabled={!currentAccountAddress}
                  >
                    Trustline
                  </button>
                </HoverTooltip>
              </div>
            </div>
            {accountState === "idle" ? (
              <p className={`mt-2 text-base ${accentKoreanClass}`}>지갑 연결 후 정보를 불러올 수 있습니다.</p>
            ) : null}
            {accountState === "loading" ? (
              <p className={`mt-2 text-base ${accentKoreanClass}`}>로딩 중...</p>
            ) : null}
            {accountState === "not_found" ? (
              <p className={`mt-2 text-base ${accentKoreanClass}`}>계정이 아직 활성화되지 않았습니다.</p>
            ) : null}
            {accountState === "error" && accountError ? (
              <p className="mt-2 text-base text-red-400">{accountError}</p>
            ) : null}
            {accountState === "ready" && accountInfo ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <HoverTooltip text={TOOLTIP_TEXTS.xrpBalance}>
                    <dt className="text-sm text-white cursor-help">XRP Balance</dt>
                  </HoverTooltip>
                  <dd className="font-mono text-sm text-[#FFB3F9]">{accountInfo.balanceXrp}</dd>
                </div>
                <div>
                  <HoverTooltip text={TOOLTIP_TEXTS.iouBalance}>
                    <dt className="text-sm text-white cursor-help">IOU Balance</dt>
                  </HoverTooltip>
                  <dd className="font-mono text-sm text-[#FFB3F9]">
                    <button
                      type="button"
                      onClick={onOpenIouBalancesModal}
                      disabled={!hasAccountLines}
                      className={`${smallButtonClass} px-3 py-1 text-[11px] font-semibold ${
                        hasAccountLines ? "" : "cursor-not-allowed opacity-40"
                      }`}
                    >
                      View
                    </button>
                  </dd>
                </div>
                <div>
                  <HoverTooltip text={TOOLTIP_TEXTS.mptBalance}>
                    <dt className="text-sm text-white cursor-help">MPT Balance</dt>
                  </HoverTooltip>
                  <dd className="font-mono text-sm text-[#FFB3F9]">
                    <button
                      type="button"
                      onClick={onOpenMptBalancesModal}
                      disabled={!hasMptHoldings}
                      className={`${smallButtonClass} px-3 py-1 text-[11px] font-semibold ${
                        hasMptHoldings ? "" : "cursor-not-allowed opacity-40"
                      }`}
                    >
                      View
                    </button>
                  </dd>
                </div>
                <div>
                  <HoverTooltip text={TOOLTIP_TEXTS.sequence}>
                    <dt className="text-sm text-white cursor-help">Sequence</dt>
                  </HoverTooltip>
                  <dd className="font-mono text-sm text-[#FFB3F9]">{accountInfo.sequence}</dd>
                </div>
                <div>
                  <HoverTooltip text={TOOLTIP_TEXTS.ownerCount}>
                    <dt className="text-sm text-white cursor-help">Owner Count</dt>
                  </HoverTooltip>
                  <dd className="font-mono text-sm text-[#FFB3F9]">{accountInfo.ownerCount ?? "-"}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </div>
      ) : (
        <p className={`text-base ${accentKoreanClass}`}>
          아직 지갑이 없습니다. &ldquo;Connect Wallet&rdquo; 또는 &ldquo;Saved Wallet&rdquo; 버튼을 클릭해 지갑을 연결하세요.
        </p>
      )}

      {faucetBalance ? (
        <div className={`rounded-2xl border border-white/10 bg-black/40 px-8 py-3 text-base ${accentKoreanClass}`}>
          Faucet 요청 후 현재 잔액: <span className="font-mono">{faucetBalance} XRP</span>
        </div>
      ) : null}
    </section>
  );
}
