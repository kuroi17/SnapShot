# 📸 Phase 3 — Floating Trigger, Crop Overlay & Screen Capture

## 🎯 Goal

Implement the platform-specific entry point trigger and screen capture workflow:
- **Android**: Floating Overlay Bubble (drawn over any app)
- **iOS**: Share Extension (triggered from native Share Sheet)

After triggering, the user sees a touch-friendly rectangular crop marquee to select the screen region they want to extract.

---

## 💡 Skills — MAXIMIZE ALL OF THESE

> ⚠️ **INSTRUCTION**: Before writing any code, read and apply the following global skills in full:
> - **`ui-ux-pro-max`**: The crop overlay must feel native and silky smooth. Gesture-based drag handles, animated marquee corners, real-time size display.
> - **`react-expert`**: Use `react-native-gesture-handler` `PanGestureHandler` for all drag interactions. Use `useAnimatedStyle` with `Reanimated v3` for zero-JS-thread overlay rendering.
> - **`security-audit`**: Handle OS permissions (SYSTEM_ALERT_WINDOW, MediaProjection, Photos) gracefully with clear user explanations. Never silently fail on permission denial.

---

## 📋 Components to Build

### `src/components/FloatingTrigger/` (Android Only)
- Small movable SnapShot pixel-art camera icon rendered above all other apps
- Animated spring-based snap-to-edge behavior when released
- Single tap → opens `CaptureOverlay`
- Uses Android `SYSTEM_ALERT_WINDOW` permission (Expo Native Module / bare workflow)

### `src/components/CaptureOverlay/`
- Full-screen semi-transparent overlay (RGBA `rgba(0,0,0,0.55)`)
- Touch-draggable rectangular selection marquee with:
  - Corner drag handles (8 handles, each 44pt touch target)
  - Live width × height display label
  - Animated dashed Win95-style selection border
- `[ Capture ]` and `[ Cancel ]` action buttons
- On confirm: captures the selected region using `react-native-view-shot` or `expo-media-library`

### `src/services/screenCaptureService.ts`
Abstract service:
```typescript
interface ScreenCaptureService {
  requestPermission(): Promise<boolean>;
  captureRegion(region: CaptureRegion): Promise<ImageURI>;
}
```

### iOS Share Extension (`ios/ShareExtension/`)
- Native Swift share extension that receives shared images/screenshots
- Launches SnapShot refinement flow with the shared image URI
- Configured via `app.json` Expo plugin

---

## ✅ General Instructions

1. Create `src/components/FloatingTrigger/` with Reanimated v3 spring-snap behavior.
2. Create `src/components/CaptureOverlay/` with 8-handle drag-resize and animated marquee border.
3. Create `src/services/screenCaptureService.ts` abstraction.
4. Add Android `SYSTEM_ALERT_WINDOW` permission in `app.json`.
5. Create iOS Share Extension stub (detailed implementation in Expo prebuild config).
6. Test crop overlay dragging smoothly on both platforms.

---

## ✅ Phase 3 Definition of Done

- Android: Floating trigger visible over other apps. Tap opens crop overlay.
- iOS: Share Extension appears in native share sheet.
- Crop overlay responds to drag handles. Confirm captures the region as a URI.
