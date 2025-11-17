"use client";
import { useEffect, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { withBasePath } from "@/lib/utils/basePath";
import '../app/globals.css';

const pretty = (obj: unknown) => JSON.stringify(obj, null, 2);

type MarkdownTooltipState = {
  content: string;
  loading: boolean;
  error: string | null;
};

const prefixAssetUrl = (url?: string) =>
  url && url.startsWith("/") ? withBasePath(url) : url;

const markdownComponents = {
  a: ({
    node: _node,
    href,
    ...props
  }: ComponentProps<"a"> & { node?: unknown }) => {
    const patchedHref =
      typeof href === "string" ? prefixAssetUrl(href) : href;
    return (
      <a
        {...props}
        href={patchedHref}
        target="_blank"
        rel="noreferrer"
      />
    );
  },
  img: ({
    node: _node,
    src,
    ...props
  }: ComponentProps<"img"> & { node?: unknown }) => {
    const patchedSrc = typeof src === "string" ? prefixAssetUrl(src) : src;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={patchedSrc} />;
  },
};

const MARKDOWN_TOOLTIP_CLASS =
  "markdown-tooltip space-y-8 text-[15px] leading-relaxed text-white/90 [&_*]:text-white/90 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-[#D4FF9A] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:text-lg [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-white/80 [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-white/30 [&_blockquote]:pl-4 [&_blockquote]:text-white [&_ul]:space-y-1 [&_li]:marker:text-[#D4FF9A] [&_a]:text-[#D4FF9A] [&_a]:underline [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-3";

const TOOLTIP_OVERLAY_CLASS =
  "pointer-events-none absolute right-0 top-full z-100 mt-2 w-[min(1000px,60vw)] max-w-[1000px] h-[600px] max-h-[800px] overflow-y-auto rounded-2xl border border-white/15 bg-neutral-800 p-4 text-left text-xs leading-relaxed text-white/90 opacity-0 shadow-xl transition-opacity duration-150 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100";

const useMarkdownTooltip = (path: string): MarkdownTooltipState => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMarkdown = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(withBasePath(path), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load ${path} (${response.status})`);
        }
        const text = await response.text();
        if (!cancelled) {
          setContent(text);
        }
      } catch {
        if (!cancelled) {
          setError("툴팁 내용을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { content, loading, error };
};

const MarkdownTooltipPanel = ({
  state,
  emptyMessage,
}: {
  state: MarkdownTooltipState;
  emptyMessage: string;
}) => {
  if (state.loading) {
    return <p className="text-sm text-white/70">Markdown 내용을 불러오는 중입니다…</p>;
  }
  if (state.error) {
    return <p className="text-sm text-red-300">{state.error}</p>;
  }
  if (state.content.trim().length > 0) {
    return (
      <div className="rounded-2xl border border-white/20 bg-black/90 p-4 shadow-inner">
        <div className="max-h-[520px] overflow-y-auto rounded-xl border border-white/10 bg-black/95 p-4">
          <div className={MARKDOWN_TOOLTIP_CLASS}>
            <ReactMarkdown components={markdownComponents}>{state.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  return <div className="text-sm text-white/70">{emptyMessage}</div>;
};

//사이드바 구성 항목 타입 정의
export type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onInsertTx: (txJson: string, mode?: "replace" | "append") => void;
  context?: {
    networkKey?: string;
    walletAddress?: string;
    lastTxHash?: string | null;
  };
};
// Transaction Library에 사용될 트랜잭션 Recipe 타입 정의
type Recipe = {
  id: string;
  title: string;
  isMainnetActive: boolean;
  build: (ctx?: SidebarProps["context"]) => Record<string, unknown>;
};
// 27 ~ 466 - Tx Library Recipe 배열 
const RECIPES: Recipe[] = [
  // ─────────────────────────────
  // Payment
  // ─────────────────────────────
  {
    id: "payment-xrp",
    title: "Payment (XRP)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "보내는 주소",
      Destination: "받는 주소",
      Amount: "XRP drops 문자열 (예: '1000000')",
      DestinationTag: "수취자 태그 (옵션)"
    }),
  },
  {
    id: "payment-iou",
    title: "Payment (IOU)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "보내는 주소",
      Destination: "받는 주소",
      Amount: { currency: "토큰코드", issuer: "발행자 주소", value: "수량" },
    }),
  },
  {
    id: "payment-mpt",
    title: "Payment (MPT)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "보내는 주소",
      Destination: "받는 주소",
      Amount: { currency: "MPT코드", issuer: "발행자 주소", value: "수량" },
      SendMax: { currency: "최대 지불 MPT", issuer: "발행자 주소", value: "수량 (옵션)" },
      Paths: "경로 지정 배열 (옵션)",
      DeliverMin: { currency: "최소 수령 MPT", issuer: "발행자 주소", value: "수량 (옵션)" },
      DestinationTag: "수취자 태그 (옵션)",
      InvoiceID: "64바이트 hex (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-amm-swap",
    title: "Payment (AMM Swap)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "스왑 실행 계정",
      Destination: "수취자 주소(본인 가능)",
      SendMax: { currency: "입력자산", issuer: "입력자산 발행자", value: "최대 지불" },
      Amount: { currency: "출력자산", issuer: "출력자산 발행자", value: "원하는 수량" },
      DeliverMin: { currency: "출력자산", issuer: "출력자산 발행자", value: "최소 수령 (옵션)" },
      Paths: "AMM 경유 경로 배열 (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      InvoiceID: "64바이트 hex (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Account / Trust
  // ─────────────────────────────
  {
    id: "accountset",
    title: "AccountSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AccountSet",
      Account: "계정 주소",
      SetFlag: "설정할 플래그 번호 (옵션)",
      ClearFlag: "해제할 플래그 번호 (옵션)",
    }),
  },
  {
    id: "accountdelete",
    title: "AccountDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AccountDelete",
      Account: "삭제할 계정 주소",
      Destination: "잔액을 받을 주소"
    }),
  },
  {
    id: "trustset",
    title: "TrustSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "TrustSet",
      Account: "설정 계정 주소",
      LimitAmount: { currency: "토큰코드", issuer: "발행자 주소", value: "한도" }
    }),
  },

  // ─────────────────────────────
  // DEX (Offer)
  // ─────────────────────────────
  {
    id: "offercreate-permissioned",
    title: "OfferCreate (Permissioned)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "OfferCreate",
      Account: "오퍼 제출 계정",
      TakerGets: { currency: "내주는 자산", issuer: "발행자", value: "수량" },
      TakerPays: { currency: "받는 자산", issuer: "발행자", value: "수량" },
      DomainID: "Permissioned DEX 도메인 ID",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "offercreate-general",
    title: "OfferCreate (General)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OfferCreate",
      Account: "오퍼 제출 계정",
      TakerGets: "XRP drops 문자열 또는 IOU 객체",
      TakerPays: "XRP drops 문자열 또는 IOU 객체",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "offercancel",
    title: "OfferCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OfferCancel",
      Account: "계정 주소",
      OfferSequence: "취소할 오퍼의 시퀀스",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Escrow
  // ─────────────────────────────
  {
    id: "escrowcreate-xrp",
    title: "EscrowCreate (XRP)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: "에스크로 생성 계정",
      Destination: "수취자 주소",
      Amount: "XRP drops 문자열",
      FinishAfter: "해당 시간 이후 완료 가능(UNIX) (옵션)",
      CancelAfter: "해당 시간 이후 취소 가능(UNIX) (옵션)",
      Condition: "PREIMAGE-SHA-256 조건(hex) (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowcreate-iou",
    title: "EscrowCreate (IOU)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: "에스크로 생성 계정",
      Destination: "수취자 주소",
      Amount: { currency: "토큰코드", issuer: "발행자 주소", value: "수량" },
      FinishAfter: "해당 시간 이후 완료 가능(UNIX) (옵션)",
      CancelAfter: "해당 시간 이후 취소 가능(UNIX) (옵션)",
      Condition: "PREIMAGE-SHA-256 조건(hex) (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowcreate-mpt",
    title: "EscrowCreate (MPT)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: "에스크로 생성 계정",
      Destination: "수취자 주소",
      Amount: { currency: "MPT코드", issuer: "발행자 주소", value: "수량" },
      FinishAfter: "해당 시간 이후 완료 가능(UNIX) (옵션)",
      CancelAfter: "해당 시간 이후 취소 가능(UNIX) (옵션)",
      Condition: "PREIMAGE-SHA-256 조건(hex) (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowfinish",
    title: "EscrowFinish",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowFinish",
      Account: "완료 트랜잭션 제출 계정",
      Owner: "EscrowCreate를 보낸 계정 주소",
      OfferSequence: "EscrowCreate 시퀀스",
      Fulfillment: "조건 충족 Proof(hex) (옵션)",
      Condition: "조건(hex) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowcancel",
    title: "EscrowCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowCancel",
      Account: "취소 트랜잭션 제출 계정",
      Owner: "EscrowCreate를 보낸 계정 주소",
      OfferSequence: "EscrowCreate 시퀀스",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Batch
  // ─────────────────────────────
  {
    id: "batch",
    title: "Batch",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "Batch",
      Transactions: "내부 트랜잭션 배열 (각 내부 트랜잭션에 tfInnerBatchTxn(0x40000000) 플래그 설정정 필요)",
      Flags: "tfAllOrNothing / tfOnlyOne / tfUntilFailure / tfIndependent 중 선택 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  // ─────────────────────────────
  // AMM
  // ─────────────────────────────
  {
    id: "ammcreate",
    title: "AMMCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMCreate",
      Account: "풀 생성 계정",
      Amount: { currency: "자산1", issuer: "발행자1", value: "예치 수량" },
      Amount2: { currency: "자산2", issuer: "발행자2", value: "예치 수량" },
      TradingFee: "거래 수수료(0~1000, 1=0.01%) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammdeposit",
    title: "AMMDeposit",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMDeposit",
      Account: "예치하는 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      Amount: { currency: "자산1", issuer: "발행자1", value: "예치 수량 (옵션)" },
      Amount2: { currency: "자산2", issuer: "발행자2", value: "예치 수량 (옵션)" },
      LPTokenOut: { currency: "LP 토큰", issuer: "AMM LP 발행자", value: "받고자 하는 LP 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammwithdraw",
    title: "AMMWithdraw",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMWithdraw",
      Account: "인출하는 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      LPTokenIn: { currency: "LP 토큰", issuer: "AMM LP 발행자", value: "소각할 LP 수량 (옵션)" },
      Amount: { currency: "자산1", issuer: "발행자1", value: "인출 수량 (옵션)" },
      Amount2: { currency: "자산2", issuer: "발행자2", value: "인출 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammdelete",
    title: "AMMDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMDelete",
      Account: "풀 삭제 트랜잭션 제출 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammbid",
    title: "AMMBid",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMBid",
      Account: "입찰 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      BidMin: { currency: "입찰 자산", issuer: "발행자", value: "최소 수량 (옵션)" },
      BidMax: { currency: "입찰 자산", issuer: "발행자", value: "최대 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammvote",
    title: "AMMVote",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMVote",
      Account: "투표 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      TradingFee: "제안/투표할 거래 수수료(0~1000, 1=0.01%)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammclawback",
    title: "AMMClawback",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMClawback",
      Account: "발행자(회수 주체) 주소",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      Holder: "회수 대상 보유자 주소",
      Amount: { currency: "회수할 자산", issuer: "발행자1 또는 2", value: "수량" },
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Credentials
  // ─────────────────────────────
  {
    id: "credentialcreate",
    title: "CredentialCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialCreate",
      Account: "발급자(issuer) 주소",
      Subject: "피발급자(subject) 주소",
      CredentialType: "자격증명 유형",
      URI: "관련 문서/레지스트리 URI (옵션)",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "credentialaccept",
    title: "CredentialAccept",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialAccept",
      Account: "수령자(holder) 주소",
      Issuer: "발급자 주소",
      CredentialType: "자격증명 유형",
      URI: "관련 문서/레지스트리 URI (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "credentialdelete",
    title: "CredentialDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialDelete",
      Account: "삭제 요청자 주소(일반적으로 발급자)",
      Subject: "피발급자(subject) 주소",
      CredentialType: "자격증명 유형",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Checks
  // ─────────────────────────────
  {
    id: "checkcancel",
    title: "CheckCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CheckCancel",
      Account: "체크 취소를 제출할 계정 주소",
      CheckID: "64자리 체크 ID(헥사)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "checkcash",
    title: "CheckCash",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CheckCash",
      Account: "체크의 Destination(수취자) 주소",
      CheckID: "64자리 체크 ID(헥사)",
      Amount: "교환 금액 (XRP drops | IOU 객체) (옵션)",
      DeliverMin: "최소 수령 금액 (XRP drops | IOU 객체) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "checkcreate",
    title: "CheckCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CheckCreate",
      Account: "체크 발행자 주소",
      Destination: "수취자 주소",
      SendMax: "최대 금액 (XRP drops | IOU 객체)",
      DestinationTag: "수취자 태그 (옵션)",
      Expiration: "만료 시각(UNIX) (옵션)",
      InvoiceID: "64바이트 hex (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Clawback / DepositPreauth / DID
  // ─────────────────────────────
  {
    id: "clawback",
    title: "Clawback",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Clawback",
      Account: "회수자(발행자) 주소",
      Amount: { currency: "회수할 토큰", issuer: "보유자 주소", value: "회수할 수량" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "depositpreauth",
    title: "DepositPreauth",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "DepositPreauth",
      Account: "예치 사전승인(DepositAuth) 설정 계정",
      Authorize: "사전 승인할 계정 주소 (Authorize/Unauthorize 중 택1)",
      Unauthorize: "사전 승인 해제할 계정 주소 (Authorize/Unauthorize 중 택1)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "diddelete",
    title: "DIDDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "DIDDelete",
      Account: "DID 소유자 주소",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "didset",
    title: "DIDSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "DIDSet",
      Account: "DID 소유자 주소",
      Data: "임의 데이터(hex) (옵션)",
      DIDDocument: "DID Document JSON(hex) (옵션)",
      URI: "hex-encoded URI (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  // ─────────────────────────────
  // MPToken (Issuance / Authorize)
  // ─────────────────────────────
  {
    id: "mptokenissuancecreate",
    title: "MPTokenIssuanceCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceCreate",
      Account: "발행자(issuer) 주소",
      TokenCode: "MPT 토큰 코드",
      Decimals: "소수 자리수 (옵션)",
      TransferFee: "전송 수수료(bps) (옵션)",
      Flags: "tfMPTCanLock|tfMPTRequireAuth|tfMPTCanEscrow|tfMPTCanTrade|tfMPTCanTransfer|tfMPTCanClawback 중 선택 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "mptokenissuancedestroy",
    title: "MPTokenIssuanceDestroy",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceDestroy",
      Account: "발행자(issuer) 주소",
      IssuanceID: "삭제할 발행(issuance) 식별자",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "mptokenissuanceset",
    title: "MPTokenIssuanceSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceSet",
      Account: "발행자(issuer) 주소",
      IssuanceID: "대상 발행(issuance) 식별자",
      // 잠금/해제는 Flags 비트로 설정
      Flags: "tfMPTLock 또는 tfMPTUnlock 설정 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "mptokenauthorize",
    title: "MPTokenAuthorize",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenAuthorize",
      Account: "제출 계정(보유자 또는 발행자)",
      Asset: { currency: "MPT 코드", issuer: "발행자 주소" },
      Holder: "보유자 주소 (발행자가 권한 취소/부여 시 필수) (옵션)",
      Flags: "tfMPTUnauthorize 설정 시 보유 의사 철회/권한 취소 동작 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Permissioned DEX Domain
  // ─────────────────────────────
  {
    id: "permissioneddomainset",
    title: "PermissionedDomainSet",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "PermissionedDomainSet",
      Account: "도메인 소유자 주소",
      DomainID: "도메인 식별자",
      Description: "도메인 설명 (옵션)",
      Rules: "권한/규칙 JSON (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "permissioneddomaindelete",
    title: "PermissionedDomainDelete",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "PermissionedDomainDelete",
      Account: "도메인 소유자 주소",
      DomainID: "삭제할 도메인 식별자",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // NFTs (XLS-20)
  // ─────────────────────────────
  {
    id: "nftokenacceptoffer",
    title: "NFTokenAcceptOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenAcceptOffer",
      Account: "수락 트랜잭션 제출 계정",
      // 둘 중 하나(단일), 또는 둘 다(브로커드 모드)
      NFTokenBuyOffer: "구매 오퍼 ID (옵션)",
      NFTokenSellOffer: "판매 오퍼 ID (옵션)",
      BrokerFee: { currency: "수수료 통화", issuer: "발행자 주소", value: "수수료 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokenburn",
    title: "NFTokenBurn",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenBurn",
      Account: "소각 트랜잭션 제출 계정",
      NFTokenID: "소각할 NFT ID",
      Owner: "소유자 주소(타 계정의 NFT 소각 시 필요) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokencanceloffer",
    title: "NFTokenCancelOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenCancelOffer",
      Account: "취소 트랜잭션 제출 계정",
      NFTokenOffers: ["취소할 오퍼 ID들"],
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokencreateoffer",
    title: "NFTokenCreateOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenCreateOffer",
      Account: "오퍼 생성 계정(판매자 또는 구매자)",
      NFTokenID: "대상 NFT ID",
      // 판매 오퍼: Amount는 받으려는 대가 / 구매 오퍼: 구매자가 지불할 금액
      Amount: "XRP drops | IOU 객체",
      Owner: "NFT 소유자 주소(구매 오퍼일 때 필요) (옵션)",
      Destination: "오퍼 수락 가능 계정 제한 (옵션)",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokenmint",
    title: "NFTokenMint",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenMint",
      Account: "민팅 계정(발행자)",
      NFTokenTaxon: "분류 번호(0~) (같은 컬렉션 묶음 용도)",
      URI: "hex-encoded 메타데이터 URI (옵션)",
      TransferFee: "이차 판매 수수료(bps) (옵션)",
      Issuer: "대리 발행 시 지정(옵션)",
      Flags: "tfBurnable|tfOnlyXRP|tfTrustLine|tfTransferable 등 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokenmodify",
    title: "NFTokenModify",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenModify",
      Account: "수정 트랜잭션 제출 계정",
      NFTokenID: "수정할 NFT ID",
      URI: "새 hex-encoded URI (옵션)",
      TransferFee: "새 이차 판매 수수료(bps) (옵션)",
      Flags: "수정 관련 플래그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "oracle-delete",
    title: "OracleDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OracleDelete",
      Account: "오라클 소유자 주소",
      OracleDocumentID: "오라클 문서 ID",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "oracle-set",
    title: "OracleSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OracleSet",
      Account: "오라클 소유자 주소",
      OracleDocumentID: "오라클 문서 ID",
      LastUpdateTime: "최종 업데이트 시각(UNIX)",
      PriceDataSeries: "가격 데이터 시리즈 배열",
      Provider: "프로바이더 식별자(HEX ASCII) (옵션)",
      AssetClass: "자산 클래스(HEX ASCII) (옵션)",
      URI: "오라클 메타데이터 URI (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "set-regular-key",
    title: "SetRegularKey",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "SetRegularKey",
      Account: "마스터 키 보유 계정 주소",
      RegularKey: "새 Regular Key 주소 (미설정 시 기존 RegularKey 제거) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "signer-list-set",
    title: "SignerListSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "SignerListSet",
      Account: "멀티시그 소유 계정 주소",
      SignerQuorum: "요구 정족수",
      SignerEntries: "서명자 엔트리 배열",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ticket-create",
    title: "TicketCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "TicketCreate",
      Account: "티켓 발급 계정 주소",
      TicketCount: "발급할 티켓 개수",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-channel-claim",
    title: "PaymentChannelClaim",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelClaim",
      Account: "채널 소유자 또는 수신자 주소",
      Channel: "채널 ID(64바이트 HEX)",
      Balance: "새 누적 잔액(drops) (옵션)",
      Amount: "서명된 청구 금액(drops) (옵션)",
      Signature: "오프레저 청구 서명(HEX) (옵션)",
      PublicKey: "서명 공개키(HEX) (옵션)",
      Flags: "tfClose(131072) 또는 tfRenew(65536) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-channel-create",
    title: "PaymentChannelCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelCreate",
      Account: "채널 개설자(송신자) 주소",
      Amount: "송금 총액(drops)",
      Destination: "수신자 주소",
      SettleDelay: "정산 지연 시간(초)",
      PublicKey: "송신자 공개키(HEX)",
      CancelAfter: "만료 시각(UNIX) (옵션)",
      DestinationTag: "수신자 태그 (옵션)",
      SourceTag: "송신자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-channel-fund",
    title: "PaymentChannelFund",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelFund",
      Account: "채널 소유자 주소",
      Channel: "채널 ID(64바이트 HEX)",
      Amount: "추가 펀딩 금액(drops)",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  }
  
];
// 에러 코드 타입 정의
type ErrorItem = { 
  code: string;
  class: "tec" | "tef" | "tel" | "tem" | "ter" | "other";
  message: string;
};
// 플래그 타입 정의
type FlagItem = {
  id: string;
  flag: number;
  title: string;
  description: string;
  detailUrl?: string;
};
// 에러 코드 라이브러리 배열
const ERROR_CODES: ErrorItem[] = [
  // tec
  { code: "tecAMM_ACCOUNT", class: "tec", message: "AMM 계정에서는 허용되지 않는 작업" },
  { code: "tecAMM_UNFUNDED", class: "tec", message: "AMMCreate 자산이 부족" },
  { code: "tecAMM_BALANCE", class: "tec", message: "AMM 또는 사용자 보유 자산 부족(예: AMM 보유량 초과 출금)" },
  { code: "tecAMM_EMPTY", class: "tec", message: "AMM 풀이 비어 있음. 예치 또는 삭제만 가능" },
  { code: "tecAMM_FAILED", class: "tec", message: "AMM 거래 실패(가격 조건 불충족, 자산 부족, 입찰/투표 조건 불가 등)" },
  { code: "tecAMM_INVALID_TOKENS", class: "tec", message: "LP 토큰 부족 또는 반올림 문제" },
  { code: "tecAMM_NOT_EMPTY", class: "tec", message: "빈 풀 대상 작업이지만 AMM에 자산이 있음" },
  { code: "tecCANT_ACCEPT_OWN_NFTOKEN_OFFER", class: "tec", message: "자신이 올린 NFT 오퍼를 수락하려 함" },
  { code: "tecCLAIM", class: "tec", message: "원인 불명 실패. 수수료 소각" },
  { code: "tecCRYPTOCONDITION_ERROR", class: "tec", message: "암호 조건 형식/매칭 오류(Escrow)" },
  { code: "tecDIR_FULL", class: "tec", message: "소유자 디렉터리 가득 참. 개체 추가 불가" },
  { code: "tecDUPLICATE", class: "tec", message: "이미 존재하는 개체 생성 시도" },
  { code: "tecDST_TAG_NEEDED", class: "tec", message: "목적지 태그 필요" },
  { code: "tecEMPTY_DID", class: "tec", message: "빈 DID 생성 시도" },
  { code: "tecEXPIRED", class: "tec", message: "만료된 개체 생성 시도" },
  { code: "tecFAILED_PROCESSING", class: "tec", message: "처리 중 알 수 없는 오류" },
  { code: "tecFROZEN", class: "tec", message: "자산이 글로벌 동결 상태" },
  { code: "tecHAS_OBLIGATIONS", class: "tec", message: "삭제 불가 개체 보유로 AccountDelete 실패" },
  { code: "tecINSUF_RESERVE_LINE", class: "tec", message: "리저브 부족으로 트러스트라인 생성 불가(상대 라인이 비기본 상태)" },
  { code: "tecINSUF_RESERVE_OFFER", class: "tec", message: "리저브 부족으로 오퍼 생성 불가" },
  { code: "tecINSUFF_FEE", class: "tec", message: "수수료 부족. 송신자 XRP 전액 소각될 수 있음" },
  { code: "tecINSUFFICIENT_FUNDS", class: "tec", message: "필요 자산 부족" },
  { code: "tecINSUFFICIENT_PAYMENT", class: "tec", message: "모든 비용을 충당하기에 금액 부족" },
  { code: "tecINSUFFICIENT_RESERVE", class: "tec", message: "요구 리저브가 잔액을 초과" },
  { code: "tecINTERNAL", class: "tec", message: "내부 오류. 수수료 적용" },
  { code: "tecINVALID_UPDATE_TIME", class: "tec", message: "OracleSet의 LastUpdateTime이 유효하지 않음" },
  { code: "tecINVARIANT_FAILED", class: "tec", message: "불변식 검사 실패" },
  { code: "tecKILLED", class: "tec", message: "tfFillOrKill 미체결로 주문 취소" },
  { code: "tecMAX_SEQUENCE_REACHED", class: "tec", message: "시퀀스 관련 필드가 최대값 도달" },
  { code: "tecNEED_MASTER_KEY", class: "tec", message: "마스터 키가 필요한 변경 시도" },
  { code: "tecNFTOKEN_BUY_SELL_MISMATCH", class: "tec", message: "NFT 매수/매도 오퍼 불일치" },
  { code: "tecNFTOKEN_OFFER_TYPE_MISMATCH", class: "tec", message: "오퍼 유형 불일치" },
  { code: "tecNO_ALTERNATIVE_KEY", class: "tec", message: "유일한 승인 수단 제거 시도" },
  { code: "tecNO_AUTH", class: "tec", message: "RequireAuth 라인이 미승인" },
  { code: "tecNO_DST", class: "tec", message: "수신 계정이 존재하지 않음" },
  { code: "tecNO_DST_INSUF_XRP", class: "tec", message: "수신 계정 없음 + 생성에 필요한 XRP 부족" },
  { code: "tecNO_ENTRY", class: "tec", message: "대상 원장 객체가 존재하지 않음" },
  { code: "tecNO_ISSUER", class: "tec", message: "지정 발행자 계정이 존재하지 않음" },
  { code: "tecNO_LINE", class: "tec", message: "필요 자산 트러스트라인 없음(또는 미승인)" },
  { code: "tecNO_LINE_INSUF_RESERVE", class: "tec", message: "리저브 부족으로 트러스트라인 생성 불가(상대 라인 없음)" },
  { code: "tecNO_LINE_REDUNDANT", class: "tec", message: "라인이 없어 기본 상태 설정 불가" },
  { code: "tecNO_PERMISSION", class: "tec", message: "권한 없음(예: 조기 Escrow, 타 계정 채널 자금 등)" },
  { code: "tecNO_REGULAR_KEY", class: "tec", message: "마스터 비활성화 시 대체 승인 수단 없음" },
  { code: "tecNO_SUITABLE_NFTOKEN_PAGE", class: "tec", message: "NFT를 담을 디렉터리 페이지 없음" },
  { code: "tecNO_TARGET", class: "tec", message: "지정 Escrow/PayChannel 없음 또는 DisallowXRP 대상" },
  { code: "tecOBJECT_NOT_FOUND", class: "tec", message: "지정된 객체가 원장에 없음" },
  { code: "tecOVERSIZE", class: "tec", message: "메타데이터 과다로 처리 불가" },
  { code: "tecOWNERS", class: "tec", message: "소유 개체 존재로 요청 불가" },
  { code: "tecPATH_DRY", class: "tec", message: "경로 유동성 0" },
  { code: "tecPATH_PARTIAL", class: "tec", message: "경로 유동성 부족으로 전액 전송 불가" },
  { code: "tecTOO_SOON", class: "tec", message: "AccountDelete: 시퀀스가 너무 큼" },
  { code: "tecUNFUNDED", class: "tec", message: "금액+추가 리저브 충족할 XRP 부족" },
  { code: "tecUNFUNDED_PAYMENT", class: "tec", message: "보유 XRP 초과 송금" },
  { code: "tecUNFUNDED_OFFER", class: "tec", message: "TakerGets 자산 보유량 0" },

  // tef
  { code: "tefALREADY", class: "tef", message: "동일 거래가 이미 적용됨" },
  { code: "tefBAD_AUTH", class: "tef", message: "서명 키에 계정 변경 권한 없음" },
  { code: "tefBAD_AUTH_MASTER", class: "tef", message: "단일 서명이 마스터 키와 불일치. 정규키 없음" },
  { code: "tefBAD_LEDGER", class: "tef", message: "원장이 예상과 다른 상태" },
  { code: "tefBAD_QUORUM", class: "tef", message: "멀티서명 가중치 합이 정족수 미달" },
  { code: "tefBAD_SIGNATURE", class: "tef", message: "서명자가 SignerList에 없음" },
  { code: "tefEXCEPTION", class: "tef", message: "처리 중 예외 상태 진입" },
  { code: "tefFAILURE", class: "tef", message: "적용 실패(원인 불명)" },
  { code: "tefINTERNAL", class: "tef", message: "적용 중 서버 내부 오류" },
  { code: "tefINVARIANT_FAILED", class: "tef", message: "수수료 청구 중 불변식 실패" },
  { code: "tefMASTER_DISABLED", class: "tef", message: "마스터 키로 서명했지만 lsfDisableMaster 설정됨" },
  { code: "tefMAX_LEDGER", class: "tef", message: "LastLedgerSequence를 초과" },
  { code: "tefNFTOKEN_IS_NOT_TRANSFERABLE", class: "tef", message: "NFT가 비양도 상태" },
  { code: "tefNO_AUTH_REQUIRED", class: "tef", message: "상대 계정이 RequireAuth 미사용. 승인 불필요" },
  { code: "tefNO_TICKET", class: "tef", message: "지정 TicketSequence 없음. 생성도 불가" },
  { code: "tefNOT_MULTI_SIGNING", class: "tef", message: "멀티서명 거래이나 SignerList 없음" },
  { code: "tefPAST_SEQ", class: "tef", message: "시퀀스가 현재보다 작음" },
  { code: "tefTOO_BIG", class: "tef", message: "영향 개체 수 과다" },
  { code: "tefWRONG_PRIOR", class: "tef", message: "AccountTxnID가 직전 거래와 불일치" },

  // tel
  { code: "telBAD_DOMAIN", class: "tel", message: "Domain 값이 유효하지 않음" },
  { code: "telBAD_PATH_COUNT", class: "tel", message: "경로가 너무 많음" },
  { code: "telBAD_PUBLIC_KEY", class: "tel", message: "공개키 형식/길이 불일치" },
  { code: "telCAN_NOT_QUEUE", class: "tel", message: "오픈 원장 비용 미달. 큐잉 제한으로 미추가" },
  { code: "telCAN_NOT_QUEUE_BALANCE", class: "tel", message: "대기열 잠재 비용 합계가 잔액 초과. 큐잉 실패" },
  { code: "telCAN_NOT_QUEUE_BLOCKS", class: "tel", message: "대체 시 기존 대기 거래를 블록함. 큐잉 실패" },
  { code: "telCAN_NOT_QUEUE_BLOCKED", class: "tel", message: "앞선 대기 거래에 의해 차단. 큐잉 실패" },
  { code: "telCAN_NOT_QUEUE_FEE", class: "tel", message: "기존 대기 거래 대체에 수수료 수준 미달" },
  { code: "telCAN_NOT_QUEUE_FULL", class: "tel", message: "서버 대기열 가득 참" },
  { code: "telFAILED_PROCESSING", class: "tel", message: "처리 중 알 수 없는 오류" },
  { code: "telINSUF_FEE_P", class: "tel", message: "서버 요구 수수료 수준 미달" },
  { code: "telLOCAL_ERROR", class: "tel", message: "로컬 오류. 다른 서버 시도 가능" },
  { code: "telNETWORK_ID_MAKES_TX_NON_CANONICAL", class: "tel", message: "이 네트워크에서는 NetworkID 필드를 허용하지 않음" },
  { code: "telNO_DST_PARTIAL", class: "tel", message: "신규 계정 개설 XRP 결제에 tfPartialPayment 불가" },
  { code: "telREQUIRES_NETWORK_ID", class: "tel", message: "이 네트워크는 NetworkID 필드를 요구함" },
  { code: "telWRONG_NETWORK", class: "tel", message: "NetworkID가 현재 네트워크와 불일치" },

  // tem
  { code: "temBAD_AMM_TOKENS", class: "tem", message: "자산 지정이 잘못됨(AMM 풀 자산과 불일치 등)" },
  { code: "temBAD_AMOUNT", class: "tem", message: "금액이 유효하지 않음(음수 등)" },
  { code: "temBAD_AUTH_MASTER", class: "tem", message: "마스터 키와 불일치. 정규키 미설정" },
  { code: "temBAD_CURRENCY", class: "tem", message: "통화 필드 형식 오류" },
  { code: "temBAD_EXPIRATION", class: "tem", message: "만료 값 지정 오류 또는 필요 값 누락" },
  { code: "temBAD_FEE", class: "tem", message: "수수료 값 지정 오류" },
  { code: "temBAD_ISSUER", class: "tem", message: "발행자 필드 지정 오류" },
  { code: "temBAD_LIMIT", class: "tem", message: "트러스트라인 LimitAmount 지정 오류" },
  { code: "temBAD_NFTOKEN_TRANSFER_FEE", class: "tem", message: "NFT TransferFee 지정 오류" },
  { code: "temBAD_OFFER", class: "tem", message: "잘못된 오퍼(자기자신과 거래, 음수 금액 등)" },
  { code: "temBAD_PATH", class: "tem", message: "경로(Paths) 지정 오류" },
  { code: "temBAD_PATH_LOOP", class: "tem", message: "결제 경로에 루프가 감지됨" },
  { code: "temBAD_SEND_XRP_LIMIT", class: "tem", message: "XRP→XRP 결제에 tfLimitQuality 사용" },
  { code: "temBAD_SEND_XRP_MAX", class: "tem", message: "XRP→XRP 결제에 SendMax 사용" },
  { code: "temBAD_SEND_XRP_NO_DIRECT", class: "tem", message: "XRP→XRP 결제에 tfNoDirectRipple 사용" },
  { code: "temBAD_SEND_XRP_PARTIAL", class: "tem", message: "XRP→XRP 결제에 tfPartialPayment 사용" },
  { code: "temBAD_SEND_XRP_PATHS", class: "tem", message: "XRP 전송에 Paths 포함" },
  { code: "temBAD_SEQUENCE", class: "tem", message: "자신의 Sequence보다 큰 값을 참조" },
  { code: "temBAD_SIGNATURE", class: "tem", message: "서명이 없거나 형식이 올바르지 않음" },
  { code: "temBAD_SRC_ACCOUNT", class: "tem", message: "송신 계정 주소 형식 오류" },
  { code: "temBAD_TRANSFER_RATE", class: "tem", message: "TransferRate 형식/범위 오류" },
  { code: "temCANNOT_PREAUTH_SELF", class: "tem", message: "자기 자신을 사전 승인할 수 없음" },
  { code: "temDST_IS_SRC", class: "tem", message: "Destination이 송신 Account와 동일" },
  { code: "temDST_NEEDED", class: "tem", message: "Destination 또는 issuer 누락" },
  { code: "temINVALID", class: "tem", message: "그 외 형식/서명 등 전반적 무효" },
  { code: "temINVALID_COUNT", class: "tem", message: "TicketCount 값이 유효하지 않음" },
  { code: "temINVALID_FLAG", class: "tem", message: "존재하지 않거나 상충하는 플래그 포함" },
  { code: "temMALFORMED", class: "tem", message: "트랜잭션 형식 오류" },
  { code: "temREDUNDANT", class: "tem", message: "효과 없음(자기 자신 송금 등)" },
  { code: "temRIPPLE_EMPTY", class: "tem", message: "경로가 필요한 결제에 빈 Paths" },
  { code: "temSEQ_AND_TICKET", class: "tem", message: "Sequence와 TicketSequence를 동시에 사용" },
  { code: "temBAD_WEIGHT", class: "tem", message: "SignerWeight 값이 유효하지 않음" },
  { code: "temBAD_SIGNER", class: "tem", message: "서명자 목록에 오류(중복, 자기 자신 포함 등)" },
  { code: "temBAD_QUORUM", class: "tem", message: "SignerQuorum 값이 유효하지 않음" },
  { code: "temUNCERTAIN", class: "tem", message: "내부용. 반환되지 않음" },
  { code: "temUNKNOWN", class: "tem", message: "내부용. 반환되지 않음" },
  { code: "temDISABLED", class: "tem", message: "필요 로직이 비활성(미채택 개정안 등)" },

  // ter
  { code: "terINSUF_FEE_B", class: "ter", message: "수수료(Fee) 지불에 XRP 부족" },
  { code: "terLAST", class: "ter", message: "내부용. 반환되지 않음" },
  { code: "terNO_ACCOUNT", class: "ter", message: "송신 주소가 미개설" },
  { code: "terNO_AMM", class: "ter", message: "지정 자산쌍의 AMM 인스턴스 없음." },
  { code: "terNO_AUTH", class: "ter", message: "RequireAuth 자산을 미승인 라인에 추가 시도" },
  { code: "terNO_LINE", class: "ter", message: "내부용. 반환되지 않음" },
  { code: "terNO_RIPPLE", class: "ter", message: "리플 설정으로 불가(예: Default Ripple 미활성)" },
  { code: "terOWNERS", class: "ter", message: "소유 개체 수가 0이 아님" },
  { code: "terPRE_SEQ", class: "ter", message: "현재 거래 Sequence가 계정 현재값보다 큼" },
  { code: "terPRE_TICKET", class: "ter", message: "TicketSequence가 아직 없음. 이후 생성 가능" },
  { code: "terQUEUED", class: "ter", message: "오픈 원장 요건 미달로 큐에 보류" },
  { code: "terRETRY", class: "ter", message: "재시도 가능 오류" },
  { code: "terSUBMITTED", class: "ter", message: "제출됨. 아직 적용 전" },
];
// 플래그 라이브러리 배열
const FLAG_ITEMS: FlagItem[] = [
     // ─────────────────────────────────────────────
    // AccountSet (asf flags: SetFlag/ClearFlag 값)
    // ─────────────────────────────────────────────
    {
      id: "asf-require-dest",
      flag: 1,
      title: "asfRequireDest",
      description:
        "이 계정으로의 XRPL 입금에 Destination Tag를 요구. 수취인 실수 예방에 유용, 주로 거래소의 XRPL 지갑에서 사용됨",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-require-auth",
      flag: 2,
      title: "asfRequireAuth",
      description:
        "타 계정이 이 계정의 Trustline 토큰(IOU)을 보유하려면 사전 승인 필요",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-xrp",
      flag: 3,
      title: "asfDisallowXRP",
      description:
        "클라이언트가 이 계정으로의 XRP 송금/표시를 회피하도록 권고(프로토콜 강제는 아님)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disable-master",
      flag: 4,
      title: "asfDisableMaster",
      description:
        "마스터 키 사용 금지. RegularKey/멀티시그로만 서명 가능",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-account-txn-id",
      flag: 5,
      title: "asfAccountTxnID",
      description:
        "최근 전송 트랜잭션의 해시를 AccountTxnID 필드에 저장/추적",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-no-freeze",
      flag: 6,
      title: "asfNoFreeze",
      description:
        "해당 계정이 Trustline 동결을 사용할 수 없도록 영구 비활성화(되돌릴 수 없음)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-global-freeze",
      flag: 7,
      title: "asfGlobalFreeze",
      description:
        "해당 계정이 발행한 모든 토큰을 전역 동결",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-default-ripple",
      flag: 8,
      title: "asfDefaultRipple",
      description:
        "계정의 Trustline에서 기본적으로 rippling 허용. 발행자 계정에 권장",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-deposit-auth",
      flag: 9,
      title: "asfDepositAuth",
      description:
        "본인이 보내는 거래 또는 사전 인가된 계정으로부터만 입금 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-authorized-nft-minter",
      flag: 10,
      title: "asfAuthorizedNFTokenMinter",
      description:
        "대리 민팅 계정(NFTokenMinter) 지정 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-nft-offer",
      flag: 12,
      title: "asfDisallowIncomingNFTokenOffer",
      description: "들어오는 NFT 오퍼 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-check",
      flag: 13,
      title: "asfDisallowIncomingCheck",
      description: "들어오는 Check 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-paychan",
      flag: 14,
      title: "asfDisallowIncomingPayChan",
      description: "들어오는 Payment Channel 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-trustline",
      flag: 15,
      title: "asfDisallowIncomingTrustline",
      description: "들어오는 Trustline 생성 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-allow-trustline-clawback",
      flag: 16,
      title: "asfAllowTrustLineClawback",
      description:
        "발행자가 Trustline에서 자산을 회수(Clawback)할 수 있도록 허용. 한번 설정하면 되돌릴 수 없음",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-allow-trustline-locking",
      flag: 17,
      title: "asfAllowTrustLineLocking",
      description:
        "Trust Line 토큰의 Escrow(잠금) 기능 허용, IOU TokenEscrow를 위한 Flag",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
  
    {
      id: "tf-fully-canonical-sig",
      flag: 2147483648,
      title: "tfFullyCanonicalSig",
      description:
        "모든 트랜잭션에 적용 가능한 전역 플래그. 완전 정규 서명을 요구합니다 (hex 0x80000000). RequireFullyCanonicalSig 개정 이후 기본 보호가 적용되지만, 병렬 네트워크/레거시 환경에서 명시적 사용을 권장",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/common-fields"
    },
  
    // ─────────────────────────────────────────────
    // Payment (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-payment-no-direct-ripple",
      flag: 65536,
      title: "tfNoRippleDirect",
      description:
        "직접 경로(rippling)를 사용하지 않도록 요청 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/payment"
    },
    {
      id: "tf-payment-partial-payment",
      flag: 131072,
      title: "tfPartialPayment",
      description:
        "부분 결제를 허용 (hex 0x00020000). 수취인이 전체 금액 대신 일부 금액 수령 가능",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/payment"
    },
    {
      id: "tf-payment-limit-quality",
      flag: 262144,
      title: "tfLimitQuality",
      description:
        "지정한 한계를 초과하면 결제 거부 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/payment"
    },
  
    // ─────────────────────────────────────────────
    // OfferCreate (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-offercreate-passive",
      flag: 65536,
      title: "tfPassive",
      description:
        "수동 오퍼. 즉시 체결을 시도하지 않고 호가만 게시 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-offercreate-ioc",
      flag: 131072,
      title: "tfImmediateOrCancel",
      description:
        "즉시 체결되지 않는 잔여 수량은 즉시 취소 (IOC) (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-offercreate-fok",
      flag: 262144,
      title: "tfFillOrKill",
      description:
        "전량이 즉시 체결되지 않으면 전체 취소 (FOK) (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-offercreate-sell",
      flag: 524288,
      title: "tfSell",
      description:
        "지정 수량을 팔도록 해석 (sell side) (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-hybrid",
      flag: 1048576,
      title: "tfHybrid",
      description:
        "Permissioned DEX와 오픈 DEX를 모두 사용하는 하이브리드 오퍼로 생성. 이 플래그 사용 시 DomainID 필드가 필수. (PermissionedDEX amendment 필요, 현재 메인넷 미활성 / hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    // ─────────────────────────────────────────────
    // TrustSet (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-trustset-set-auth",
      flag: 65536,
      title: "tfSetfAuth",
      description:
        "상대 Trustline에 Auth 비트 설정 (hex 0x00010000). 발행자가 승인 기반 자산을 운용할 때 사용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-set-noripple",
      flag: 131072,
      title: "tfSetNoRipple",
      description:
        "해당 Trustline에서 rippling 비활성화 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-clear-noripple",
      flag: 262144,
      title: "tfClearNoRipple",
      description:
        "해당 Trustline에서 rippling 비활성화 해제 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-set-freeze",
      flag: 1048576,
      title: "tfSetFreeze",
      description:
        "해당 Trustline을 동결 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-clear-freeze",
      flag: 2097152,
      title: "tfClearFreeze",
      description:
        "해당 Trustline 동결 해제 (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-set-deep-freeze",
      flag: 4194304,
      title: "tfSetDeepFreeze",
      description:
        "Deep Freeze 설정 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-clear-deep-freeze",
      flag: 8388608,
      title: "tfClearDeepFreeze",
      description:
        "Deep Freeze 해제 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
  
    // ─────────────────────────────────────────────
    // PaymentChannelClaim (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-paychan-renew",
      flag: 65536,
      title: "tfRenew",
      description:
        "Payment Channel의 유효기간을 갱신 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelclaim"
    },
    {
      id: "tf-paychan-close",
      flag: 131072,
      title: "tfClose",
      description:
        "Payment Channel을 닫음 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelclaim"
    },
  
    // ─────────────────────────────────────────────
    // AMMDeposit / AMMWithdraw (type-based flags)
    // ─────────────────────────────────────────────
    // AMMDeposit
    {
      id: "tf-ammdeposit-lptoken",
      flag: 65536,
      title: "tfLPToken (AMMDeposit)",
      description: "LP 토큰 수량 기준으로 입금 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-single-asset",
      flag: 524288,
      title: "tfSingleAsset (AMMDeposit)",
      description: "단일 자산만 입금 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-two-asset",
      flag: 1048576,
      title: "tfTwoAsset (AMMDeposit)",
      description: "양 자산을 비율에 맞춰 입금 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-one-asset-lptoken",
      flag: 2097152,
      title: "tfOneAssetLPToken (AMMDeposit)",
      description: "단일 자산 + 목표 LP토큰 수량 조합 입금 (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-limit-lptoken",
      flag: 4194304,
      title: "tfLimitLPToken (AMMDeposit)",
      description: "LP 토큰 발행 상한 설정 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-two-asset-if-empty",
      flag: 8388608,
      title: "tfTwoAssetIfEmpty (AMMDeposit)",
      description: "풀 초기화 시 두 자산 모두 필요 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
  
    // AMMWithdraw
    {
      id: "tf-ammwithdraw-lptoken",
      flag: 65536,
      title: "tfLPToken (AMMWithdraw)",
      description: "LP 토큰 수량 기준으로 출금 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-withdraw-all",
      flag: 131072,
      title: "tfWithdrawAll (AMMWithdraw)",
      description: "보유 지분 전체 출금 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-one-asset-withdraw-all",
      flag: 262144,
      title: "tfOneAssetWithdrawAll (AMMWithdraw)",
      description: "단일 자산으로 전량 출금 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-single-asset",
      flag: 524288,
      title: "tfSingleAsset (AMMWithdraw)",
      description: "단일 자산 출금 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-two-asset",
      flag: 1048576,
      title: "tfTwoAsset (AMMWithdraw)",
      description: "양 자산 비율 출금 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-one-asset-lptoken",
      flag: 2097152,
      title: "tfOneAssetLPToken (AMMWithdraw)",
      description: "단일 자산 + 목표 LP토큰 수량 조합 출금 (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-limit-lptoken",
      flag: 4194304,
      title: "tfLimitLPToken (AMMWithdraw)",
      description: "LP 토큰 소각/회수 상한 설정 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-claw-two-assets",
      flag: 1,
      title: "tfClawTwoAssets",
      description:
        "지정한 Asset 금액과, AMM 풀의 자산 비율에 따른 대응 Asset2 금액을 함께 회수(두 자산 모두 Account 필드의 발행자가 발행한 자산이어야 함). 이 플래그를 사용하지 않으면 지정한 Asset만 회수되고, 해당 비율의 Asset2는 Holder에게 반환됨 (hex 0x00000001)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammclawback"
    },
  
    // ─────────────────────────────────────────────
    // NFTokenMint / NFTokenCreateOffer (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-nftmint-burnable",
      flag: 1,
      title: "tfBurnable",
      description: "보유자가 NFT 소각 가능",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-onlyxrp",
      flag: 2,
      title: "tfOnlyXRP",
      description: "NFT 전송/거래 시 XRP만 사용하도록 제한",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-trustline",
      flag: 4,
      title: "tfTrustLine",
      description: "NFT와 관련된 트러스트라인 요구",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-transferable",
      flag: 8,
      title: "tfTransferable",
      description: "NFT 소유권 이전 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-mutable",
      flag: 16,
      title: "tfMutable",
      description: "NFT 발행 후 메타데이터 수정 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftcreateoffer-sell",
      flag: 1,
      title: "tfSellNFToken",
      description: "판매 오퍼로 해석(미설정 시 구매 오퍼)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokencreateoffer"
    },
    // ─────────────────────────────────────────────
    // Transaction Flags (tf*) 
    // ─────────────────────────────────────────────
    // MPtokenIssuance/Authorize/Set tf
    {
      id: "tf-mpt-can-lock",
      flag: 2,
      title: "tfMPTCanLock",
      description:
        "개별 및 글로벌 잠금(LOCK) 허용 (hex 0x00000002)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-require-auth",
      flag: 4,
      title: "tfMPTRequireAuth",
      description:
        "개별 보유자 승인(Authorization) 필요 (hex 0x00000004)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-escrow",
      flag: 8,
      title: "tfMPTCanEscrow",
      description:
        "보유 잔액을 에스크로(escrow)로 예치 가능 (hex 0x00000008)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-trade",
      flag: 16,
      title: "tfMPTCanTrade",
      description:
        "XRPL DEX에서 보유 잔액 거래 가능 (hex 0x00000010)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-transfer",
      flag: 32,
      title: "tfMPTCanTransfer",
      description:
        "발행자가 아닌 다른 계정으로 토큰 전송 가능 (hex 0x00000020)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-clawback",
      flag: 64,
      title: "tfMPTCanClawback",
      description:
        "발행자가 Clawback 트랜잭션으로 개별 보유자 잔액 회수 가능 (hex 0x00000040)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-unauthorize",
      flag: 1,
      title: "tfMPTUnauthorize",
      description:
        "보유자: 잔액이 0이면 해당 MPT 보유 의사 철회 및 MPToken 엔트리 삭제(잔액>0이면 실패). 발행자: 지정 보유자의 보유 권한 취소(해당 MPT가 allow-listing을 사용하지 않으면 실패). (hex 0x00000001)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize"
    },
    {
      id: "tf-mpt-lock",
      flag: 1,
      title: "tfMPTLock",
      description:
        "해당 MPT 발행분의 잔액을 잠금(lock) 처리 (hex 0x00000001)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset"
    },
    {
      id: "tf-mpt-unlock",
      flag: 2,
      title: "tfMPTUnlock",
      description:
        "해당 MPT 발행분의 잔액 잠금 해제(unlock) (hex 0x00000002)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset"
    },
    // ─────────────────────────────────────────────
    // Transaction Flags (tf*) 
    // ─────────────────────────────────────────────
    // Batch tf
    {
      id: "tf-all-or-nothing",
      flag: 65536,
      title: "tfAllOrNothing",
      description:
        "모든 트랜잭션이 성공해야 하며 하나라도 실패하면 전체 배치가 실패 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-only-one",
      flag: 131072,
      title: "tfOnlyOne",
      description:
        "가장 먼저 성공한 트랜잭션만 적용되고 이후 트랜잭션은 실패하거나 건너뜀 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-until-failure",
      flag: 262144,
      title: "tfUntilFailure",
      description:
        "첫 실패가 발생할 때까지 순서대로 적용하며 이후 트랜잭션은 건너뜀 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-independent",
      flag: 524288,
      title: "tfIndependent",
      description:
        "실패 여부와 무관하게 모든 트랜잭션을 적용 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-inner-batch-txn",
      flag: 1073741824,
      title: "tfInnerBatchTxn",
      description:
        "해당 트랜잭션이 Batch 트랜잭션 내부에 있음을 표시. Batch 기능 사용 시 모든 내부 트랜잭션에 이 플래그를 설정해야 함 (hex 0x40000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    // ─────────────────────────────────────────────
    // Ledger Flags (lsf*) — AccountRoot / Offer / RippleState
    // ─────────────────────────────────────────────
    // AccountRoot lsf
    {
      id: "lsf-allow-trustline-clawback",
      flag: 2147483648,
      title: "lsfAllowTrustLineClawback",
      description:
        "계정에 Clawback 기능이 활성화됨 (hex 0x80000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-allow-trustline-locking",
      flag: 1073741824,
      title: "lsfAllowTrustLineLocking",
      description:
        "Trust Line 토큰 에스크로(잠금) 기능 활성 (hex 0x40000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-default-ripple",
      flag: 8388608,
      title: "lsfDefaultRipple",
      description: "기본 rippling 허용 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-deposit-auth",
      flag: 16777216,
      title: "lsfDepositAuth",
      description:
        "DepositAuth 활성 (hex 0x01000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disable-master",
      flag: 1048576,
      title: "lsfDisableMaster",
      description: "마스터 키 비활성화 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-check",
      flag: 134217728,
      title: "lsfDisallowIncomingCheck",
      description: "들어오는 Check 차단 (hex 0x08000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-nft-offer",
      flag: 67108864,
      title: "lsfDisallowIncomingNFTokenOffer",
      description: "들어오는 NFT 오퍼 차단 (hex 0x04000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-paychan",
      flag: 268435456,
      title: "lsfDisallowIncomingPayChan",
      description: "들어오는 Payment Channel 차단 (hex 0x10000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-trustline",
      flag: 536870912,
      title: "lsfDisallowIncomingTrustline",
      description: "들어오는 트러스트라인 차단 (hex 0x20000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-xrp",
      flag: 524288,
      title: "lsfDisallowXRP",
      description:
        "클라이언트가 이 계정으로의 XRP 송금/표시를 피하도록 권고 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-global-freeze",
      flag: 4194304,
      title: "lsfGlobalFreeze",
      description: "발행한 모든 자산 동결 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-no-freeze",
      flag: 2097152,
      title: "lsfNoFreeze",
      description:
        "해당 계정은 신뢰선 동결을 사용할 수 없음(영구) (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-password-spent",
      flag: 65536,
      title: "lsfPasswordSpent",
      description:
        "무료 SetRegularKey 1회 사용 기록 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-require-auth",
      flag: 262144,
      title: "lsfRequireAuth",
      description:
        "발행 토큰 보유에 개별 승인 필요 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-require-desttag",
      flag: 131072,
      title: "lsfRequireDestTag",
      description:
        "입금 시 Destination Tag 필수 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
  
    // Offer (ledger) lsf
    {
      id: "lsf-offer-passive",
      flag: 65536,
      title: "lsfPassive",
      description: "수동 오퍼 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/offer"
    },
    {
      id: "lsf-offer-sell",
      flag: 131072,
      title: "lsfSell",
      description: "판매 오퍼 표시 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/offer"
    },
    {
      id: "lsf-offer-hybrid",
      flag: 262144,
      title: "lsfHybrid",
      description: "하이브리드 오퍼 표시 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/offer"
    },
  
    // RippleState (ledger) lsf
    {
      id: "lsf-ripplestate-low-reserve",
      flag: 65536,
      title: "lsfLowReserve",
      description: "low 쪽(소유자)이 리저브 필요 상태 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-reserve",
      flag: 131072,
      title: "lsfHighReserve",
      description: "high 쪽이 리저브 필요 상태 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-auth",
      flag: 262144,
      title: "lsfLowAuth",
      description: "low 쪽 Auth 설정 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-auth",
      flag: 524288,
      title: "lsfHighAuth",
      description: "high 쪽 Auth 설정 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-noripple",
      flag: 1048576,
      title: "lsfLowNoRipple",
      description: "low 쪽 NoRipple (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-noripple",
      flag: 2097152,
      title: "lsfHighNoRipple",
      description: "high 쪽 NoRipple (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-freeze",
      flag: 4194304,
      title: "lsfLowFreeze",
      description: "low 쪽 신뢰선 동결 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-freeze",
      flag: 8388608,
      title: "lsfHighFreeze",
      description: "high 쪽 신뢰선 동결 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-deep-freeze",
      flag: 33554432,
      title: "lsfLowDeepFreeze",
      description: "low 쪽 Deep Freeze (hex 0x02000000)",
      detailUrl:
        "https://js.xrpl.org/enums/LedgerEntry.RippleStateFlags.html"
    },
    {
      id: "lsf-ripplestate-high-deep-freeze",
      flag: 67108864,
      title: "lsfHighDeepFreeze",
      description: "high 쪽 Deep Freeze (hex 0x04000000)",
      detailUrl:
        "https://js.xrpl.org/enums/LedgerEntry.RippleStateFlags.html"
    },
    {
      id: "lsf-ripplestate-amm-node",
      flag: 16777216,
      title: "lsfAMMNode",
      description: "해당 신뢰선이 AMM 노드와 연관됨 (hex 0x01000000)",
      detailUrl:
        "https://js.xrpl.org/enums/LedgerEntry.RippleStateFlags.html"
    }
  ];

// 에러 코드 Docs 링크
const XRPL_DOCS_BASE = {
  tec: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tec-codes",
  tef: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tef-codes",
  tel: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tel-codes",
  tem: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tem-codes",
  ter: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/ter-codes",
} as const;
// 에러 코드 Docs 링크 매핑 관련
const docUrlFor = (cls?: string) => {
  if (!cls) return;
  const key = cls.toLowerCase() as keyof typeof XRPL_DOCS_BASE;
  return XRPL_DOCS_BASE[key];
};
//Developer Links 타입 정의
type DevLink = {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: ReactNode;
};

// txLink 타입 정의
type TxLink = {
  title: string; // 트랜잭션 이름
  jsref?: string; // 해당 트랜잭션의 xrpl.js docs 링크
  pyref?: string; // 해당 트랜잭션의 xrpl-py docs 링크
  docref?: string; // 설명 외부 링크(노션)
};
// 649 ~ 689 - 아이콘 정의(이미지로 대체 가능성 있음)
const IconDoc = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path d="M7 3h7l5 5v13H7V3z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const IconJs = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <text x="6.5" y="16" fontSize="9" fill="currentColor">JS</text>
  </svg>
);
const IconPy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <rect x="3" y="3" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="12" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const IconTelegram = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path d="M20.5 4.5L3.8 11.1c-.8.3-.8 1.4 0 1.7l4.5 1.6 1.7 4.6c.3.8 1.4.8 1.8 0l2.9-5.3 4.7-7.7c.4-.7-.3-1.5-1.1-1.2z" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);
const IconDiscord = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path d="M8 6.5c2-.8 6-.8 8 0 1.7.7 3 2.9 3 5.3v5.2c0 .6-.5 1-1.1.9a16.9 16.9 0 0 0-3.2-.8l-.7 1.4c-1.9.3-3.9.3-5.8 0l-.7-1.4c-1.1.2-2.2.5-3.2.8-.6.2-1.1-.3-1.1-.9v-5.2c0-2.4 1.3-4.6 3-5.3z" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="9.5" cy="12" r="1" fill="currentColor"/><circle cx="14.5" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const COMMUNITY_LINKS: DevLink[] = [
  { id: "xrpl-korea", title: "XRPL Korea", desc: "XRPL Korea 공식 웹사이트", href: "https://www.xrplkorea.org/", icon: <IconGlobe /> },
  { id: "xrpl-korea-x", title: "XRPL Korea X", desc: "XRPL Korea 공식 X 계정", href: "https://x.com/xrplkorea", icon: <IconX /> },
  { id: "xrpl-korea-telegram", title: "XRPL Korea Telegram", desc: "XRPL Korea 공식 텔레그램 커뮤니티", href: "https://t.me/XRPLKorea", icon: <IconTelegram /> },
  { id: "xrpl-discord-kr", title: "XRP Ledger Discord KR 채널", desc: "XRP Ledger 공식 디스코드 한국어 채널", href: "https://discord.com/channels/886050993802985492/1130924837662109716", icon: <IconDiscord /> },
];

const DEV_LINKS: DevLink[] = [
  { id: "xrpl-docs", title: "XRPL Docs", desc: "XRPL 공식 문서 개요와 프로토콜 레퍼런스", href: "https://xrpl.org/docs", icon: <IconDoc /> },
  { id: "xrpl-dev-portal", title: "xrpl-dev-portal", desc: "XRPL 샘플 코드와 가이드 모음", href: "https://github.com/XRPLF/xrpl-dev-portal", icon: <IconDoc /> },
  { id: "xrpl-js", title: "xrpl.js", desc: "XRPL Javascript SDK 레퍼런스", href: "https://js.xrpl.org", icon: <IconJs /> },
  { id: "xrpl-py", title: "xrpl-py", desc: "XRPL Python SDK 레퍼런스", href: "https://xrpl-py.readthedocs.io/en/stable", icon: <IconPy /> },
  { id: "explorer-mainnet", title: "XRPL Explorer", desc: "XRPL 트랜잭션 익스플로러", href: "https://livenet.xrpl.org", icon: <IconGlobe /> },
  { id: "xrpscan", title: "XRPScan", desc: "XRPL 대체 익스플로러", href: "https://xrpscan.com", icon: <IconGlobe /> },
];

const txLink: TxLink[]= [
  { title: "Payment (XRP)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment", docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment"},
  { title: "Payment (IOU)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment"},
  { title: "Payment (MPT)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment"},
  { title: "Payment (AMM Swap)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment"},
  { title: "AccountSet", jsref: "https://js.xrpl.org/interfaces/AccountSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AccountSet" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/accountset"},
  { title: "AccountDelete", jsref: "https://js.xrpl.org/interfaces/AccountDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AccountDelete" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/accountdelete"},
  { title: "TrustSet", jsref: "https://js.xrpl.org/interfaces/TrustSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.TrustSet" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/trustset"},
  { title: "OfferCreate (Permissioned)", jsref: "https://js.xrpl.org/interfaces/OfferCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCreate" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"},
  { title: "OfferCreate (General)", jsref: "https://js.xrpl.org/interfaces/OfferCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCreate" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"},
  { title: "OfferCancel", jsref: "https://js.xrpl.org/interfaces/OfferCancel.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCancel" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/offercancel"},
  { title: "EscrowCreate (XRP)", jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate"},
  { title: "EscrowCreate (IOU)", jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate"},
  { title: "EscrowCreate (MPT)", jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate"}, 
  { title: "EscrowFinish", jsref: "https://js.xrpl.org/interfaces/EscrowFinish.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowFinish" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowfinish"},
  { title: "EscrowCancel", jsref: "https://js.xrpl.org/interfaces/EscrowCancel.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCancel" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcancel"},
  { title: "Batch", jsref: "https://js.xrpl.org/interfaces/Batch.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Batch" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/batch"},
  { title: "AMMCreate", jsref: "https://js.xrpl.org/interfaces/AMMCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMCreate" , docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammcreate"},
  { title: "AMMDeposit", jsref: "https://js.xrpl.org/interfaces/AMMDeposit.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMDeposit", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit" },
  { title: "AMMWithdraw", jsref: "https://js.xrpl.org/interfaces/AMMWithdraw.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMWithdraw", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw" },
  { title: "AMMDelete", jsref: "https://js.xrpl.org/interfaces/AMMDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMDelete", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammdelete" },
  { title: "AMMBid", jsref: "https://js.xrpl.org/interfaces/AMMBid.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMBid", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammbid" },
  { title: "AMMVote", jsref: "https://js.xrpl.org/interfaces/AMMVote.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMVote", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammvote" },
  { title: "AMMClawback", jsref: "https://js.xrpl.org/interfaces/AMMClawback.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMClawback", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammclawback" },
  { title: "CredentialCreate", jsref: "https://js.xrpl.org/interfaces/CredentialCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialCreate", docref: "https://xrpl.org/docs/references/protocol/transactions/types/credentialcreate" },
  { title: "CredentialAccept", jsref: "https://js.xrpl.org/interfaces/CredentialAccept.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialAccept", docref: "https://xrpl.org/docs/references/protocol/transactions/types/credentialaccept" },
  { title: "CredentialDelete", jsref: "https://js.xrpl.org/interfaces/CredentialDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialDelete", docref: "https://xrpl.org/docs/references/protocol/transactions/types/credentialdelete" },
  { title: "CheckCancel", jsref: "https://js.xrpl.org/interfaces/CheckCancel.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CheckCancel", docref: "https://xrpl.org/docs/references/protocol/transactions/types/checkcancel" },
  { title: "CheckCash", jsref: "https://js.xrpl.org/interfaces/CheckCash.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CheckCash", docref: "https://xrpl.org/docs/references/protocol/transactions/types/checkcash" },
  { title: "CheckCreate", jsref: "https://js.xrpl.org/interfaces/CheckCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CheckCreate", docref: "https://xrpl.org/docs/references/protocol/transactions/types/checkcreate" },
  { title: "Clawback", jsref: "https://js.xrpl.org/interfaces/Clawback.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Clawback", docref: "https://xrpl.org/docs/references/protocol/transactions/types/clawback" },
  { title: "DepositPreauth", jsref: "https://js.xrpl.org/interfaces/DepositPreauth.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.DepositPreauth", docref: "https://xrpl.org/docs/references/protocol/transactions/types/depositpreauth" },
  { title: "DIDDelete", jsref: "https://js.xrpl.org/interfaces/DIDDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.DIDDelete", docref: "https://xrpl.org/docs/references/protocol/transactions/types/diddelete" },
  { title: "DIDSet", jsref: "https://js.xrpl.org/interfaces/DIDSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.DIDSet", docref: "https://xrpl.org/docs/references/protocol/transactions/types/didset" },
  { title: "MPTokenIssuanceCreate", jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceCreate", docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate" },
  { title: "MPTokenIssuanceDestroy", jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceDestroy.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceDestroy", docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancedestroy" },
  { title: "MPTokenIssuanceSet", jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceSet", docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset" },
  { title: "MPTokenAuthorize", jsref: "https://js.xrpl.org/interfaces/MPTokenAuthorize.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenAuthorize", docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize" },
  { title: "PermissionedDomainSet", jsref: "https://js.xrpl.org/interfaces/PermissionedDomainSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PermissionedDomainSet", docref: "https://xrpl.org/docs/references/protocol/transactions/types/permissioneddomainset" },
  { title: "PermissionedDomainDelete", jsref: "https://js.xrpl.org/interfaces/PermissionedDomainDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PermissionedDomainDelete", docref: "https://xrpl.org/docs/references/protocol/transactions/types/permissioneddomaindelete" },
  { title: "NFTokenAcceptOffer", jsref: "https://js.xrpl.org/interfaces/NFTokenAcceptOffer.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenAcceptOffer", docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenacceptoffer" },
  { title: "NFTokenBurn", jsref: "https://js.xrpl.org/interfaces/NFTokenBurn.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenBurn", docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenburn" },
  { title: "NFTokenCancelOffer", jsref: "https://js.xrpl.org/interfaces/NFTokenCancelOffer.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenCancelOffer", docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokencanceloffer" },
  { title: "NFTokenCreateOffer", jsref: "https://js.xrpl.org/interfaces/NFTokenCreateOffer.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenCreateOffer", docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokencreateoffer" },
  { title: "NFTokenMint", jsref: "https://js.xrpl.org/interfaces/NFTokenMint.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenMint", docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint" },
  { title: "NFTokenModify", jsref: "https://js.xrpl.org/interfaces/NFTokenModify.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenModify", docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmodify" },
  { title: "OracleDelete", jsref: "https://js.xrpl.org/interfaces/OracleDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OracleDelete", docref: "https://xrpl.org/docs/references/protocol/transactions/types/oracledelete" },
  { title: "OracleSet", jsref: "https://js.xrpl.org/interfaces/OracleSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OracleSet", docref: "https://xrpl.org/docs/references/protocol/transactions/types/oracleset" },
  { title: "SetRegularKey", jsref: "https://js.xrpl.org/interfaces/SetRegularKey.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.SetRegularKey", docref: "https://xrpl.org/docs/references/protocol/transactions/types/setregularkey" },
  { title: "SignerListSet", jsref: "https://js.xrpl.org/interfaces/SignerListSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.SignerListSet", docref: "https://xrpl.org/docs/references/protocol/transactions/types/signerlistset" },
  { title: "TicketCreate", jsref: "https://js.xrpl.org/interfaces/TicketCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.TicketCreate", docref: "https://xrpl.org/docs/references/protocol/transactions/types/ticketcreate" },
  { title: "PaymentChannelClaim", jsref: "https://js.xrpl.org/interfaces/PaymentChannelClaim.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelClaim", docref: "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelclaim" },
  { title: "PaymentChannelCreate", jsref: "https://js.xrpl.org/interfaces/PaymentChannelCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelCreate", docref: "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelcreate" },
  { title: "PaymentChannelFund", jsref: "https://js.xrpl.org/interfaces/PaymentChannelFund.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelFund", docref: "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelfund" }
];

// 재사용 모달
function Modal({
  title,
  open,
  onClose,
  children,
  mounted,
  panelClassName,
  contentClassName,
  headerActions,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  mounted: boolean;
  panelClassName?: string;
  contentClassName?: string;
  headerActions?: ReactNode;
}) {
  if (!mounted || !open) return null;
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-6"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        >
          <div
            className={`min-w-[320px] rounded-2xl border border-white/20 bg-neutral-800 p-6 shadow-2xl backdrop-blur ${panelClassName ?? "w-[66vw] max-w-[1280px]"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <div className="flex items-center gap-2">
                {headerActions}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-white/80"
                >
                  닫기
                </button>
              </div>
            </div>
          <div className={`mt-4 overflow-auto rounded-xl border border-white/10 bg-black/50 p-4 text-white/60 ${contentClassName ?? "h-[66vh]"}`}>
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
//메인 함수
export default function Sidebar({ open, onClose, onInsertTx, context }: SidebarProps) {
  // 공통 상태
  const [decoderInput, setDecoderInput] = useState<string>("");
  const [tooltipEnabled, setTooltipEnabled] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filteredRecipes = useMemo(() => {
    const q = recipeQuery.trim().toLowerCase();
    if (!q) return RECIPES;
    return RECIPES.filter((r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [recipeQuery]);

  // 섹션별 모달 ON/OFF
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isErrorsOpen, setIsErrorsOpen] = useState(false);
  const [isFlagsOpen, setIsFlagsOpen] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [errorQuery, setErrorQuery] = useState("");
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [flagQuery, setFlagQuery] = useState("");
  const flagsTooltip = useMarkdownTooltip("/flags-tooltip.md");
  const txLibraryTooltip = useMarkdownTooltip("/tx-library-tooltip.md");
  const errorCodesTooltip = useMarkdownTooltip("/error-codes-tooltip.md");
  const usageTooltip = useMarkdownTooltip("/dev-console-usage-tooltip.md");
  const filteredErrorCodes = useMemo(() => {
    const q = errorQuery.trim().toLowerCase();
    if (!q) return ERROR_CODES;
    return ERROR_CODES.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        e.class.toLowerCase().includes(q),
    );
  }, [errorQuery]);

  const filteredFlags = useMemo(() => {
    const q = flagQuery.trim().toLowerCase();
    if (!q) return FLAG_ITEMS;
    return FLAG_ITEMS.filter((item) =>
      [ item.title, item.description].some((field) =>
        field?.toLowerCase().includes(q),
      ),
    );
  }, [flagQuery]);

  const fireTooltipToggle = (on: boolean) => {
    setTooltipEnabled(on);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("xrpl-dev:toggle-tooltips", { detail: { enabled: on } }));
    }
  };


  return (
    <div className="flex h-full flex-col gap-3">
      {/* 헤더 고정 */}
      <div className="flex items-center justify-between">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dev Console Tools</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="group relative inline-flex">
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              aria-describedby="dev-console-usage-tooltip"
            >
              사용법
            </button>
            <div
              id="dev-console-usage-tooltip"
              role="tooltip"
              className={`${TOOLTIP_OVERLAY_CLASS} left-16 w-[min(1100px,70vw)] max-w-[1100px] h-[600px]`}
            >
              <MarkdownTooltipPanel
                state={usageTooltip}
                emptyMessage="표시할 Markdown 내용이 없습니다. `public/dev-console-usage-tooltip.md` 파일을 업데이트하세요."
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 2) XRP Ledger(XRPL) 소개 */}
      <a
        href="https://catalyze-research.notion.site/XRP-Ledger-XRPL-ee6270fcf3d84713864dccfad26d77f3?source=copy_link"
        target="_blank"
        rel="noreferrer"
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● XRP Ledger(XRPL) 소개</p>
        </div>
      </a>

      {/* 3) Transaction Library */}
      <button
        type="button"
        onClick={() => setIsLibraryOpen(true)}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30 "
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Transaction Library</p>
        </div>
      </button>

      {/* 4) Error Codes */}
      <button
        type="button"
        onClick={() => setIsErrorsOpen(true)}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Error Codes</p>
        </div>
      </button>

      {/* 4-1) Flags */}
      <button
        type="button"
        onClick={() => setIsFlagsOpen(true)}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Flags</p>
        </div>
      </button>

      {/* 5) Developer Links */}
      <button
        type="button"
        onClick={() => setIsLinksOpen(true)}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Developer Links</p>
        </div>
      </button>

      {/* 6) XRPL Community */}
      <button
        type="button"
        onClick={() => setIsCommunityOpen(true)}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● XRPL Community</p>
        </div>
      </button>
      {/* 7) Updates */}
      <button
        type="button"
        onClick={() => setIsUpdateOpen(true)}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Updates</p>
        </div>
      </button>

      <Modal title="Updates" open={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} mounted={mounted} >
        <div className="flex items-center justify-between ">
          <span className=" text-xl font-bold text-white/90">기능 추가 및 수정 로그, 향후 개선사항</span>
         
        </div>
        <p className="mt-2 text-sm text-white/80">
          ※ 2025/11/05: 초기 계획상의 전체적인 메인페이지 및 사이드바 기능 구현 완료
        </p>
        <p className="mt-2 text-sm text-white/80">
        ※ 2025/11/07: 우측 그리드 상단 XRPL GPT 링크 연결버튼 추가(OpenAI Brand Kit 규칙 준수), 사이드바에 Flags 메뉴 추가(기능 구현 X), Tx Library에 Clawback 추가
        </p>
        <p className="mt-2 text-sm text-white/80">
        ※ 2025/11/08: IOU Balance 조회 방식 버튼으로 변경
        </p>
        <p className="mt-2 text-sm text-white/80">
        ※ 2025/11/11: 사이드바 상단 사용법 및 Tx Library, Error Codes, Flags 메뉴 팝업에 툴팁 오버레이 추가, (Markdown 형식의 가이드 팝업)
        </p>
        <p className="mt-2 text-sm text-white/80">
        ※ 2025/11/12: Tx Library 개선: Insert되는 트랜잭션 json 내부 한글 설명 추가, 해당 트랜잭션에 대한 xrpl.org(공식 docs 링크) 버튼 추가. Transaction History 모달에서 Hash 클릭 시 연결된 네트워크의 XRPL Explorer로 이동
        </p>
        <p className="mt-2 text-sm text-white/80">
        ※ 2025/11/13: Girin Wallet 연결 모달 구현(초기 단계)
        </p>
        <p className="mt-2 text-sm text-white/80">
          ※ 향후 개선사항: Girin Wallet 연결 후 기능 이용 시 발생하는 Error case 관련 수정, UI 개선, Transaction History 설명 문서 추가
        </p>
        
      </Modal>

      {/* 3) XRPL Community */}
      <Modal
        title="XRPL Community"
        open={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
        mounted={mounted}
        panelClassName="w-[540px] max-w-[92vw]"
        contentClassName="h-[60vh]"
      >
        <ul className="grid grid-cols-1 gap-2 text-sm">
          {COMMUNITY_LINKS.map((it) => (
            <li key={it.id}>
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:border-white/20 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <div className="mt-0.5 text-white/80 group-hover:text-white">{it.icon}</div>
                <div className="min-w-0">
                  <div className="text-white font-medium">{it.title}</div>
                  <div className="text-xs text-white/70">{it.desc}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Modal>

      {/* 4) Error Codes */}
      <Modal
        title="Error Codes"
        open={isErrorsOpen}
        onClose={() => setIsErrorsOpen(false)}
        mounted={mounted}
        headerActions={
          <div className="group relative inline-flex">
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              aria-describedby="error-codes-tooltip-info"
            >
              Error Codes란?
            </button>
            <div id="error-codes-tooltip-info" role="tooltip" className={TOOLTIP_OVERLAY_CLASS}>
              <MarkdownTooltipPanel
                state={errorCodesTooltip}
                emptyMessage="표시할 Markdown 내용이 없습니다. `public/error-codes-tooltip.md` 파일을 업데이트하세요."
              />
            </div>
          </div>
        }
      >
        {/* 상단 좌측 버튼바 + 검색창 */}
        <div className="sticky top-0 z-10 -mt-1 mb-3 flex flex-wrap items-center justify-start gap-2 rounded-lg border border-white/20 bg-black/100 p-2">
           
          {/* 검색 입력 */}
          <input
            value={errorQuery}
            onChange={(e) => setErrorQuery(e.target.value)}
            placeholder='코드/설명 검색: 예) "tecNO_DST"'
            className="basis-full sm:basis-[260px] grow rounded-md border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
            spellCheck={false}
          />
        </div>

        

        {/* 결과 그리드 */}
        {filteredErrorCodes.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/60">
            결과 없음.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-2 text-xs text-white/85 sm:grid-cols-2">
            {filteredErrorCodes.map((e) => (
              <li key={e.code} className="rounded-md border border-white/10 bg-black/40 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[12px] text-white">{e.code}</code>
                </div>
                <div className="flex items-center gap-2">
                {docUrlFor(e.class) && (
                  <a
                    href={docUrlFor(e.class)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white/95 hover:bg-white/20"
                  >
                    상세
                  </a>
                  )}
                </div>
              </div>
              <p className="text-white/80">{e.message}</p>
            </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Flags */}
      <Modal
        title="Flags"
        open={isFlagsOpen}
        onClose={() => setIsFlagsOpen(false)}
        mounted={mounted}
        headerActions={
          <div className="group relative inline-flex">
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              aria-describedby="flags-tooltip-info"
            >
              Flags란?
            </button>
            <div id="flags-tooltip-info" role="tooltip" className={TOOLTIP_OVERLAY_CLASS}>
              <MarkdownTooltipPanel
                state={flagsTooltip}
                emptyMessage="표시할 Markdown 내용이 없습니다. `public/flags-tooltip.md` 파일을 업데이트하세요."
              />
            </div>
          </div>
        }
      >
        <div className="sticky top-0 z-10 -mt-1 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-black/100 p-2">
          <input
            value={flagQuery}
            onChange={(e) => setFlagQuery(e.target.value)}
            placeholder="플래그 이름/설명 검색"
            className="basis-full sm:basis-[260px] grow rounded-md border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
            spellCheck={false}
          />
        </div>
        {filteredFlags.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/60">
            아직 등록된 플래그가 없습니다.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-2 text-xs text-white/85 sm:grid-cols-2">
            {filteredFlags.map((flag) => (
              <li key={flag.id} className="rounded-md border border-white/10 bg-black/40 p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {flag.title || "(제목 미정)"}
                    </p>
                    <p className="text-xs text-white/60">
                      {typeof flag.flag === "number" && Number.isFinite(flag.flag)
                        ? `플래그 값(Decimal): ${flag.flag}`
                        : "(Flag 값 미정)"}
                    </p>
                  </div>
                  {flag.detailUrl ? (
                    <a
                      href={flag.detailUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white/95 hover:bg-white/20"
                    >
                      상세
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white/60 opacity-40 cursor-not-allowed"
                    >
                      상세
                    </button>
                  )}
                </div>
                <p className="text-white/75">
                  {flag.description || "아직 설명이 준비되지 않았습니다."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
      
      {/*  Developer Links */}
      <Modal
        title="Developer Links"
        open={isLinksOpen}
        onClose={() => setIsLinksOpen(false)}
        mounted={mounted}
        panelClassName="w-[540px] max-w-[92vw]"
        contentClassName="h-[60vh]"
      >
        <ul className="grid grid-cols-1 gap-2 text-sm">
          {DEV_LINKS.map((it) => (
            <li key={it.id}>
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:border-white/20 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <div className="mt-0.5 text-white/80 group-hover:text-white">{it.icon}</div>
                <div className="min-w-0">
                  <div className="text-white font-medium">{it.title}</div>
                  <div className="text-xs text-white/70">{it.desc}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Modal>

      {/* 6) Transaction Library */}
      <Modal
        title="Transaction Library"
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        mounted={mounted}
        contentClassName="h-[66vh] text-white/85"
        headerActions={
          <div className="group relative inline-flex">
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              aria-describedby="tx-library-tooltip-info"
            >
              Tx Library 사용법
            </button>
            <div id="tx-library-tooltip-info" role="tooltip" className={TOOLTIP_OVERLAY_CLASS}>
              <MarkdownTooltipPanel
                state={txLibraryTooltip}
                emptyMessage="표시할 Markdown 내용이 없습니다. `public/tx-library-tooltip.md` 파일을 업데이트하세요."
              />
            </div>
          </div>
        }
      >
        <input
          value={recipeQuery}
          onChange={(e) => setRecipeQuery(e.target.value)}
          placeholder="검색 (Transaction title)"
          className="mb-3 w-full rounded-lg border border-white/10 bg-black/50 p-2 text-xs text-white outline-none focus:border-white/30"
        />
        <ul className="space-y-2">
        {filteredRecipes.map((r) => {
          const json = pretty(r.build(context));

          // 상태 결정 로직
          const networkStatus = r.isMainnetActive
            ? ["Mainnet", "Testnet", "Devnet"] // 메인넷 활성화된 경우
            : ["Devnet"]; // 메인넷 비활성화된 경우 (Devnet만 활성화)

          // 해당 트랜잭션에 맞는 링크 찾기
          const txLinkData = txLink.find(tx => tx.title === r.title);

          return (
            <li key={r.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  {/* 상태 바 표시 */}
                  {networkStatus.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/60">활성 네트워크:</span>
                      {networkStatus.map((status, index) => (
                        <span
                          key={index}
                          className={`text-xs font-medium ${
                            r.isMainnetActive ? "text-green-500" : "text-yellow-500"
                          }`}
                        >
                          {status}
                          {index < networkStatus.length - 1 && ", "} {/* 쉼표 추가 */}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex gap-2">
                  {/* Insert 버튼 */}
                  <button
                    type="button"
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    onClick={() => {
                      onInsertTx(json, "replace");
                      setIsLibraryOpen(false);
                      onClose();
                      setTimeout(() => {
                        const el = document.querySelector(
                          '#tx-editor, [data-tx-editor="true"], textarea[name="tx"]'
                        ) as HTMLTextAreaElement | null;

                        // 여기서 highlight 클래스를 추가하여 효과를 줍니다.
                        if (el) {
                          el.classList.add("highlight");
                          el.focus(); // textarea 포커스
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                          window.dispatchEvent(new CustomEvent("xrpl-dev:focus-editor"));

                          // 하이라이트 효과 후 클래스 제거 (0.5초 후)
                          setTimeout(() => {
                            el.classList.remove("highlight");
                          }, 500); // 0.5초 후 하이라이트 제거
                        }
                      }, 0);
                    }}
                  >
                    Insert
                  </button>
                  {/* 설명 버튼: 링크 없으면 비활성 */}
                  {txLinkData?.docref ? (
                    <a
                      href={txLinkData.docref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    >
                      <span>xrpl.org docs</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="설명 링크 준비 중"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold opacity-40 cursor-not-allowed"
                    >
                      설명
                    </button>
                  )}

                  {/* xrpl.js 버튼 */}
                  {txLinkData?.jsref && (
                    <a
                      href={txLinkData.jsref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    >
                      <span>xrpl.js</span>
                    </a>
                  )}

                  {/* xrpl-py 버튼 */}
                  {txLinkData?.pyref && (
                    <a
                      href={txLinkData.pyref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    >
                      <span>xrpl-py</span>
                    </a>
                  )}
                
                </div>
              </div>
            </li>
          );
        })}

        </ul>
      </Modal>
    </div>
  );
}
