import "expo-router/entry";
import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { Outfit_400Regular, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { StatusBar } from "expo-status-bar";
import { FloatingTrigger } from "../components/FloatingTrigger/FloatingTrigger";
import { ToastProvider } from "../services/ToastContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Outfit_400Regular,
    Outfit_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar style="light" />
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="design-system" />
          <Stack.Screen
            name="capture"
            options={{ presentation: "fullScreenModal", animation: "none" }}
          />
          <Stack.Screen
            name="processing"
            options={{ presentation: "fullScreenModal", animation: "fade" }}
          />
          <Stack.Screen
            name="refine"
            options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="permission-denied"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="error"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
        </Stack>
        <FloatingTrigger />
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
