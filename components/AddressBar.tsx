import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useBrowser } from "@/context/BrowserContext";
import { useTheme } from "@/context/ThemeContext";

function resolveUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "https://duckduckgo.com";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+\.\w{2,}/.test(trimmed)) return `https://${trimmed}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
}

function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
}

export default function AddressBar() {
  const { theme } = useTheme();
  const { tabs, activeTabId, navigateActiveTab, history, goBackRef, goForwardRef, reloadRef } =
    useBrowser();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [inputValue, setInputValue] = useState(activeTab?.url || "");
  const [editing, setEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!editing && activeTab) {
      setInputValue(displayUrl(activeTab.url));
    }
  }, [activeTab?.url, editing]);

  const onFocus = useCallback(() => {
    setEditing(true);
    setInputValue(activeTab?.url || "");
    setTimeout(() => inputRef.current?.selectAll?.(), 50);
  }, [activeTab?.url]);

  const onBlur = useCallback(() => {
    setEditing(false);
    setSuggestions([]);
    if (activeTab) {
      setInputValue(displayUrl(activeTab.url));
    }
  }, [activeTab]);

  const onChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      if (text.length > 0) {
        const filtered = history
          .filter((h) => h.toLowerCase().includes(text.toLowerCase()))
          .slice(0, 5);
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    },
    [history]
  );

  const onSubmit = useCallback(() => {
    const url = resolveUrl(inputValue);
    navigateActiveTab(url);
    setEditing(false);
    setSuggestions([]);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [inputValue, navigateActiveTab]);

  const onSuggestionPress = useCallback(
    (url: string) => {
      navigateActiveTab(url);
      setEditing(false);
      setSuggestions([]);
      Keyboard.dismiss();
    },
    [navigateActiveTab]
  );

  const isSecure = activeTab?.url.startsWith("https://");
  const isLoading = false;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.input,
            borderColor: editing ? theme.primary : theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => goBackRef.current?.()}
          disabled={!activeTab?.canGoBack}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={activeTab?.canGoBack ? theme.foreground : theme.mutedForeground}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => goForwardRef.current?.()}
          disabled={!activeTab?.canGoForward}
        >
          <Feather
            name="chevron-right"
            size={20}
            color={activeTab?.canGoForward ? theme.foreground : theme.mutedForeground}
          />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          {!editing && (
            <Feather
              name={isSecure ? "lock" : "globe"}
              size={12}
              color={isSecure ? "#4caf50" : theme.mutedForeground}
              style={styles.lockIcon}
            />
          )}
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: editing ? theme.url : theme.foreground }]}
            value={inputValue}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            onSubmitEditing={onSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
            placeholderTextColor={theme.mutedForeground}
            placeholder="Search or enter URL"
          />
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={() => reloadRef.current?.()}>
          <Feather name="refresh-cw" size={16} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      {editing && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                onPress={() => onSuggestionPress(item)}
              >
                <Feather name="clock" size={14} color={theme.mutedForeground} style={{ marginRight: 8 }} />
                <Text style={[styles.suggestionText, { color: theme.foreground }]} numberOfLines={1}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    zIndex: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
    height: 42,
  },
  navBtn: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    height: 42,
  },
  lockIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    includeFontPadding: false,
  },
  suggestions: {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 220,
    overflow: "hidden",
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
