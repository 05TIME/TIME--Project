import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Pressable, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getEndpoints } from "@/lib/storage";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [endpointCount, setEndpointCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const endpoints = await getEndpoints();
      setEndpointCount(endpoints.length);
    };
    loadStats();
  }, []);

  const appVersion = "1.0.0";

  const handleClearData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (Platform.OS === "web") {
      if (confirm("Clear all saved endpoints? This cannot be undone.")) {
        await AsyncStorage.clear();
        setEndpointCount(0);
      }
    } else {
      Alert.alert(
        "Clear All Data",
        "This will delete all saved endpoints. This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            style: "destructive",
            onPress: async () => {
              await AsyncStorage.clear();
              setEndpointCount(0);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.profileSection}
      >
        <Image
          source={require("../../assets/images/avatar-dev.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
        <ThemedText type="h3" style={styles.title}>
          API Tester
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Developer Utility
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.statItem}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {endpointCount}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            Saved Endpoints
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          SETTINGS
        </ThemedText>
        <View style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => [
              styles.settingRow,
              pressed && { opacity: 0.7 },
            ]}
            testID="button-clear-data"
          >
            <View style={styles.settingLeft}>
              <Feather name="trash-2" size={20} color={Colors.dark.error} />
              <ThemedText style={[styles.settingText, { color: Colors.dark.error }]}>
                Clear All Data
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          ABOUT
        </ThemedText>
        <View style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="info" size={20} color={theme.textSecondary} />
              <ThemedText style={styles.settingText}>Version</ThemedText>
            </View>
            <ThemedText style={{ color: theme.textSecondary }}>
              {appVersion}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(500).springify()}
        style={styles.footer}
      >
        <ThemedText
          type="small"
          style={[styles.footerText, { color: theme.textSecondary }]}
        >
          Built for developers
        </ThemedText>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {},
  statsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  settingsCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingText: {
    fontSize: 15,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 12,
  },
});
