import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBrowser } from "@/context/BrowserContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeName, themeNames } from "@/constants/colors";

const THEME_DESCRIPTIONS: Record<ThemeName, string> = {
  Earth: "Fresh forest green",
  Virellus: "Rich royal purple",
  Neptune: "Deep ocean blue",
  Mars: "Warm red & orange",
  Solar: "Fiery flame tones",
};

// Gradient colors for theme orbs - matching each theme's palette
const THEME_GRADIENT: Record<ThemeName, [string, string, string]> = {
  Earth: ["#28a840", "#1e8c34", "#0f2212"],
  Virellus: ["#a060e0", "#8040d0", "#6c30b8"],
  Neptune: ["#4080e0", "#3060c0", "#2050a8"],
  Mars: ["#e06040", "#c04820", "#a83818"],
  Solar: ["#ff4500", "#ff6b35", "#ff8c00"],
};

export default function SettingsScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const { clearHistory } = useBrowser();
  const insets = useSafeAreaInsets();

  const handleClearHistory = () => {
    Alert.alert("Clear History", "Are you sure you want to clear all browsing history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          clearHistory();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>THEME</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {themeNames.map((name, idx) => {
            const isSelected = name === themeName;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.themeRow,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: idx < themeNames.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
                onPress={() => {
                  setTheme(name as ThemeName);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <LinearGradient
                  colors={THEME_GRADIENT[name]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.themeOrb}
                />
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: theme.foreground }]}>{name}</Text>
                  <Text style={[styles.themeDesc, { color: theme.mutedForeground }]}>
                    {THEME_DESCRIPTIONS[name]}
                  </Text>
                </View>
                {isSelected && (
                  <Feather name="check" size={18} color={theme.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>PRIVACY</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearHistory}>
            <Feather name="trash-2" size={16} color={theme.destructive} style={{ marginRight: 10 }} />
            <Text style={[styles.settingName, { color: theme.destructive }]}>Clear Browsing History</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.mutedForeground }]}>Version</Text>
            <Text style={[styles.infoValue, { color: theme.foreground }]}>2.0.0</Text>
          </View>
          <View style={[styles.infoRow, { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.infoLabel, { color: theme.mutedForeground }]}>Author</Text>
            <Text style={[styles.infoValue, { color: theme.foreground }]}>VoltaTECH</Text>
          </View>
          <View style={[styles.infoRow, { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.infoLabel, { color: theme.mutedForeground }]}>License</Text>
            <Text style={[styles.infoValue, { color: theme.foreground }]}>CC-BY-NC-ND-4.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  themeOrb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  themeDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
