import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  progress: number;
  done: boolean;
}

interface BrowserContextValue {
  tabs: Tab[];
  activeTabId: string;
  setActiveTab: (id: string) => void;
  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  navigateActiveTab: (url: string) => void;
  history: string[];
  addToHistory: (url: string) => void;
  clearHistory: () => void;
  downloads: DownloadItem[];
  addDownload: (item: Omit<DownloadItem, "id">) => void;
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  goBackRef: React.MutableRefObject<(() => void) | null>;
  goForwardRef: React.MutableRefObject<(() => void) | null>;
  reloadRef: React.MutableRefObject<(() => void) | null>;
}

const DEFAULT_URL = "https://start.duckduckgo.com";

function makeId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function makeTab(url = DEFAULT_URL): Tab {
  return {
    id: makeId(),
    url,
    title: "New Tab",
    canGoBack: false,
    canGoForward: false,
  };
}

const BrowserContext = createContext<BrowserContextValue | null>(null);

export function BrowserProvider({ children }: { children: React.ReactNode }) {
  const initialTab = makeTab();
  const [tabs, setTabs] = useState<Tab[]>([initialTab]);
  const [activeTabId, setActiveTabId] = useState(initialTab.id);
  const [history, setHistory] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  const goBackRef = useRef<(() => void) | null>(null);
  const goForwardRef = useRef<(() => void) | null>(null);
  const reloadRef = useRef<(() => void) | null>(null);

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const addTab = useCallback((url?: string) => {
    const tab = makeTab(url || DEFAULT_URL);
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length === 1) return prev;
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);
        if (id === activeTabId) {
          const newActive = next[Math.max(0, idx - 1)];
          setActiveTabId(newActive.id);
        }
        return next;
      });
    },
    [activeTabId]
  );

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const navigateActiveTab = useCallback(
    (url: string) => {
      updateTab(activeTabId, { url });
    },
    [activeTabId, updateTab]
  );

  const addToHistory = useCallback((url: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((u) => u !== url);
      const next = [url, ...filtered].slice(0, 50);
      AsyncStorage.setItem("@cp_history", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem("@cp_history");
  }, []);

  const addDownload = useCallback((item: Omit<DownloadItem, "id">) => {
    const id = makeId();
    setDownloads((prev) => [...prev, { ...item, id }]);
  }, []);

  const updateDownload = useCallback(
    (id: string, updates: Partial<DownloadItem>) => {
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    },
    []
  );

  const removeDownload = useCallback((id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <BrowserContext.Provider
      value={{
        tabs,
        activeTabId,
        setActiveTab,
        addTab,
        closeTab,
        updateTab,
        navigateActiveTab,
        history,
        addToHistory,
        clearHistory,
        downloads,
        addDownload,
        updateDownload,
        removeDownload,
        goBackRef,
        goForwardRef,
        reloadRef,
      }}
    >
      {children}
    </BrowserContext.Provider>
  );
}

export function useBrowser() {
  const ctx = useContext(BrowserContext);
  if (!ctx) throw new Error("useBrowser must be used within BrowserProvider");
  return ctx;
}
