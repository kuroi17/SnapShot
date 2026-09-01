import { useRef, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withRepeat,
  withTiming,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import { Button } from "../ui/Button";

const HANDLE_SIZE = 44;
const MARQUEE_MIN = 60;

type Anchor = -1 | 0 | 1;

function MarqueeHandle({
  anchorX,
  anchorY,
  mx,
  my,
  mw,
  mh,
  maxX,
  maxY,
}: {
  anchorX: Anchor;
  anchorY: Anchor;
  mx: SharedValue<number>;
  my: SharedValue<number>;
  mw: SharedValue<number>;
  mh: SharedValue<number>;
  maxX: number;
  maxY: number;
}) {
  const prevX = useSharedValue(0);
  const prevY = useSharedValue(0);

  const haptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(haptic)();
      prevX.value = 0;
      prevY.value = 0;
    })
    .onUpdate((e) => {
      const dx = e.translationX - prevX.value;
      const dy = e.translationY - prevY.value;
      prevX.value = e.translationX;
      prevY.value = e.translationY;

      if (anchorX === -1) {
        const nextX = Math.max(0, Math.min(mx.value + mw.value - MARQUEE_MIN, mx.value + dx));
        const diffX = mx.value - nextX;
        mx.value = nextX;
        mw.value = mw.value + diffX;
      } else if (anchorX === 1) {
        mw.value = Math.max(MARQUEE_MIN, Math.min(maxX - mx.value, mw.value + dx));
      }

      if (anchorY === -1) {
        const nextY = Math.max(0, Math.min(my.value + mh.value - MARQUEE_MIN, my.value + dy));
        const diffY = my.value - nextY;
        my.value = nextY;
        mh.value = mh.value + diffY;
      } else if (anchorY === 1) {
        mh.value = Math.max(MARQUEE_MIN, Math.min(maxY - my.value, mh.value + dy));
      }
    });

  const handleStyle = useAnimatedStyle(() => {
    const offX =
      anchorX === -1
        ? -HANDLE_SIZE / 2
        : anchorX === 0
        ? mw.value / 2 - HANDLE_SIZE / 2
        : mw.value - HANDLE_SIZE / 2;
    const offY =
      anchorY === -1
        ? -HANDLE_SIZE / 2
        : anchorY === 0
        ? mh.value / 2 - HANDLE_SIZE / 2
        : mh.value - HANDLE_SIZE / 2;
    return {
      position: "absolute" as const,
      left: mx.value + offX,
      top: my.value + offY,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="absolute items-center justify-center"
        style={handleStyle}
      >
        <View className="w-3.5 h-3.5 bg-accentCyan rounded-sm shadow-md border border-white" />
      </Animated.View>
    </GestureDetector>
  );
}

export function CaptureOverlay() {
  const router = useRouter();
  const params = useLocalSearchParams<{ screenshotUri?: string; imageUri?: string }>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const captureRefLocal = useRef<View>(null);

  const [activeImageUri, setActiveImageUri] = useState<string | null>(
    params.screenshotUri || params.imageUri || null
  );
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (params.screenshotUri || params.imageUri) {
      const uri = params.screenshotUri || params.imageUri || "";
      setActiveImageUri(uri);
    }
  }, [params.screenshotUri, params.imageUri]);

  useEffect(() => {
    if (activeImageUri) {
      Image.getSize(
        activeImageUri,
        (w, h) => setImageDimensions({ width: w, height: h }),
        () => setImageDimensions(null)
      );
    }
  }, [activeImageUri]);

  const initialW = screenWidth * 0.75;
  const initialH = screenHeight * 0.45;
  const initialX = (screenWidth - initialW) / 2;
  const initialY = (screenHeight - initialH) / 3;

  const mx = useSharedValue(initialX);
  const my = useSharedValue(initialY);
  const mw = useSharedValue(initialW);
  const mh = useSharedValue(initialH);

  const borderOpacity = useSharedValue(0.6);
  const [dimLabel, setDimLabel] = useState("");

  useEffect(() => {
    borderOpacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );
  }, [borderOpacity]);

  useAnimatedReaction(
    () => ({ w: Math.round(mw.value), h: Math.round(mh.value) }),
    (current) => {
      runOnJS(setDimLabel)(`${current.w} × ${current.h}`);
    }
  );

  // Marquee body pan gesture (drag the whole selection box around)
  const prevMoveX = useSharedValue(0);
  const prevMoveY = useSharedValue(0);
  const moveGesture = Gesture.Pan()
    .onBegin(() => {
      prevMoveX.value = 0;
      prevMoveY.value = 0;
    })
    .onUpdate((e) => {
      const dx = e.translationX - prevMoveX.value;
      const dy = e.translationY - prevMoveY.value;
      prevMoveX.value = e.translationX;
      prevMoveY.value = e.translationY;

      const newX = Math.max(0, Math.min(screenWidth - mw.value, mx.value + dx));
      const newY = Math.max(0, Math.min(screenHeight - mh.value, my.value + dy));
      mx.value = newX;
      my.value = newY;
    });

  // Spotlight Cutout Dimmed Layers
  const topDimStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: Math.max(0, my.value),
    backgroundColor: "rgba(12, 13, 14, 0.65)",
  }));

  const bottomDimStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: my.value + mh.value,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(12, 13, 14, 0.65)",
  }));

  const leftDimStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: my.value,
    left: 0,
    width: Math.max(0, mx.value),
    height: mh.value,
    backgroundColor: "rgba(12, 13, 14, 0.65)",
  }));

  const rightDimStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: my.value,
    left: mx.value + mw.value,
    right: 0,
    height: mh.value,
    backgroundColor: "rgba(12, 13, 14, 0.65)",
  }));

  const marqueeStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value,
    top: my.value,
    width: mw.value,
    height: mh.value,
    borderWidth: 2,
    borderColor: "#00f0ff",
    borderStyle: "dashed" as const,
    opacity: borderOpacity.value,
    backgroundColor: "rgba(0, 240, 255, 0.03)",
  }));

  const labelStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value,
    top: Math.max(12, my.value - 28),
  }));

  const loadLatestScreenshot = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: "photo",
          sortBy: ["creationTime"],
          first: 1,
        });
        if (media.assets.length > 0 && media.assets[0]?.uri) {
          setActiveImageUri(media.assets[0].uri);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleCapture = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    try {
      let finalCroppedUri = "";

      if (activeImageUri) {
        // Crop exact selected region from the loaded screenshot / image
        const imgW = imageDimensions?.width || screenWidth;
        const imgH = imageDimensions?.height || screenHeight;

        const scaleX = imgW / screenWidth;
        const scaleY = imgH / screenHeight;

        const cropX = Math.max(0, Math.round(mx.value * scaleX));
        const cropY = Math.max(0, Math.round(my.value * scaleY));
        const cropW = Math.min(imgW - cropX, Math.round(mw.value * scaleX));
        const cropH = Math.min(imgH - cropY, Math.round(mh.value * scaleY));

        const cropped = await ImageManipulator.manipulateAsync(
          activeImageUri,
          [
            {
              crop: {
                originX: cropX,
                originY: cropY,
                width: Math.max(10, cropW),
                height: Math.max(10, cropH),
              },
            },
          ],
          { format: ImageManipulator.SaveFormat.PNG }
        );

        finalCroppedUri = cropped.uri;
      } else if (Platform.OS !== "web" && captureRefLocal.current) {
        finalCroppedUri = await captureRef(captureRefLocal, {
          format: "png",
          quality: 1,
          result: "tmpfile",
        });
      }

      router.push({
        pathname: "/processing",
        params: { imageUri: finalCroppedUri },
      });
    } catch {
      router.push({ pathname: "/processing", params: { imageUri: activeImageUri || "" } });
    }
  }, [activeImageUri, imageDimensions, screenWidth, screenHeight, mx, my, mw, mh, router]);

  const handleCancel = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    router.back();
  }, [router]);

  const anchors: { ax: Anchor; ay: Anchor }[] = [
    { ax: -1, ay: -1 },
    { ax: 0, ay: -1 },
    { ax: 1, ay: -1 },
    { ax: 1, ay: 0 },
    { ax: 1, ay: 1 },
    { ax: 0, ay: 1 },
    { ax: -1, ay: 1 },
    { ax: -1, ay: 0 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} className="bg-darkCanvas">
      <View ref={captureRefLocal} style={{ flex: 1, width: "100%", height: "100%" }} collapsable={false}>
        {/* Underneath Screenshot / Image Background */}
        {activeImageUri ? (
          <Image
            source={{ uri: activeImageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-darkCard/90 p-6 rounded-lg border border-win95Shadow items-center max-w-xs">
              <Text className="text-accentCyan font-bold text-base mb-2">📸 SnapShot Selection</Text>
              <Text className="text-gray-300 text-xs text-center mb-4 leading-5">
                Drag the marquee box over any object, or load your latest screenshot / photo to remove background.
              </Text>
              <Pressable
                onPress={loadLatestScreenshot}
                className="bg-accentBlue/20 border border-accentBlue px-4 py-2.5 rounded active:opacity-70"
              >
                <Text className="text-accentBlue font-bold text-xs">🖼️ Load Latest Screenshot / Photo</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 4 Spotlight Dimmed Surrounds (Creates clear un-dimmed window inside selection) */}
        <Animated.View style={topDimStyle} pointerEvents="none" />
        <Animated.View style={bottomDimStyle} pointerEvents="none" />
        <Animated.View style={leftDimStyle} pointerEvents="none" />
        <Animated.View style={rightDimStyle} pointerEvents="none" />

        {/* Drag-to-Move Whole Marquee Box */}
        <GestureDetector gesture={moveGesture}>
          <Animated.View style={marqueeStyle} />
        </GestureDetector>

        {/* 8 Resize Handles */}
        {anchors.map((a, i) => (
          <MarqueeHandle
            key={i}
            anchorX={a.ax}
            anchorY={a.ay}
            mx={mx}
            my={my}
            mw={mw}
            mh={mh}
            maxX={screenWidth}
            maxY={screenHeight}
          />
        ))}

        {/* Dimension Label */}
        <Animated.View style={[labelStyle, { pointerEvents: "none" }]}>
          <View
            className="bg-darkCard/95 px-2.5 py-1 rounded-sm"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0, 240, 255, 0.4)",
            }}
          >
            <Text className="font-mono text-[11px] text-accentCyan font-bold">
              {dimLabel || `${Math.round(initialW)} × ${Math.round(initialH)}`}
            </Text>
          </View>
        </Animated.View>

        {/* Bottom Action Bar */}
        <View
          style={{
            position: "absolute",
            bottom: 36,
            left: 0,
            right: 0,
            zIndex: 10000,
            flexDirection: "row",
            justifyContent: "center",
            gap: 16,
            paddingHorizontal: 24,
          }}
        >
          <Button
            variant="glow"
            size="lg"
            className="flex-1 max-w-[180px]"
            onPress={handleCapture}
          >
            Capture
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 max-w-[180px]"
            onPress={handleCancel}
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
}
