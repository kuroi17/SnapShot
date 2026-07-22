# 📱 Phase 1 — React Native + Expo Scaffold & Project Foundation

## 🎯 Goal

Initialize the `mobile/` React Native + Expo application inside the SnapShot monorepo. Set up NativeWind v4, shared design tokens, and the project directory structure so all future phases have a clean, consistent base.

---

## 💡 Skills — MAXIMIZE ALL OF THESE

> ⚠️ **INSTRUCTION**: Before writing any code, read and apply the following global skills in full:
> - **`react-expert`**: Follow modern React Native functional architecture and strict TypeScript patterns.
> - **`improve-codebase-architecture`**: Establish a clean, abstracted service/component/hook separation from day one.

---

## 📋 Tech Stack for This Phase

| Item | Package |
| :--- | :--- |
| Scaffold | `npx create-expo-app mobile --template expo-template-blank-typescript` |
| Styling | `nativewind@^4`, `tailwindcss` |
| Utility | `clsx`, `tailwind-merge` |
| Fonts | `expo-font`, `@expo-google-fonts/inter`, `@expo-google-fonts/outfit` |
| Navigation | `expo-router@^3` |
| Animations | `react-native-reanimated@^3`, `react-native-gesture-handler@^2` |

---

## 📁 Directory Structure to Establish

```text
mobile/
├── src/
│   ├── app/                        # Expo Router screens
│   │   └── index.tsx               # Entry screen
│   ├── components/
│   │   ├── layout/
│   │   └── ui/                     # Shared reusable primitives
│   ├── hooks/                      # Custom React hooks
│   ├── services/                   # AI, clipboard, capture abstractions
│   ├── utils/
│   │   └── cn.ts                   # clsx + tailwind-merge utility
│   └── constants/
│       └── colors.ts               # Shared Win95 retro color tokens
├── assets/
│   └── u2netp.onnx                 # Quantized AI model
├── app.json
├── tailwind.config.js
├── babel.config.js
└── package.json
```

---

## 🎨 Design Tokens to Configure (`constants/colors.ts` & `tailwind.config.js`)

```typescript
export const colors = {
  // Dark canvas
  darkCanvas:   '#0c0d0e',
  darkCard:     '#141517',
  // Win95 bevel
  win95Surface: '#d4d0c8',
  win95Light:   '#ffffff',
  win95Shadow:  '#808080',
  win95Dark:    '#404040',
  // Accents
  accentBlue:   '#0078d7',
  accentCyan:   '#00f0ff',
  accentGreen:  '#28a745',
  // Text
  textMain:     '#f3f4f6',
  textMuted:    '#9ca3af',
};
```

---

## ✅ General Instructions

1. Run `npx create-expo-app@latest mobile --template blank-typescript` in the workspace root.
2. Install all dependencies listed above.
3. Configure NativeWind v4 in `babel.config.js` and `tailwind.config.js`.
4. Configure Expo Router in `app.json` (`"scheme": "snapshot"`, `"web.bundler": "metro"`).
5. Load fonts (`Inter`, `Outfit`, `JetBrains Mono`) via `expo-font` in root layout.
6. Create `src/utils/cn.ts` utility.
7. Create `src/constants/colors.ts` with all design tokens.
8. Verify clean boot: `npx expo start` runs without errors.

---

## ✅ Phase 1 Definition of Done

- `npx expo start` boots cleanly on Android & iOS simulators.
- NativeWind `className` styling works on a test `<View>`.
- Fonts loaded correctly.
- Directory structure established.
