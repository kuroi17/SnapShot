import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Win95Window } from "../components/ui/Win95Window";
import { Button } from "../components/ui/Button";

export default function ErrorScreen() {
  const router = useRouter();
  const { message } = useLocalSearchParams<{ message?: string }>();

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissAll();
  };

  return (
    <View className="flex-1 bg-darkCanvas items-center justify-center p-6">
      <Win95Window title="snapshot.exe - ERROR" className="w-full max-w-sm">
        <View className="items-center py-6 px-2">
          <View className="w-14 h-14 rounded-sm win95-bevel-outset bg-win95Surface items-center justify-center mb-5">
            <View className="w-10 h-10 rounded-full bg-red-500 items-center justify-center">
              <Text className="text-white text-xl font-bold">!</Text>
            </View>
          </View>

          <View className="win95-bevel-inset bg-red-100 px-4 py-3 w-full mb-4">
            <Text className="font-sans text-xs text-darkCanvas font-bold text-center leading-5">
              An unexpected error occurred
            </Text>
          </View>

          <Text className="font-sans text-[11px] text-win95Shadow text-center leading-5 px-2 mb-5">
            {message ?? "Something went wrong. Please try again."}
          </Text>

          <View className="flex-row gap-3">
            <Button variant="win95" size="md" onPress={handleRetry}>
              Retry
            </Button>
            <Button variant="ghost" size="md" onPress={handleClose}>
              Close
            </Button>
          </View>
        </View>

        <View className="border-t border-win95Shadow pt-1.5 px-1">
          <Text className="font-sans text-[9px] text-win95Shadow text-center">
                    ERR 0x1: Application encountered a critical fault
          </Text>
        </View>
      </Win95Window>
    </View>
  );
}
