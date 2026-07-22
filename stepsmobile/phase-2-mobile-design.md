# 🎨 Phase 2 — Retro Win95 Mobile Design System & UI Primitives

## 🎯 Goal

Build the complete mobile design system with shared Win95 retro-modern visual tokens and reusable mobile UI primitives (`Button`, `Win95Window`, `Badge`, `Tooltip`).

---

## 💡 Skills — MAXIMIZE ALL OF THESE

> ⚠️ **INSTRUCTION**: Before writing any code, read and apply the following global skills in full:
> - **`design-taste-frontend`**: Zero generic look. Use curated Win95 bevel colors, dark canvas, and cyan glow accents. WOW factor on first render.
> - **`minimalist-ui`**: Every screen must feel clean, spacious, and high-contrast. Remove visual clutter.
> - **`ui-ux-pro-max`**: Native-feel touch targets (min 44pt), smooth Reanimated micro-animations, and accessible typography.
> - **`frontend-design`**: Mobile-first layout, safe area insets, proper keyboardAvoidingView.

---

## 📋 UI Primitives to Build (`src/components/ui/`)

### `Button.tsx`
Three variants matching the web design system:
- **`win95`**: 3D bevel outset border, `#d4d0c8` surface, Win95 push-down animation on press
- **`glow`**: Dark background + cyan/blue glow shadow (`#00f0ff`)
- **`ghost`**: Transparent with muted border

### `Badge.tsx`
Status pill variants:
- `default`, `success`, `cyan`, `win95`, `outline`

### `Win95Window.tsx`
Classic Windows 95 frame adapted for mobile:
- Titlebar: `linear-gradient(#000080, #1084d0)` with white title text and icon slot
- 3D bevel outset border on the window frame
- `_` `口` `✕` retro control button row (cosmetic on mobile)

### `Kbd.tsx`
Keyboard key rendering component (Win95 inset styling) used for hotkey display in Shortcuts screen.

---

## 🎨 NativeWind Utility Classes to Configure (`global.css`)

```css
/* Win95 Bevel Utilities */
.win95-bevel-outset {
  border-top-width: 2;
  border-left-width: 2;
  border-right-width: 2;
  border-bottom-width: 2;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  border-right-color: #404040;
  border-bottom-color: #404040;
}

/* Keyframe animation: fade-in-up */
/* Keyframe animation: glow-pulse */
/* Use Reanimated v3 for all animations */
```

---

## ✅ General Instructions

1. Create all UI primitives in `src/components/ui/`.
2. Use `Animated` from `react-native-reanimated` for press animations on `Button`.
3. Apply `withSpring` and `withTiming` for micro-interactions.
4. Test all components in a `src/app/design-system.tsx` showcase screen.
5. Ensure all touch targets are at least 44×44pt for accessibility.

---

## ✅ Phase 2 Definition of Done

- All UI primitives built and rendering correctly.
- Win95 design tokens applied consistently.
- Design system showcase screen verifies all components at multiple sizes.
