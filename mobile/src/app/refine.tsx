import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { RefinementModal } from "../components/RefinementModal/RefinementModal";
import { ToastProvider } from "../services/ToastContext";

export default function RefineScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  if (!imageUri) return null;

  return (
    <ToastProvider>
      <RefinementModal imageUri={imageUri} />
    </ToastProvider>
  );
}
