import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "../../utils/cn";
import type { BrushMode } from "./BrushCanvas";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BrushControlsProps {
  brushMode: BrushMode;
  brushSize: number;
  onBrushModeChange: (mode: BrushMode) => void;
  onBrushSizeChange: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

function ToggleButton({
  label,
  active,
  onPress,
  className,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  className?: string;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.95, { stiffness: 300, damping: 20 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 20 });
      }}
      onPress={onPress}
      style={animStyle}
      className={cn(
        "flex-1 py-2 px-3 items-center justify-center min-h-[36]",
        active
          ? "win95-bevel-inset bg-win95Shadow/30"
          : "win95-bevel-outset bg-win95Surface",
        className
      )}
    >
      <Text
        className={cn(
          "font-sans text-[11px] font-bold",
          active ? "text-darkCanvas" : "text-win95Dark"
        )}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export function BrushControls({
  brushMode,
  brushSize,
  onBrushModeChange,
  onBrushSizeChange,
  minSize = 5,
  maxSize = 120,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: BrushControlsProps) {
  return (
    <View className="px-4 py-2 gap-3">
      <View className="flex-row gap-1">
        <ToggleButton
          label="Restore"
          active={brushMode === "restore"}
          onPress={() =>
            onBrushModeChange(brushMode === "restore" ? null : "restore")
          }
        />
        <ToggleButton
          label="Remove"
          active={brushMode === "remove"}
          onPress={() =>
            onBrushModeChange(brushMode === "remove" ? null : "remove")
          }
        />
        <View className="w-3" />
        <ToggleButton
          label="Undo"
          active={false}
          onPress={onUndo}
          className={!canUndo ? "opacity-40" : ""}
        />
        <ToggleButton
          label="Redo"
          active={false}
          onPress={onRedo}
          className={!canRedo ? "opacity-40" : ""}
        />
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="font-sans text-[11px] text-darkCanvas font-bold w-14">
          Size: {brushSize}px
        </Text>

        <View className="flex-row gap-1">
          <ToggleButton
            label="-"
            active={false}
            onPress={() => {
              const next = Math.max(minSize, brushSize - 5);
              if (next !== brushSize) onBrushSizeChange(next);
            }}
            className="w-10"
          />
          <ToggleButton
            label="+"
            active={false}
            onPress={() => {
              const next = Math.min(maxSize, brushSize + 5);
              if (next !== brushSize) onBrushSizeChange(next);
            }}
            className="w-10"
          />
        </View>

        <View className="flex-1 items-end">
          <View
            className="win95-bevel-inset bg-white items-center justify-center"
            style={{ width: 28, height: 28 }}
          >
            <View
              style={{
                width: Math.max(4, Math.min(24, brushSize / 5)),
                height: Math.max(4, Math.min(24, brushSize / 5)),
                borderRadius: Math.max(2, brushSize / 10),
                backgroundColor: brushMode === "remove" ? "#ff4444" : "#00f0ff",
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
