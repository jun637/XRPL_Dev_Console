"use client";

import { useCallback, useState } from "react";

type SidebarModalKey =
  | "library"
  | "errors"
  | "flags"
  | "links"
  | "community"
  | "update";

type SidebarModalState = Record<SidebarModalKey, boolean>;

const createInitialState = (): SidebarModalState => ({
  library: false,
  errors: false,
  flags: false,
  links: false,
  community: false,
  update: false,
});

export const useSidebarState = () => {
  const [state, setState] = useState<SidebarModalState>(createInitialState);

  const setModalState = useCallback((key: SidebarModalKey, next: boolean) => {
    setState((prev) => {
      if (prev[key] === next) {
        return prev;
      }
      return { ...prev, [key]: next };
    });
  }, []);

  const open = useCallback(
    (key: SidebarModalKey) => () => setModalState(key, true),
    [setModalState],
  );
  const close = useCallback(
    (key: SidebarModalKey) => () => setModalState(key, false),
    [setModalState],
  );
  const closeAll = useCallback(
    () => setState(createInitialState()),
    [],
  );

  return {
    isTxLibraryOpen: state.library,
    onOpenTxLibrary: open("library"),
    onCloseTxLibrary: close("library"),
    isErrorModalOpen: state.errors,
    onOpenErrorModal: open("errors"),
    onCloseErrorModal: close("errors"),
    isFlagModalOpen: state.flags,
    onOpenFlagModal: open("flags"),
    onCloseFlagModal: close("flags"),
    isLinksModalOpen: state.links,
    onOpenLinksModal: open("links"),
    onCloseLinksModal: close("links"),
    isCommunityModalOpen: state.community,
    onOpenCommunityModal: open("community"),
    onCloseCommunityModal: close("community"),
    isUpdateModalOpen: state.update,
    onOpenUpdateModal: open("update"),
    onCloseUpdateModal: close("update"),
    onCloseAllModals: closeAll,
  };
};
