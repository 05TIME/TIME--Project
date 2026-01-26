import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import EndpointsScreen from "@/screens/EndpointsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export type EndpointsStackParamList = {
  Endpoints: undefined;
};

const Stack = createNativeStackNavigator<EndpointsStackParamList>();

function AddButton() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      onPress={() => navigation.navigate("NewRequestTab")}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Feather name="plus" size={24} color={theme.primary} />
    </Pressable>
  );
}

export default function EndpointsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Endpoints"
        component={EndpointsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="API Tester" />,
          headerRight: () => <AddButton />,
        }}
      />
    </Stack.Navigator>
  );
}
