import {
  cacheDirectory,
  readAsStringAsync,
  writeAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { decode as decodeJPEG } from "jpeg-js";
import { fromByteArray, toByteArray } from "base64-js";
import { encodePNG } from "./pngEncoder";

async function readImagePixels(imageUri: string): Promise<{
  pixels: Uint8Array;
  width: number;
  height: number;
}> {
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 320, height: 320 } }],
    { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
  );

  const base64 = await readAsStringAsync(resized.uri, {
    encoding: EncodingType.Base64,
  });
  const raw = toByteArray(base64);
  const decoded = decodeJPEG(raw, true);

  return {
    pixels: new Uint8Array(
      decoded.data.buffer,
      decoded.data.byteOffset,
      decoded.data.byteLength
    ),
    width: decoded.width,
    height: decoded.height,
  };
}

function preprocessToTensor(
  pixels: Uint8Array,
  width: number,
  height: number
): Float32Array {
  const tensor = new Float32Array(1 * 3 * 320 * 320);
  const mean: [number, number, number] = [0.485, 0.456, 0.406];
  const std: [number, number, number] = [0.229, 0.224, 0.225];

  for (let y = 0; y < 320; y++) {
    for (let x = 0; x < 320; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * 320 + x;
      const r = pixels[srcIdx] / 255;
      const g = pixels[srcIdx + 1] / 255;
      const b = pixels[srcIdx + 2] / 255;
      tensor[dstIdx] = (r - mean[0]) / std[0];
      tensor[1 * 320 * 320 + dstIdx] = (g - mean[1]) / std[1];
      tensor[2 * 320 * 320 + dstIdx] = (b - mean[2]) / std[2];
    }
  }

  return tensor;
}

function resizeAlphaMask(
  alpha: Float32Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Float32Array {
  const result = new Float32Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = Math.min(Math.floor(dx * xRatio), srcW - 1);
      const sy = Math.min(Math.floor(dy * yRatio), srcH - 1);
      result[dy * dstW + dx] = alpha[sy * srcW + sx];
    }
  }

  return result;
}

async function createTransparentPNG(
  imagePixels: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  alphaMask: Float32Array
): Promise<string> {
  const alpha = resizeAlphaMask(alphaMask, 320, 320, imageWidth, imageHeight);

  const rgba = new Uint8Array(imageWidth * imageHeight * 4);
  for (let i = 0; i < imageWidth * imageHeight; i++) {
    const srcOff = i * 4;
    const alphaVal = Math.round(
      Math.max(0, Math.min(1, alpha[i])) * 255
    );
    rgba[srcOff] = imagePixels[srcOff];
    rgba[srcOff + 1] = imagePixels[srcOff + 1];
    rgba[srcOff + 2] = imagePixels[srcOff + 2];
    rgba[srcOff + 3] = alphaVal;
  }

  const pngData = encodePNG(rgba, imageWidth, imageHeight);
  const base64 = fromByteArray(pngData);

  const outputPath = `${cacheDirectory}snapshot_${Date.now()}.png`;
  await writeAsStringAsync(outputPath, base64, {
    encoding: EncodingType.Base64,
  });

  return outputPath;
}

export interface BackgroundRemovalInput {
  imageUri: string;
  runInference: (
    tensor: Float32Array,
    shape: number[]
  ) => Promise<Float32Array>;
}

export async function removeBackground(
  input: BackgroundRemovalInput
): Promise<string> {
  const { imageUri, runInference } = input;

  const { pixels, width, height } = await readImagePixels(imageUri);
  const inputTensor = preprocessToTensor(pixels, width, height);

  const outputData = await runInference(inputTensor, [1, 3, 320, 320]);

  const resultUri = await createTransparentPNG(
    pixels,
    width,
    height,
    outputData
  );

  return resultUri;
}
