"use client";

import Image from "next/image";
import '../app/globals.css';
import type { JSX } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Client,
  Wallet,
  parseAccountRootFlags,
  type AccountInfoAccountFlags,
  type AccountInfoRequest,
  type AccountInfoResponse,
  type AccountLinesRequest,
  type AccountLinesResponse,
  type AccountTxRequest,
  type AccountTxResponse,
  type SubmittableTransaction,
} from "xrpl";
import {
  DEFAULT_NETWORK,
  NETWORKS,
  getNetworkConfig,
  isFaucetAvailable,
  type NetworkConfig,
  type NetworkKey,
} from "@/lib/xrpl/constants";
import { parseTxJsonInput, TxJsonParseError } from "@/lib/xrpl/parseTx";
import Sidebar from "../components/Sidebar";


type ConnectionStatus = "connecting" | "connected" | "error";

type FundWalletResponse = Awaited<ReturnType<Client["fundWallet"]>>;

type AccountDataState = "idle" | "loading" | "ready" | "not_found" | "error";

type MutableTx = Record<string, unknown> & {
  Account?: string;
  TransactionType?: string;
};

interface RippledError extends Error {
  data?: {
    error?: string;
    error_message?: string;
  };
}
interface AccountSnapshot {
  balanceXrp: string;
  iouBalance: string;
  mptBalance: string;
  sequence: number;
  ownerCount?: number;
  flags?: Partial<AccountInfoAccountFlags>;
}
interface SavedWallet {
  name: string;
  classicAddress: string;
  publicKey: string;
  seed: string;
}
interface TransactionSummary {
  engineResult: string | null;
  engineResultMessage: string | null;
  hash: string | null;
}
interface AccountTransactionEntry {
  tx: Record<string, unknown>;
  meta?: Record<string, unknown>;
  validated: boolean;
  hash: string | null;
  transactionType: string | null;
  date: number | null;
}

const networkList = Object.values(NETWORKS);

const defaultTxTemplate = `{
  "TransactionType": "TrustSet",
  "Account": "",
  "LimitAmount": {
    "currency": "ABC",
    "issuer": "",
    "value": "1000"
  }
}`;
const SAVED_WALLETS_STORAGE_KEY = "xrpltool:saved-wallets";

const COPY_FEEDBACK_DURATION_MS = 1500;

const rippleEpoch = 946684800;

const dropsToXrp = (drops: string): string => {
  const asNumber = Number(drops);
  if (Number.isNaN(asNumber)) {
    return "-";
  }
  return (asNumber / 1_000_000).toFixed(6);
};

const summarizeIssuedBalances = (
  lines: AccountLinesResponse["result"]["lines"],
): { iouTotal: number; mptTotal: number } => {
  let iouTotal = 0;
  let mptTotal = 0;

  for (const line of lines) {
    const amount = Number(line.balance);
    if (Number.isNaN(amount)) {
      continue;
    }
    const currency = line.currency.toUpperCase();
    if (currency === "MPT") {
      mptTotal += amount;
    } else {
      iouTotal += amount;
    }
  }

  return { iouTotal, mptTotal };
};

const formatIssuedBalance = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const fixed = value.toFixed(6);
  return fixed === "-0.000000" ? "0.000000" : fixed;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
};

const formatRippleTimeKST = (raw: unknown): string => {
  if (typeof raw !== "number") return "-";
  const unixTime = raw + rippleEpoch; // seconds
  const date = new Date(unixTime * 1000);
  if (Number.isNaN(date.getTime())) return "-";

  // 예: 2025-11-03 13:59:40 KST
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const pick = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const yyyy = pick("year");
  const mm   = pick("month").padStart(2, "0");
  const dd   = pick("day").padStart(2, "0");
  const hh   = pick("hour").padStart(2, "0");
  const mi   = pick("minute").padStart(2, "0");
  const ss   = pick("second").padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} KST`;
};

const getTxResult = (entry: AccountTransactionEntry): string | null => {
  const m = entry.meta as any;
  if (!m) return null;
  if (typeof m?.TransactionResult === "string") return m.TransactionResult;
  if (typeof m?.transaction_result === "string") return m.transaction_result;
  return null;
};
const validateTxJsonShapes = (tx: Record<string, any>) => {
  const isStr = (v: any) => typeof v === "string";
  const isUIntStr = (v: any) => isStr(v) && /^\d+$/.test(v);
  const isIOU = (v: any) =>
    v && typeof v === "object" && isStr(v.currency) && isStr(v.issuer) && isStr(v.value);

  const checkAmountish = (field: string) => {
    if (!(field in tx)) return;
    const v = tx[field];
    const ok = isUIntStr(v) || isIOU(v);
    if (!ok) {
      throw new TxJsonParseError(
        `Invalid ${field}. Use drops as string (e.g. "10000000") for XRP, or IOU object {currency, issuer, value:"..."} with value as string.`
      );
    }
  };

  ["Amount", "SendMax", "DeliverMin", "LimitAmount"].forEach(checkAmountish);

  if ("Fee" in tx && !isUIntStr(tx.Fee)) {
    throw new TxJsonParseError(`Invalid Fee. Must be drops as string (e.g. "12").`);
  }
};
const buttonBaseClass =
  "rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25";
const buttonDisabledClass =
  "cursor-not-allowed bg-white/5 text-white/40 hover:bg-white/5";
const smallButtonClass =
  "rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/25";
const accentKoreanClass = "text-[#C4B5FD]";
function ConnectDropdownButton({
  onCreate,
  onLoad,
  onGirin,
  buttonClassName,
}: {
  onCreate: () => void;
  onLoad: () => void;
  onGirin?: () => void;
  buttonClassName?: string;
}) {
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
    // 메뉴 닫힌 뒤 실행
    setTimeout(() => fn(), 0);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        className={`${buttonBaseClass} ${buttonClassName ?? ""}`.trim()}
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
            Load wallet with pre-existing Seed
            <span className="block text-xs text-white/70">
              Connect using an existing seed
            </span>
          </button>
          {onGirin && (
            <button
              type="button"
              data-menuitem
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10 focus:outline-none inline-flex gap-2"
              onClick={() => choose(onGirin)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  choose(onGirin);
                }
                if (e.key === "ArrowDown") {
                  // 다음 메뉴로 포커스 이동
                  (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
                }
                if (e.key === "ArrowUp") {
                  // 마지막 항목으로 포커스 이동
                  (e.currentTarget.parentElement?.lastElementChild as HTMLElement | null)?.focus();
                }
              }}
            >
              <span className="flex flex-col">
                <span className="text-white font-medium">Connect with Girin Wallet</span>
                <span className="text-xs text-white/70">Open Girin App to connect with QR code</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const ADDRESS_KEYS = new Set([
  "Account",
  "Destination",
  "Issuer",
  "ClassicAddress",
  "Counterparty",
  "RegularKey",
]);

const TRANSACTION_TYPE_KEYS = new Set(["TransactionType"]);
const PUBLIC_KEY_KEYS = new Set(["SigningPubKey", "SigningPublicKey", "PublicKey"]);
const SEED_KEYS = new Set(["Seed", "Secret", "WalletSeed", "Mnemonic", "MasterSeed"]);

const JSON_HIGHLIGHT_REGEX =
  /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

const renderColoredJson = (value: unknown): JSX.Element => {
  const json = JSON.stringify(value, null, 2);
  if (!json) {
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-white">
        -
      </pre>
    );
  }

  const fragments: Array<JSX.Element | string> = [];
  let lastIndex = 0;
  let tokenIndex = 0;
  let currentKey: string | null = null;
  let match: RegExpExecArray | null;

  JSON_HIGHLIGHT_REGEX.lastIndex = 0;

  while ((match = JSON_HIGHLIGHT_REGEX.exec(json)) !== null) {
    if (match.index > lastIndex) {
      fragments.push(json.slice(lastIndex, match.index));
    }

    const token = match[0];
    let color = "#FFD166";

    if (token.startsWith('"')) {
      const nextChar = json[JSON_HIGHLIGHT_REGEX.lastIndex];
      if (nextChar === ":") {
        color = "#FFB3F9"; // key
        currentKey = token.slice(1, -1);
      }
    } else if (token === "true" || token === "false" || token === "null") {
      color = "#7CFC00";
      currentKey = null;
    } else {
      color = "#FF8A5B"; // number
      currentKey = null;
    }

    if (
      token.startsWith('"') &&
      !(json[JSON_HIGHLIGHT_REGEX.lastIndex] === ":")
    ) {
      if (currentKey) {
        if (
          ADDRESS_KEYS.has(currentKey) ||
          TRANSACTION_TYPE_KEYS.has(currentKey)
        ) {
          color = "#D4FF9A";
        } else if (PUBLIC_KEY_KEYS.has(currentKey)) {
          color = "#C6F4FF";
        } else if (SEED_KEYS.has(currentKey)) {
          color = "#FFB788";
        }
      }
      currentKey = null;
    }

    fragments.push(
      <span key={`json-token-${tokenIndex++}`} style={{ color }}>
        {token}
      </span>,
    );

    lastIndex = JSON_HIGHLIGHT_REGEX.lastIndex;
  }

  if (lastIndex < json.length) {
    fragments.push(json.slice(lastIndex));
  }

  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-white">
        {fragments.map((fragment, index) =>
          typeof fragment === "string" ? (
            <span key={`json-text-${index}`}>{fragment}</span>
          ) : (
            fragment
          ),
        )}
    </pre>
  );
};

const ACCOUNT_FLAG_CONFIG: Array<{ label: string; flagKey: string }> = [
  { label: "asfAccountTxnID", flagKey: "lsfAccountTxnID" },
  { label: "asfAllowTrustLineClawback", flagKey: "lsfAllowTrustLineClawback" },
  { label: "asfAllowTrustLineLocking", flagKey: "lsfAllowTrustLineLocking" },
  { label: "asfAuthorizedNFTokenMinter", flagKey: "lsfAuthorizedNFTokenMinter" },
  { label: "asfDefaultRipple", flagKey: "lsfDefaultRipple" },
  { label: "asfDepositAuth", flagKey: "lsfDepositAuth" },
  { label: "asfDisableMaster", flagKey: "lsfDisableMaster" },
  { label: "asfDisallowIncomingCheck", flagKey: "lsfDisallowIncomingCheck" },
  {
    label: "asfDisallowIncomingNFTokenOffer",
    flagKey: "lsfDisallowIncomingNFTokenOffer",
  },
  { label: "asfDisallowIncomingPayChan", flagKey: "lsfDisallowIncomingPayChan" },
  {
    label: "asfDisallowIncomingTrustline",
    flagKey: "lsfDisallowIncomingTrustline",
  },
  { label: "asfDisallowXRP", flagKey: "lsfDisallowXRP" },
  { label: "asfGlobalFreeze", flagKey: "lsfGlobalFreeze" },
  { label: "asfNoFreeze", flagKey: "lsfNoFreeze" },
  { label: "asfRequireAuth", flagKey: "lsfRequireAuth" },
  { label: "asfRequireDest", flagKey: "lsfRequireDestTag" },
];

export default function Home(): JSX.Element {
  const [network, setNetwork] = useState<NetworkKey>(DEFAULT_NETWORK);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const walletRef = useRef<Wallet | null>(null);
  const [walletMessage, setWalletMessage] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const hasLoadedSavedWalletsRef = useRef(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedWalletModalOpen, setIsSavedWalletModalOpen] = useState(false);
  const [walletNameInput, setWalletNameInput] = useState("");
  const [walletNameError, setWalletNameError] = useState<string | null>(null);
  const [selectedSavedWalletName, setSelectedSavedWalletName] = useState<string | null>(null);
  const [copiedWalletName, setCopiedWalletName] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFlagsModalOpen, setIsFlagsModalOpen] = useState(false);
  const [isIouBalancesModalOpen, setIsIouBalancesModalOpen] = useState(false);
  const [isTrustlinesModalOpen, setIsTrustlinesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransactionEntry[]>([]);
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<AccountTransactionEntry | null>(null);

  const [accountInfo, setAccountInfo] = useState<AccountSnapshot | null>(null);
  const [accountLines, setAccountLines] =
    useState<AccountLinesResponse["result"]["lines"]>([]);
  const [accountState, setAccountState] =
    useState<AccountDataState>("idle");
  const [accountError, setAccountError] = useState<string | null>(null);

  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [faucetResult, setFaucetResult] = useState<FundWalletResponse | null>(
    null,
  );
  const [faucetError, setFaucetError] = useState<string | null>(null);

  const [txInput, setTxInput] = useState(defaultTxTemplate);
  const txInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatbotLauncherButton = (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.open(
            "https://chatgpt.com/g/g-690be9c9a6c88191abd28e5c42f54872-xrpl-gpt",
            "_blank",
            "noopener,noreferrer",
          );
        }
      }}
      className="inline-flex h-10 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      <span className="sr-only">Open XRPL GPT</span>
      <Image
        src="/OpenAI-white-monoblossom.svg"
        alt="OpenAI logo"
        width={38}
        height={38}
        priority={false}
      />
    </button>
  );

  const handleConnectGirin = useCallback(() => {
    // 여기서 실제 QR 모달 열기나 딥링크 호출을 붙이면 됨
    // 예시 1) 커스텀 이벤트로 모달 트리거
    window.dispatchEvent(new CustomEvent("girin:open-qr-connect"));
  
    // 예시 2) 가능한 경우 딥링크 시도
    // window.location.href = "girin://connect";
  
    setWalletMessage("Girin Wallet 연결을 시작합니다. 앱에서 QR로 연결하세요(구현 예정)");
    setWalletError(null);
  }, []);

  const handleInsertTx = useCallback(
    (next: string, mode: "replace" | "append" = "replace") => {
      setTxInput((prev) =>
        mode === "replace" ? next : `${prev.trim()}\n\n${next.trim()}`
      );
      requestAnimationFrame(() => txInputRef.current?.focus());
    },
    [],
  );

  


  const handleTxKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== "Enter") return;
  
    // ⬇️ IME 조합 중이면 무시 (type-safe하게 nativeEvent에서만 확인)
    const ne = e.nativeEvent as unknown as { isComposing?: boolean; keyCode?: number };
    if (ne?.isComposing || ne?.keyCode === 229) return;
  
    e.preventDefault();
    const el = txInputRef.current;
    if (!el) return;
  
    const value = txInput;
    const start = el.selectionStart ?? 0;
    const end   = el.selectionEnd ?? 0;
  
    const before = value.slice(0, start);
    const after  = value.slice(end);
  
    const charBefore = value[start - 1] ?? "";
    const charAfter  = value[end] ?? "";
  
    const lineStart   = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.slice(lineStart, start);
    const baseIndent  = currentLine.match(/^\s*/)?.[0] ?? "";
  
    // {} 사이에서 엔터 → 블록 펼치기
    if (charBefore === "{" && charAfter === "}") {
      const insert = `\n${baseIndent}  \n${baseIndent}`;
      const next = before + insert + after;
      setTxInput(next);
  
      requestAnimationFrame(() => {
        const t = txInputRef.current;
        if (!t) return;
        const caret = start + 1 + baseIndent.length + 2;
        t.selectionStart = caret;
        t.selectionEnd   = caret;
        t.focus();
      });
      return;
    }
  
    // 일반 엔터 → 들여쓰기 유지(+ 직전이 { 로 끝나면 두 칸 추가)
    const needsExtraIndent = /{\s*$/.test(currentLine);
    const indent = baseIndent + (needsExtraIndent ? "  " : "");
    const insert = `\n${indent}`;
    const next = before + insert + after;
    setTxInput(next);
  
    requestAnimationFrame(() => {
      const t = txInputRef.current;
      if (!t) return;
      const caret = start + insert.length;
      t.selectionStart = caret;
      t.selectionEnd   = caret;
      t.focus();
    });
  };
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [txResult, setTxResult] = useState<TransactionSummary | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const iouBalanceEntries = useMemo(
    () =>
      accountLines.map((line, index) => {
        const currency =
          typeof line.currency === "string" ? line.currency.toUpperCase() : "";
        const issuer =
          (typeof line.account === "string" && line.account) ||
          "";
        const numericBalance = Number(line.balance);
        const formattedBalance = Number.isNaN(numericBalance)
          ? line.balance
          : numericBalance.toLocaleString("en-US", {
            maximumFractionDigits: 6,
          });
        return {
          id: `${currency}-${issuer}-${index}`,
          currency,
          issuer,
          balance: formattedBalance,
        };
      }),
    [accountLines],
  );

  const sidebarContext = useMemo(
    () => ({
      networkKey: network,
      walletAddress: wallet?.classicAddress ?? undefined,
      lastTxHash: txResult?.hash ?? null,
    }),
    [network, wallet?.classicAddress, txResult?.hash],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (hasLoadedSavedWalletsRef.current) {
      return;
    }
    hasLoadedSavedWalletsRef.current = true;
    try {
      const raw = window.localStorage.getItem(SAVED_WALLETS_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      const sanitized = parsed.filter(
        (item): item is SavedWallet =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { name?: unknown }).name === "string" &&
          typeof (item as { classicAddress?: unknown }).classicAddress ===
            "string" &&
          typeof (item as { publicKey?: unknown }).publicKey === "string" &&
          typeof (item as { seed?: unknown }).seed === "string",
      );
      if (sanitized.length > 0) {
        setSavedWallets(sanitized);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const currentNetworkConfig = useMemo<NetworkConfig>(
    () => getNetworkConfig(network),
    [network],
  );

  const flagStatusList = useMemo(() => {
    const flagsRecord =
      accountInfo?.flags !== undefined
        ? (accountInfo.flags as Record<string, unknown>)
        : undefined;
  return ACCOUNT_FLAG_CONFIG.map(({ flagKey, label }) => {
    const enabled =
      flagsRecord && typeof flagsRecord[flagKey] === "boolean"
        ? Boolean(flagsRecord[flagKey])
        : false;
    return { flagKey, label, enabled };
  });
}, [accountInfo?.flags]);

  const connectionStatusMeta = useMemo(() => {
    switch (connectionStatus) {
      case "connected":
        return { label: "Connected", dotClass: "text-[#66FF99]" };
      case "connecting":
        return { label: "Connecting", dotClass: "text-[#66CCFF]" };
      case "error":
      default:
        return { label: "Not Connected", dotClass: "text-[#FF6666]" };
    }
  }, [connectionStatus]);

  const persistSavedWallets = useCallback((next: SavedWallet[]) => {
    setSavedWallets(next);
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(
        SAVED_WALLETS_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore storage write errors
    }
  }, []);

  const disconnectClient = useCallback(async () => {
    const existing = clientRef.current;
    clientRef.current = null;
    if (existing) {
      try {
        await existing.disconnect();
      } catch {
        // ignore disconnect errors
      }
    }
  }, []);

  const resetAccountState = useCallback(() => {
    setAccountInfo(null);
    setAccountLines([]);
    setAccountState("idle");
    setAccountError(null);
  }, []);

  const refreshAccountData = useCallback(
    async (targetWallet: Wallet) => {
      const client = clientRef.current;
      if (!client) {
        return;
      }

      setAccountState("loading");
      setAccountError(null);

      const account = targetWallet.classicAddress;

      try {
        const [infoResponse, linesResponse] = await Promise.all([
          client.request<AccountInfoRequest>({
            command: "account_info",
            account,
            ledger_index: "validated",
          }),
          client.request<AccountLinesRequest>({
            command: "account_lines",
            account,
            ledger_index: "validated",
          }),
        ]);

        const infoResult = (infoResponse as AccountInfoResponse).result;
        const linesResult = (linesResponse as AccountLinesResponse).result;

        const { iouTotal, mptTotal } = summarizeIssuedBalances(
          linesResult.lines,
        );

        setAccountInfo({
          balanceXrp: dropsToXrp(infoResult.account_data.Balance),
          iouBalance: formatIssuedBalance(iouTotal),
          mptBalance: formatIssuedBalance(mptTotal),
          sequence: infoResult.account_data.Sequence,
          ownerCount: infoResult.account_data.OwnerCount,
          flags: parseAccountRootFlags(
            infoResult.account_data.Flags ?? 0,
          ) as Partial<AccountInfoAccountFlags>,
        });
        setAccountLines(linesResult.lines);
        setAccountState("ready");
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "data" in error &&
          (error as RippledError).data?.error === "actNotFound"
        ) {
          setAccountInfo(null);
          setAccountLines([]);
          setAccountState("not_found");
          setAccountError("계정 정보를 찾을 수 없습니다.");
          return;
        }

        setAccountInfo(null);
        setAccountLines([]);
        setAccountState("error");
        setAccountError(
          getErrorMessage(error, "계정 정보를 불러오는 데 실패했습니다."),
        );
      }
    },
    [],
  );
  useEffect(() => {
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail as { enabled?: boolean } | undefined;
      const enabled = !!detail?.enabled;
      // TODO: enabled에 따라 화면의 필드 위에 툴팁 오버레이를 보여주거나 제거
      // ex) setShowTooltips(enabled)
    };
    window.addEventListener("xrpl-dev:toggle-tooltips" as any, onToggle);
    return () => window.removeEventListener("xrpl-dev:toggle-tooltips" as any, onToggle);
   }, 
   [],
  );

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      setConnectionStatus("connecting");
      setConnectionError(null);

      await disconnectClient();

      const config = currentNetworkConfig;
      const client = new Client(config.wsUrl);

      try {
        await client.connect();
        if (cancelled) {
          await client.disconnect();
          return;
        }

        clientRef.current = client;
        setConnectionStatus("connected");
        setConnectionError(null);

        if (walletRef.current) {
          void refreshAccountData(walletRef.current);
        }
      } catch (error) {
        setConnectionStatus("error");
        setConnectionError(
          getErrorMessage(error, "XRPL 네트워크 연결에 실패했습니다."),
        );
        try {
          await client.disconnect();
        } catch {
          // ignore
        }
      }
    };

    
    void connect();

    return () => {
      cancelled = true;
      void disconnectClient();
    };
  }, [currentNetworkConfig, disconnectClient, refreshAccountData]);

  useEffect(() => {
    resetAccountState();
    setWalletMessage(null);
    setWalletError(null);
    setFaucetResult(null);
    setFaucetError(null);
    setTxResult(null);
    setTxError(null);
  }, [network, resetAccountState]);

  const handleSelectNetwork = useCallback((key: NetworkKey) => {
    setNetwork(key);
  }, []);

  const handleGenerateWallet = useCallback(() => {
    const newWallet = Wallet.generate();
    setWallet(newWallet);
    walletRef.current = newWallet;
    setWalletMessage("새 지갑을 생성했습니다.");
    setWalletError(null);
    setFaucetResult(null);
    setFaucetError(null);
    setTxResult(null);
    setTxError(null);
    void refreshAccountData(newWallet);
  }, [refreshAccountData]);

  const handleConnectWallet = useCallback(() => {
    const seed = window.prompt("연결할 XRPL 지갑의 시드를 입력하세요.");
    if (!seed) {
      return;
    }

    try {
      const nextWallet = Wallet.fromSeed(seed.trim());
      setWallet(nextWallet);
      walletRef.current = nextWallet;
      setWalletMessage("시드로 지갑을 연결했습니다.");
      setWalletError(null);
      setFaucetResult(null);
      setFaucetError(null);
      setTxResult(null);
      setTxError(null);
      void refreshAccountData(nextWallet);
    } catch (error) {
      setWalletError(
        getErrorMessage(error, "시드로 지갑을 연결하는 데 실패했습니다."),
      );
    }
  }, [refreshAccountData]);

  const handleOpenFlagsModal = useCallback(() => {
    if (!walletRef.current) {
      setWalletError("먼저 지갑을 생성하거나 연결하세요.");
      return;
    }
    setIsFlagsModalOpen(true);
  }, []);

  const handleCloseFlagsModal = useCallback(() => {
    setIsFlagsModalOpen(false);
  }, []);

  const handleOpenTrustlinesModal = useCallback(() => {
    if (!walletRef.current) {
      setWalletError("먼저 지갑을 생성하거나 연결하세요.");
      return;
    }
    setIsTrustlinesModalOpen(true);
  }, []);

  const handleCloseTrustlinesModal = useCallback(() => {
    setIsTrustlinesModalOpen(false);
  }, []);

  const handleOpenSaveModal = useCallback(() => {
    const currentWallet = walletRef.current;
    if (!currentWallet) {
      setWalletError("먼저 지갑을 생성하거나 연결하세요.");
      return;
    }
    setWalletNameInput("");
    setWalletNameError(null);
    setIsSaveModalOpen(true);
  }, []);

  const handleCloseSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
    setWalletNameInput("");
    setWalletNameError(null);
  }, []);

  const handleSaveWallet = useCallback(() => {
    const currentWallet = walletRef.current;
    if (!currentWallet) {
      setWalletError("저장할 지갑이 없습니다.");
      setIsSaveModalOpen(false);
      return;
    }

    const trimmed = walletNameInput.trim();
    if (!trimmed) {
      setWalletNameError("지갑 이름을 입력하세요.");
      return;
    }

    if (savedWallets.some((item) => item.name === trimmed)) {
      setWalletNameError("이미 사용 중인 이름입니다.");
      return;
    }

    if (
      savedWallets.some(
        (item) => item.classicAddress === currentWallet.classicAddress,
      )
    ) {
      setWalletNameError("이미 저장된 지갑입니다.");
      return;
    }

    if (!currentWallet.seed) {
      setWalletNameError("현재 지갑은 시드 정보를 제공하지 않습니다.");
      return;
    }

    const entry: SavedWallet = {
      name: trimmed,
      classicAddress: currentWallet.classicAddress,
      publicKey: currentWallet.publicKey,
      seed: currentWallet.seed,
    };

    const next = [...savedWallets, entry];
    persistSavedWallets(next);
    setIsSaveModalOpen(false);
    setWalletNameInput("");
    setWalletNameError(null);
    setSelectedSavedWalletName(trimmed);
    setWalletMessage(`"${trimmed}" 지갑을 저장했습니다.`);
  }, [persistSavedWallets, savedWallets, walletNameInput]);

  const handleOpenSavedWalletModal = useCallback(() => {
    if (savedWallets.length > 0) {
      setSelectedSavedWalletName((previous) => {
        if (previous && savedWallets.some((item) => item.name === previous)) {
          return previous;
        }
        return savedWallets[0].name;
      });
    } else {
      setSelectedSavedWalletName(null);
    }
    setIsSavedWalletModalOpen(true);
  }, [savedWallets]);

  const handleCloseSavedWalletModal = useCallback(() => {
    setIsSavedWalletModalOpen(false);
  }, []);

  const handleSelectSavedWallet = useCallback((name: string) => {
    setSelectedSavedWalletName(name);
  }, []);

  const handleConnectSavedWallet = useCallback(() => {
    if (!selectedSavedWalletName) {
      setWalletError("연결할 저장 지갑을 선택하세요.");
      return;
    }

    const entry = savedWallets.find(
      (item) => item.name === selectedSavedWalletName,
    );
    if (!entry) {
      setWalletError("선택한 저장 지갑을 찾을 수 없습니다.");
      return;
    }

    try {
      const nextWallet = Wallet.fromSeed(entry.seed);
      if (
        nextWallet.classicAddress !== entry.classicAddress ||
        nextWallet.publicKey !== entry.publicKey
      ) {
        setWalletError(
          "저장된 지갑 정보가 현재 시드와 일치하지 않습니다.",
        );
        return;
      }

      setWallet(nextWallet);
      walletRef.current = nextWallet;
      setWalletMessage(`"${entry.name}" 지갑으로 연결했습니다.`);
      setWalletError(null);
      setFaucetResult(null);
      setFaucetError(null);
      setTxResult(null);
      setTxError(null);
      setIsSavedWalletModalOpen(false);
      void refreshAccountData(nextWallet);
    } catch (error) {
      setWalletError(
        getErrorMessage(error, "저장된 지갑을 연결하는 데 실패했습니다."),
      );
    }
  }, [
    refreshAccountData,
    savedWallets,
    selectedSavedWalletName,
  ]);

  const handleDeleteSavedWallet = useCallback(() => {
    if (!selectedSavedWalletName) {
      return;
    }
    const nameToRemove = selectedSavedWalletName;
    const next = savedWallets.filter((item) => item.name !== nameToRemove);
    persistSavedWallets(next);
    if (next.length === 0) {
      setSelectedSavedWalletName(null);
    } else if (!next.some((item) => item.name === selectedSavedWalletName)) {
      setSelectedSavedWalletName(next[0].name);
    }
    setWalletMessage(`"${nameToRemove}" 지갑을 삭제했습니다.`);
  }, [persistSavedWallets, savedWallets, selectedSavedWalletName]);

  const handleCopySavedWalletAddress = useCallback(
    async (walletName: string, address: string) => {
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard ||
        typeof navigator.clipboard.writeText !== "function"
      ) {
        setWalletError("클립보드 복사를 지원하지 않는 환경입니다.");
        return;
      }
      try {
        await navigator.clipboard.writeText(address);
        setCopiedWalletName(walletName);
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedWalletName(null);
        }, COPY_FEEDBACK_DURATION_MS);
      } catch {
        setWalletError("주소 복사에 실패했습니다.");
      }
    },
    [],
  );

  const handleOpenHistoryModal = useCallback(async () => {
    const currentWallet = walletRef.current;
    const client = clientRef.current;
    if (!currentWallet) {
      setWalletError("먼저 지갑을 생성하거나 연결하세요.");
      return;
    }
    if (!client) {
      setWalletError("XRPL 네트워크에 연결되지 않았습니다.");
      return;
    }

    setIsHistoryModalOpen(true);
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryEntry(null);
    setHistoryLoading(true);
    setHistoryError(null);
    setAccountTransactions([]);

    try {
      const response = await client.request<AccountTxRequest>({
        command: "account_tx",
        account: currentWallet.classicAddress,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 20,
        forward: false,
      });
      const result = (response as AccountTxResponse).result;
      const txs = Array.isArray(result.transactions)
        ? result.transactions
        : [];

      const mapped: AccountTransactionEntry[] = txs.map((item) => {
        const txRaw =
          item && typeof item === "object"
            ? "tx" in item
              ? (item as { tx?: unknown }).tx ?? null
              : "tx_json" in item
                ? (item as { tx_json?: unknown }).tx_json ?? null
                : null
            : null;
        const metaRaw =
          item && typeof item === "object"
            ? "meta" in item
              ? (item as { meta?: unknown }).meta ?? null
              : "meta_json" in item
                ? (item as { meta_json?: unknown }).meta_json ?? null
                : null
            : null;
        const validated =
          !!(
            item &&
            typeof item === "object" &&
            "validated" in item &&
            (item as { validated?: unknown }).validated
          );

        const txRecord: Record<string, unknown> =
          txRaw && typeof txRaw === "object"
            ? ((txRaw as unknown) as Record<string, unknown>)
            : {};

        const itemHash =
          item && typeof item === "object" && "hash" in item
            ? (item as { hash?: unknown }).hash
            : null;
        const hash =
          typeof itemHash === "string"
            ? itemHash
            : typeof (txRecord as { hash?: unknown }).hash === "string"
              ? (txRecord as { hash?: string }).hash ?? null
              : null;

        const transactionType =
          typeof (txRecord as { TransactionType?: unknown }).TransactionType ===
          "string"
            ? (txRecord as { TransactionType?: string }).TransactionType ?? null
            : null;

        const dateFromTx =
          typeof (txRecord as { date?: unknown }).date === "number"
            ? (txRecord as { date: number }).date
            : null;
        const dateFromItem =
          item && typeof item === "object" && "date" in item
            ? (item as { date?: unknown }).date
            : null;
        const date =
          typeof dateFromTx === "number"
            ? dateFromTx
            : typeof dateFromItem === "number"
              ? dateFromItem
              : null;

        const metaRecord =
          metaRaw && typeof metaRaw === "object"
            ? ((metaRaw as unknown) as Record<string, unknown>)
            : undefined;

        return {
          tx: txRecord,
          meta: metaRecord,
          validated,
          hash,
          transactionType,
          date,
        };
      });

      setAccountTransactions(mapped);
    } catch (error) {
      setHistoryError(
        getErrorMessage(error, "트랜잭션 히스토리를 불러오지 못했습니다."),
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryEntry(null);
    setHistoryLoading(false);
  }, []);

  const handleCloseIouBalancesModal = useCallback(() => {
    setIsIouBalancesModalOpen(false);
  }, []);

  const handleOpenHistoryDetail = useCallback((entry: AccountTransactionEntry) => {
    setSelectedHistoryEntry(entry);
    setIsHistoryDetailModalOpen(true);
  }, []);

  const handleCloseHistoryDetail = useCallback(() => {
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryEntry(null);
  }, []);

  const handleRefreshAccount = useCallback(() => {
    const currentWallet = walletRef.current;
    if (!currentWallet) {
      setWalletError("먼저 지갑을 생성하거나 연결하세요.");
      return;
    }
    void refreshAccountData(currentWallet);
  }, [refreshAccountData]);

  const handleFaucet = useCallback(async () => {
    const currentWallet = walletRef.current;
    const client = clientRef.current;

    if (!currentWallet) {
      setFaucetError("먼저 지갑을 생성하거나 연결하세요.");
      return;
    }
    if (!client) {
      setFaucetError("XRPL 네트워크에 연결되지 않았습니다.");
      return;
    }
    if (!isFaucetAvailable(currentNetworkConfig)) {
      setFaucetError("이 네트워크에서는 Faucet을 사용할 수 없습니다.");
      return;
    }

    setIsFaucetLoading(true);
    setFaucetError(null);

    try {
      const result = await client.fundWallet(currentWallet);
      setFaucetResult(result);
      setWalletMessage("Faucet 요청이 완료되었습니다.");
      await refreshAccountData(currentWallet);
    } catch (error) {
      setFaucetError(getErrorMessage(error, "Faucet 요청에 실패했습니다."));
    } finally {
      setIsFaucetLoading(false);
    }
  }, [currentNetworkConfig, refreshAccountData]);

  const handleSubmitTransaction = useCallback(async () => {
    const currentWallet = walletRef.current;
    const client = clientRef.current;
  
    if (!currentWallet) {
      setTxError("지갑이 연결되어 있지 않습니다.");
      return;
    }
    if (!client) {
      setTxError("XRPL 네트워크에 연결되어 있지 않습니다.");
      return;
    }
  
    setIsSubmittingTx(true);
    setTxError(null);
  
    try {
      const parsed = parseTxJsonInput(txInput) as MutableTx;
      validateTxJsonShapes(parsed);
    
      // Account 자동 채움
      if (!parsed.Account) {
        parsed.Account = currentWallet.classicAddress;
      }
    
      // 수수료/시퀀스/LLS 자동 채움
      const prepared = await client.autofill(parsed as SubmittableTransaction);
    
      // 제출 & 검증 대기
      const resp = await client.submitAndWait(
        prepared as SubmittableTransaction,
        { wallet: currentWallet },
      );
    
      // 응답 파싱 (result 래퍼 유무 대응)
      const top: any  = (resp as any)?.result ?? (resp as any) ?? {};
      const meta: any = top.meta ?? top.meta_json ?? {};
      const tx: any   = top.tx_json ?? top.tx ?? {};
    
      // 최종 코드: meta.TransactionResult 우선, 없으면 engine_result 보조
      const engineResult: string | null =
        typeof meta.TransactionResult === "string"
          ? meta.TransactionResult
          : typeof meta.transaction_result === "string"
            ? meta.transaction_result
            : typeof top.engine_result === "string"
              ? top.engine_result
              : null;
    
      const engineResultMessage: string | null =
        typeof top.engine_result_message === "string"
          ? top.engine_result_message
          : typeof top.error_message === "string"
            ? top.error_message
            : typeof meta.engine_result_message === "string"
              ? meta.engine_result_message
              : null;
    
      const hash: string | null =
        typeof tx.hash === "string"
          ? tx.hash
          : typeof top.hash === "string"
            ? top.hash
            : null;
    
      setTxResult({ engineResult, engineResultMessage, hash });
      setWalletMessage("트랜잭션을 제출했습니다.");
      await refreshAccountData(currentWallet);
    }
     catch (error) {
      if (error instanceof TxJsonParseError) {
        setTxError(error.message);
      } else {
        const base = getErrorMessage(error, "트랜잭션 전송에 실패했습니다.");
        const extra =
          (error as RippledError)?.data?.error_message ??
          (error as RippledError)?.data?.error ??
          null;
        setTxError(extra ? `${base} - ${extra}` : base);
      }
      setTxResult(null);
    } finally {
      setIsSubmittingTx(false);
    }
  }, [refreshAccountData, txInput]);

  const connectionStatusText = useMemo(() => {
    switch (connectionStatus) {
      case "connecting":
        return "연결 중";
      case "connected":
        return "연결됨";
      case "error":
      default:
        return "오류";
    }
  }, [connectionStatus]);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-0 py-15">
          <header className="space-y-8 ">
            <h1 className="relative -top-4 sm:-top-8 flex flex-wrap items-center justify-center gap-6 text-center text-3xl font-bold sm:text-[34px]">

              <Image
                src="/xrpl-logo.svg"
                alt="XRPL 로고"
                width={350}
                height={60}
                priority
              />
              <span className="leading-tight font-bold sm:text-[35px]">
                Developer Console
              </span>
            </h1>
            <div className={`mt-2 z-[20] flex flex-wrap items-center gap-3 justify-center sm:justify-start ${isSidebarOpen ? "opacity-0 pointer-events-none" : ""}`}>
            {/* 토글 버튼: 사이드바 닫혀있을 때만 표시 */}
                {!isSidebarOpen && (
                  <button
                    type="button"
                    aria-label="Open sidebar"
                    onClick={() => setIsSidebarOpen(v => !v)}
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
                      <line x1="0" y1="4"  x2="30" y2="4" />
                      <line x1="0" y1="12" x2="30" y2="12" />
                      <line x1="0" y1="20" x2="30" y2="20" />
                    </svg>
                  </button>
                )}
              <div className="inline-flex items-center gap-0 rounded-full border border-white/20 bg-white/10 p-1">
                {networkList.map((item) => {
                  const isActive = item.key === network;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectNetwork(item.key)}
                      className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                        isActive ? "bg-white text-black shadow-sm" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center pointer-events-none text-sm text-white/80">
                <span className={`mr-2 text-base ${connectionStatusMeta.dotClass}`}>
                    ●
                </span>
                {connectionStatusMeta.label}
              </div>
              <div className="pointer-events-auto ml-auto">
                {chatbotLauncherButton}
              </div>
            </div>
         </header>

        <main className="-mt-3 flex justify-center gap-6 md:grid-cols-2">
          <section className="mt-2 flex-1 basis-0 min-w-0 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/10 px-5 py-5 shadow-lg shadow-black/40 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start md:gap-17">
              <h2 className="text-left text-2xl font-semibold text-white md:self-start md:ml-2">
                Wallet
              </h2>
              <div className="flex flex-wrap items-center justify-start gap-3 md:flex-nowrap md:-ml-11">
                <ConnectDropdownButton
                  onCreate={handleGenerateWallet}
                  onLoad={handleConnectWallet}
                  onGirin={handleConnectGirin}  
                  buttonClassName="whitespace-nowrap px-5 md:px-6"
                />
                <button
                  type="button"
                  className={`${buttonBaseClass} whitespace-nowrap px-5 md:px-6`}
                  onClick={handleOpenSavedWalletModal}
                >
                  Saved Wallet
                </button>
                <button
                  type="button"
                  onClick={handleFaucet}
                  disabled={
                    isFaucetLoading ||
                    !wallet ||
                    !isFaucetAvailable(currentNetworkConfig) ||
                    connectionStatus !== "connected"
                  }
                  className={`${buttonBaseClass} whitespace-nowrap px-5 md:px-6 ${
                    isFaucetLoading ||
                    !wallet ||
                    !isFaucetAvailable(currentNetworkConfig) ||
                    connectionStatus !== "connected"
                      ? buttonDisabledClass
                      : ""
                  }`}
                >
                  {isFaucetLoading ? "요청 중..." : "Faucet"}
                </button>
              </div>
            </div>

            {walletMessage ? (
              <p className={`text-base ${accentKoreanClass}`}>{walletMessage}</p>
            ) : null}
            {walletError ? (
              <p className="text-base text-red-400">{walletError}</p>
            ) : null}
            {faucetError ? (
              <p className="text-base text-red-400">{faucetError}</p>
            ) : null}

            {wallet ? (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white">
                    Current Wallet
                  </p>
                  <p className="break-all text-sm  text-[#D4FF9A]">
                    {wallet.classicAddress}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white">Public Key</p>
                  <p className="break-all text-sm text-[#C6F4FF]">
                    {wallet.publicKey}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white">Seed</p>
                  <p className="break-all text-sm text-[#FFB788]">
                    {wallet.seed}
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-white">Account Info</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={smallButtonClass}
                        onClick={handleRefreshAccount}
                      >
                        Refresh
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenSaveModal}
                        disabled={!wallet}
                        className={`${smallButtonClass} ${
                          wallet ? "" : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        Save Wallet
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenFlagsModal}
                        className={`${smallButtonClass} ${
                          wallet ? "" : "opacity-40 cursor-not-allowed"
                        }`}
                        disabled={!wallet}
                      >
                        Flags
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenTrustlinesModal}
                        className={`${smallButtonClass} ${
                          wallet ? "" : "opacity-40 cursor-not-allowed"
                        }`}
                        disabled={!wallet}
                      >
                        Trustline
                      </button>
                    </div>
                  </div>
                  {accountState === "idle" ? (
                    <p className={`mt-2 text-base ${accentKoreanClass}`}>
                      계정 정보를 불러오려면 잠시 기다려 주세요.
                    </p>
                  ) : null}
                  {accountState === "loading" ? (
                    <p className={`mt-2 text-base ${accentKoreanClass}`}>
                      로딩 중...
                    </p>
                  ) : null}
                  {accountState === "not_found" ? (
                    <p className={`mt-2 text-base ${accentKoreanClass}`}>
                      계정이 아직 활성화되지 않았습니다.
                    </p>
                  ) : null}
                  {accountState === "error" && accountError ? (
                    <p className="mt-2 text-base text-red-400">{accountError}</p>
                  ) : null}
                  {accountState === "ready" && accountInfo ? (
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-sm text-white">XRP Balance</dt>
                        <dd className="font-mono text-sm text-[#FFB3F9]">
                          {accountInfo.balanceXrp}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-white">IOU Balance</dt>
                        <dd className="font-mono text-sm text-[#FFB3F9]">
                          <button
                            type="button"
                            onClick={() => setIsIouBalancesModalOpen(true)}
                            disabled={accountLines.length === 0}
                            className={`${smallButtonClass} px-3 py-1 text-[11px] font-semibold ${
                              accountLines.length === 0 ? "cursor-not-allowed opacity-40" : ""
                            }`}
                          >
                            View
                          </button>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-white">MPT Balance</dt>
                        <dd className="font-mono text-sm text-[#FFB3F9]">
                          {accountInfo.mptBalance}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-white">Sequence</dt>
                        <dd className="font-mono text-sm text-[#FFB3F9]">
                          {accountInfo.sequence}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-white">Owner Count</dt>
                        <dd className="font-mono text-sm text-[#FFB3F9]">
                          {accountInfo.ownerCount ?? "-"}
                        </dd>
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

            {faucetResult ? (
              <div
                className={`rounded-2xl border border-white/10 bg-black/40 px-8 py-3 text-base ${accentKoreanClass}`}
              >
                Faucet 충전 후 현재 잔액:{" "}
                <span className="font-mono">{faucetResult.balance} XRP</span>
              </div>
            ) : null}

          </section>

          <section className="mt-2 flex-1 basis-0 min-w-0 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-5 shadow-lg shadow-black/40 backdrop-blur">

            <div className="min-w-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="sm:flex-2">
                <h2 className="text-2xl font-semibold text-white">
                  Transaction Submit
                </h2>
                <p className={`mt-3 text-sm ${accentKoreanClass}`}>
                  tx_json 데이터만 입력하세요.
                </p>
                <p className={`mt-1 text-sm whitespace-nowrap ${accentKoreanClass}`}>
                  Account 필드가 비어 있으면 현재 연결된 지갑 주소가 자동으로 사용됩니다.
                </p>
              </div>

              <div className="min-w-0 flex sm:flex-col sm:items-end sm:justify-between sm:gap-4">
                <button
                  type="button"
                  onClick={() => { void handleOpenHistoryModal(); }}
                  disabled={!wallet || connectionStatus !== "connected"}
                  className={`${buttonBaseClass} ${
                    !wallet || connectionStatus !== "connected" ? buttonDisabledClass : ""
                  } whitespace-nowrap`}
                >
                  Transaction History
                </button>
              </div>

            </div>

            {/* Textarea 영역 */}
            <div className="min-w-0 flex flex-col gap-3 mt-4">
              <textarea
                ref={txInputRef}
                onKeyDown={handleTxKeyDown}
                value={txInput}
                onChange={(event) => setTxInput(event.target.value)}
                className="w-full min-h-[18rem] resize-y rounded-2xl border border-white/10 bg-black/40 px-5 py-6 font-mono text-sm text-white outline-none focus:border-white/40"

                spellCheck={false}
              />
            </div>

            {/* 버튼 섹션 */}
            <div className="mt-4 min-w-0 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSubmitTransaction}
                disabled={isSubmittingTx}
                className={`${buttonBaseClass} ${isSubmittingTx ? buttonDisabledClass : ""} self-start`}
              >
                {isSubmittingTx ? "전송 중..." : "Transaction Submit"}
              </button>
              {txError ? <p className="text-base text-red-400">{txError}</p> : null}
              {txResult ? (
                <div className="rounded-2xl border border-white/10 bg-black/40 px-8 py-3 text-base text-slate-200">
                  <p>
                    TransactionResult:{" "}
                    {typeof txResult.engineResult === "string" ? (
                      <span
                        className={`font-mono ${
                          txResult.engineResult === "tesSUCCESS"
                            ? "text-[#66FF99]"
                            : "text-red-400"
                        }`}
                      >
                        {txResult.engineResult}
                      </span>
                    ) : (
                      <span className="font-mono">-</span>
                    )}
                  </p>

                  {txResult.engineResultMessage ? (
                    <p className="mt-1">
                      Message:{" "}
                      <span className="font-mono">{txResult.engineResultMessage}</span>
                    </p>
                  ) : null}

                  {txResult.hash ? (
                    <p className="mt-1">
                      Hash:{" "}
                      <span className="break-all font-mono">{txResult.hash}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        </main>
      </div>
      {isIouBalancesModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-10"
          onClick={handleCloseIouBalancesModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black/90 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">IOU Balances</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  계정이 보유 중인 토큰과 잔액 목록입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseIouBalancesModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {iouBalanceEntries.length === 0 ? (
                <p className="text-sm text-white/70">보유 중인 IOU가 없습니다.</p>
              ) : (
                iouBalanceEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/90"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-white">
                          {entry.currency || "Unknown"}
                        </span>
                        <span className="text-xs text-white/60 break-all">
                          Issuer: {entry.issuer || "-"}
                        </span>
                      </div>
                      <span className="font-mono text-base text-[#D4FF9A]">
                        {entry.balance ?? "-"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
      {isSaveModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10"
          onClick={handleCloseSaveModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/20 bg-black/80 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">계정 저장</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  현재 지갑의 주소, Public Key, Seed를 저장합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseSaveModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm text-slate-200">
                Wallet name
                <input
                  type="text"
                  value={walletNameInput}
                  onChange={(event) => setWalletNameInput(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 p-3 text-sm text-white outline-none focus:border-white/40"
                  placeholder="ex) Admin"
                />
              </label>
              {walletNameError ? (
                <p className="text-sm text-red-400">{walletNameError}</p>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveWallet}
                className={buttonBaseClass}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isSavedWalletModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10"
          onClick={handleCloseSavedWalletModal}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-white/20 bg-black/80 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Saved Wallet</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  저장된 지갑을 선택해 연결하거나 삭제할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseSavedWalletModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {savedWallets.length === 0 ? (
                <p className={`text-sm ${accentKoreanClass}`}>
                  아직 저장된 지갑이 없습니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {savedWallets.map((item) => {
                    const isSelected = item.name === selectedSavedWalletName;
                    return (
                      <li key={item.name}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectSavedWallet(item.name)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleSelectSavedWallet(item.name);
                            }
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 transition focus:outline-none ${
                            isSelected
                              ? "border-white bg-white/10"
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-semibold text-white">
                              {item.name}
                            </span>
                            <span className="break-all text-xs text-[#D4FF9A]">
                              {item.classicAddress}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`${buttonBaseClass} px-3 py-1 text-xs font-semibold ${
                              copiedWalletName === item.name
                                ? "bg-white/20"
                                : ""
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCopySavedWalletAddress(
                                item.name,
                                item.classicAddress,
                              );
                            }}
                          >
                            {copiedWalletName === item.name
                              ? "복사됨"
                              : "주소 복사"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteSavedWallet}
                disabled={!selectedSavedWalletName}
                className={`${buttonBaseClass} ${
                  selectedSavedWalletName ? "" : buttonDisabledClass
                }`}
              >
                삭제
              </button>
              <button
                type="button"
                onClick={handleConnectSavedWallet}
                disabled={!selectedSavedWalletName}
                className={`${buttonBaseClass} ${
                  selectedSavedWalletName ? "" : buttonDisabledClass
                }`}
              >
                연결
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isSidebarOpen && (
          <>
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* 왼쪽 패널 */}
            <aside
              role="dialog"
              aria-modal="true"
              className="fixed left-0 top-0 z-50 h-full w-[360px] max-w-[85vw] translate-x-0 border-r border-white/10 bg-neutral-900 p-3 shadow-2xl shadow-black/40 backdrop-blur"
            >
              

              <Sidebar
                open={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onInsertTx={handleInsertTx}
                context={sidebarContext}
              />
            </aside>
          </>
        )}

      {isFlagsModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10"
          onClick={handleCloseFlagsModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/20 bg-black/80 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Account Flags</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  계정에 설정된 플래그 상태를 확인할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseFlagsModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-2 text-sm">
              <ul className="space-y-2">
                {flagStatusList.map((item) => (
                  <li
                    key={item.flagKey}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-4 py-2"
                  >
                    <span className="font-mono text-xs text-white">{item.label}</span>
                    <span
                      className={`rounded-md px-2 py-1 text-sm font-semibold ${
                        item.enabled
                          ? "bg-[#CCFF66]/30 text-white"
                          : "text-slate-200"
                      }`}
                    >
                      {item.enabled ? "True" : "False"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {isTrustlinesModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10"
          onClick={handleCloseTrustlinesModal}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-white/20 bg-black/80 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Trustlines</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  계정에 연결된 트러스트라인 목록입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseTrustlinesModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-2 text-sm">
              {accountLines.length === 0 ? (
                <p className={accentKoreanClass}>
                  등록된 트러스트라인이 없습니다.
                </p>
              ) : (
                <ul className="space-y-3">
                  {accountLines.map((line, index) => (
                    <li
                      key={`${line.account}-${line.currency}-${index}`}
                      className="rounded-xl border border-white/10 bg-black/40 p-4"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase text-white">Currency</p>
                          <p className="font-mono text-sm text-white">{line.currency}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-white">Balance</p>
                          <p className="font-mono text-sm text-white">{line.balance}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-white">Issuer</p>
                          <p className="break-all font-mono text-sm text-[#D4FF9A]">
                            {line.account}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-white">Limit</p>
                          <p className="font-mono text-sm text-white">{line.limit}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isHistoryModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10"
          onClick={handleCloseHistoryModal}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-white/20 bg-black/80 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  최근 20개의 트랜잭션을 확인할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseHistoryModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm">
              {historyLoading ? (
                <p className={accentKoreanClass}>트랜잭션을 불러오는 중입니다...</p>
              ) : historyError ? (
                <p className="text-red-400">{historyError}</p>
              ) : accountTransactions.length === 0 ? (
                <p className={accentKoreanClass}>표시할 트랜잭션이 없습니다.</p>
              ) : (
                <ul className="space-y-3">
                  {accountTransactions.map((entry, index) => (
                    <li
                      key={entry.hash ?? `${entry.transactionType ?? "unknown"}-${index}`}
                      className="rounded-xl border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm text-white">
                            <span className="font-semibold">Transaction Type:</span>{" "}
                            <span className="text-[#D4FF9A]">{entry.transactionType ?? "Unknown"}</span>
                          </p>
                          <p className="text-sm text-white">
                            <span className="font-semibold">Transaction Result:</span>{" "}
                            <span
                              className={`font-mono ${
                                getTxResult(entry) === "tesSUCCESS" ? "text-[#66FF99]" : "text-red-400"
                              }`}
                            >
                              {getTxResult(entry) ?? "-"}
                            </span>
                          </p>
                          <p className="text-sm text-white">
                            <span className="font-semibold">Date:</span>{" "}
                            <span className="font-mono">{formatRippleTimeKST(entry.date)}</span>
                          </p>
                          <p className="text-sm text-white">
                            <span className="font-semibold">Hash:</span>{" "}
                            <span className="break-all font-mono text-white/80">{entry.hash ?? "-"}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          className={`${buttonBaseClass} px-3 py-1 text-xs font-semibold`}
                          onClick={() => handleOpenHistoryDetail(entry)}
                        >
                          트랜잭션 상세
                        </button>
                      </div>

                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isHistoryDetailModalOpen && selectedHistoryEntry ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-10"
          onClick={handleCloseHistoryDetail}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-white/20 bg-black/90 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">트랜잭션 상세</h3>
                <p className="mt-1 text-sm ">
                  트랜잭션 원문을 확인하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseHistoryDetail}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-4">
              {renderColoredJson(selectedHistoryEntry.tx)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}















