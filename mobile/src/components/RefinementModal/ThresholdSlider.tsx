import { View, Text, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");
const SLIDER_W = SCREEN_W - 64;
const HANDLE_W = 16;
const TRACK_H = 6;

interface ThresholdSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
}

export function ThresholdSlider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  label = "Threshold",
}: ThresholdSliderProps) {
  const range = max - min;
  const fraction = (value - min) / range;
  const trackLeft = useSharedValue(fraction * (SLIDER_W - HANDLE_W));
  const startX = useSharedValue(0);

  const updateValue = (v: number) => {
    const clamped = Math.max(min, Math.min(max, v));
    const rounded = Math.round(clamped / step) * step;
    onChange(rounded);
  };

  const dragGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = trackLeft.value;
    })
    .onUpdate((e) => {
      const newLeft = Math.max(
        0,
        Math.min(SLIDER_W - HANDLE_W, startX.value + e.translationX)
      );
      trackLeft.value = newLeft;
    })
    .onEnd(() => {
      const frac = trackLeft.value / (SLIDER_W - HANDLE_W);
      const val = min + frac * range;
      const rounded = Math.round(val / step) * step;
      runOnJS(updateValue)(rounded);
    });

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackLeft.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: trackLeft.value + HANDLE_W / 2,
  }));

  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-sans text-xs text-darkCanvas font-bold">
          {label}
        </Text>
        <Text className="font-mono text-[11px] text-darkCanvas bg-win95Light/60 px-1.5 rounded-sm">
          {value.toFixed(2)}
        </Text>
      </View>

      <View
        style={{
          width: SLIDER_W,
          height: TRACK_H,
          borderRadius: 1,
          backgroundColor: "#ffffff",
          borderWidth: 2,
          borderColor: "#808080",
          borderRightColor: "#ffffff",
          borderBottomColor: "#ffffff",
          position: "relative",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              height: TRACK_H - 4,
              backgroundColor: "#000080",
              borderRadius: 1,
            },
            fillStyle,
          ]}
        />

        <GestureDetector gesture={dragGesture}>
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                top: -5,
                width: HANDLE_W,
                height: TRACK_H + 10,
                alignItems: "center",
                justifyContent: "center",
              },
              handleStyle,
            ]}
          >
            <View
              className="win95-bevel-outset"
              style={{
                width: HANDLE_W,
                height: TRACK_H + 10,
                backgroundColor: "#d4d0c8",
                borderRadius: 1,
              }}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      <View className="flex-row justify-between mt-1">
        <Text className="font-mono text-[9px] text-win95Shadow">
          {min.toFixed(2)}
        </Text>
        <Text className="font-mono text-[9px] text-win95Shadow">
          {max.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
