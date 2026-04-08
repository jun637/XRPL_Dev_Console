"use client";

import Image from "next/image";
import "../app/globals.css";
import type { JSX } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WalletConnectModalSign } from "@walletconnect/modal-sign-react";
import {
  Client,
  Wallet,
  type AccountTxRequest,
  type AccountTxResponse,
  type SubmittableTransaction,
} from "xrpl";
import {
  DEFAULT_NETWORK,
  getNetworkConfig,
  isFaucetAvailable,
  type NetworkConfig,
  type NetworkKey,
} from "@/lib/xrpl/constants";
import { createXRPLClient } from "@/lib/xrpl/client";
import { useGirinWallet } from "@/hooks/useGirinWallet";
import { GIRIN_METADATA } from "@/lib/girin/constants";
import { withBasePath } from "@/lib/utils/basePath";
import { TxJsonParseError } from "@/lib/xrpl/parseTx";
import { validateTxJsonShapes } from "@/lib/xrpl/validateTxJson";
import { networkList, NETWORK_EXPLORER_BASES } from "@/lib/xrpl/networkMeta";
import { DEFAULT_TX_TEMPLATE } from "@/data/xrpl/defaultTxTemplate";
import { SAVED_WALLETS_STORAGE_KEY, COPY_FEEDBACK_DURATION_MS } from "@/lib/constants/app";
import { walletConnectProjectId } from "@/lib/env/public";
import { logBasePath } from "@/lib/utils/logBasePath";
import Sidebar from "../components/Sidebar";
import { TxEditor } from "@/components/TxEditor";
import type { TransactionSummary } from "@/types/transactions";
import { OnboardingWizard, isOnboardingCompleted } from "@/components/OnboardingWizard";
import { ScenarioSelector } from "@/components/scenarios/ScenarioSelector";
import { ScenarioWizard } from "@/components/scenarios/ScenarioWizard";
import type { ScenarioDef } from "@/data/scenarios/types";
import { useTxEditor } from "@/hooks/useTxEditor";
import { useSidebarState } from "@/hooks/useSidebarState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WalletSection } from "@/components/dashboard/WalletSection";
import type { AccountTransactionEntry, SavedWallet } from "@/types/account";
import { ACCOUNT_FLAG_CONFIG } from "@/data/xrpl/accountFlags";
import { ColoredJson } from "@/components/ui/ColoredJson";
import type { ColoredJsonProps } from "@/components/ui/ColoredJson";
import { formatRippleTimeKST, getTxResult, normalizeTxTimeFields } from "@/lib/xrpl/formatters";
import { getErrorMessage } from "@/lib/utils/errors";
import { extractGirinHash } from "@/lib/girin/hash";
import { useAccountData } from "@/hooks/useAccountData";
import type { SidebarProps } from "@/components/sidebar/types";
import {
  buttonBaseClass,
  buttonDisabledClass,
  smallButtonClass,
  girinSubmitButtonClass,
  accentKoreanClass,
} from "@/components/ui/classNames";
import type {
  ConnectionStatus,
  FundWalletResponse,
  MutableTx,
  RippledError,
} from "@/types/xrpl";

logBasePath();


export default function Home(): JSX.Element {
  const [network, setNetwork] = useState<NetworkKey>(DEFAULT_NETWORK);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const explorerBaseUrl = NETWORK_EXPLORER_BASES[network];
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
  const [isMptBalancesModalOpen, setIsMptBalancesModalOpen] = useState(false);
  const [isTrustlinesModalOpen, setIsTrustlinesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransactionEntry[]>([]);
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<AccountTransactionEntry | null>(null);
  const historyDetailJsonProps: ColoredJsonProps | null = selectedHistoryEntry
    ? { value: selectedHistoryEntry.tx }
    : null;

  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [faucetResult, setFaucetResult] = useState<FundWalletResponse | null>(
    null,
  );
  const [faucetError, setFaucetError] = useState<string | null>(null);

  const {
    rawTx,
    setRawTx,
    txInputRef,
    handleKeyDown: handleTxKeyDown,
    insertTx,
    parsedTx,
    parseError: txEditorParseError,
  } = useTxEditor(DEFAULT_TX_TEMPLATE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarControls = useSidebarState();
  const { onCloseAllModals: closeSidebarModals } = sidebarControls;
  const handleSidebarClose = useCallback(() => {
    closeSidebarModals();
    setIsSidebarOpen(false);
  }, [closeSidebarModals]);
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen((prev) => {
      if (prev) {
        closeSidebarModals();
        return false;
      }
      return true;
    });
  }, [closeSidebarModals]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isScenarioSelectorOpen, setIsScenarioSelectorOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioDef | null>(null);
  const {
    isEnabled: isGirinAvailable,
    isConnecting: isGirinConnecting,
    isConnected: isGirinConnected,
    accountAddress: girinAccountAddress,
    connect: connectGirin,
    reset: resetGirin,
    submitViaGirin,
  } = useGirinWallet(network, walletConnectProjectId ?? undefined);
  const currentAccountAddress = girinAccountAddress ?? wallet?.classicAddress ?? null;
const {
  accountInfo,
  accountLines,
  mptHoldings,
  accountState,
  accountError,
  refreshAccountData,
  resetAccountState,
} = useAccountData({
    clientRef,
    account: currentAccountAddress,
    autoRefreshEnabled: connectionStatus === "connected",
  });
  const currentNetworkConfig = useMemo<NetworkConfig>(
    () => getNetworkConfig(network),
    [network],
  );
  const isHistoryDisabled = !currentAccountAddress || connectionStatus !== "connected";
  const girinState = useMemo(
    () => ({
      available: isGirinAvailable,
      connecting: isGirinConnecting,
      connected: isGirinConnected,
    }),
    [isGirinAvailable, isGirinConnecting, isGirinConnected],
  );
  const isUsingGirinWallet = Boolean(girinAccountAddress);
  const isFaucetDisabled =
    isFaucetLoading ||
    !wallet ||
    !isFaucetAvailable(currentNetworkConfig) ||
    connectionStatus !== "connected" ||
    isUsingGirinWallet;
  const faucetBalance = faucetResult?.balance ?? null;

  /* XRPL GPT 버튼 — KFIP 2026 기간 동안 비활성화
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
        src={withBasePath("/OpenAI-white-monoblossom.svg")}
        alt="OpenAI logo"
        width={38}
        height={38}
        priority={false}
      />
    </button>
  );
  */
  const chatbotLauncherButton = null;

  const handleConnectGirin = useCallback(async () => {
    if (!isGirinAvailable) {
      setWalletError("현재 네트워크에서는 Girin Wallet을 사용할 수 없습니다.");
      return;
    }

    try {
      setWalletMessage("Girin Wallet 연결을 시작합니다. Girin Wallet 앱을 열어 QR을 스캔해 주세요.");
      setWalletError(null);
      setFaucetResult(null);
      setFaucetError(null);
      setTxResult(null);
      setTxError(null);
      await connectGirin();
      setWallet(null);
      walletRef.current = null;
    } catch (error) {
      setWalletError(getErrorMessage(error, "Girin Wallet 연결에 실패했습니다."));
    }
  }, [
    connectGirin,
    isGirinAvailable,
  ]);

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
  const mptBalanceEntries = useMemo(
    () =>
      mptHoldings.map((holding, index) => ({
        id: `${holding.issuanceId}-${index}`,
        issuanceId: holding.issuanceId,
        balance: holding.balance,
      })),
    [mptHoldings],
  );

  const sidebarContext = useMemo(
    () => ({
      networkKey: network,
      walletAddress: currentAccountAddress ?? undefined,
      lastTxHash: txResult?.hash ?? null,
    }),
    [network, currentAccountAddress, txResult?.hash],
  );
  const handleOpenScenario = useCallback(() => {
    setIsScenarioSelectorOpen(true);
  }, []);

  const sidebarProps = useMemo<SidebarProps>(
    () => ({
      open: isSidebarOpen,
      onClose: handleSidebarClose,
      onInsertTx: insertTx,
      context: sidebarContext,
      onOpenScenario: handleOpenScenario,
      ...sidebarControls,
    }),
    [handleSidebarClose, handleOpenScenario, insertTx, isSidebarOpen, sidebarContext, sidebarControls],
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
    if (typeof window === "undefined") return;
    if (!isOnboardingCompleted()) {
      setIsOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);



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


  useEffect(() => {
    if (!isGirinAvailable && girinAccountAddress) {
      resetGirin();
    }
  }, [girinAccountAddress, isGirinAvailable, resetGirin]);

  useEffect(() => {
    const onToggle = () => {
      // TODO: enabled값을 활용해 토글 기능을 완성하거나 삭제
      // ex) setShowTooltips(detail?.enabled ?? false)
    };
    window.addEventListener("xrpl-dev:toggle-tooltips", onToggle as EventListener);
    return () => window.removeEventListener("xrpl-dev:toggle-tooltips", onToggle as EventListener);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      setConnectionStatus("connecting");
      setConnectionError(null);

      await disconnectClient();

      const config = currentNetworkConfig;
      const client = createXRPLClient(config);

      try {
        await client.connect();
        if (cancelled) {
          await client.disconnect();
          return;
        }

        clientRef.current = client;
        setConnectionStatus("connected");
        setConnectionError(null);

        if (currentAccountAddress) {
          void refreshAccountData(currentAccountAddress);
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
  }, [currentAccountAddress, currentNetworkConfig, disconnectClient, refreshAccountData]);

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
    resetGirin();
    const newWallet = Wallet.generate();
    setWallet(newWallet);
    walletRef.current = newWallet;
    setWalletMessage("새 지갑을 생성했습니다.");
    setWalletError(null);
    setFaucetResult(null);
    setFaucetError(null);
    setTxResult(null);
    setTxError(null);
    void refreshAccountData(newWallet.classicAddress);
  }, [refreshAccountData, resetGirin]);

  const handleConnectWallet = useCallback(() => {
    const seed = window.prompt("사용할 XRPL 지갑의 시드를 입력해주세요.");
    if (!seed) {
      return;
    }

    try {
      resetGirin();
      const nextWallet = Wallet.fromSeed(seed.trim());
      setWallet(nextWallet);
      walletRef.current = nextWallet;
      setWalletMessage("시드로 지갑을 연결했습니다.");
      setWalletError(null);
      setFaucetResult(null);
      setFaucetError(null);
      setTxResult(null);
      setTxError(null);
      void refreshAccountData(nextWallet.classicAddress);
    } catch (error) {
      setWalletError(
        getErrorMessage(error, "시드 지갑을 연결하는 데 실패했습니다."),
      );
    }
  }, [refreshAccountData, resetGirin]);

  const handleOpenFlagsModal = useCallback(() => {
    if (!currentAccountAddress) {
      setWalletError("지갑을 생성하거나 불러와 주세요.");
      return;
    }
    setIsFlagsModalOpen(true);
  }, [currentAccountAddress]);

  const handleCloseFlagsModal = useCallback(() => {
    setIsFlagsModalOpen(false);
  }, []);

  const handleOpenTrustlinesModal = useCallback(() => {
    if (!currentAccountAddress) {
      setWalletError("지갑을 생성하거나 불러와 주세요.");
      return;
    }
    setIsTrustlinesModalOpen(true);
  }, [currentAccountAddress]);

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
      setWalletError("사용할 저장 지갑을 선택해주세요.");
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
      resetGirin();
      const nextWallet = Wallet.fromSeed(entry.seed);
      if (
        nextWallet.classicAddress !== entry.classicAddress ||
        nextWallet.publicKey !== entry.publicKey
      ) {
        setWalletError(
          "저장된 정보와 다른 지갑이어서 연결할 수 없습니다.",
        );
        return;
      }

      setWallet(nextWallet);
      walletRef.current = nextWallet;
      setWalletMessage(`"${entry.name}" 지갑을 연결했습니다.`);
      setWalletError(null);
      setFaucetResult(null);
      setFaucetError(null);
      setTxResult(null);
      setTxError(null);
      setIsSavedWalletModalOpen(false);
      void refreshAccountData(nextWallet.classicAddress);
    } catch (error) {
      setWalletError(
        getErrorMessage(error, "저장된 지갑을 연결하는 데 실패했습니다."),
      );
    }
  }, [
    refreshAccountData,
    resetGirin,
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
    const account = currentAccountAddress;
    const client = clientRef.current;
    if (!account) {
      setWalletError("지갑을 생성하거나 불러와 주세요.");
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
        account,
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
  }, [currentAccountAddress]);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryEntry(null);
    setHistoryLoading(false);
  }, []);

  const handleCloseIouBalancesModal = useCallback(() => {
    setIsIouBalancesModalOpen(false);
  }, []);
  const handleCloseMptBalancesModal = useCallback(() => {
    setIsMptBalancesModalOpen(false);
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
    if (!currentAccountAddress) {
      setWalletError("지갑을 생성하거나 불러와 주세요.");
      return;
    }
    void refreshAccountData(currentAccountAddress);
  }, [currentAccountAddress, refreshAccountData]);

  const handleFaucet = useCallback(async () => {
    const currentWallet = walletRef.current;
    const client = clientRef.current;

    if (isUsingGirinWallet) {
      setFaucetError("Girin Wallet 연결 상태에서는 Faucet을 사용할 수 없습니다.");
      return;
    }
    if (!currentWallet) {
      setFaucetError("지갑을 생성하거나 불러와 주세요.");
      return;
    }
    if (!client) {
      setFaucetError("XRPL 네트워크에 연결되어 있지 않습니다.");
      return;
    }
    if (!isFaucetAvailable(currentNetworkConfig)) {
      setFaucetError("해당 네트워크에서는 Faucet을 사용할 수 없습니다.");
      return;
    }

    setIsFaucetLoading(true);
    setFaucetError(null);

    try {
      const result = await client.fundWallet(currentWallet);
      setFaucetResult(result);
      setWalletMessage("Faucet 요청을 완료했습니다.");
      await refreshAccountData(currentWallet.classicAddress);
    } catch (error) {
      setFaucetError(getErrorMessage(error, "Faucet 요청에 실패했습니다."));
    } finally {
      setIsFaucetLoading(false);
    }
  }, [currentNetworkConfig, isUsingGirinWallet, refreshAccountData]);

  const handleSubmitTransaction = useCallback(async () => {
    const currentWallet = walletRef.current;
    const client = clientRef.current;
    const account = girinAccountAddress ?? currentWallet?.classicAddress ?? null;

    if (!account) {
      setTxError("지갑이 연결되어 있지 않습니다.");
      return;
    }
    if (!client) {
      setTxError("XRPL 네트워크에 연결되어 있지 않습니다.");
      return;
    }

    if (!parsedTx) {
      setTxError(txEditorParseError ?? "트랜잭션 JSON을 확인하세요.");
      return;
    }

    const parsed = { ...(parsedTx as MutableTx) };
    validateTxJsonShapes(parsed);
    normalizeTxTimeFields(parsed);

    if (!parsed.Account) {
      parsed.Account = account;
    }

    setIsSubmittingTx(true);
    setTxError(null);

    try {
      const prepared = await client.autofill(parsed as SubmittableTransaction);

      if (isUsingGirinWallet) {
        const response = await submitViaGirin(prepared);
        const txHash = extractGirinHash(response ?? undefined);
        setTxResult({
          engineResult: null,
          engineResultMessage: "Girin Wallet에 서명 요청을 전송했습니다.",
          hash: txHash,
        });
        setWalletMessage("Girin Wallet 앱에서 서명 요청을 승인해 주세요.");
        await refreshAccountData(account);
        return;
      }

      if (!currentWallet) {
        setTxError("지갑이 연결되어 있지 않습니다.");
        return;
      }

      const resp = await client.submitAndWait(
        prepared as SubmittableTransaction,
        { wallet: currentWallet },
      );

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const top: any  = (resp as any)?.result ?? (resp as any) ?? {};
      const meta: any = top.meta ?? top.meta_json ?? {};
      const tx: any   = top.tx_json ?? top.tx ?? {};

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
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setTxResult({ engineResult, engineResultMessage, hash });
      await refreshAccountData(account);
    } catch (error) {
      const base = getErrorMessage(error, "트랜잭션 전송에 실패했습니다.");
      const extra =
        (error as RippledError)?.data?.error_message ??
        (error as RippledError)?.data?.error ??
        null;
      setTxError(extra ? `${base} - ${extra}` : base);
      setTxResult(null);
    } finally {
      setIsSubmittingTx(false);
    }
  }, [
    girinAccountAddress,
    isUsingGirinWallet,
    refreshAccountData,
    submitViaGirin,
    parsedTx,
    txEditorParseError,
  ]);

  return (
    <>
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
      
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-0 py-15">
          <DashboardHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleSidebarToggle}
            networks={networkList}
            activeNetwork={network}
            onSelectNetwork={handleSelectNetwork}
            connectionStatusMeta={connectionStatusMeta}
            connectionError={connectionError}
            chatbotLauncherButton={chatbotLauncherButton}
          />

        <main className="-mt-3 flex justify-center gap-6 md:grid-cols-2">
          <WalletSection
            buttonBaseClass={buttonBaseClass}
            buttonDisabledClass={buttonDisabledClass}
            smallButtonClass={smallButtonClass}
            accentKoreanClass={accentKoreanClass}
            girinState={girinState}
            onCreateWallet={handleGenerateWallet}
            onLoadWallet={handleConnectWallet}
            onConnectGirin={isGirinAvailable ? handleConnectGirin : undefined}
            onOpenSavedWalletModal={handleOpenSavedWalletModal}
            onFaucet={handleFaucet}
            isFaucetLoading={isFaucetLoading}
            isFaucetDisabled={isFaucetDisabled}
            wallet={wallet}
            walletMessage={walletMessage}
            walletError={walletError}
            faucetError={faucetError}
            currentAccountAddress={currentAccountAddress}
            isUsingGirinWallet={isUsingGirinWallet}
            accountState={accountState}
            accountInfo={accountInfo}
            accountError={accountError}
            onRefreshAccount={handleRefreshAccount}
            onOpenSaveModal={handleOpenSaveModal}
            onOpenFlagsModal={handleOpenFlagsModal}
            onOpenTrustlinesModal={handleOpenTrustlinesModal}
            onOpenIouBalancesModal={() => setIsIouBalancesModalOpen(true)}
            onOpenMptBalancesModal={() => setIsMptBalancesModalOpen(true)}
            hasAccountLines={accountLines.length > 0}
            hasMptHoldings={mptBalanceEntries.length > 0}
            faucetBalance={faucetBalance}
          />
          <TxEditor
            accentKoreanClass={accentKoreanClass}
            buttonBaseClass={buttonBaseClass}
            buttonDisabledClass={buttonDisabledClass}
            explorerBaseUrl={explorerBaseUrl}
            girinSubmitButtonClass={girinSubmitButtonClass}
            historyButtonDisabled={isHistoryDisabled}
            isSubmittingTx={isSubmittingTx}
            isUsingGirinWallet={isUsingGirinWallet}
            onChangeRawTx={setRawTx}
            onKeyDownRawTx={handleTxKeyDown}
            onOpenHistory={() => {
              void handleOpenHistoryModal();
            }}
            onSubmitTx={handleSubmitTransaction}
            txError={txError}
            rawTx={rawTx}
            txInputRef={txInputRef}
            txResult={txResult}
          />
        </main>
      </div>
      {isOnboardingOpen ? (
        <OnboardingWizard
          onSelectNetwork={handleSelectNetwork}
          onGenerateWallet={handleGenerateWallet}
          onFaucet={handleFaucet}
          onInsertTx={(tx) => setRawTx(tx)}
          onSubmitTx={handleSubmitTransaction}
          isFaucetLoading={isFaucetLoading}
          faucetBalance={faucetBalance}
          currentAccountAddress={currentAccountAddress}
          isSubmittingTx={isSubmittingTx}
          txResult={txResult}
          explorerBaseUrl={explorerBaseUrl}
          onClose={() => setIsOnboardingOpen(false)}
        />
      ) : null}
      {isScenarioSelectorOpen && !activeScenario ? (
        <ScenarioSelector
          onSelect={(scenario) => {
            setIsScenarioSelectorOpen(false);
            setActiveScenario(scenario);
          }}
          onClose={() => setIsScenarioSelectorOpen(false)}
        />
      ) : null}
      {activeScenario ? (
        <ScenarioWizard
          scenario={activeScenario}
          onClose={() => setActiveScenario(null)}
        />
      ) : null}
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
      {isMptBalancesModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-10"
          onClick={handleCloseMptBalancesModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black/90 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">MPT Balances</h3>
                <p className={`mt-1 text-sm ${accentKoreanClass}`}>
                  Issuance ID별 보유 중인 MPToken 수량입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseMptBalancesModal}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/25"
              >
                닫기
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {mptBalanceEntries.length === 0 ? (
                <p className="text-sm text-white/70">보유 중인 MPT가 없습니다.</p>
              ) : (
                mptBalanceEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/90"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-white/60 break-all">
                        Issuance ID: {entry.issuanceId}
                      </div>
                      <span className="font-mono text-base text-[#D4FF9A]">{entry.balance ?? "-"}</span>
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
              onClick={handleSidebarClose}
              aria-hidden="true"
            />
            {/* 왼쪽 패널 */}
            <aside
              role="dialog"
              aria-modal="true"
              className="fixed left-0 top-0 z-50 h-full w-[360px] max-w-[85vw] translate-x-0 border-r border-white/10 bg-neutral-900 p-3 shadow-2xl shadow-black/40 backdrop-blur"
            >
              

              <Sidebar {...sidebarProps} />
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
                            {entry.hash && explorerBaseUrl ? (
                              <a
                                href={`${explorerBaseUrl}/${entry.hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="break-all font-mono text-[#D4FF9A] underline-offset-2 hover:underline"
                              >
                                {entry.hash}
                              </a>
                            ) : (
                              <span className="break-all font-mono text-white/80">{entry.hash ?? "-"}</span>
                            )}
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
              {historyDetailJsonProps ? <ColoredJson {...historyDetailJsonProps} /> : null}
            </div>
          </div>
        </div>
      ) : null}
      </div>
      {walletConnectProjectId ? (
        <WalletConnectModalSign
          projectId={walletConnectProjectId}
          metadata={GIRIN_METADATA}
          modalOptions={{
            themeMode: "dark",
            themeVariables: {
              "--wcm-background-color": "#292A30CC",
              "--wcm-accent-color": "#34D98F",
              "--wcm-accent-fill-color": "#34D98F",
            },
            enableExplorer: false,
          }}
        />
      ) : null}
    </>
  );
}















