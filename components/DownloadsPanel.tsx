import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useBrowser } from "@/context/BrowserContext";
import { useTheme } from "@/context/ThemeContext";

export default function DownloadsPanel({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { downloads, removeDownload } = useBrowser();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.foreground }]}>Downloads</Text>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={20} color={theme.mutedForeground} />
        </TouchableOpacity>
      </View>
      {downloads.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="download" size={32} color={theme.mutedForeground} />
          <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>No downloads yet</Text>
        </View>
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => (
            <View style={[styles.item, { borderBottomColor: theme.border }]}>
              <View style={styles.itemInfo}>
                <Feather
                  name={item.done ? "check-circle" : "download"}
                  size={16}
                  color={item.done ? "#4caf50" : theme.primary}
                />
                <Text style={[styles.itemName, { color: theme.foreground }]} numberOfLines={1}>
                  {item.filename}
                </Text>
              </View>
              {!item.done && (
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: theme.primary, width: `${item.progress * 100}%` as any },
                    ]}
                  />
                </View>
              )}
              {item.done && (
                <TouchableOpacity onPress={() => removeDownload(item.id)}>
                  <Feather name="trash-2" size={14} color={theme.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: 320,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
