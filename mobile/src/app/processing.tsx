import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useONNXModel } from "../hooks/useONNXModel";
import { removeBackground } from "../services/backgroundRemovalService";
import { Button } from "../components/ui/Button";
import { Win95Window } from "../components/ui/Win95Window";

const PROGRESS_STEPS = [
  "Loading AI model...",
  "Preprocessing image...",
  "Running AI inference...",
  "Generating alpha mask...",
  "Compositing transparent image...",
  "Finalizing...",
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { imageUri: uriParam } = useLocalSearchParams<{
    imageUri: string;
  }>();
  const imageUri = uriParam ?? "";

  const { runInference, isReady } = useONNXModel("u2netp.onnx");

  const [stepIndex, setStepIndex] = useState(0);
  const [progressText, setProgressText] = useState("Initializing...");
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progressWidth = useSharedValue(0);
  const indeterminateOffset = useSharedValue(-200);

  useEffect(() => {
    indeterminateOffset.value = withRepeat(
      withTiming(400, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indeterminateOffset.value }],
  }));

  const advanceStep = useCallback((index: number) => {
    setStepIndex(index);
    setProgressText(PROGRESS_STEPS[index] ?? "Processing...");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function process() {
      try {
        if (!imageUri) {
          setError("No image provided");
          return;
        }

        while (!isReady) {
          await new Promise((r) => setTimeout(r, 100));
          if (cancelled) return;
        }

        advanceStep(1);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        advanceStep(2);
        const uri = await removeBackground({ imageUri, runInference });

        if (cancelled) return;
        setResultUri(uri);
        advanceStep(5);

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Processing failed";
          setError(msg);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
        }
      }
    }

    process();

    return () => {
      cancelled = true;
    };
  }, [imageUri, isReady, runInference, advanceStep]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDone = useCallback(() => {
    if (resultUri) {
      router.replace({
        pathname: "/refine",
        params: { imageUri: resultUri },
      });
    }
  }, [resultUri, router]);

  return (
    <View className="flex-1 bg-darkCanvas items-center justify-center p-6">
      <Win95Window title="AI Background Removal" className="w-full max-w-sm">
        <View className="items-center py-6">
          <Text className="font-sans text-xs text-darkCanvas mb-6 text-center leading-5">
            {error ?? progressText}
          </Text>

          <View className="w-full h-5 win95-bevel-inset bg-white overflow-hidden">
            {resultUri ? (
              <Animated.View
                className="absolute h-full bg-accentBlue"
                style={[
                  { width: "100%" as any },
                ]}
              />
            ) : error ? (
              <Animated.View
                className="absolute h-full bg-red-500"
                style={[
                  { width: "100%" as any },
                ]}
              />
            ) : (
              <Animated.View
                className="absolute h-full w-[200] bg-accentBlue"
                style={barStyle}
              />
            )}
          </View>

          <View className="flex-row justify-between w-full mt-1.5">
            {PROGRESS_STEPS.map((_, i) => (
              <View
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i <= stepIndex ? "bg-accentBlue" : "bg-win95Shadow"
                }`}
              />
            ))}
          </View>
        </View>

        <View className="flex-row justify-center gap-3 pt-2 border-t border-win95Shadow">
          {error ? (
            <Button variant="ghost" size="sm" onPress={handleCancel}>
              Close
            </Button>
          ) : resultUri ? (
            <Button variant="win95" size="sm" onPress={handleDone}>
              Done
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onPress={handleCancel}>
              Cancel
            </Button>
          )}
        </View>
      </Win95Window>
    </View>
  );
}
