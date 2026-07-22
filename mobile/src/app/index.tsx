import { View, Text } from "react-native";

export default function IndexScreen() {
  return (
    <View className="flex-1 bg-darkCanvas items-center justify-center px-6">
      <Text className="font-display text-4xl text-textMain tracking-tight">
        SnapShot
      </Text>
      <Text className="font-sans text-base text-textMuted mt-2">
        See it → Capture it → Copy it.
      </Text>
    </View>
  );
}
