import { useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useWindowDimensions, View, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useService } from "../../services/ServiceContext";
import { isNativeOverlayActive } from "../../services/nativeFloatingService";

const TRIGGER_SIZE = 56;
const EDGE_MARGIN = 12;
const SPRING_CONFIG = { stiffness: 200, damping: 20, mass: 0.5 };

export function FloatingTrigger() {
  const { serviceActive } = useService();
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const translateX = useSharedValue(screenWidth - TRIGGER_SIZE - EDGE_MARGIN);
  const translateY = useSharedValue(screenHeight * 0.4);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withSpring(screenWidth - TRIGGER_SIZE - EDGE_MARGIN, SPRING_CONFIG);
    translateY.value = withSpring(Math.min(translateY.value, screenHeight - TRIGGER_SIZE - EDGE_MARGIN), SPRING_CONFIG);
  }, [screenWidth, screenHeight]);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics unavailable on web
    }
  };

  const snapToEdge = (x: number, y: number) => {
    const snapX =
      x + TRIGGER_SIZE / 2 < screenWidth / 2
        ? EDGE_MARGIN
        : screenWidth - TRIGGER_SIZE - EDGE_MARGIN;
    const clampedY = Math.max(
      EDGE_MARGIN,
      Math.min(y, screenHeight - TRIGGER_SIZE - EDGE_MARGIN)
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

  // When running on native Android with system overlay, the OS Foreground Service
  // already renders the true floating camera bubble on top of all apps.
  if (!serviceActive || isNativeOverlayActive()) return null;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 9999,
            width: TRIGGER_SIZE,
            height: TRIGGER_SIZE,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
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
        <View className="items-center justify-center">
          <Text style={{ fontSize: 24, color: "#00f0ff" }}>📷</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
