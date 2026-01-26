import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { EndpointCard } from "@/components/EndpointCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getEndpoints, deleteEndpoint } from "@/lib/storage";
import type { Endpoint } from "@/types/endpoint";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EndpointsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEndpoints = useCallback(async () => {
    const data = await getEndpoints();
    setEndpoints(data);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEndpoints();
    }, [loadEndpoints])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEndpoints();
    setIsRefreshing(false);
  };

  const handleEndpointPress = (endpoint: Endpoint) => {
    navigation.navigate("EditRequest", { endpoint });
  };

  const handleEndpointLongPress = (endpoint: Endpoint) => {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${endpoint.name || "Untitled Request"}"?`)) {
        handleDelete(endpoint.id);
      }
    } else {
      Alert.alert(
        "Delete Endpoint",
        `Are you sure you want to delete "${endpoint.name || "Untitled Request"}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDelete(endpoint.id),
          },
        ]
      );
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEndpoint(id);
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
  };

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      style={styles.emptyContainer}
    >
      <Image
        source={require("../../assets/images/empty-endpoints.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h4" style={styles.emptyTitle}>
        No endpoints yet
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        Create your first API request to get started
      </ThemedText>
    </Animated.View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: Endpoint;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <EndpointCard
        endpoint={item}
        onPress={() => handleEndpointPress(item)}
        onLongPress={() => handleEndpointLongPress(item)}
      />
    </Animated.View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
        endpoints.length === 0 && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={endpoints}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={isLoading ? null : renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyImage: {
    width: 160,
    height: 160,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    maxWidth: 240,
  },
});
