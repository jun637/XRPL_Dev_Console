"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type HoverTooltipProps = {
  text: ReactNode;
  children: ReactNode;
  /** Max width in px. Defaults to 400. */
  maxWidth?: number;
  /** Allow pointer events on tooltip (for links). Defaults to false. */
  interactive?: boolean;
};

export function HoverTooltip({
  text,
  children,
  maxWidth = 400,
  interactive = false,
}: HoverTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const suppressedRef = useRef(false);
  const hoveringTooltipRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const cancelHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const dismiss = useCallback(() => {
    cancelHideTimeout();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    hoveringTooltipRef.current = false;
    setVisible(false);
    setCoords(null);
  }, []);

  const show = useCallback(() => {
    if (suppressedRef.current) return;
    cancelHideTimeout();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 150);
  }, []);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    suppressedRef.current = false;
    if (interactive) {
      // Give time to move mouse to tooltip
      hideTimeoutRef.current = setTimeout(() => {
        if (!hoveringTooltipRef.current) {
          dismiss();
        }
      }, 100);
    } else {
      dismiss();
    }
  }, [interactive, dismiss]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelHideTimeout();
    };
  }, []);

  // Click → suppress tooltip until mouse fully leaves
  const handleClick = useCallback(() => {
    suppressedRef.current = true;
    dismiss();
  }, [dismiss]);

  // After tooltip renders in portal, measure and position it
  useEffect(() => {
    if (!visible || !tooltipRef.current || !wrapperRef.current) return;

    const wrapper = wrapperRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const pad = 12;

    let top: number;
    if (wrapper.bottom + tooltip.height + 8 + pad > window.innerHeight) {
      top = wrapper.top - tooltip.height - 8;
    } else {
      top = wrapper.bottom + 8;
    }
    top = Math.max(pad, top);

    let left = wrapper.left + wrapper.width / 2 - tooltip.width / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - tooltip.width - pad));

    setCoords({ top, left });
  }, [visible]);

  const tooltipHandlers = interactive
    ? {
        onMouseEnter: () => {
          cancelHideTimeout();
          hoveringTooltipRef.current = true;
        },
        onMouseLeave: () => {
          hoveringTooltipRef.current = false;
          dismiss();
        },
      }
    : {};

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={handleClick}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {mounted && visible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            {...tooltipHandlers}
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              maxWidth,
              opacity: coords ? 1 : 0,
              pointerEvents: interactive ? "auto" : "none",
            }}
            className="z-[9999] w-max rounded-xl border border-white/20 bg-neutral-900/95 px-4 py-3 text-[13px] leading-relaxed text-white/90 shadow-2xl backdrop-blur"
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  );
}
