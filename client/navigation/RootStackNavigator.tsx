import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import EditRequestScreen from "@/screens/EditRequestScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { Endpoint } from "@/types/endpoint";

export type RootStackParamList = {
  Main: undefined;
  EditRequest: { endpoint: Endpoint };
  NewRequestTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditRequest"
        component={EditRequestScreen}
        options={{
          headerTitle: "Edit Request",
        }}
      />
    </Stack.Navigator>
  );
}
