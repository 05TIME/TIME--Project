import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HttpMethods, BorderRadius, Fonts } from "@/constants/theme";
import type { HttpMethod } from "@/types/endpoint";

interface MethodBadgeProps {
  method: HttpMethod;
  size?: "small" | "medium";
}

export function MethodBadge({ method, size = "medium" }: MethodBadgeProps) {
  const methodConfig = HttpMethods[method];
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: methodConfig.color + "20" },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: methodConfig.color, fontFamily: Fonts.mono },
          isSmall && styles.textSmall,
        ]}
      >
        {methodConfig.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});
