# 🖌️ Phase 5 — Touch-Based Refinement Modal

## 🎯 Goal

Build the full touch-based Refinement Modal where users can fine-tune the AI cutout using their fingers. This is the heart of the SnapShot mobile experience.

The refinement experience must match the quality and fluency of the desktop version but fully adapted for mobile touch input.

---

## 💡 Skills — MAXIMIZE ALL OF THESE

> ⚠️ **INSTRUCTION**: Before writing any code, read and apply the following global skills in full:
> - **`ui-ux-pro-max`**: The canvas must respond at 60fps. Use Reanimated v3 `runOnJS` bridges, not JS-thread setState during stroke rendering. Brush cursor must center on fingertip with zero jitter.
> - **`react-expert`**: Manage the undo/redo history stack via `useReducer`. Never mutate pixel arrays directly — always work on immutable copies.
> - **`design-taste-frontend`**: The refinement modal must look as polished and premium as the desktop Win95 refinement window. Win95Window frame around the canvas. Retro-styled controls.
> - **`minimalist-ui`**: Collapse non-essential controls. Only show what the user needs at each step. Bottom sheet for brush controls.

---

## 📋 Refinement Modal Layout

```text
┌─────────────────────────────────┐
│ SnapShot          _ 口 ✕        │  ← Win95 titlebar
├─────────────────────────────────┤
│                                 │
│       [Transparent Cutout]      │  ← Pinch zoom + pan canvas
│                                 │
├─────────────────────────────────┤
│ Background:  🏁  🏴  ⬜  ⬛     │  ← Background toggle row
├─────────────────────────────────┤
│ Threshold ──────●──── 0.50      │  ← Slider
│                                 │
│  [Restore Brush] [Remove Brush] │  ← Brush mode toggle
│                                 │
│  ● Size: 24px  [-]  [+]        │
│                                 │
│  [↩ Undo]  [↪ Redo]           │
├─────────────────────────────────┤
│        [ Copy to Clipboard ]    │  ← Primary action
└─────────────────────────────────┘
```

---

## 📋 Files to Build

### `src/components/RefinementModal/RefinementModal.tsx`
Main modal screen. Orchestrates all sub-components.

### `src/components/RefinementModal/BrushCanvas.tsx`
- Full-screen canvas using `react-native-skia` or `react-native-canvas`
- `PanGestureHandler` for brush strokes
- `PinchGestureHandler` + `PanGestureHandler` for zoom/pan (when not in brush mode)
- Ball brush cursor (translucent cyan ring) centered on touch point using `Reanimated v3`

### `src/components/RefinementModal/ThresholdSlider.tsx`
- Win95 horizontal slider rail
- Drag handle with `PanGestureHandler`
- Real-time alpha mask update (debounced 150ms)

### `src/components/RefinementModal/BrushControls.tsx`
- Restore / Remove brush toggle buttons
- Brush size `-` / `+` step buttons + display label
- Brush size range: 5px–120px (touch-optimized, larger than desktop)

### `src/components/RefinementModal/BackgroundToggle.tsx`
- Floating row of 4 icon buttons: Light Grid, Dark Grid, White, Black

### `src/hooks/useCanvasBrush.ts`
```typescript
// Manages brush state, stroke pixel manipulation, undo/redo history stack
export function useCanvasBrush(transparentImageUri: string): {
  applyStroke: (x: number, y: number, mode: 'restore' | 'remove', radius: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentImageUri: string;
};
```

---

## ✅ General Instructions

1. Build `RefinementModal.tsx` as a full-screen modal navigated from the processing screen.
2. Build `BrushCanvas.tsx` with `PanGestureHandler` for painting and simultaneous `PinchGestureHandler` for zoom.
3. Implement `useCanvasBrush` hook with an immutable undo/redo history stack (max 30 steps).
4. Wire threshold slider to update alpha mask in real-time (debounced).
5. Implement background toggle to switch checkerboard/solid backgrounds behind the transparent canvas.
6. Ball brush cursor must follow the touch point using `useAnimatedStyle` — never lag behind.

---

## ✅ Phase 5 Definition of Done

- User can paint Restore/Remove brush strokes smoothly at 60fps.
- Undo/Redo history stack works correctly for brush strokes.
- Threshold slider updates the alpha mask without freezing the UI.
- Background toggle changes the canvas background instantly.
- Ball brush cursor stays perfectly centered on the user's fingertip.
