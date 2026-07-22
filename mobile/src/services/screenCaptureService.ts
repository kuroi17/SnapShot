import { Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import type { RefObject } from "react";
import type { View } from "react-native";

export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CaptureResult = string;

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("[screenCapture] Media library permission denied");
      return false;
    }
    return true;
  }

  if (Platform.OS === "ios") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("[screenCapture] Photo library permission denied");
      return false;
    }
    return true;
  }

  return false;
}

export async function captureRegion(
  region: CaptureRegion,
  viewRef?: RefObject<View>
): Promise<string> {
  if (viewRef?.current) {
    return captureRef(viewRef.current, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width: region.width,
      height: region.height,
    });
  }

  return captureRef(undefined as any, {
    format: "png",
    quality: 1,
    result: "tmpfile",
    width: region.width,
    height: region.height,
  });
}

export async function saveToGallery(uri: string): Promise<boolean> {
  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch {
    console.warn("[screenCapture] Failed to save to gallery");
    return false;
  }
}
