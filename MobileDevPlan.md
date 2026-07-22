# 📱 SnapShot Mobile App — Product & Development Plan

## 🎯 Product Vision

Build a mobile version of SnapShot that allows users to capture content from their mobile screens and quickly transform it into a clipboard-ready transparent PNG object.

The mobile experience follows the same core zero-friction philosophy as the Windows application:

> **See it → Capture it → Refine it → Copy & Paste it.**

---

## 🛠️ Finalized Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React Native + Expo (Prebuild / Custom Dev Client) |
| **Language** | TypeScript |
| **Styling** | NativeWind v4 (TailwindCSS for React Native) |
| **Local AI Inference** | ONNX Runtime Mobile (`onnxruntime-react-native`) |
| **Screen Capture** | `expo-media-library` + `react-native-view-shot` |
| **Clipboard** | `expo-clipboard` (transparent PNG copy) |
| **Navigation** | Expo Router v3 |
| **Animations** | Reanimated v3 + Gesture Handler v2 |

---

## 🧠 Core Output Philosophy (Same as Desktop)

After refining the cutout, the app copies the transparent PNG **directly to the mobile clipboard**. The user can paste it anywhere — messages, design apps, documents — no sharing UX required.

```text
Floating Trigger → Capture → AI Removal → Refine → Copy to Clipboard → Paste Anywhere
```

---

## 📱 Platform Integration Strategy

### 🤖 Android
* **Floating Overlay Bubble** using `SYSTEM_ALERT_WINDOW` permission
* Android `MediaProjection` API for screen region capture
* Native clipboard via `expo-clipboard`

### 🍎 iOS
* **Share Extension**: User shares any screenshot → selects SnapShot → refine → copy
* **Control Center Action** or **Back Tap** trigger for capture
* Native clipboard via `expo-clipboard`

---

## 🤖 Local AI Background Removal (100% On-Device)

* **Model**: Quantized `u2netp` (~4.7MB, shared with desktop)
* **Runtime**: ONNX Runtime Mobile (CoreML on iOS, NNAPI on Android)
* **Speed**: Sub-150ms inference on modern devices
* **Privacy**: Zero images leave the device

---

## 🎛️ Core Mobile MVP Features

1. **Floating Trigger** (Android) / **Share Extension** (iOS)
2. **Touch-Friendly Crop Selection Overlay**
3. **Local ONNX AI Background Removal**
4. **Refinement Modal**:
   - Threshold Slider
   - Restore Brush (with translucent guide)
   - Remove Brush
   - Ball Brush Cursor centered on fingertip
   - Background Toggles (Light Grid, Dark Grid, White, Black)
   - Undo / Redo
5. **Clipboard Copy** — paste the transparent PNG anywhere

---

## 📁 Repository Integration

```text
SnapShot/
├── desktop/
├── website/
├── mobile/                       # React Native + Expo App
│   ├── src/
│   │   ├── app/                  # Expo Router screens
│   │   ├── components/
│   │   │   ├── FloatingTrigger/
│   │   │   ├── CaptureOverlay/
│   │   │   └── RefinementModal/
│   │   ├── hooks/
│   │   │   ├── useONNXModel.ts
│   │   │   └── useCanvasBrush.ts
│   │   ├── services/
│   │   │   ├── backgroundRemovalService.ts
│   │   │   └── clipboardService.ts
│   │   └── utils/
│   ├── assets/
│   │   └── u2netp.onnx           # Shared AI model
│   ├── app.json
│   ├── package.json
│   └── README.md
├── .github/workflows/
└── README.md
```

---

## 🚀 Development Phases Summary

| Phase | Goal |
| :--- | :--- |
| **Phase 1** | React Native + Expo scaffold, NativeWind, shared design tokens |
| **Phase 2** | Retro Win95 mobile design system & UI primitives |
| **Phase 3** | Floating trigger (Android) / Share Extension (iOS) + Crop Overlay |
| **Phase 4** | Local ONNX AI inference engine integration |
| **Phase 5** | Touch-based Refinement Modal (brushes, threshold, undo/redo) |
| **Phase 6** | Clipboard output, polish, performance QA & Expo build |
