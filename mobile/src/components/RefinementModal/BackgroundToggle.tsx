import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "../../utils/cn";
import type { BackgroundMode } from "./BrushCanvas";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ToggleOption = {
  mode: BackgroundMode;
  label: string;
  icon: string;
};

const OPTIONS: ToggleOption[] = [
  { mode: "light-grid", label: "LG", icon: "▦" },
  { mode: "dark-grid", label: "DG", icon: "▧" },
  { mode: "white", label: "W", icon: "▢" },
  { mode: "black", label: "B", icon: "■" },
];

interface BackgroundToggleProps {
  value: BackgroundMode;
  onChange: (mode: BackgroundMode) => void;
}

function ToggleIcon({
  option,
  active,
  onPress,
}: {
  option: ToggleOption;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.92, { stiffness: 300, damping: 20 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 20 });
      }}
      onPress={onPress}
      style={animStyle}
      className={cn(
        "w-10 h-10 items-center justify-center",
        active ? "win95-bevel-inset bg-win95Shadow/20" : "win95-bevel-outset bg-win95Surface"
      )}
    >
      <Text className="text-[16px]">{option.icon}</Text>
    </AnimatedPressable>
  );
}

export function BackgroundToggle({ value, onChange }: BackgroundToggleProps) {
  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center gap-2">
        <Text className="font-sans text-[11px] text-darkCanvas font-bold mr-1">
          Background:
        </Text>
        {OPTIONS.map((opt) => (
          <ToggleIcon
            key={opt.mode}
            option={opt}
            active={value === opt.mode}
            onPress={() => onChange(opt.mode)}
          />
        ))}
      </View>
    </View>
  );
}
