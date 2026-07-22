import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../utils/cn";

export type ToastVariant = "success" | "error";

interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-darkCard border-accentCyan",
  error: "bg-darkCard border-red-500",
};

const variantGlow: Record<ToastVariant, string> = {
  success: "#00f0ff",
  error: "#ef4444",
};

const iconMap: Record<ToastVariant, string> = {
  success: "\u2713",
  error: "\u2715",
};

export function Toast({ visible, message, variant = "success" }: ToastProps) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 200 });
      opacity.value = withSpring(1, { damping: 14, stiffness: 200 });
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    } else {
      translateY.value = withTiming(80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 40,
          left: 20,
          right: 20,
          zIndex: 9999,
        },
      ]}
    >
      <View
        className={cn(
          "flex-row items-center gap-2.5 px-4 py-3 rounded-sm border",
          variantStyles[variant]
        )}
        style={{
          shadowColor: variantGlow[variant],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View
          className={cn(
            "w-6 h-6 rounded-sm items-center justify-center",
            variant === "success"
              ? "win95-bevel-outset bg-accentCyan"
              : "win95-bevel-outset bg-red-500"
          )}
        >
          <Text className="text-darkCanvas text-xs font-bold">
            {iconMap[variant]}
          </Text>
        </View>
        <Text className="font-sans text-sm text-win95Light font-medium flex-1">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
