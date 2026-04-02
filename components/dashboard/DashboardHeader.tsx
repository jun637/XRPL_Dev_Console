"use client";

import Image from "next/image";
import type { JSX } from "react";
import type { NetworkKey } from "@/lib/xrpl/constants";
import { withBasePath } from "@/lib/utils/basePath";
import { HoverTooltip } from "@/components/ui/HoverTooltip";
import { TOOLTIP_TEXTS } from "@/data/tooltipTexts";

type NetworkItem = {
  key: NetworkKey;
  label: string;
};

type DashboardHeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  networks: NetworkItem[];
  activeNetwork: NetworkKey;
  onSelectNetwork: (network: NetworkKey) => void;
  connectionStatusMeta: { label: string; dotClass: string };
  connectionError: string | null;
  chatbotLauncherButton: JSX.Element | null;
};

export function DashboardHeader({
  isSidebarOpen,
  onToggleSidebar,
  networks,
  activeNetwork,
  onSelectNetwork,
  connectionStatusMeta,
  connectionError,
  chatbotLauncherButton,
}: DashboardHeaderProps) {
  return (
    <header className="space-y-8 ">
      <h1 className="relative -top-4 sm:-top-8 flex flex-wrap items-center justify-center gap-6 text-center text-3xl font-bold sm:text-[34px]">
        <Image
          src={withBasePath("/xrpl-logo.svg")}
          alt="XRPL 로고"
          width={350}
          height={60}
          priority
        />
        <span className="leading-tight font-bold sm:text-[35px]">Developer Console</span>
      </h1>
      <div
        className={`mt-2 z-[20] flex flex-wrap items-center gap-3 justify-center sm:justify-start ${isSidebarOpen ? "opacity-0 pointer-events-none" : ""}`}
      >
        {!isSidebarOpen && (
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/15 backdrop-blur hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="0" y1="4" x2="30" y2="4" />
              <line x1="0" y1="12" x2="30" y2="12" />
              <line x1="0" y1="20" x2="30" y2="20" />
            </svg>
          </button>
        )}
        <HoverTooltip text={TOOLTIP_TEXTS.networkTabs}>
          <div className="inline-flex items-center gap-0 rounded-full border border-white/20 bg-white/10 p-1">
            {networks.map((item) => {
              const isActive = item.key === activeNetwork;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectNetwork(item.key)}
                  className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                    isActive ? "bg-white text-black shadow-sm" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </HoverTooltip>
        <HoverTooltip text={TOOLTIP_TEXTS.connectionStatus}>
          <div className="flex items-center pointer-events-none text-sm text-white/80">
            <span className={`mr-2 text-base ${connectionStatusMeta.dotClass}`}>●</span>
            {connectionStatusMeta.label}
          </div>
        </HoverTooltip>
        {connectionError ? <p className="text-sm text-red-400">{connectionError}</p> : null}
        <div className="pointer-events-auto ml-auto">{chatbotLauncherButton}</div>
      </div>
    </header>
  );
}
