"use client";

import type { ReactNode } from "react";
import type { DevLinkIcon } from "@/data/xrpl/devLinks";

const IconDoc = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path d="M7 3h7l5 5v13H7V3z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconJs = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <text x="6.5" y="16" fontSize="9" fill="currentColor">
      JS
    </text>
  </svg>
);

const IconPy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <rect x="3" y="3" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="12" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconTelegram = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path
      d="M20.5 4.5L3.8 11.1c-.8.3-.8 1.4 0 1.7l4.5 1.6 1.7 4.6c.3.8 1.4.8 1.8 0l2.9-5.3 4.7-7.7c.4-.7-.3-1.5-1.1-1.2z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const IconDiscord = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path
      d="M8 6.5c2-.8 6-.8 8 0 1.7.7 3 2.9 3 5.3v5.2c0 .6-.5 1-1.1.9a16.9 16.9 0 0 0-3.2-.8l-.7 1.4c-1.9.3-3.9.3-5.8 0l-.7-1.4c-1.1.2-2.2.5-3.2.8-.6.2-1.1-.3-1.1-.9v-5.2c0-2.4 1.3-4.6 3-5.3z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="9.5" cy="12" r="1" fill="currentColor" />
    <circle cx="14.5" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const DEV_LINK_ICON_MAP: Record<DevLinkIcon, ReactNode> = {
  doc: <IconDoc />,
  js: <IconJs />,
  py: <IconPy />,
  globe: <IconGlobe />,
  x: <IconX />,
  telegram: <IconTelegram />,
  discord: <IconDiscord />,
};
