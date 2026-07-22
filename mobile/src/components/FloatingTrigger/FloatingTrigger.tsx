import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Dimensions, View } from "react-native";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TRIGGER_SIZE = 56;
const EDGE_MARGIN = 12;

const SPRING_CONFIG = { stiffness: 200, damping: 20, mass: 0.5 };

export function FloatingTrigger() {
  const router = useRouter();

  const translateX = useSharedValue(SCREEN_WIDTH - TRIGGER_SIZE - EDGE_MARGIN);
  const translateY = useSharedValue(SCREEN_HEIGHT * 0.4);
  const scale = useSharedValue(1);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const snapToEdge = (x: number, y: number) => {
    const snapX =
      x + TRIGGER_SIZE / 2 < SCREEN_WIDTH / 2
        ? EDGE_MARGIN
        : SCREEN_WIDTH - TRIGGER_SIZE - EDGE_MARGIN;
    const clampedY = Math.max(
      EDGE_MARGIN,
      Math.min(y, SCREEN_HEIGHT - TRIGGER_SIZE - EDGE_MARGIN)
    );
    translateX.value = withSpring(snapX, SPRING_CONFIG);
    translateY.value = withSpring(clampedY, SPRING_CONFIG);
    runOnJS(triggerHaptic)();
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(0.9, SPRING_CONFIG);
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      translateX.value = event.absoluteX - TRIGGER_SIZE / 2;
      translateY.value = event.absoluteY - TRIGGER_SIZE / 2;
    })
    .onEnd((event) => {
      scale.value = withSpring(1, SPRING_CONFIG);
      snapToEdge(
        event.absoluteX - TRIGGER_SIZE / 2,
        event.absoluteY - TRIGGER_SIZE / 2
      );
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(triggerHaptic)();
      runOnJS(router.push)("/capture");
    });

  const composed = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        className="absolute z-50 items-center justify-center rounded-full"
        style={[
          {
            width: TRIGGER_SIZE,
            height: TRIGGER_SIZE,
            backgroundColor: "rgba(0, 240, 255, 0.15)",
            borderWidth: 2,
            borderColor: "rgba(0, 240, 255, 0.5)",
            shadowColor: "#00f0ff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
            elevation: 12,
          },
          animatedStyle,
        ]}
      >
        <SymbolView
          name={{
            ios: "camera.fill",
            android: "photo_camera",
            web: "photo_camera",
          }}
          tintColor="#00f0ff"
          size={26}
          fallback={
            <View className="items-center justify-center">
              <Animated.Text className="text-[26px]">📷</Animated.Text>
            </View>
          }
        />
      </Animated.View>
    </GestureDetector>
  );
}
