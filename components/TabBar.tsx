import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBrowser } from "@/context/BrowserContext";
import { useTheme } from "@/context/ThemeContext";

export default function TabBar() {
  const { theme } = useTheme();
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useBrowser();

  const handleAddTab = useCallback(() => {
    addTab();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [addTab]);

  const handleClose = useCallback(
    (id: string) => {
      closeTab(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [closeTab]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(t) => t.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isActive = item.id === activeTabId;
          return (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.tabActive : theme.tabInactive,
                  borderColor: isActive ? theme.primary : "transparent",
                },
              ]}
              onPress={() => setActiveTab(item.id)}
              activeOpacity={0.8}
            >
              <Feather
                name="globe"
                size={12}
                color={isActive ? theme.primaryForeground : theme.mutedForeground}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabTitle,
                  { color: isActive ? theme.primaryForeground : theme.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {item.title.length > 12 ? item.title.slice(0, 12) + "…" : item.title}
              </Text>
              {tabs.length > 1 && (
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => handleClose(item.id)}
                  style={styles.closeBtn}
                >
                  <Feather
                    name="x"
                    size={11}
                    color={isActive ? theme.primaryForeground : theme.mutedForeground}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity
        style={[styles.addBtn, { borderColor: theme.border }]}
        onPress={handleAddTab}
      >
        <Feather name="plus" size={18} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: 8,
  },
  list: {
    paddingVertical: 6,
    gap: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 140,
    minWidth: 70,
  },
  tabIcon: {
    marginRight: 5,
  },
  tabTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  closeBtn: {
    marginLeft: 4,
  },
  addBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
  },
});
