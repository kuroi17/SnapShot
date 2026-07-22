import { useCallback, useState, useRef, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { copyTransparentPNG } from "../../services/clipboardService";
import { useToast } from "../../services/ToastContext";
import { cn } from "../../utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CopyState = "idle" | "copying" | "success" | "error";

interface CopyButtonProps {
  imageUri: string;
}

const STATE_LABELS: Record<CopyState, string> = {
  idle: "Copy to Clipboard",
  copying: "Copying...",
  success: "Copied!",
  error: "Failed — Tap to Retry",
};

export function CopyButton({ imageUri }: CopyButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const glowIntensity = useSharedValue(0);
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: "#00f0ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowIntensity.value * 0.8,
    shadowRadius: 8 + glowIntensity.value * 12,
    elevation: Math.round(glowIntensity.value * 12),
    borderColor: `rgba(0, 240, 255, ${0.3 + glowIntensity.value * 0.7})` as any,
    borderWidth: 2,
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const flashGlow = useCallback(() => {
    glowIntensity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0.6, { duration: 400 }),
      withTiming(0, { duration: 300 })
    );
  }, []);

  const handlePress = useCallback(async () => {
    if (copyState === "copying") return;

    setCopyState("copying");
    scale.value = withSpring(0.96, { stiffness: 300, damping: 20 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await copyTransparentPNG(imageUri);
      setCopyState("success");
      checkmarkScale.value = withSpring(1, { stiffness: 200, damping: 15 });
      flashGlow();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Transparent PNG copied to clipboard!", "success");
      scale.value = withSpring(1, { stiffness: 300, damping: 20 });

      resetTimerRef.current = setTimeout(() => {
        setCopyState("idle");
        checkmarkScale.value = withTiming(0, { duration: 200 });
      }, 1800);
    } catch {
      setCopyState("error");
      flashGlow();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Failed to copy to clipboard", "error");
      scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    }
  }, [imageUri, copyState]);

  const isSuccess = copyState === "success";

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={copyState === "copying"}
      className={cn(
        "flex-row items-center justify-center h-[52] rounded-sm bg-darkCard overflow-hidden",
        copyState === "error" && "bg-darkCard border-2 border-red-500/50"
      )}
      style={[scaleStyle, glowStyle]}
    >
      <View className="flex-row items-center justify-center gap-2.5 px-7">
        <Animated.View style={checkmarkStyle}>
          <View
            className={cn(
              "w-6 h-6 rounded-sm items-center justify-center",
              isSuccess
                ? "win95-bevel-outset bg-accentCyan"
                : "win95-bevel-outset bg-accentCyan"
            )}
          >
            <Text className="text-darkCanvas text-xs font-bold">
              {isSuccess ? "\u2713" : "\u{1F4F7}"}
            </Text>
          </View>
        </Animated.View>

        <Text
          className={cn(
            "font-sans text-sm font-bold tracking-tight",
            isSuccess
              ? "text-accentCyan"
              : copyState === "error"
              ? "text-red-400"
              : "text-accentCyan"
          )}
        >
          {STATE_LABELS[copyState]}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
