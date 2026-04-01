import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddressBar from "@/components/AddressBar";
import DownloadsPanel from "@/components/DownloadsPanel";
import ParticleSystem from "@/components/ParticleSystem";
import TabBar from "@/components/TabBar";
import { useBrowser } from "@/context/BrowserContext";
import { useTheme } from "@/context/ThemeContext";

function BrowserWebView({ tab, isActive, onNavStateChange, onRef }: {
  tab: { id: string; url: string };
  isActive: boolean;
  onNavStateChange?: (state: any) => void;
  onRef?: (ref: any) => void;
}) {
  const { theme } = useTheme();

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webFallback, { backgroundColor: theme.card }]}>
        <Feather name="globe" size={48} color={theme.mutedForeground} />
        <Text style={[styles.webFallbackTitle, { color: theme.foreground }]}>
          Browser Preview
        </Text>
        <Text style={[styles.webFallbackSub, { color: theme.mutedForeground }]}>
          WebView is available on Android & iOS
        </Text>
        <Text style={[styles.webFallbackUrl, { color: theme.url }]} numberOfLines={2}>
          {tab.url}
        </Text>
      </View>
    );
  }

  const WebView = require("react-native-webview").default;

  return (
    <WebView
      ref={onRef}
      source={{ uri: tab.url }}
      style={{ flex: 1, backgroundColor: theme.background }}
      onNavigationStateChange={isActive ? onNavStateChange : undefined}
      javaScriptEnabled
      domStorageEnabled
      allowsBackForwardNavigationGestures
      pullToRefreshEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={[styles.loadingView, { backgroundColor: theme.background }]}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      )}
    />
  );
}

export default function BrowserScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    tabs,
    activeTabId,
    updateTab,
    addToHistory,
    downloads,
    goBackRef,
    goForwardRef,
    reloadRef,
  } = useBrowser();

  const webViewRefs = useRef<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleRef = useCallback(
    (id: string, ref: any) => {
      webViewRefs.current[id] = ref;
      if (id === activeTabId) {
        goBackRef.current = () => webViewRefs.current[id]?.goBack();
        goForwardRef.current = () => webViewRefs.current[id]?.goForward();
        reloadRef.current = () => webViewRefs.current[id]?.reload();
      }
    },
    [activeTabId, goBackRef, goForwardRef, reloadRef]
  );

  const onNavigationStateChange = useCallback(
    (navState: any) => {
      const { url, title, canGoBack, canGoForward, loading: isLoading } = navState;
      updateTab(activeTabId, { url, title: title || url, canGoBack, canGoForward });
      if (!isLoading && url) {
        addToHistory(url);
      }
      setLoading(!!isLoading);
    },
    [activeTabId, updateTab, addToHistory]
  );

  const activeDownloads = downloads.filter((d) => !d.done).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ParticleSystem />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            backgroundColor: theme.navBar,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TabBar />
        <View style={styles.addressRow}>
          <AddressBar />
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.secondary }]}
            onPress={() => setShowDownloads(true)}
          >
            <Feather name="download" size={16} color={theme.foreground} />
            {activeDownloads > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{activeDownloads}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.secondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/settings");
            }}
          >
            <Feather name="settings" size={16} color={theme.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webViewContainer}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <View
              key={tab.id}
              style={[
                StyleSheet.absoluteFill,
                { opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 },
              ]}
              pointerEvents={isActive ? "auto" : "none"}
            >
              <BrowserWebView
                tab={tab}
                isActive={isActive}
                onNavStateChange={onNavigationStateChange}
                onRef={(ref) => handleRef(tab.id, ref)}
              />
            </View>
          );
        })}
        {loading && Platform.OS !== "web" && (
          <View
            pointerEvents="none"
            style={[styles.loadingBar, { backgroundColor: theme.border, zIndex: 10 }]}
          >
            <View style={[styles.loadingBarFill, { backgroundColor: theme.primary }]} />
          </View>
        )}
      </View>

      <Modal
        visible={showDownloads}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDownloads(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDownloads(false)}
        >
          <View style={[styles.downloadsContainer, { paddingBottom: insets.bottom + 16 }]}>
            <DownloadsPanel onClose={() => setShowDownloads(false)} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 9,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  loadingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  loadingBarFill: {
    height: "100%",
    width: "60%",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  webFallbackSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  webFallbackUrl: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  downloadsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
