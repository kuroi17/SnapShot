# 🤖 Phase 4 — Local ONNX AI Background Removal Integration

## 🎯 Goal

Integrate the quantized `u2netp` ONNX model to run 100% local on-device AI background removal. The captured image region goes in; a transparent PNG object comes out. No server calls. No cloud. Zero privacy risk.

---

## 💡 Skills — MAXIMIZE ALL OF THESE

> ⚠️ **INSTRUCTION**: Before writing any code, read and apply the following global skills in full:
> - **`react-expert`**: Build the ONNX hook (`useONNXModel`) using `useRef` for session persistence. Run inference off the JS thread via native module.
> - **`tdd`**: Write a standalone test for `backgroundRemovalService.ts` before wiring to any UI. Verify output alpha channel is correct on sample images.
> - **`improve-codebase-architecture`**: Keep the AI engine 100% abstracted. The UI must only call `removeBackground(imageUri)` and get back a transparent PNG URI. Future model swaps must not touch components.

---

## 📋 AI Integration Architecture

```text
CaptureOverlay (imageUri)
        ↓
backgroundRemovalService.removeBackground(imageUri)
        ↓
useONNXModel hook → onnxruntime-react-native session
        ↓
u2netp inference (CoreML on iOS / NNAPI on Android)
        ↓
Alpha mask generation → composite transparent PNG
        ↓
Return: transparentImageUri
```

---

## 📦 Dependencies to Install

```bash
npm install onnxruntime-react-native
npx expo prebuild  # Required for native modules
```

---

## 📋 Files to Build

### `src/hooks/useONNXModel.ts`
```typescript
// Loads and manages the ONNX session lifecycle
// Returns: { runInference, isReady, error }
export function useONNXModel(modelAssetPath: string): {
  runInference: (inputTensor: Float32Array, shape: number[]) => Promise<Float32Array>;
  isReady: boolean;
  error: string | null;
};
```

### `src/services/backgroundRemovalService.ts`
```typescript
// Full pipeline: image URI → preprocessed tensor → ONNX inference → alpha mask → transparent PNG
// Input:  imageUri (local file URI)
// Output: transparentPngUri (local file URI)
export async function removeBackground(imageUri: string): Promise<string>;
```

### `src/app/processing.tsx`
- Loading screen shown during AI inference
- Win95 progress indicator animation
- Cancel button

---

## ✅ General Instructions

1. Copy `desktop/src/Assets/u2netp.onnx` to `mobile/assets/u2netp.onnx`.
2. Install `onnxruntime-react-native` and configure in `app.json` plugins.
3. Run `npx expo prebuild` to generate native Android/iOS projects.
4. Implement `useONNXModel.ts` with session creation on app mount and cleanup on unmount.
5. Implement `backgroundRemovalService.ts`:
   - Decode image → resize to 320×320 → normalize to `[0,1]` float32
   - Run ONNX inference → get alpha mask output
   - Composite alpha mask over original image → save transparent PNG to cache
6. Build `processing.tsx` screen with Win95-style animated progress bar.
7. Write unit test for the service using a sample PNG fixture.

---

## ✅ Phase 4 Definition of Done

- `backgroundRemovalService.removeBackground(uri)` returns a valid transparent PNG URI.
- ONNX session loads correctly on both Android (NNAPI) and iOS (CoreML).
- Unit test for service passes.
- Processing screen displays and dismisses correctly.
