import { useState } from "react";
import { View, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CANVAS_SIZE = Math.min(SCREEN_W, SCREEN_H) * 0.9;

type BrushMode = "restore" | "remove" | null;
type BackgroundMode = "light-grid" | "dark-grid" | "white" | "black";

interface BrushCanvasProps {
  imageUri: string;
  brushRadius: number;
  brushMode: BrushMode;
  backgroundMode: BackgroundMode;
  onStrokeStart?: () => void;
  onStrokeMove?: (x: number, y: number) => void;
  onStrokeEnd?: () => void;
  onZoomChange?: (scale: number) => void;
}

function BackgroundLayer({ mode }: { mode: BackgroundMode }) {
  const baseBg =
    mode === "light-grid" || mode === "white" ? "#e0e0e0" : "#1a1a1a";
  const altBg = mode === "light-grid" ? "#ffffff" : mode === "dark-grid" ? "#0d0d0d" : baseBg;
  const isSolid = mode === "white" || mode === "black";

  if (isSolid) {
    return (
      <View
        style={{
          position: "absolute",
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          backgroundColor: mode === "white" ? "#ffffff" : "#000000",
        }}
      />
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: baseBg,
      }}
    >
      {Array.from({ length: 16 }).map((_, row) =>
        Array.from({ length: 16 }).map((_, col) => {
          const isAlt = (row + col) % 2 === 1;
          return (
            <View
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                left: (col * CANVAS_SIZE) / 16,
                top: (row * CANVAS_SIZE) / 16,
                width: CANVAS_SIZE / 16 + 1,
                height: CANVAS_SIZE / 16 + 1,
                backgroundColor: isAlt ? altBg : "transparent",
              }}
            />
          );
        })
      )}
    </View>
  );
}

export function BrushCanvas({
  imageUri,
  brushRadius,
  brushMode,
  backgroundMode,
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
}: BrushCanvasProps) {
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZE);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const cursorX = useSharedValue(-100);
  const cursorY = useSharedValue(-100);
  const cursorOpacity = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const canvasTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const cursorStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: cursorX.value - brushRadius,
    top: cursorY.value - brushRadius,
    width: brushRadius * 2,
    height: brushRadius * 2,
    borderRadius: brushRadius,
    borderWidth: 2,
    borderColor: "rgba(0, 240, 255, 0.7)",
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    opacity: cursorOpacity.value,
    pointerEvents: "none" as const,
  }));

  const navigationPanGesture = Gesture.Pan()
    .onBegin(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    });

  const paintPanGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      cursorOpacity.value = withTiming(1, { duration: 100 });
      cursorX.value = e.absoluteX;
      cursorY.value = e.absoluteY;
      runOnJS(triggerHaptic)();
      if (onStrokeStart) runOnJS(onStrokeStart)();
    })
    .onUpdate((e) => {
      cursorX.value = e.absoluteX;
      cursorY.value = e.absoluteY;
      if (onStrokeMove) {
        runOnJS(onStrokeMove)(e.x, e.y);
      }
    })
    .onEnd(() => {
      cursorOpacity.value = withTiming(0, { duration: 200 });
      if (onStrokeEnd) runOnJS(onStrokeEnd)();
    })
    .onFinalize(() => {
      cursorOpacity.value = withTiming(0, { duration: 200 });
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1) scale.value = withTiming(1);
    });

  const panGesture = brushMode ? paintPanGesture : navigationPanGesture;
  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    <View
      className="flex-1 items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0c0d0e" }}
      onLayout={(e) => setCanvasSize(e.nativeEvent.layout.width)}
    >
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            {
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              alignItems: "center",
              justifyContent: "center",
            },
            canvasTransformStyle,
          ]}
        >
          <BackgroundLayer mode={backgroundMode} />
          <Image
            source={{ uri: imageUri }}
            style={{
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              position: "absolute",
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>

      {brushMode && (
        <Animated.View
          style={[
            cursorStyle,
            {
              shadowColor: "#00f0ff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        />
      )}
    </View>
  );
}

export type { BrushMode, BackgroundMode };
