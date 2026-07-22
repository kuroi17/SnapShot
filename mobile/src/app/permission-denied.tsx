import { View, Text, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Win95Window } from "../components/ui/Win95Window";
import { Button } from "../components/ui/Button";

export default function PermissionDeniedScreen() {
  const router = useRouter();

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-1 bg-darkCanvas items-center justify-center p-6">
      <Win95Window title="snapshot.exe - Permission Required" className="w-full max-w-sm">
        <View className="items-center py-6 px-2">
          <View className="w-14 h-14 rounded-sm win95-bevel-outset bg-win95Surface items-center justify-center mb-5">
            <Text className="text-2xl">�</Text>
          </View>

          <View className="win95-bevel-inset bg-win95Surface/80 px-4 py-3 w-full mb-4">
            <Text className="font-sans text-xs text-darkCanvas font-bold text-center leading-5">
              Permission Denied
            </Text>
          </View>

          <Text className="font-sans text-[11px] text-win95Shadow text-center leading-5 px-2 mb-4">
            SnapShot needs access to your screen and media library to capture
            and process images. These permissions are used solely on-device
            and no data leaves your device.
          </Text>

          <View className="w-full win95-bevel-inset bg-white px-3 py-2 mb-5">
            <Text className="font-sans text-[10px] text-darkCanvas leading-4">
              To enable:{"\n"}
              1. Open Settings{"\n"}
              2. Find SnapShot in your apps{"\n"}
              3. Enable required permissions
            </Text>
          </View>

          <View className="flex-row gap-3">
            <Button variant="win95" size="md" onPress={handleOpenSettings}>
              Open Settings
            </Button>
            <Button variant="ghost" size="md" onPress={handleGoBack}>
              Go Back
            </Button>
          </View>
        </View>

        <View className="border-t border-win95Shadow pt-1.5 px-1">
          <Text className="font-sans text-[9px] text-win95Shadow text-center">
            ERROR: Required permissions not granted
          </Text>
        </View>
      </Win95Window>
    </View>
  );
}
