"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Client, Wallet } from "xrpl";
import type { SubmittableTransaction } from "xrpl";
import type { ScenarioDef, ScenarioStep, WalletRole } from "@/data/scenarios/types";
import { createXRPLClient } from "@/lib/xrpl/client";
import { getNetworkConfig } from "@/lib/xrpl/constants";
import { NETWORK_EXPLORER_BASES } from "@/lib/xrpl/networkMeta";
import { getErrorMessage } from "@/lib/utils/errors";

type ScenarioWizardProps = {
  scenario: ScenarioDef;
  onClose: () => void;
};

type WalletEntry = {
  wallet: Wallet;
  funded: boolean;
};

type TxRecord = {
  hash: string | null;
  result: string | null;
  sequence?: number;
};

function StepIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current ? "w-6 bg-[#D4FF9A]" : i < current ? "w-2 bg-[#D4FF9A]/50" : "w-2 bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

// Convert Ripple epoch offset
const RIPPLE_EPOCH_OFFSET = 946684800;

export function ScenarioWizard({ scenario, onClose }: ScenarioWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [wallets, setWallets] = useState<Record<string, WalletEntry>>({});
  const [txRecords, setTxRecords] = useState<TxRecord[]>([]);
  const [mptIssuanceId, setMptIssuanceId] = useState<string | null>(null);
  const [credentialHash, setCredentialHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const explorerBase = NETWORK_EXPLORER_BASES.testnet;

  const step = scenario.steps[stepIndex];
  const isLastStep = stepIndex === scenario.steps.length - 1;

  // Connect to testnet on mount
  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      const config = getNetworkConfig("testnet");
      const client = createXRPLClient(config);
      try {
        await client.connect();
        if (!cancelled) clientRef.current = client;
      } catch {
        if (!cancelled) setError("Testnet 연결에 실패했습니다.");
      }
    };
    void connect();
    return () => {
      cancelled = true;
      if (clientRef.current) {
        void clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, []);

  const getWalletAddresses = useCallback((): Record<string, string> => {
    const addrs: Record<string, string> = {};
    for (const [role, entry] of Object.entries(wallets)) {
      addrs[role] = entry.wallet.classicAddress;
    }
    return addrs;
  }, [wallets]);

  const handleCreateWallet = useCallback(async (role: WalletRole) => {
    const client = clientRef.current;
    if (!client) {
      setError("XRPL 네트워크에 연결되어 있지 않습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newWallet = Wallet.generate();
      const result = await client.fundWallet(newWallet);
      setWallets((prev) => ({
        ...prev,
        [role]: { wallet: result.wallet, funded: true },
      }));
    } catch (e) {
      setError(getErrorMessage(e, "지갑 생성/Faucet에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitTx = useCallback(async (stepDef: ScenarioStep) => {
    if (stepDef.type !== "tx") return;

    const client = clientRef.current;
    if (!client) {
      setError("XRPL 네트워크에 연결되어 있지 않습니다.");
      return;
    }

    const roleWallet = wallets[stepDef.role];
    if (!roleWallet) {
      setError(`${stepDef.role} 지갑이 생성되지 않았습니다.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const addrs = getWalletAddresses();
      const txObj = stepDef.buildTx(addrs);

      // Replace placeholders
      const txStr = JSON.stringify(txObj)
        .replace(/"__MPT_ISSUANCE_ID__"/g, () => {
          if (!mptIssuanceId) throw new Error("MPT Issuance ID가 아직 생성되지 않았습니다. 이전 스텝을 먼저 완료해주세요.");
          return `"${mptIssuanceId}"`;
        })
        .replace(/"__ESCROW_SEQUENCE__"/g, () => {
          const lastEscrowTx = txRecords.find((r) => r.sequence !== undefined);
          return lastEscrowTx?.sequence?.toString() ?? "0";
        })
        .replace(/"__RIPPLE_TIME_PLUS_10__"/g, () => {
          return String(Math.floor(Date.now() / 1000) - RIPPLE_EPOCH_OFFSET + 10);
        })
        .replace(/"__CREDENTIAL_HASH__"/g, () => {
          if (!credentialHash) throw new Error("Credential 해시가 아직 생성되지 않았습니다. 이전 스텝을 먼저 완료해주세요.");
          return `"${credentialHash}"`;
        });

      const parsed = JSON.parse(txStr);
      const prepared = await client.autofill(parsed as SubmittableTransaction);
      const resp = await client.submitAndWait(prepared, { wallet: roleWallet.wallet });

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const top: any = (resp as any)?.result ?? resp ?? {};
      const meta: any = top.meta ?? {};
      const tx: any = top.tx_json ?? top.tx ?? {};

      const engineResult: string | null =
        typeof meta.TransactionResult === "string" ? meta.TransactionResult : null;
      const hash: string | null =
        typeof tx.hash === "string" ? tx.hash : typeof top.hash === "string" ? top.hash : null;

      // Capture sequence for EscrowFinish
      const sequence = typeof prepared.Sequence === "number" ? prepared.Sequence : undefined;

      // Capture MPTokenIssuanceID from response
      if (parsed.TransactionType === "MPTokenIssuanceCreate") {
        let capturedId: string | null = null;

        // Try top-level mpt_issuance_id
        if (typeof meta.mpt_issuance_id === "string") {
          capturedId = meta.mpt_issuance_id;
        }
        // Try tx_json
        if (!capturedId && typeof tx.MPTokenIssuanceID === "string") {
          capturedId = tx.MPTokenIssuanceID;
        }
        // Try AffectedNodes
        if (!capturedId) {
          const nodes = meta.AffectedNodes ?? [];
          for (const node of nodes) {
            const created = node.CreatedNode;
            if (created?.LedgerEntryType === "MPTokenIssuance") {
              capturedId = created.NewFields?.MPTokenIssuanceID ?? created.LedgerIndex ?? null;
              if (capturedId) break;
            }
          }
        }
        // Build from account + sequence as fallback (MPTokenIssuanceID = account + sequence hex)
        if (!capturedId && hash) {
          // Try to get from a second request
          try {
            const txResp = await client.request({ command: "tx", transaction: hash });
            const txResult2: any = (txResp as any)?.result ?? {};
            const meta2: any = txResult2.meta ?? {};
            if (typeof meta2.mpt_issuance_id === "string") {
              capturedId = meta2.mpt_issuance_id;
            }
            if (!capturedId) {
              const nodes2 = meta2.AffectedNodes ?? [];
              for (const node of nodes2) {
                const created = node.CreatedNode;
                if (created?.LedgerEntryType === "MPTokenIssuance") {
                  capturedId = created.NewFields?.MPTokenIssuanceID ?? created.LedgerIndex ?? null;
                  if (capturedId) break;
                }
              }
            }
          } catch {
            // ignore retry error
          }
        }

        if (capturedId) {
          setMptIssuanceId(capturedId);
        }
      }
      // Capture Credential ledger index from CredentialCreate
      if (parsed.TransactionType === "CredentialCreate") {
        const nodes = meta.AffectedNodes ?? [];
        for (const node of nodes) {
          const created = node.CreatedNode;
          if (created?.LedgerEntryType === "Credential") {
            const idx = created.LedgerIndex;
            if (typeof idx === "string") setCredentialHash(idx);
            break;
          }
        }
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setTxRecords((prev) => [...prev, { hash, result: engineResult, sequence }]);
    } catch (e) {
      if (stepDef.expectFailure) {
        // Expected failure — record it and allow proceeding
        const errMsg = getErrorMessage(e, "트랜잭션이 거부되었습니다.");
        setTxRecords((prev) => [...prev, { hash: null, result: errMsg, sequence: undefined }]);
      } else {
        setError(getErrorMessage(e, "트랜잭션 전송에 실패했습니다."));
      }
    } finally {
      setLoading(false);
    }
  }, [wallets, getWalletAddresses, mptIssuanceId, credentialHash, txRecords]);

  const currentTxIndex = scenario.steps.slice(0, stepIndex + 1).filter((s) => s.type === "tx").length - 1;
  const currentTxRecord = step?.type === "tx" && currentTxIndex >= 0 ? txRecords[currentTxIndex] : null;
  const canProceed = (() => {
    if (!step) return false;
    switch (step.type) {
      case "info":
        return true;
      case "wallet":
        return !!wallets[step.role]?.funded;
      case "tx":
        return !!currentTxRecord;
      case "complete":
        return true;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-6 py-10"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900 p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <StepIndicator total={scenario.steps.length} current={stepIndex} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>
        <p className="text-center text-xs text-white/40 mb-6">{scenario.title}</p>

        {/* Step Content */}
        {step?.type === "info" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{step.title}</h2>
            <div className="text-[14px] leading-relaxed text-white/80">{step.content}</div>
          </div>
        )}

        {step?.type === "wallet" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{step.label} 생성</h2>
            {step.description && (
              <p className="text-sm text-white/60">{step.description}</p>
            )}
            <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">{step.label}</span>
                {wallets[step.role]?.funded ? (
                  <span className="text-xs text-[#D4FF9A] font-semibold">생성 완료</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCreateWallet(step.role)}
                    disabled={loading}
                    className={`rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 ${
                      loading ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "생성 중..." : "생성 + Faucet"}
                  </button>
                )}
              </div>
              {wallets[step.role] && (
                <p className="break-all text-xs font-mono text-[#D4FF9A]">
                  {wallets[step.role].wallet.classicAddress}
                </p>
              )}
            </div>
          </div>
        )}

        {step?.type === "tx" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">{step.title}</h2>
            <div className="text-[13px] leading-relaxed text-white/80">{step.explanation}</div>

            {/* TX Preview */}
            <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
              <pre className="text-[11px] font-mono leading-relaxed text-white/70 overflow-x-auto">
                {JSON.stringify(step.buildTx(getWalletAddresses()), null, 2)
                  .replace(/"__MPT_ISSUANCE_ID__"/g, mptIssuanceId ? `"${mptIssuanceId}"` : '"(자동 입력됨)"')
                  .replace(/"__ESCROW_SEQUENCE__"/g, () => {
                    const seq = txRecords.find((r) => r.sequence !== undefined)?.sequence;
                    return seq?.toString() ?? '"(자동 입력됨)"';
                  })
                  .replace(/"__RIPPLE_TIME_PLUS_10__"/g, '"(현재시각 + 10초)"')
                  .replace(/"__CREDENTIAL_HASH__"/g, credentialHash ? `"${credentialHash}"` : '"(자동 입력됨)"')
                }
              </pre>
            </div>

            <div className="flex items-center gap-3">
              {!currentTxRecord ? (
                <button
                  type="button"
                  onClick={() => handleSubmitTx(step)}
                  disabled={loading}
                  className={`rounded-full bg-[#D4FF9A] px-5 py-2 text-sm font-bold text-black transition hover:bg-[#c5f080] ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "전송 중..." : "트랜잭션 전송"}
                </button>
              ) : (
                <div className="space-y-1">
                  {step.expectFailure && currentTxRecord.result !== "tesSUCCESS" && (
                    <p className="text-xs text-amber-400 font-semibold mb-1">
                      ⚠ 예상된 실패입니다 — 인증 없이는 거래가 거부됩니다.
                    </p>
                  )}
                  <p className="text-sm font-semibold">
                    결과:{" "}
                    <span className={currentTxRecord.result === "tesSUCCESS" ? "text-[#66FF99]" : "text-red-400"}>
                      {currentTxRecord.result ?? "unknown"}
                    </span>
                  </p>
                  {currentTxRecord.hash && explorerBase && (
                    <a
                      href={`${explorerBase}/${currentTxRecord.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-xs font-mono text-[#D4FF9A] underline-offset-2 hover:underline"
                    >
                      {currentTxRecord.hash}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step?.type === "complete" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">시나리오 완료 🎉</h2>
            <div className="text-[14px] leading-relaxed text-white/80">{step.summary}</div>

            {txRecords.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 space-y-2">
                <p className="text-xs text-white/50 font-semibold">실행된 트랜잭션</p>
                {txRecords.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={r.result === "tesSUCCESS" ? "text-[#66FF99]" : "text-red-400"}>
                      {r.result ?? "-"}
                    </span>
                    {r.hash && explorerBase ? (
                      <a
                        href={`${explorerBase}/${r.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[#D4FF9A] truncate max-w-[300px] underline-offset-2 hover:underline"
                      >
                        {r.hash}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full bg-[#D4FF9A] px-8 py-2.5 text-sm font-bold text-black transition hover:bg-[#c5f080]"
            >
              콘솔로 돌아가기
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        {/* Navigation */}
        {!isLastStep && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setStepIndex((i) => Math.max(0, i - 1)); setError(null); }}
              disabled={stepIndex === 0}
              className={`rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/20 ${
                stepIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => { setStepIndex((i) => Math.min(scenario.steps.length - 1, i + 1)); setError(null); }}
              disabled={!canProceed}
              className={`rounded-full bg-[#D4FF9A] px-6 py-1.5 text-xs font-bold text-black transition hover:bg-[#c5f080] ${
                !canProceed ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
