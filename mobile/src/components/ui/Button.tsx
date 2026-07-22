import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "win95" | "glow" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  onPress?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  win95: "bg-win95Surface rounded-none",
  glow: "bg-darkCard border-2 border-accentCyan/40 rounded-sm",
  ghost: "bg-transparent border border-win95Shadow rounded-sm",
};

const variantInner: Record<ButtonVariant, string> = {
  win95: "win95-bevel-outset",
  glow: "",
  ghost: "",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[44] min-w-[44] px-3",
  md: "min-h-[44] min-w-[44] px-5",
  lg: "min-h-[52] min-w-[52] px-7",
};

const textStyles: Record<ButtonVariant, string> = {
  win95: "text-darkCanvas font-bold",
  glow: "text-accentCyan font-bold",
  ghost: "text-textMain font-medium",
};

const sizeText: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Button({ variant = "win95", size = "md", children, className, onPress }: ButtonProps) {
  const scale = useSharedValue(1);
  const bevelPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { stiffness: 300, damping: 20 });
    bevelPressed.value = withSpring(1, { stiffness: 300, damping: 20 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    bevelPressed.value = withSpring(0, { stiffness: 300, damping: 20 });
  };

  const win95BevelStyle = useAnimatedStyle(() => {
    if (variant !== "win95") return {};
    return {
      borderTopColor: bevelPressed.value === 1 ? "#404040" : ("#ffffff" as any),
      borderLeftColor: bevelPressed.value === 1 ? "#404040" : ("#ffffff" as any),
      borderRightColor: bevelPressed.value === 1 ? "#ffffff" : ("#404040" as any),
      borderBottomColor: bevelPressed.value === 1 ? "#ffffff" : ("#404040" as any),
    };
  });

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className={cn("items-center justify-center", variantStyles[variant], className)}
      style={[
        animatedStyle,
        variant === "glow" && {
          shadowColor: "#00f0ff",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 8,
        },
      ]}
    >
      <Animated.View
        className={cn(
          "flex-1 w-full items-center justify-center",
          sizeStyles[size],
          variantInner[variant]
        )}
        style={win95BevelStyle}
      >
        <Text className={cn("font-sans tracking-tight", textStyles[variant], sizeText[size])}>
          {children}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}
