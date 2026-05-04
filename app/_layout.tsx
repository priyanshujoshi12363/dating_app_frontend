import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f172a" },
        }}
      >
        {/* Manually register your screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="components/Login" />
        <Stack.Screen name="components/Register" />
        <Stack.Screen name="components/Registration_complete" />
        <Stack.Screen name="components/MainApp" />
      </Stack>
    </>
  );
}