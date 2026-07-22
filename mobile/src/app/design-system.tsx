import { ScrollView, View, Text } from "react-native";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Win95Window } from "../components/ui/Win95Window";
import { Kbd } from "../components/ui/Kbd";

export default function DesignSystemScreen() {
  return (
    <ScrollView className="flex-1 bg-darkCanvas">
      <View className="px-4 py-12">
        <Text className="font-display text-3xl text-textMain tracking-tight mb-1">
          Design System
        </Text>
        <Text className="font-sans text-sm text-textMuted mb-8">
          SnapShot Mobile — Win95 Retro-Modern UI Primitives
        </Text>

        {/* Buttons */}
        <Text className="font-sans text-xs text-textMuted uppercase tracking-[0.15em] mb-3">
          Button — win95 variant
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          <Button variant="win95" size="sm" onPress={() => {}}>
            Small
          </Button>
          <Button variant="win95" size="md" onPress={() => {}}>
            Medium
          </Button>
          <Button variant="win95" size="lg" onPress={() => {}}>
            Large
          </Button>
        </View>

        <Text className="font-sans text-xs text-textMuted uppercase tracking-[0.15em] mb-3">
          Button — glow variant
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          <Button variant="glow" size="sm" onPress={() => {}}>
            Small
          </Button>
          <Button variant="glow" size="md" onPress={() => {}}>
            Medium
          </Button>
          <Button variant="glow" size="lg" onPress={() => {}}>
            Large
          </Button>
        </View>

        <Text className="font-sans text-xs text-textMuted uppercase tracking-[0.15em] mb-3">
          Button — ghost variant
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-10">
          <Button variant="ghost" size="sm" onPress={() => {}}>
            Small
          </Button>
          <Button variant="ghost" size="md" onPress={() => {}}>
            Medium
          </Button>
          <Button variant="ghost" size="lg" onPress={() => {}}>
            Large
          </Button>
        </View>

        <View className="h-px bg-white/5 mb-8" />

        {/* Badges */}
        <Text className="font-sans text-xs text-textMuted uppercase tracking-[0.15em] mb-3">
          Badge variants
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-10">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="cyan">Cyan</Badge>
          <Badge variant="win95">Win95</Badge>
          <Badge variant="outline">Outline</Badge>
        </View>

        <View className="h-px bg-white/5 mb-8" />

        {/* KBD */}
        <Text className="font-sans text-xs text-textMuted uppercase tracking-[0.15em] mb-3">
          Keyboard keycaps
        </Text>
        <View className="flex-row flex-wrap items-center gap-2 mb-10">
          <Kbd>Ctrl</Kbd>
          <Text className="text-textMuted text-xs">+</Text>
          <Kbd>Shift</Kbd>
          <Text className="text-textMuted text-xs">+</Text>
          <Kbd>S</Kbd>
        </View>

        <View className="h-px bg-white/5 mb-8" />

        {/* Win95 Window */}
        <Text className="font-sans text-xs text-textMuted uppercase tracking-[0.15em] mb-3">
          Win95Window
        </Text>
        <Win95Window title="snapshot.exe" icon="📷" className="mb-4">
          <View className="gap-3">
            <Text className="font-sans text-xs text-darkCanvas leading-relaxed">
              This is a classic Windows 95 frame adapted for mobile. The titlebar
              uses the signature navy-to-blue gradient.
            </Text>
            <View className="flex-row gap-2">
              <Button variant="win95" size="sm" onPress={() => {}}>
                OK
              </Button>
              <Button variant="win95" size="sm" onPress={() => {}}>
                Cancel
              </Button>
            </View>
          </View>
        </Win95Window>

        <Win95Window title="shortcuts" className="mb-4">
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-xs text-darkCanvas">Capture</Text>
              <View className="flex-row items-center gap-1">
                <Kbd>Win</Kbd>
                <Text className="text-darkCanvas text-xs">+</Text>
                <Kbd>Shift</Kbd>
                <Text className="text-darkCanvas text-xs">+</Text>
                <Kbd>S</Kbd>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-xs text-darkCanvas">Copy</Text>
              <View className="flex-row items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <Text className="text-darkCanvas text-xs">+</Text>
                <Kbd>C</Kbd>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-xs text-darkCanvas">Undo</Text>
              <View className="flex-row items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <Text className="text-darkCanvas text-xs">+</Text>
                <Kbd>Z</Kbd>
              </View>
            </View>
          </View>
        </Win95Window>
      </View>
    </ScrollView>
  );
}
