import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCanvasBrush } from "../../hooks/useCanvasBrush";
import { Win95Window } from "../ui/Win95Window";
import { Button } from "../ui/Button";
import { BrushCanvas } from "./BrushCanvas";
import { ThresholdSlider } from "./ThresholdSlider";
import { BrushControls } from "./BrushControls";
import { BackgroundToggle } from "./BackgroundToggle";
import { CopyButton } from "./CopyButton";
import type { BrushMode, BackgroundMode } from "./BrushCanvas";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RefinementModalProps {
  imageUri: string;
}

function Win95TitleBar({ title }: { title: string }) {
  return (
    <View className="flex-row items-center justify-between px-0">
      <Text className="font-sans text-xs text-darkCanvas font-bold">
        {title}
      </Text>
      <View className="flex-row items-center gap-0.5">
        <TitleBarButton label="_" disabled />
        <TitleBarButton label="□" disabled />
        <TitleBarButton label="✕" />
      </View>
    </View>
  );
}

function TitleBarButton({
  label,
  disabled,
}: {
  label: string;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.9, { stiffness: 300, damping: 20 });
        if (!disabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 20 });
      }}
      style={animStyle}
      disabled={disabled}
      className={cn(
        "w-[18] h-[14] items-center justify-center",
        disabled ? "opacity-50" : "win95-bevel-outset bg-win95Surface"
      )}
    >
      <Text className="text-[9px] font-bold text-darkCanvas leading-none">
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function RefinementModal({
  imageUri,
}: RefinementModalProps) {
  const router = useRouter();
  const {
    applyStroke,
    commitStroke,
    undo,
    redo,
    canUndo,
    canRedo,
    currentImageUri,
  } = useCanvasBrush(imageUri);

  const [brushMode, setBrushMode] = useState<BrushMode>("restore");
  const [brushSize, setBrushSize] = useState(24);
  const [backgroundMode, setBackgroundMode] =
    useState<BackgroundMode>("light-grid");
  const [threshold, setThreshold] = useState(0.5);

  const handleStrokeMove = useCallback(
    (x: number, y: number) => {
      applyStroke(x, y, brushMode ?? "restore", brushSize);
    },
    [applyStroke, brushMode, brushSize]
  );

  const handleStrokeEnd = useCallback(() => {
    commitStroke();
  }, [commitStroke]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <BlurView intensity={80} tint="dark" className="flex-1">
      <View className="flex-1 px-2 py-4">
        <Win95Window title="snapshot.exe — Refine" className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 2 }}
          >
            <Win95TitleBar title="Refine Cutout" />

            <View className="h-[320] overflow-hidden rounded-sm border border-win95Shadow">
              <BrushCanvas
                imageUri={currentImageUri}
                brushRadius={brushSize}
                brushMode={brushMode}
                backgroundMode={backgroundMode}
                onStrokeMove={handleStrokeMove}
                onStrokeEnd={handleStrokeEnd}
              />
            </View>

            <View className="border-t border-win95Shadow pt-1 mt-1">
              <BackgroundToggle
                value={backgroundMode}
                onChange={setBackgroundMode}
              />
            </View>

            <View className="border-t border-win95Shadow pt-1">
              <ThresholdSlider
                value={threshold}
                onChange={setThreshold}
              />
            </View>

            <View className="border-t border-win95Shadow pt-1">
              <BrushControls
                brushMode={brushMode}
                brushSize={brushSize}
                onBrushModeChange={setBrushMode}
                onBrushSizeChange={setBrushSize}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
              />
            </View>

            <View className="px-4 pt-3 pb-2">
              <CopyButton imageUri={currentImageUri} />
            </View>

            <View className="px-4 pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onPress={handleClose}
              >
                Close
              </Button>
            </View>
          </ScrollView>
        </Win95Window>
      </View>
    </BlurView>
  );
}
