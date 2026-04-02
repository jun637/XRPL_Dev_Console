"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { MarkdownTooltipPanel, TOOLTIP_OVERLAY_CLASS, useMarkdownTooltip } from "@/components/markdown/MarkdownTooltip";
import type { SidebarProps } from "@/components/sidebar/types";
import { TxRecipeList } from "@/components/sidebar/TxRecipeList";
import { ErrorCodeList } from "@/components/sidebar/ErrorCodeList";
import { FlagList } from "@/components/sidebar/FlagList";
import { COMMUNITY_LINKS, DEV_LINKS } from "@/data/xrpl/devLinks";
import { DEV_LINK_ICON_MAP } from "@/components/ui/DevLinkIcons";
import '../app/globals.css';

// 649 ~ 689 - 아이콘 정의(이미지로 대체 가능성 있음)



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
export default function Sidebar({
  open,
  onClose,
  onInsertTx,
  context,
  isTxLibraryOpen,
  onOpenTxLibrary,
  onCloseTxLibrary,
  isErrorModalOpen,
  onOpenErrorModal,
  onCloseErrorModal,
  isFlagModalOpen,
  onOpenFlagModal,
  onCloseFlagModal,
  isLinksModalOpen,
  onOpenLinksModal,
  onCloseLinksModal,
  isCommunityModalOpen,
  onOpenCommunityModal,
  onCloseCommunityModal,
  isUpdateModalOpen,
  onOpenUpdateModal,
  onCloseUpdateModal,
  onCloseAllModals,
  onOpenScenario,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 섹션별 모달 ON/OFF
  const flagsTooltip = useMarkdownTooltip("/flags-tooltip.md");
  const txLibraryTooltip = useMarkdownTooltip("/tx-library-tooltip.md");
  const errorCodesTooltip = useMarkdownTooltip("/error-codes-tooltip.md");
  const handleCloseSidebar = () => {
    onCloseAllModals();
    onClose();
  };


  return (
    <div className="flex h-full flex-col gap-3">
      {/* 헤더 고정 */}
      <div className="flex items-center justify-between">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dev Console Tools</h3>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://catalyze-research.notion.site/XRPL-Dev-Console-Developer-Guide-2a2898c680bf8091818ddb4f08a832e5?source=copy_link"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          >
            사용법
          </a>
          <button
            type="button"
            onClick={handleCloseSidebar}
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

      {/* Scenario Guide */}
      {onOpenScenario && (
        <button
          type="button"
          onClick={() => {
            handleCloseSidebar();
            onOpenScenario();
          }}
          className="group w-full rounded-xl border border-[#D4FF9A]/30 bg-[#D4FF9A]/5 p-4 text-left hover:border-[#D4FF9A]/50 hover:bg-[#D4FF9A]/10 focus:outline-none focus:ring-2 focus:ring-[#D4FF9A]/30"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#D4FF9A]">● Scenario Guide</p>
            <span className="text-[10px] font-semibold text-[#D4FF9A]/60 rounded-full border border-[#D4FF9A]/30 px-2 py-0.5">NEW</span>
          </div>
        </button>
      )}

      {/* 3) Transaction Library */}
      <button
        type="button"
        onClick={onOpenTxLibrary}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30 "
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Transaction Library</p>
        </div>
      </button>

      {/* 4) Error Codes */}
      <button
        type="button"
        onClick={onOpenErrorModal}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Error Codes</p>
        </div>
      </button>

      {/* 4-1) Flags */}
      <button
        type="button"
        onClick={onOpenFlagModal}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Flags</p>
        </div>
      </button>

      {/* 5) Developer Links */}
      <button
        type="button"
        onClick={onOpenLinksModal}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Developer Links</p>
        </div>
      </button>

      {/* 6) XRPL Community */}
      <button
        type="button"
        onClick={onOpenCommunityModal}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● XRPL Community</p>
        </div>
      </button>
      {/* Updates — KFIP 2026 기간 동안 비활성화
      <button
        type="button"
        onClick={onOpenUpdateModal}
        className="group w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/20 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">● Updates</p>
        </div>
      </button>

      <Modal title="Updates" open={isUpdateModalOpen} onClose={onCloseUpdateModal} mounted={mounted} >
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
      */}

      {/* 3) XRPL Community */}
      <Modal
        title="XRPL Community"
        open={isCommunityModalOpen}
        onClose={onCloseCommunityModal}
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
                <div className="mt-0.5 text-white/80 group-hover:text-white">{DEV_LINK_ICON_MAP[it.icon]}</div>
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
        open={isErrorModalOpen}
        onClose={onCloseErrorModal}
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
        <ErrorCodeList />
      </Modal>

      {/* Flags */}
      <Modal
        title="Flags"
        open={isFlagModalOpen}
        onClose={onCloseFlagModal}
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
        <FlagList />
      </Modal>
      
      {/*  Developer Links */}
      <Modal
        title="Developer Links"
        open={isLinksModalOpen}
        onClose={onCloseLinksModal}
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
                <div className="mt-0.5 text-white/80 group-hover:text-white">{DEV_LINK_ICON_MAP[it.icon]}</div>
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
        open={isTxLibraryOpen}
        onClose={onCloseTxLibrary}
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
        <TxRecipeList
          context={context}
          onInsertTx={onInsertTx}
          onCloseLibrary={onCloseTxLibrary}
          onCloseSidebar={handleCloseSidebar}
        />
      </Modal>
    </div>
  );
}
