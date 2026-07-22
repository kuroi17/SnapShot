import { useRef, useCallback, useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HANDLE_SIZE = 44;
const MARQUEE_MIN = 80;

const INITIAL_W = SCREEN_WIDTH * 0.7;
const INITIAL_H = SCREEN_HEIGHT * 0.4;
const INITIAL_X = (SCREEN_WIDTH - INITIAL_W) / 2;
const INITIAL_Y = (SCREEN_HEIGHT - INITIAL_H) / 3;

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
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      anchorX === -1 ? -HANDLE_SIZE / 2
        : anchorX === 0 ? mw.value / 2 - HANDLE_SIZE / 2
        : mw.value - HANDLE_SIZE / 2;
    const offY =
      anchorY === -1 ? -HANDLE_SIZE / 2
        : anchorY === 0 ? mh.value / 2 - HANDLE_SIZE / 2
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
        <View
          className="w-3 h-3 bg-accentCyan rounded-sm"
          style={{
            shadowColor: "#00f0ff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 6,
            elevation: 6,
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function CaptureOverlay() {
  const router = useRouter();
  const captureRefLocal = useRef<View>(null);

  const mx = useSharedValue(INITIAL_X);
  const my = useSharedValue(INITIAL_Y);
  const mw = useSharedValue(INITIAL_W);
  const mh = useSharedValue(INITIAL_H);
  const borderOpacity = useSharedValue(0.3);

  const [dimLabel, setDimLabel] = useState("");

  useEffect(() => {
    borderOpacity.value = withRepeat(
      withTiming(1, { duration: 900 }),
      -1,
      true
    );
  }, []);

  useAnimatedReaction(
    () => ({
      w: Math.round(mw.value),
      h: Math.round(mh.value),
    }),
    (cur) => {
      runOnJS(setDimLabel)(`${cur.w} × ${cur.h}`);
    },
    [mw, mh]
  );

  const marqueeStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value,
    top: my.value,
    width: mw.value,
    height: mh.value,
    borderWidth: 2,
    borderStyle: "dashed" as const,
    borderColor: `rgba(0, 240, 255, ${borderOpacity.value})`,
    backgroundColor: "rgba(0, 240, 255, 0.04)",
  }));

  const glowStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value - 4,
    top: my.value - 4,
    width: mw.value + 8,
    height: mh.value + 8,
    borderWidth: 1,
    borderColor: `rgba(0, 240, 255, ${borderOpacity.value * 0.3})`,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: mx.value,
    top: my.value - 28,
  }));

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleCapture = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await captureRef(captureRefLocal.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
    } catch {
      // capture failed silently
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
    <BlurView intensity={80} tint="dark" className="flex-1">
      <View ref={captureRefLocal} className="flex-1" collapsable={false}>
        <Animated.View style={glowStyle} pointerEvents="none" />
        <Animated.View style={marqueeStyle} pointerEvents="none" />

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

        <Animated.View style={labelStyle} pointerEvents="none">
          <View
            className="bg-darkCard/90 px-2 py-0.5 rounded-sm"
            style={{
              borderWidth: 1,
              borderColor: "rgba(0, 240, 255, 0.3)",
            }}
          >
            <Text className="font-mono text-[11px] text-accentCyan font-bold">
              {dimLabel || `${Math.round(INITIAL_W)} × ${Math.round(INITIAL_H)}`}
            </Text>
          </View>
        </Animated.View>

        <View className="absolute bottom-12 left-0 right-0 flex-row justify-center gap-4 px-6">
          <Button
            variant="glow"
            size="lg"
            className="flex-1 max-w-[180]"
            onPress={handleCapture}
          >
            Capture
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 max-w-[180]"
            onPress={handleCancel}
          >
            Cancel
          </Button>
        </View>
      </View>
    </BlurView>
  );
}
