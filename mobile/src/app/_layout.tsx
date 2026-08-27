import "./preload";
import "../global.css";

import { Component, type ReactNode } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { Outfit_400Regular, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { StatusBar, View, Text } from "react-native";
import { FloatingTrigger } from "../components/FloatingTrigger/FloatingTrigger";
import { ToastProvider } from "../services/ToastContext";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  override state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: "#0c0d0e", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: "#ef4444", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>SnapShot Runtime Error</Text>
          <Text style={{ color: "#f3f4f6", fontSize: 12, textAlign: "center" }}>{String(this.state.error?.message || this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Outfit_400Regular,
    Outfit_700Bold,
  });

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0c0d0e" }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0c0d0e" } }}>
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
    </ErrorBoundary>
  );
}
