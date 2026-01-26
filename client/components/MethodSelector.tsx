import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, HttpMethods, Fonts } from "@/constants/theme";
import type { HttpMethod } from "@/types/endpoint";

interface MethodSelectorProps {
  selected: HttpMethod;
  onSelect: (method: HttpMethod) => void;
}

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function MethodSelector({ selected, onSelect }: MethodSelectorProps) {
  const { theme } = useTheme();

  const handleSelect = (method: HttpMethod) => {
    Haptics.selectionAsync();
    onSelect(method);
  };

  return (
    <View style={styles.container}>
      {methods.map((method) => {
        const isSelected = selected === method;
        const config = HttpMethods[method];

        return (
          <Pressable
            key={method}
            onPress={() => handleSelect(method)}
            style={[
              styles.button,
              {
                backgroundColor: isSelected
                  ? config.color + "30"
                  : theme.backgroundDefault,
                borderColor: isSelected ? config.color : "transparent",
              },
            ]}
            testID={`button-method-${method.toLowerCase()}`}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isSelected ? config.color : theme.textSecondary,
                  fontFamily: Fonts.mono,
                },
              ]}
            >
              {method}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  button: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
