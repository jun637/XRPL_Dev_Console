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

const markdownComponents = {
  a: ({ node: _node, ...props }: ComponentProps<"a"> & { node?: unknown }) => (
    <a {...props} target="_blank" rel="noreferrer" />
  ),
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
  {
    id: "payment-xrp",
    title: "Payment (XRP)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: "1000000",
    }),
  },
  {
    id: "payment-iou",
    title: "Payment (IOU)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: { currency: "USD", value: "10", issuer: "" },
    }),
  },
  {
    id: "payment-mpt",
    title: "Payment (MPT)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: { currency: "MPT", value: "10", issuer: "" },
    }),
  },
  {
    id: "payment-amm-swap",
    title: "Payment (AMM Swap)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: "1000000",
    }),
  },
  {
    id: "accountset",
    title: "AccountSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AccountSet",
      Account: ctx?.walletAddress ?? "",
      SetFlag: 1,
    }),
  },
  {
    id: "trustset",
    title: "TrustSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "TrustSet",
      Account: ctx?.walletAddress ?? "",
      LimitAmount: { currency: "USD", issuer: "", value: "1000" },
    }),
  },
  {
    id: "credential-create",
    title: "CredentialCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialCreate",
      Account: ctx?.walletAddress ?? "",
      CredentialData: "Sample Data",
    }),
  },
  {
    id: "credential-accept",
    title: "CredentialAccept",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialAccept",
      Account: ctx?.walletAddress ?? "",
      CredentialID: "12345",
    }),
  },
  {
    id: "credential-delete",
    title: "CredentialDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialDelete",
      Account: ctx?.walletAddress ?? "",
      CredentialID: "12345",
    }),
  },
  {
    id: "clawback",
    title: "Clawback",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Clawback",
      Account: "회수자 주소",
      Amount: { currency: "회수할 토큰", issuer: "보유자 주소", value: "회수할 수량" },
    }),
  },
  {
    id: "mp-token-issuance-create",
    title: "MPTokenIssuanceCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceCreate",
      Account: ctx?.walletAddress ?? "",
      TokenAmount: "1000000",
    }),
  },
  {
    id: "mp-token-issuance-destroy",
    title: "MPTokenIssuanceDestroy",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceDestroy",
      Account: ctx?.walletAddress ?? "",
      TokenAmount: "1000000",
    }),
  },
  {
    id: "mp-token-issuance-set",
    title: "MPTokenIssuanceSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceSet",
      Account: ctx?.walletAddress ?? "",
      TokenAmount: "1000000",
    }),
  },
  {
    id: "mp-token-authorize",
    title: "MPTokenAuthorize",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenAuthorize",
      Account: ctx?.walletAddress ?? "",
      TokenID: "12345",
    }),
  },
  {
    id: "offercreate-permissioned",
    title: "OfferCreate (Permissioned)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "OfferCreate",
      Account: ctx?.walletAddress ?? "",
      TakerGets: "10000000",
      TakerPays: { currency: "USD", value: "50", issuer: "" },
    }),
  },
  {
    id: "offercreate-general",
    title: "OfferCreate (General)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OfferCreate",
      Account: ctx?.walletAddress ?? "",
      TakerGets: "10000000",
      TakerPays: { currency: "USD", value: "50", issuer: "" },
    }),
  },
  {
    id: "offercancel",
    title: "OfferCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OfferCancel",
      Account: ctx?.walletAddress ?? "",
      OfferSequence: "12345",
    }),
  },
  {
    id: "escrowcreate-xrp",
    title: "EscrowCreate (XRP)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: "5000000",
      FinishAfter: 800000000,
    }),
  },
  {
    id: "escrowcreate-iou",
    title: "EscrowCreate (IOU)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: { currency: "USD", value: "5000", issuer: "" },
      FinishAfter: 800000000,
    }),
  },
  {
    id: "escrowcreate-mpt",
    title: "EscrowCreate (MPT)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: ctx?.walletAddress ?? "",
      Destination: "",
      Amount: { currency: "USD", value: "5000", issuer: "" },
      FinishAfter: 800000000,
    }),
  },
  {
    id: "escrowfinish",
    title: "EscrowFinish",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowFinish",
      Account: ctx?.walletAddress ?? "",
      Owner: "",
      OfferSequence: "12345",
    }),
  },
  {
    id: "escrowcancel",
    title: "EscrowCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowCancel",
      Account: ctx?.walletAddress ?? "",
      Owner: "",
      OfferSequence: "12345",
    }),
  },
  {
    id: "batch",
    title: "Batch",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "Batch",
      Account: ctx?.walletAddress ?? "",
      Transactions: [],
    }),
  },
  {
    id: "ammcreate",
    title: "AMMCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMCreate",
      Account: ctx?.walletAddress ?? "",
      Asset: { currency: "XRP" },
      Amount: "1000000",
      Flags: 0,
    }),
  },
  {
    id: "ammdeposit",
    title: "AMMDeposit",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMDeposit",
      Account: ctx?.walletAddress ?? "",
      Asset: { currency: "XRP" },
      Amount: "1000000",
      Flags: 0,
    }),
  },
  {
    id: "ammwithdraw",
    title: "AMMWithdraw",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMWithdraw",
      Account: ctx?.walletAddress ?? "",
      Asset: { currency: "XRP" },
      Amount: "1000000",
    }),
  },
  {
    id: "ammdelete",
    title: "AMMDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMDelete",
      Account: ctx?.walletAddress ?? "",
      Asset: { currency: "XRP" },
      Amount: "1000000",
    }),
  },
  {
    id: "amm-bid",
    title: "AMMBid",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMBid",
      Account: ctx?.walletAddress ?? "",
      Amount: "1000000",
    }),
  },
  {
    id: "amm-vote",
    title: "AMMVote",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMVote",
      Account: ctx?.walletAddress ?? "",
      Vote: "Yes",
    }),
  },
  {
    id: "amm-clawback",
    title: "AMMClawback",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMClawback",
      Account: ctx?.walletAddress ?? "",
      Amount: "1000000",
    }),
  },
  {
    id: "nftmint",
    title: "NFTokenMint",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenMint",
      Account: ctx?.walletAddress ?? "",
      URI: Buffer.from("ipfs://Qm...").toString("hex"),
      NFTokenTaxon: 0,
    }),
  },
  {
    id: "nfTokenburn",
    title: "NFTokenBurn",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenBurn",
      Account: ctx?.walletAddress ?? "",
      NFTokenID: "12345",
    }),
  },
  {
    id: "nfTokencreateoffer",
    title: "NFTokenCreateOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenCreateOffer",
      Account: ctx?.walletAddress ?? "",
      NFTokenID: "12345",
      TakerGets: "1000000",
      TakerPays: { currency: "USD", value: "50", issuer: "" },
    }),
  },
  {
    id: "nfTokenacceptoffer",
    title: "NFTokenAcceptOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenAcceptOffer",
      Account: ctx?.walletAddress ?? "",
      NFTokenID: "12345",
      OfferSequence: "12345",
    }),
  },
  {
    id: "nft-cancel-offer",
    title: "NFTokenCancelOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenCancelOffer",
      Account: ctx?.walletAddress ?? "",
      NFTokenID: "12345",
      OfferSequence: "67890",
    }),
  },
  {
    id: "nfTokenmodify",
    title: "NFTokenModify",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenModify",
      Account: ctx?.walletAddress ?? "",
      NFTokenID: "12345",
      URI: Buffer.from("ipfs://newUri").toString("hex"),
    }),
  },
  {
    id: "oracledelete",
    title: "OracleDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OracleDelete",
      Account: ctx?.walletAddress ?? "",
      OracleID: "12345",
    }),
  },
  {
    id: "oracleset",
    title: "OracleSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OracleSet",
      Account: ctx?.walletAddress ?? "",
      OracleID: "12345",
      Fee: "1000000",
    }),
  },
  
  {
    id: "paymentchannelcreate",
    title: "PaymentChannelCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelCreate",
      Account: ctx?.walletAddress ?? "",
      Amount: "1000000",
      Destination: "",
    }),
  },
  {
    id: "paymentchannelfund",
    title: "PaymentChannelFund",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelFund",
      Account: ctx?.walletAddress ?? "",
      Channel: "12345",
      Amount: "500000",
    }),
  },
  {
    id: "paymentchannelclaim",
    title: "PaymentChannelClaim",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelClaim",
      Account: ctx?.walletAddress ?? "",
      Channel: "12345",
      Amount: "1000000",
    }),
  },
  
  {
    id: "permissioned-domain-set",
    title: "PermissionedDomainSet",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "PermissionedDomainSet",
      Account: ctx?.walletAddress ?? "",
      Domain: "example.com",
    }),
  },
  {
    id: "permissioned-domain-delete",
    title: "PermissionedDomainDelete",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "PermissionedDomainDelete",
      Account: ctx?.walletAddress ?? "",
      Domain: "example.com",
    }),
  },
  
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
        "발행자가 Trustline에서 자산을 회수(Clawback)할 수 있도록 허용. 한번번 설정하면 되돌릴 수 없음",
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
      title: "tfNoDirectRipple",
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
      description: "소유권 이전 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-mutable",
      flag: 16,
      title: "tfMutable",
      description: "발행 후 메타데이터 수정 허용",
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
  { id: "explorer-mainnet", title: "XRPL Explorer Mainnet", desc: "XRPL 메인넷 트랜잭션 브라우저", href: "https://livenet.xrpl.org", icon: <IconGlobe /> },
  { id: "xrpscan", title: "XRPScan", desc: "XRPL 대체 익스플로러", href: "https://xrpscan.com", icon: <IconGlobe /> },
];

const txLink: TxLink[]= [
  { title: "Payment (XRP)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment", docref: "https://catalyze-research.notion.site/Payment-XRP-2a2898c680bf80e78109d8cb05ab044b?source=copy_link"},
  { title: "Payment (IOU)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment" , docref: ""},
  { title: "Payment (MPT)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment" , docref: ""},
  { title: "Payment (AMM Swap)", jsref: "https://js.xrpl.org/interfaces/Payment.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment" , docref: ""},
  { title: "AccountSet", jsref: "https://js.xrpl.org/interfaces/AccountSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AccountSet" , docref: ""},
  { title: "TrustSet", jsref: "https://js.xrpl.org/interfaces/TrustSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.TrustSet" , docref: ""},
  { title: "OfferCreate (Permissioned)", jsref: "https://js.xrpl.org/interfaces/OfferCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCreate" , docref: ""},
  { title: "OfferCreate (General)", jsref: "https://js.xrpl.org/interfaces/OfferCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCreate" , docref: ""},
  { title: "OfferCancel", jsref: "https://js.xrpl.org/interfaces/OfferCancel.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCancel" , docref: ""},
  { title: "EscrowCreate (XRP)", jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate" , docref: ""},
  { title: "EscrowCreate (IOU)", jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate" , docref: ""},
  { title: "EscrowCreate (MPT)", jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate" , docref: ""}, 
  { title: "EscrowFinish", jsref: "https://js.xrpl.org/interfaces/EscrowFinish.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowFinish" , docref: ""},
  { title: "EscrowCancel", jsref: "https://js.xrpl.org/interfaces/EscrowCancel.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCancel" , docref: ""},
  { title: "Batch", jsref: "https://js.xrpl.org/interfaces/Batch.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Batch" , docref: ""},
  { title: "AMMCreate", jsref: "https://js.xrpl.org/interfaces/AMMCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMCreate" , docref: ""},
  { title: "AMMDeposit", jsref: "https://js.xrpl.org/interfaces/AMMDeposit.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMDeposit", docref: "" },
  { title: "AMMWithdraw", jsref: "https://js.xrpl.org/interfaces/AMMWithdraw.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMWithdraw", docref: "" },
  { title: "AMMDelete", jsref: "https://js.xrpl.org/interfaces/AMMDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMDelete", docref: "" },
  { title: "AMMBid", jsref: "https://js.xrpl.org/interfaces/AMMBid.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMBid", docref: "" },
  { title: "AMMVote", jsref: "https://js.xrpl.org/interfaces/AMMVote.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMVote", docref: "" },
  { title: "AMMClawback", jsref: "https://js.xrpl.org/interfaces/AMMClawback.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMClawback", docref: "" },
  { title: "CredentialCreate", jsref: "https://js.xrpl.org/interfaces/CredentialCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialCreate", docref: "" },
  { title: "CredentialAccept", jsref: "https://js.xrpl.org/interfaces/CredentialAccept.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialAccept", docref: "" },
  { title: "CredentialDelete", jsref: "https://js.xrpl.org/interfaces/CredentialDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialDelete", docref: "" },
  { title: "Clawback", jsref: "https://js.xrpl.org/interfaces/Clawback.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Clawback", docref: "" },
  { title: "MPTokenIssuanceCreate", jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceCreate", docref: "" },
  { title: "MPTokenIssuanceDestroy", jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceDestroy.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceDestroy", docref: "" },
  { title: "MPTokenIssuanceSet", jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceSet", docref: "" },
  { title: "MPTokenAuthorize", jsref: "https://js.xrpl.org/interfaces/MPTokenAuthorize.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenAuthorize", docref: "" },
  { title: "PermissionedDomainSet", jsref: "https://js.xrpl.org/interfaces/PermissionedDomainSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PermissionedDomainSet", docref: "" },
  { title: "PermissionedDomainDelete", jsref: "https://js.xrpl.org/interfaces/PermissionedDomainDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PermissionedDomainDelete", docref: "" },
  { title: "NFTokenAcceptOffer", jsref: "https://js.xrpl.org/interfaces/NFTokenAcceptOffer.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenAcceptOffer", docref: "" },
  { title: "NFTokenBurn", jsref: "https://js.xrpl.org/interfaces/NFTokenBurn.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenBurn", docref: "" },
  { title: "NFTokenCancelOffer", jsref: "https://js.xrpl.org/interfaces/NFTokenCancelOffer.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenCancelOffer", docref: "" },
  { title: "NFTokenCreateOffer", jsref: "https://js.xrpl.org/interfaces/NFTokenCreateOffer.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenCreateOffer", docref: "" },
  { title: "NFTokenMint", jsref: "https://js.xrpl.org/interfaces/NFTokenMint.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenMint", docref: "" },
  { title: "NFTokenModify", jsref: "https://js.xrpl.org/interfaces/NFTokenModify.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenModify", docref: "" },
  { title: "OracleDelete", jsref: "https://js.xrpl.org/interfaces/OracleDelete.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OracleDelete", docref: "" },
  { title: "OracleSet", jsref: "https://js.xrpl.org/interfaces/OracleSet.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OracleSet", docref: "" },
  { title: "PaymentChannelClaim", jsref: "https://js.xrpl.org/interfaces/PaymentChannelClaim.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelClaim", docref: "" },
  { title: "PaymentChannelCreate", jsref: "https://js.xrpl.org/interfaces/PaymentChannelCreate.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelCreate", docref: "" },
  { title: "PaymentChannelFund", jsref: "https://js.xrpl.org/interfaces/PaymentChannelFund.html", pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelFund", docref: "" }
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
          ※ 향후 개선사항: Girin Wallet 연결 모달 구현, UI 개선, Transaction History 설명 문서 추가, Sidebar.tsx/Recipe 상세 업데이트
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
                      <span>설명</span>
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
