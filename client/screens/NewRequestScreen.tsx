import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { MethodSelector } from "@/components/MethodSelector";
import { ResponseViewer } from "@/components/ResponseViewer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { saveEndpoint, updateEndpointLastUsed } from "@/lib/storage";
import type { HttpMethod, Endpoint, RequestResponse } from "@/types/endpoint";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NewRequestScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseHeaders = (headersStr: string): Record<string, string> => {
    const result: Record<string, string> = {};
    if (!headersStr.trim()) return result;

    try {
      return JSON.parse(headersStr);
    } catch {
      headersStr.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
          result[key.trim()] = valueParts.join(":").trim();
        }
      });
    }
    return result;
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const startTime = Date.now();

    try {
      const parsedHeaders = parseHeaders(headers);
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
      };

      if (method !== "GET" && body.trim()) {
        fetchOptions.body = body;
      }

      const res = await fetch(url.trim(), fetchOptions);
      const duration = Date.now() - startTime;

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody = "";
      try {
        responseBody = await res.text();
      } catch {
        responseBody = "[Unable to read response body]";
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const endpoint: Endpoint = {
        id: Date.now().toString(),
        name: name.trim() || `${method} Request`,
        url: url.trim(),
        method,
        headers: parsedHeaders,
        body: method !== "GET" ? body : undefined,
        lastUsed: Date.now(),
        createdAt: Date.now(),
      };
      await saveEndpoint(endpoint);
    } catch (err) {
      const duration = Date.now() - startTime;
      setError(
        err instanceof Error ? err.message : "Failed to send request"
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeIn.delay(100)}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          METHOD
        </ThemedText>
        <MethodSelector selected={method} onSelect={setMethod} />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(150)} style={styles.inputGroup}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          REQUEST NAME (OPTIONAL)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="My API Request"
          placeholderTextColor={theme.textSecondary}
          testID="input-name"
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(200)} style={styles.inputGroup}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          URL
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.monoInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              fontFamily: Fonts.mono,
            },
          ]}
          value={url}
          onChangeText={setUrl}
          placeholder="https://api.example.com/endpoint"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          testID="input-url"
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(250)} style={styles.inputGroup}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          HEADERS (JSON OR KEY: VALUE)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            styles.monoInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              fontFamily: Fonts.mono,
            },
          ]}
          value={headers}
          onChangeText={setHeaders}
          placeholder={'{"Authorization": "Bearer token"}'}
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          testID="input-headers"
        />
      </Animated.View>

      {method !== "GET" ? (
        <Animated.View entering={FadeIn.delay(300)} style={styles.inputGroup}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            BODY
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              styles.monoInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                fontFamily: Fonts.mono,
              },
            ]}
            value={body}
            onChangeText={setBody}
            placeholder={'{"key": "value"}'}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="input-body"
          />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeIn.delay(350)}>
        <Pressable
          onPress={sendRequest}
          disabled={isLoading}
          style={[
            styles.sendButton,
            { backgroundColor: theme.primary, opacity: isLoading ? 0.6 : 1 },
          ]}
          testID="button-send"
        >
          <Feather name="send" size={18} color={theme.buttonText} />
          <ThemedText
            style={[styles.sendButtonText, { color: theme.buttonText }]}
          >
            Send Request
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400)} style={styles.responseSection}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          RESPONSE
        </ThemedText>
        <ResponseViewer response={response} isLoading={isLoading} error={error} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  inputGroup: {},
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    fontSize: 15,
  },
  monoInput: {
    fontSize: 13,
  },
  multilineInput: {
    height: 90,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  responseSection: {
    flex: 1,
    minHeight: 250,
  },
});
