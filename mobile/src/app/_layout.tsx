import "./preload";
import "../global.css";

import { Component, useEffect, type ReactNode } from "react";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { Outfit_400Regular, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { StatusBar, View, Text, DeviceEventEmitter, Linking } from "react-native";
import { FloatingTrigger } from "../components/FloatingTrigger/FloatingTrigger";
import { ToastProvider } from "../services/ToastContext";
import { ServiceProvider } from "../services/ServiceContext";

function FloatingBubbleListener() {
  const router = useRouter();

  useEffect(() => {
    // 1. Direct native event when floating camera bubble is tapped
    const eventSub = DeviceEventEmitter.addListener("onFloatingBubbleClicked", () => {
      router.push("/capture");
    });

    // 2. Deep linking URL (e.g. snapshot://capture)
    const handleUrl = (event: { url: string }) => {
      if (event.url && event.url.includes("capture")) {
        router.push("/capture");
      }
    };
    const linkSub = Linking.addEventListener("url", handleUrl);

    // 3. Initial cold start launch URL
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("capture")) {
        router.push("/capture");
      }
    });

    return () => {
      eventSub.remove();
      linkSub.remove();
    };
  }, [router]);

  return null;
}

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
        <ServiceProvider>
          <ToastProvider>
            <FloatingBubbleListener />
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
        </ServiceProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
