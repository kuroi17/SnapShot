# 📋 Phase 6 — Clipboard Output, Polish, Performance QA & Expo Build

## 🎯 Goal

Wire up the final clipboard copy action, performance-harden all components, and produce a working Expo development build that can be installed on a real Android/iOS device.

---

## 💡 Skills — MAXIMIZE ALL OF THESE

> ⚠️ **INSTRUCTION**: Before writing any code, read and apply the following global skills in full:
> - **`security-audit`**: Verify that clipboard access, screen capture, and file system permissions are handled safely. Ensure no image data is written outside the app's cache directory.
> - **`tdd`**: Write an integration test for the full pipeline: `captureRegion → removeBackground → copyToClipboard`. Verify transparent PNG binary is correctly placed in clipboard.
> - **`react-expert`**: Ensure all hooks clean up after unmount. ONNX session is released on app background. No memory leaks in brush canvas.
> - **`ui-ux-pro-max`**: Polish all edge-case states: loading skeletons, empty states, error banners, permission denied screens. Every state must have a designed UI, not a raw error string.

---

## 📋 Files to Build

### `src/services/clipboardService.ts`
```typescript
// Writes transparent PNG to mobile clipboard
// Uses expo-clipboard writePNGToClipboard
export async function copyTransparentPNG(imageUri: string): Promise<void>;
```

### `src/components/RefinementModal/CopyButton.tsx`
- Primary action button: **"Copy to Clipboard"**
- Win95 glow variant with a camera flash icon
- Tap → copies transparent PNG → shows success checkmark toast
- Success animation: Win95 window frame flashes `#00f0ff` cyan glow → fades out

### `src/components/ui/Toast.tsx`
- Brief non-blocking status notification from bottom of screen
- Variants: `success` (cyan), `error` (red bevel)
- Auto-dismisses after 2500ms using Reanimated `withTiming`

### Error & Permission Screens
- `src/app/permission-denied.tsx`: Friendly screen shown when OS permission is denied, with instructions to enable in Settings
- `src/app/error.tsx`: Unexpected error screen with Win95 "ERROR" modal style and retry button

---

## ⚙️ Performance Checklist

- [ ] Brush stroke latency < 16ms (no JS thread blocking)
- [ ] ONNX inference completes in < 500ms on mid-range device (Snapdragon 695 / A15)
- [ ] App launches from cold start in < 2 seconds
- [ ] No memory leaks: ONNX session released on `AppState` background
- [ ] Expo Hermes engine enabled for 20% faster JS execution

---

## 🏗️ Expo Build Configuration (`app.json`)

```json
{
  "expo": {
    "name": "SnapShot",
    "slug": "snapshot",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "snapshot",
    "icon": "./assets/snapshot_icon.png",
    "splash": { "backgroundColor": "#0c0d0e" },
    "android": {
      "package": "com.kuroi17.snapshot",
      "permissions": ["SYSTEM_ALERT_WINDOW", "READ_EXTERNAL_STORAGE"]
    },
    "ios": {
      "bundleIdentifier": "com.kuroi17.snapshot",
      "infoPlist": { "NSPhotoLibraryUsageDescription": "SnapShot captures screen regions." }
    }
  }
}
```

---

## ✅ General Instructions

1. Implement `clipboardService.ts` using `expo-clipboard`.
2. Build `CopyButton.tsx` with success toast and cyan glow animation.
3. Build `Toast.tsx` reusable component.
4. Build `permission-denied.tsx` and `error.tsx` error screens.
5. Run full pipeline integration test.
6. Run `npx expo run:android` and `npx expo run:ios` on real device / emulator.
7. Verify cold-start time, ONNX inference latency, and memory usage.

---

## ✅ Phase 6 Definition of Done

- `copyTransparentPNG(uri)` writes transparent PNG to mobile clipboard successfully.
- User taps "Copy to Clipboard" → sees cyan glow success animation → can paste in any app.
- All error/permission states have designed UI screens.
- App runs cleanly on Android emulator & iOS simulator with 0 warnings.
- Full pipeline works end-to-end: `Trigger → Capture → AI Removal → Refine → Copy → Paste`.
