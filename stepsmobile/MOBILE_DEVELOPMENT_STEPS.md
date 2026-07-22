# 📱 SnapShot Mobile App — Master Execution Steps

This document details the step-by-step phases for building the official **SnapShot Mobile App** in `mobile/` inside the monorepo.

---

## 📌 Master Plan Overview

| Item | Details |
| :--- | :--- |
| **Framework** | React Native + Expo (Prebuild / Custom Dev Client) |
| **Language** | TypeScript |
| **Styling** | NativeWind v4 (TailwindCSS for React Native) |
| **Local AI** | ONNX Runtime Mobile (`onnxruntime-react-native`) |
| **Clipboard** | `expo-clipboard` (transparent PNG) |
| **Animations** | Reanimated v3 + Gesture Handler v2 |
| **Navigation** | Expo Router v3 |
| **Platforms** | Android (Floating Overlay) + iOS (Share Extension) |
| **Design Philosophy** | *Retro Windows 95 Classic meets Modern Minimalist* |

---

## 🛠️ Global Skills Integration Strategy

Every phase MUST strictly incorporate and maximize the following global skills:

| Skill | Application |
| :--- | :--- |
| **`react-expert`** | Modern RN functional architecture, custom hooks, TypeScript, zero memory leaks |
| **`design-taste-frontend`** | Win95 bevel tokens, curated color palette, zero generic look |
| **`minimalist-ui`** | Clean mobile layouts, touch-friendly spacing, clutter-free screens |
| **`ui-ux-pro-max`** | Native-feel micro-animations, gesture interactions, accessible touch targets |
| **`frontend-design`** | Responsive scaling for small/large phone screens and tablets |
| **`tdd`** | Test critical services (ONNX, clipboard, brush) before wiring to UI |
| **`security-audit`** | Ensure OS permissions (screen capture, clipboard) are handled safely |
| **`improve-codebase-architecture`** | Keep services abstracted from UI for future model swap |

---

## 📑 Execution Phases

| Phase | File | Goal |
| :--- | :--- | :--- |
| **Phase 1** | [`phase-1-mobile-init.md`](./phase-1-mobile-init.md) | Expo scaffold, NativeWind, design tokens |
| **Phase 2** | [`phase-2-mobile-design.md`](./phase-2-mobile-design.md) | Win95 retro mobile design system & UI primitives |
| **Phase 3** | [`phase-3-mobile-capture.md`](./phase-3-mobile-capture.md) | Floating trigger, crop overlay, screen capture |
| **Phase 4** | [`phase-4-mobile-ai.md`](./phase-4-mobile-ai.md) | Local ONNX AI background removal integration |
| **Phase 5** | [`phase-5-mobile-refinement.md`](./phase-5-mobile-refinement.md) | Touch refinement modal, brushes, undo/redo |
| **Phase 6** | [`phase-6-mobile-output-qa.md`](./phase-6-mobile-output-qa.md) | Clipboard output, Expo build & QA |
