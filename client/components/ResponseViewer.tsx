import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, Colors } from "@/constants/theme";
import type { RequestResponse } from "@/types/endpoint";

interface ResponseViewerProps {
  response: RequestResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

type Tab = "body" | "headers";

export function ResponseViewer({
  response,
  isLoading,
  error,
}: ResponseViewerProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("body");

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return Colors.dark.success;
    if (status >= 400) return Colors.dark.error;
    return Colors.dark.primary;
  };

  const formatJson = (text: string) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.loadingContainer}>
          <Feather name="loader" size={24} color={theme.primary} />
          <ThemedText style={styles.loadingText}>Sending request...</ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={24} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            {error}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (!response) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.emptyContainer}>
          <Feather name="send" size={32} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Send a request to see the response
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(response.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(response.status), fontFamily: Fonts.mono },
              ]}
            >
              {response.status} {response.statusText}
            </Text>
          </View>
          <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
            {response.duration}ms
          </ThemedText>
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setActiveTab("body")}
            style={[
              styles.tab,
              activeTab === "body" && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === "body" ? theme.text : theme.textSecondary },
              ]}
            >
              Body
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("headers")}
            style={[
              styles.tab,
              activeTab === "headers" && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                {
                  color: activeTab === "headers" ? theme.text : theme.textSecondary,
                },
              ]}
            >
              Headers
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === "body" ? (
          <View>
            <Pressable
              onPress={() => handleCopy(response.body)}
              style={styles.copyButton}
            >
              <Feather name="copy" size={16} color={theme.textSecondary} />
            </Pressable>
            <Text
              style={[
                styles.codeText,
                { color: theme.text, fontFamily: Fonts.mono },
              ]}
              selectable
            >
              {formatJson(response.body)}
            </Text>
          </View>
        ) : (
          <View>
            {Object.entries(response.headers).map(([key, value]) => (
              <View key={key} style={styles.headerRow}>
                <Text
                  style={[
                    styles.headerKey,
                    { color: theme.primary, fontFamily: Fonts.mono },
                  ]}
                >
                  {key}:
                </Text>
                <Text
                  style={[
                    styles.headerValue,
                    { color: theme.textSecondary, fontFamily: Fonts.mono },
                  ]}
                  numberOfLines={2}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    flex: 1,
    minHeight: 200,
  },
  header: {
    padding: Spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  duration: {
    fontSize: 13,
  },
  tabs: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  tab: {
    paddingBottom: Spacing.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  copyButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: Spacing.sm,
    zIndex: 1,
  },
  codeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  headerRow: {
    marginBottom: Spacing.sm,
  },
  headerKey: {
    fontSize: 12,
    fontWeight: "600",
  },
  headerValue: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["3xl"],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
