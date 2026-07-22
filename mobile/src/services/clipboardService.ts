import * as Clipboard from "expo-clipboard";
import { cacheDirectory, readAsStringAsync, EncodingType } from "expo-file-system/legacy";

export async function copyTransparentPNG(imageUri: string): Promise<void> {
  if (!imageUri) {
    throw new Error("copyTransparentPNG: imageUri is required");
  }

  if (imageUri.startsWith("file://") || imageUri.startsWith("/")) {
    const base64 = await readAsStringAsync(imageUri, {
      encoding: EncodingType.Base64,
    });
    const dataUri = `data:image/png;base64,${base64}`;
    await Clipboard.setImageAsync(dataUri);
    return;
  }

  await Clipboard.setImageAsync(imageUri);
}
