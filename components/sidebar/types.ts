export type SidebarContext = {
  networkKey?: string;
  walletAddress?: string;
  lastTxHash?: string | null;
};

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onInsertTx: (txJson: string, mode?: "replace" | "append") => void;
  context?: SidebarContext;
  isTxLibraryOpen: boolean;
  onOpenTxLibrary: () => void;
  onCloseTxLibrary: () => void;
  isErrorModalOpen: boolean;
  onOpenErrorModal: () => void;
  onCloseErrorModal: () => void;
  isFlagModalOpen: boolean;
  onOpenFlagModal: () => void;
  onCloseFlagModal: () => void;
  isLinksModalOpen: boolean;
  onOpenLinksModal: () => void;
  onCloseLinksModal: () => void;
  isCommunityModalOpen: boolean;
  onOpenCommunityModal: () => void;
  onCloseCommunityModal: () => void;
  isUpdateModalOpen: boolean;
  onOpenUpdateModal: () => void;
  onCloseUpdateModal: () => void;
  onCloseAllModals: () => void;
  onOpenScenario?: () => void;
};
