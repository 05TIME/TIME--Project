import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NewRequestScreen from "@/screens/NewRequestScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type NewRequestStackParamList = {
  NewRequest: undefined;
};

const Stack = createNativeStackNavigator<NewRequestStackParamList>();

export default function NewRequestStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="NewRequest"
        component={NewRequestScreen}
        options={{
          headerTitle: "Test Request",
        }}
      />
    </Stack.Navigator>
  );
}
