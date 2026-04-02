"use client";

import { useEffect, useRef, useState } from "react";

type GirinState = {
  available: boolean;
  connecting: boolean;
  connected: boolean;
};

type ConnectDropdownButtonProps = {
  onCreate: () => void;
  onLoad: () => void;
  onGirin?: () => void;
  className?: string;
  girinState?: GirinState;
};

export function ConnectDropdownButton({
  onCreate,
  onLoad,
  onGirin,
  className,
  girinState,
}: ConnectDropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node | null;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (menuRef.current?.querySelector("[data-menuitem]") as
          | HTMLElement
          | null)?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => setOpen((o) => !o);
  const choose = (fn: () => void) => {
    setOpen(false);
    setTimeout(() => fn(), 0);
  };

  const girinConnecting = girinState?.connecting ?? false;
  const girinConnected = girinState?.connected ?? false;
  const girinDisabled = girinState ? !girinState.available : false;
  const girinStatusText = girinConnected
    ? "Connected"
    : girinConnecting
      ? "Connecting..."
      : girinDisabled
        ? "Unavailable for this network"
        : "Open Girin App to connect with QR code";

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        Connect Wallet
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Connect options"
          className="absolute z-10 mt-1 w-64 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl"
        >
          <button
            type="button"
            data-menuitem
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10 focus:outline-none"
            onClick={() => choose(onCreate)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                choose(onCreate);
              }
              if (e.key === "ArrowDown") {
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
              }
              if (e.key === "ArrowUp") {
                (e.currentTarget.parentElement?.lastElementChild as HTMLElement | null)?.focus();
              }
            }}
          >
            Create New
            <span className="block text-xs text-white/70">
              Generate a new XRPL wallet
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10 focus:outline-none"
            onClick={() => choose(onLoad)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                choose(onLoad);
              }
              if (e.key === "ArrowDown") {
                (e.currentTarget.parentElement?.firstElementChild as HTMLElement | null)?.focus();
              }
              if (e.key === "ArrowUp") {
                (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
              }
            }}
          >
            Load Existing
            <span className="block text-xs text-white/70">
              Import a wallet using Seed &amp; Public Key
            </span>
          </button>

          {onGirin ? (
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              disabled={girinDisabled}
              onClick={() => choose(onGirin)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  choose(onGirin);
                }
                if (e.key === "ArrowDown") {
                  (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
                }
                if (e.key === "ArrowUp") {
                  (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
                }
              }}
            >
              Girin Wallet
              <span className="block text-xs text-white/70">{girinStatusText}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
