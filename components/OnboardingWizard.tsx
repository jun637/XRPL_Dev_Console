"use client";

import { useState, useCallback } from "react";

const ONBOARDING_DONE_KEY = "xrpltool:onboarding-completed";
const ONBOARDING_DEST = "rGpkyQwwSwig9SJZPzTEzJvbTjxdUFLTM5";

type OnboardingWizardProps = {
  onSelectNetwork: (network: "testnet") => void;
  onGenerateWallet: () => void;
  onFaucet: () => Promise<void>;
  onInsertTx: (tx: string) => void;
  onSubmitTx: () => Promise<void>;
  isFaucetLoading: boolean;
  faucetBalance: number | null;
  currentAccountAddress: string | null;
  isSubmittingTx: boolean;
  txResult: { engineResult: string | null; hash: string | null } | null;
  explorerBaseUrl?: string;
  onClose: () => void;
};

type Step = "welcome" | "wallet" | "transaction" | "complete";

const STEPS: Step[] = ["welcome", "wallet", "transaction", "complete"];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all ${
            s === current ? "w-6 bg-[#D4FF9A]" : "w-2 bg-white/25"
          }`}
        />
      ))}
    </div>
  );
}

export function OnboardingWizard({
  onSelectNetwork,
  onGenerateWallet,
  onFaucet,
  onInsertTx,
  onSubmitTx,
  isFaucetLoading,
  faucetBalance,
  currentAccountAddress,
  isSubmittingTx,
  txResult,
  explorerBaseUrl,
  onClose,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [walletCreated, setWalletCreated] = useState(false);
  const [faucetDone, setFaucetDone] = useState(false);
  const [txInserted, setTxInserted] = useState(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    } catch { /* ignore */ }
    onClose();
  }, [onClose]);

  const handleCreateWallet = useCallback(() => {
    onSelectNetwork("testnet");
    // Small delay to let network switch settle
    setTimeout(() => {
      onGenerateWallet();
      setWalletCreated(true);
    }, 300);
  }, [onSelectNetwork, onGenerateWallet]);

  const handleFaucet = useCallback(async () => {
    await onFaucet();
    setFaucetDone(true);
  }, [onFaucet]);

  const handleInsertAndSubmit = useCallback(() => {
    const tx = JSON.stringify(
      {
        TransactionType: "Payment",
        Destination: ONBOARDING_DEST,
        Amount: "1000000",
        Fee: "12",
      },
      null,
      2,
    );
    onInsertTx(tx);
    setTxInserted(true);
  }, [onInsertTx]);

  const handleSubmit = useCallback(async () => {
    await onSubmitTx();
    setStep("complete");
  }, [onSubmitTx]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-6 py-10"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-neutral-900 p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <StepIndicator current={step} />
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            건너뛰기
          </button>
        </div>

        {/* Step: Welcome */}
        {step === "welcome" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">
              XRPL Dev Console에 오신 것을 환영합니다
            </h2>
            <p className="text-[15px] leading-relaxed text-white/80">
              이 콘솔에서는 XRPL 네트워크에 직접 연결하여
              <br />지갑을 만들고, 트랜잭션을 작성하고, 전송 결과를 확인할 수 있습니다.
            </p>
            <p className="text-[15px] leading-relaxed text-white/80">
              지금부터 <strong className="text-white">3단계</strong>를 따라가며
              <br />첫 번째 XRPL 트랜잭션을 직접 전송해보겠습니다.
            </p>
            <button
              type="button"
              onClick={() => setStep("wallet")}
              className="mt-2 rounded-full bg-[#D4FF9A] px-8 py-2.5 text-sm font-bold text-black transition hover:bg-[#c5f080]"
            >
              시작하기
            </button>
          </div>
        )}

        {/* Step: Wallet */}
        {step === "wallet" && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white">
              Step 1. 지갑 생성 &amp; 테스트 XRP 받기
            </h2>
            <p className="text-[14px] leading-relaxed text-white/80">
              테스트넷에서 사용할 지갑을 생성하고,
              <br />Faucet으로 무료 테스트용 XRP를 받아보겠습니다.
            </p>

            {/* Create Wallet */}
            <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">1. 지갑 생성</span>
                {walletCreated ? (
                  <span className="text-xs text-[#D4FF9A] font-semibold">완료</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateWallet}
                    className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
                  >
                    지갑 생성하기
                  </button>
                )}
              </div>
              {currentAccountAddress && (
                <p className="break-all text-xs font-mono text-[#D4FF9A]">
                  {currentAccountAddress}
                </p>
              )}
            </div>

            {/* Faucet */}
            <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">2. 테스트 XRP 받기</span>
                {faucetDone && faucetBalance ? (
                  <span className="text-xs text-[#D4FF9A] font-semibold">
                    {faucetBalance} XRP 수령 완료
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleFaucet}
                    disabled={!walletCreated || isFaucetLoading}
                    className={`rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 ${
                      !walletCreated || isFaucetLoading ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    {isFaucetLoading ? "요청 중..." : "Faucet 받기"}
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("transaction")}
              disabled={!faucetDone || !faucetBalance}
              className={`mt-2 rounded-full bg-[#D4FF9A] px-8 py-2.5 text-sm font-bold text-black transition hover:bg-[#c5f080] ${
                !faucetDone || !faucetBalance ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              다음
            </button>
          </div>
        )}

        {/* Step: Transaction */}
        {step === "transaction" && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-white">
              Step 2. 첫 트랜잭션 전송하기
            </h2>
            <p className="text-[14px] leading-relaxed text-white/80">
              1 XRP를 전송하는 Payment 트랜잭션을 실행해보겠습니다.
              <br />아래 버튼을 누르면 트랜잭션 JSON이 에디터에 자동 입력됩니다.
            </p>

            {/* TX Preview */}
            <div className="rounded-xl border border-white/10 bg-black/50 px-5 py-4">
              <pre className="text-xs font-mono leading-relaxed text-white/80">{`{
  "TransactionType": "Payment",
  "Destination": "${ONBOARDING_DEST}",
  "Amount": "1000000",
  "Fee": "12"
}`}</pre>
            </div>

            <div className="flex items-center gap-3">
              {!txInserted ? (
                <button
                  type="button"
                  onClick={handleInsertAndSubmit}
                  className="rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
                >
                  에디터에 입력하기
                </button>
              ) : !txResult ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmittingTx}
                  className={`rounded-full bg-[#D4FF9A] px-5 py-2 text-sm font-bold text-black transition hover:bg-[#c5f080] ${
                    isSubmittingTx ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmittingTx ? "전송 중..." : "트랜잭션 전송"}
                </button>
              ) : (
                <span className="text-sm text-[#D4FF9A] font-semibold">전송 완료!</span>
              )}
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">
              첫 XRPL 트랜잭션을 완료했습니다! 🎉
            </h2>
            <p className="text-[15px] leading-relaxed text-white/80">
              방금 테스트넷에서 1 XRP를 전송하는 Payment 트랜잭션을
              <br />직접 작성하고 네트워크에 제출했습니다.
            </p>

            {txResult?.hash && (
              <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-4 space-y-2">
                <p className="text-xs text-white/60">Transaction Hash</p>
                {explorerBaseUrl ? (
                  <a
                    href={`${explorerBaseUrl}/${txResult.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block break-all text-sm font-mono text-[#D4FF9A] underline-offset-2 hover:underline"
                  >
                    {txResult.hash}
                  </a>
                ) : (
                  <p className="break-all text-sm font-mono text-[#D4FF9A]">{txResult.hash}</p>
                )}
                <p className="text-xs text-white/50">
                  위 링크를 클릭하면 XRPL Explorer에서 트랜잭션 상세 내역을 확인할 수 있습니다.
                </p>
              </div>
            )}

            <p className="text-[14px] leading-relaxed text-white/70">
              이제 좌측 사이드바의 <strong className="text-white">Transaction Library</strong>에서
              <br />다양한 트랜잭션 타입을 시도해보세요.
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="mt-2 rounded-full bg-[#D4FF9A] px-8 py-2.5 text-sm font-bold text-black transition hover:bg-[#c5f080]"
            >
              콘솔 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Check if onboarding has been completed before. */
export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_DONE_KEY) === "true";
  } catch {
    return false;
  }
}
