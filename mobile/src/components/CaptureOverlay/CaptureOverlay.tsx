import { useRef, useCallback, useEffect, useState } from "react";
import { View, Text, useWindowDimensions, Platform } from "react-native";
import { BlurView } from "expo-blur";
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
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";
import { Button } from "../ui/Button";

const HANDLE_SIZE = 44;
const MARQUEE_MIN = 80;

type Anchor = -1 | 0 | 1;

function MarqueeHandle({
  anchorX,
  anchorY,
  mx,
  my,
  mw,
  mh,
}: {
  anchorX: Anchor;
  anchorY: Anchor;
  mx: SharedValue<number>;
  my: SharedValue<number>;
  mw: SharedValue<number>;
  mh: SharedValue<number>;
}) {
  const prevX = useSharedValue(0);
  const prevY = useSharedValue(0);
  const haptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics unavailable on web
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
        mx.value = mx.value + dx;
        mw.value = Math.max(MARQUEE_MIN, mw.value - dx);
      } else if (anchorX === 1) {
        mw.value = Math.max(MARQUEE_MIN, mw.value + dx);
      }
      if (anchorY === -1) {
        my.value = my.value + dy;
        mh.value = Math.max(MARQUEE_MIN, mh.value - dy);
      } else if (anchorY === 1) {
        mh.value = Math.max(MARQUEE_MIN, mh.value + dy);
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
        <View className="w-3.5 h-3.5 bg-accentCyan rounded-sm shadow-md" />
      </Animated.View>
    </GestureDetector>
  );
}

export function CaptureOverlay() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const captureRefLocal = useRef<View>(null);

  const initialW = screenWidth * 0.7;
  const initialH = screenHeight * 0.4;
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
  }, []);

  useAnimatedReaction(
    () => ({ w: Math.round(mw.value), h: Math.round(mh.value) }),
    (current) => {
      runOnJS(setDimLabel)(`${current.w} × ${current.h}`);
    }
  );

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
    backgroundColor: "rgba(0, 240, 255, 0.04)",
  }));

  const labelStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value,
    top: my.value - 28,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value - 4,
    top: my.value - 4,
    width: mw.value + 8,
    height: mh.value + 8,
    backgroundColor: "rgba(0, 240, 255, 0.08)",
    borderRadius: 4,
  }));

  const handleCapture = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    try {
      let resultUri = "";
      if (Platform.OS !== "web" && captureRefLocal.current) {
        resultUri = await captureRef(captureRefLocal, {
          format: "png",
          quality: 1,
          result: "tmpfile",
        });
      }
      router.push({
        pathname: "/processing",
        params: { imageUri: resultUri },
      });
    } catch {
      router.push({ pathname: "/processing", params: { imageUri: "" } });
    }
  }, [router]);

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
    <BlurView
      intensity={90}
      tint="dark"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(12, 13, 14, 0.85)",
      }}
    >
      <View ref={captureRefLocal} style={{ flex: 1, width: "100%", height: "100%" }} collapsable={false}>
        <Animated.View style={[glowStyle, { pointerEvents: "none" }]} />
        <Animated.View style={[marqueeStyle, { pointerEvents: "none" }]} />

        {anchors.map((a, i) => (
          <MarqueeHandle
            key={i}
            anchorX={a.ax}
            anchorY={a.ay}
            mx={mx}
            my={my}
            mw={mw}
            mh={mh}
          />
        ))}

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

        <View
          style={{
            position: "absolute",
            bottom: 32,
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
    </BlurView>
  );
}
