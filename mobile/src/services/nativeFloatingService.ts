import { NativeModules, Platform } from "react-native";

const { FloatingBubble } = NativeModules;

export async function hasOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (!FloatingBubble?.hasPermission) return true;
  try {
    return await FloatingBubble.hasPermission();
  } catch {
    return true;
  }
}

export async function requestOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (!FloatingBubble?.requestPermission) return true;
  try {
    return await FloatingBubble.requestPermission();
  } catch {
    return false;
  }
}

export async function showFloatingBubble(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (!FloatingBubble?.showBubble) return true;
  try {
    await FloatingBubble.showBubble();
    return true;
  } catch (error) {
    console.warn("Failed to show native floating bubble:", error);
    return false;
  }
}

export async function hideFloatingBubble(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (!FloatingBubble?.hideBubble) return true;
  try {
    await FloatingBubble.hideBubble();
    return true;
  } catch (error) {
    console.warn("Failed to hide native floating bubble:", error);
    return false;
  }
}

export async function isFloatingBubbleShowing(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (!FloatingBubble?.isBubbleShowing) return false;
  try {
    return await FloatingBubble.isBubbleShowing();
  } catch {
    return false;
  }
}
