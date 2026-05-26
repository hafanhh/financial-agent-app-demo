// Iter2 — Lightweight cross-scene state for bi-directional navigation
// between M3 and the Data & Knowledge scene.
//
// We deliberately use React Context (not Zustand) to avoid adding a new dep —
// the project has no global state lib today, and Context keeps the convention.

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  DEFAULT_SM_LOCATION,
  type Persona,
  type StoreLocation,
} from "./data/m3Chat";
import { DEFAULT_SELECTED_DOC_ID } from "./data/knowledgeBase";

export type DataSubTab = "kb" | "catalog";

export type HighlightRegion = { page?: number; anchor: string } | null;

export type FloatingChip = { message: string; returnToMessageId: string } | null;

export type CompareMode = "off" | "pair" | "chain";

export type M3State = {
  persona: Persona;
  smLocation: StoreLocation;
  scrollToMessageId: string | null;
  filterByCitedDoc: string | null;
  filterByCitedDocLabel: string | null;
  pendingPrompt: string | null;
  // Iter3 — Compare panel state.
  compareMode: CompareMode;
  compareLeftId: string;
  compareRightId: string;
  // Iter5 — What-if simulator panel.
  whatIfMode: boolean;
};

export type DataTabState = {
  activeSubTab: DataSubTab;
  selectedDocId: string | null;
  highlightRegion: HighlightRegion;
  floatingChip: FloatingChip;
  catalogFilter: string[] | null;
  catalogBanner: string | null;
};

type Ctx = {
  m3: M3State;
  dataTab: DataTabState;
  setPersona: (p: Persona) => void;
  setSmLocation: (loc: StoreLocation) => void;
  setSelectedDoc: (docId: string | null) => void;
  setActiveSubTab: (tab: DataSubTab) => void;
  clearHighlight: () => void;
  clearFloatingChip: () => void;
  clearCatalogFilter: () => void;
  clearM3DocFilter: () => void;
  consumeScrollToMessageId: () => string | null;
  consumePendingPrompt: () => string | null;

  // Iter3 — Compare panel & input pre-fill
  setPendingPrompt: (text: string) => void;
  openCompareView: (args: { mode: CompareMode; leftId?: string; rightId?: string }) => void;
  closeCompareView: () => void;
  setCompareLeft: (id: string) => void;
  setCompareRight: (id: string) => void;
  // Iter5 — What-if simulator
  openWhatIfView: () => void;
  closeWhatIfView: () => void;

  // High-level navigation actions
  openDocFromCitation: (args: {
    docId: string;
    page?: number;
    anchor?: string;
    sourceMessageId: string;
    sourceMessageLabel: string;
  }) => void;
  openDocFromAnomaly: (args: {
    docId: string;
    page?: number;
    anchor?: string;
    sourceLabel: string;
  }) => void;
  openCatalogFiltered: (args: { sourceIds: string[]; banner: string }) => void;
  openM3FromDoc: (args: { docId: string; docLabel: string }) => void;
  filterM3ByDoc: (args: { docId: string; docLabel: string }) => void;
  jumpBackToM3Message: (messageId: string) => void;
};

const AppNavContext = createContext<Ctx | null>(null);

export function AppNavProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [persona, setPersonaState] = useState<Persona>("CEO");
  const [smLocation, setSmLocationState] = useState<StoreLocation>(DEFAULT_SM_LOCATION);

  const [scrollToMessageId, setScrollToMessageId] = useState<string | null>(null);
  const [filterByCitedDoc, setFilterByCitedDoc] = useState<string | null>(null);
  const [filterByCitedDocLabel, setFilterByCitedDocLabel] = useState<string | null>(null);
  const [pendingPrompt, setPendingPromptState] = useState<string | null>(null);

  const [compareMode, setCompareModeState] = useState<CompareMode>("off");
  const [compareLeftId, setCompareLeftId] = useState<string>("seminyak");
  const [compareRightId, setCompareRightId] = useState<string>("canggu");
  const [whatIfMode, setWhatIfModeState] = useState<boolean>(false);

  const [activeSubTab, setActiveSubTabState] = useState<DataSubTab>("kb");
  const [selectedDocId, setSelectedDocIdState] = useState<string | null>(DEFAULT_SELECTED_DOC_ID);
  const [highlightRegion, setHighlightRegion] = useState<HighlightRegion>(null);
  const [floatingChip, setFloatingChip] = useState<FloatingChip>(null);
  const [catalogFilter, setCatalogFilter] = useState<string[] | null>(null);
  const [catalogBanner, setCatalogBanner] = useState<string | null>(null);

  // Refs so navigation actions don't capture stale state.
  const lastSelectedRef = useRef<string | null>(DEFAULT_SELECTED_DOC_ID);
  lastSelectedRef.current = selectedDocId;

  const setPersona = useCallback((p: Persona) => setPersonaState(p), []);
  const setSmLocation = useCallback((loc: StoreLocation) => setSmLocationState(loc), []);
  const setActiveSubTab = useCallback((t: DataSubTab) => setActiveSubTabState(t), []);
  const setSelectedDoc = useCallback((id: string | null) => {
    setSelectedDocIdState(id);
    setHighlightRegion(null);
    setFloatingChip(null);
  }, []);

  const clearHighlight = useCallback(() => setHighlightRegion(null), []);
  const clearFloatingChip = useCallback(() => setFloatingChip(null), []);
  const clearCatalogFilter = useCallback(() => {
    setCatalogFilter(null);
    setCatalogBanner(null);
  }, []);
  const clearM3DocFilter = useCallback(() => {
    setFilterByCitedDoc(null);
    setFilterByCitedDocLabel(null);
  }, []);

  const consumeScrollToMessageId = useCallback(() => {
    const id = scrollToMessageId;
    if (id) setScrollToMessageId(null);
    return id;
  }, [scrollToMessageId]);

  const consumePendingPrompt = useCallback(() => {
    const p = pendingPrompt;
    if (p) setPendingPromptState(null);
    return p;
  }, [pendingPrompt]);

  const setPendingPrompt = useCallback((text: string) => setPendingPromptState(text), []);
  const setCompareLeft = useCallback((id: string) => setCompareLeftId(id), []);
  const setCompareRight = useCallback((id: string) => setCompareRightId(id), []);

  const openCompareView = useCallback<Ctx["openCompareView"]>(
    ({ mode, leftId, rightId }) => {
      setWhatIfModeState(false);
      setCompareModeState(mode);
      if (leftId) setCompareLeftId(leftId);
      if (rightId) setCompareRightId(rightId);
      navigate({ to: "/m3" });
    },
    [navigate],
  );

  const closeCompareView = useCallback(() => {
    setCompareModeState("off");
  }, []);

  const openWhatIfView = useCallback(() => {
    setCompareModeState("off");
    setWhatIfModeState(true);
    navigate({ to: "/m3" });
  }, [navigate]);

  const closeWhatIfView = useCallback(() => {
    setWhatIfModeState(false);
  }, []);

  // ---- Cross-scene actions -----------------------------------------------

  const openDocFromCitation = useCallback<Ctx["openDocFromCitation"]>(
    ({ docId, page, anchor, sourceMessageId, sourceMessageLabel }) => {
      setActiveSubTabState("kb");
      setSelectedDocIdState(docId);
      setHighlightRegion(anchor ? { page, anchor } : null);
      setFloatingChip({ message: sourceMessageLabel, returnToMessageId: sourceMessageId });
      setCatalogFilter(null);
      setCatalogBanner(null);
      navigate({ to: "/data" });
    },
    [navigate],
  );

  const openDocFromAnomaly = useCallback<Ctx["openDocFromAnomaly"]>(
    ({ docId, page, anchor, sourceLabel }) => {
      setActiveSubTabState("kb");
      setSelectedDocIdState(docId);
      setHighlightRegion(anchor ? { page, anchor } : null);
      setFloatingChip({ message: sourceLabel, returnToMessageId: "" });
      navigate({ to: "/data" });
    },
    [navigate],
  );

  const openCatalogFiltered = useCallback<Ctx["openCatalogFiltered"]>(
    ({ sourceIds, banner }) => {
      setActiveSubTabState("catalog");
      setCatalogFilter(sourceIds);
      setCatalogBanner(banner);
      navigate({ to: "/data" });
    },
    [navigate],
  );

  const openM3FromDoc = useCallback<Ctx["openM3FromDoc"]>(
    ({ docId, docLabel }) => {
      setPendingPrompt(`Show me what you learned from ${docLabel}`);
      setFilterByCitedDoc(docId);
      setFilterByCitedDocLabel(docLabel);
      navigate({ to: "/m3" });
    },
    [navigate],
  );

  const filterM3ByDoc = useCallback<Ctx["filterM3ByDoc"]>(
    ({ docId, docLabel }) => {
      setFilterByCitedDoc(docId);
      setFilterByCitedDocLabel(docLabel);
      navigate({ to: "/m3" });
    },
    [navigate],
  );

  const jumpBackToM3Message = useCallback<Ctx["jumpBackToM3Message"]>(
    (messageId) => {
      setScrollToMessageId(messageId);
      setFloatingChip(null);
      navigate({ to: "/m3" });
    },
    [navigate],
  );

  const value = useMemo<Ctx>(
    () => ({
      m3: {
        persona,
        smLocation,
        scrollToMessageId,
        filterByCitedDoc,
        filterByCitedDocLabel,
        pendingPrompt,
        compareMode,
        compareLeftId,
        compareRightId,
        whatIfMode,
      },
      dataTab: {
        activeSubTab,
        selectedDocId,
        highlightRegion,
        floatingChip,
        catalogFilter,
        catalogBanner,
      },
      setPersona,
      setSmLocation,
      setSelectedDoc,
      setActiveSubTab,
      clearHighlight,
      clearFloatingChip,
      clearCatalogFilter,
      clearM3DocFilter,
      consumeScrollToMessageId,
      consumePendingPrompt,
      setPendingPrompt,
      openCompareView,
      closeCompareView,
      setCompareLeft,
      setCompareRight,
      openWhatIfView,
      closeWhatIfView,
      openDocFromCitation,
      openDocFromAnomaly,
      openCatalogFiltered,
      openM3FromDoc,
      filterM3ByDoc,
      jumpBackToM3Message,
    }),
    [
      persona,
      smLocation,
      scrollToMessageId,
      filterByCitedDoc,
      filterByCitedDocLabel,
      pendingPrompt,
      compareMode,
      compareLeftId,
      compareRightId,
      whatIfMode,
      activeSubTab,
      selectedDocId,
      highlightRegion,
      floatingChip,
      catalogFilter,
      catalogBanner,
      setPersona,
      setSmLocation,
      setSelectedDoc,
      setActiveSubTab,
      clearHighlight,
      clearFloatingChip,
      clearCatalogFilter,
      clearM3DocFilter,
      consumeScrollToMessageId,
      consumePendingPrompt,
      setPendingPrompt,
      openCompareView,
      closeCompareView,
      setCompareLeft,
      setCompareRight,
      openWhatIfView,
      closeWhatIfView,
      openDocFromCitation,
      openDocFromAnomaly,
      openCatalogFiltered,
      openM3FromDoc,
      filterM3ByDoc,
      jumpBackToM3Message,
    ],
  );

  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>;
}

export function useAppNav() {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error("useAppNav must be used inside <AppNavProvider>");
  return ctx;
}
