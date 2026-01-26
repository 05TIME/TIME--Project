import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { MethodBadge } from "@/components/MethodBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import type { Endpoint } from "@/types/endpoint";

interface EndpointCardProps {
  endpoint: Endpoint;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EndpointCard({
  endpoint,
  onPress,
  onLongPress,
}: EndpointCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  const formatLastUsed = (timestamp?: number) => {
    if (!timestamp) return "Never used";
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
      testID={`card-endpoint-${endpoint.id}`}
    >
      <View style={styles.header}>
        <MethodBadge method={endpoint.method} />
        <ThemedText
          type="small"
          style={[styles.timestamp, { color: theme.textSecondary }]}
        >
          {formatLastUsed(endpoint.lastUsed)}
        </ThemedText>
      </View>
      <ThemedText type="body" style={styles.name} numberOfLines={1}>
        {endpoint.name || "Untitled Request"}
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.url, { color: theme.textSecondary, fontFamily: Fonts.mono }]}
        numberOfLines={1}
      >
        {endpoint.url}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  name: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  url: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 12,
  },
});
