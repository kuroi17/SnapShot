# 🚀 SnapShot Website Polish & Dual-Release Automation Plan

This document details the step-by-step execution plan to update CI/CD release workflows, publish the `mobile-v1.0.0` release tag, refactor the website API release hook, and streamline the website layout.

---

## 📌 Architectural Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    SnapShot Monorepo                        │
│                                                             │
│   desktop/              mobile/              website/       │
└───────┬────────────────────┬────────────────────┬───────────┘
        │                    │                    │
        ▼                    ▼                    ▼
desktop-v1.0.0         mobile-v1.0.0        Website API Hook
        │                    │             (Fetches /releases)
        ▼                    ▼                    │
GitHub Desktop Release  GitHub Mobile Release ─────┘
  (SnapShot.exe)          (Release Asset)
```

---

## 🛠️ Global Frontend Skills Integration Strategy

The agent executing this plan MUST strictly incorporate and maximize the following global skills:

| Skill | Application |
| :--- | :--- |
| **`design-taste-frontend`** | Ensure the dual-tab Win95 Installation window matches Attached Image 2 with authentic 3D bevels, titlebar gradients, and zero generic look. |
| **`minimalist-ui`** | Remove all duplicate/redundant download buttons, consolidated to 1 key CTA in Hero and single direct downloads in the Installation tabs. |
| **`ui-ux-pro-max`** | Smooth tab transitions between Desktop and Mobile in the Installation window, and clean handle dragging in the Comparison Slider. |
| **`react-expert`** | Refactor `useGitHubRelease.js` hook to fetch `/releases` array, filtering for `desktop-` and `mobile-` tags with clean error boundaries and fallback data. |
| **`web-design-guidelines`** | Maintain 100% mobile responsiveness, fast FCP, and semantic HTML structure. |

---

## 📑 Execution Phases

---

### ⚙️ Phase 1 — CI/CD Pipeline Update (`.github/workflows/release.yml`)

Update `.github/workflows/release.yml` to support prefix-based tags for both Desktop and Mobile:

1. **Trigger Configuration**:
   ```yaml
   on:
     push:
       tags:
         - 'desktop-v*'
         - 'mobile-v*'
         - 'v*'
     workflow_dispatch:
   ```
2. **Job Definition**:
   - Configure conditional workflow steps so that:
     - When tag matches `desktop-v*` or `v*`: Restores, publishes `desktop/src/SnapShot.csproj` into `SnapShot.exe`, and creates a GitHub Release named `SnapShot Desktop ${{ github.ref_name }}` attaching `SnapShot.exe`.
     - When tag matches `mobile-v*`: Creates a GitHub Release named `SnapShot Mobile ${{ github.ref_name }}` with mobile release notes and assets.

---

### 🏷️ Phase 2 — Publish Mobile Release Tag (`mobile-v1.0.0`)

Push the official `mobile-v1.0.0` release tag to trigger the new CI/CD workflow:

1. Prepare release notes for `mobile-v1.0.0`:
   - 📱 **SnapShot Mobile v1.0.0** — React Native + Expo App
   - 🤖 **100% Local On-Device AI Background Removal** (ONNX Runtime Mobile, <150ms inference)
   - 🎛️ **Touch-Optimized Refinement Canvas** (Skia drawing, pinch-zoom, Restore/Remove brushes)
   - 📋 **Direct Clipboard Output & Native Share Sheet**
   - 🔔 **Win95 Success Toasts & Exception Screens**
2. Run Git commands:
   ```powershell
   git tag -a mobile-v1.0.0 -m "SnapShot Mobile v1.0.0 Release"
   git push origin mobile-v1.0.0
   ```

---

### 🔌 Phase 3 — Web API Release Hook Refactor (`useGitHubRelease.js`)

Refactor `website/src/hooks/useGitHubRelease.js` to fetch `/releases` and return separate metadata for both Desktop and Mobile:

1. **Endpoint**: `https://api.github.com/repos/kuroi17/SnapShot/releases`
2. **Filtering Logic**:
   - `desktopRelease`: Find release where `tag_name` starts with `desktop-v` (or fallback to legacy `v1.0.0` / `1.0.0`). Extract version tag, published date, size, and `.exe` download URL.
   - `mobileRelease`: Find release where `tag_name` starts with `mobile-v`. Extract version tag, published date, size, and download URL.
3. **Return State**: `{ desktopRelease, mobileRelease, loading, error }` with fallback defaults if offline.

---

### 🎨 Phase 4 — Website Layout Streamlining & Section Refactor

Restructure `website/src/App.jsx` and section components into the exact sequence:

#### 1. **Hero Section (`HeroSection.jsx`)**
- Clean minimal header with retro camera logo (`snapshot_icon.png`), headline, and single CTA button navigating to the Installation section.
- **Remove all duplicate buttons**.

#### 2. **Comparison Slider (`ComparisonSlider.jsx`)**
- Use `RawCapture.png` for raw screenshot (left) and `AICutout.png` for background-removed cutout (right).
- Header: `"Raw capture vs AI cutout"`.

#### 3. **Key Features & Keyboard Shortcuts Combined (`FeaturesAndShortcuts.jsx`)**
- Pair features directly with their corresponding hotkeys inside Win95 retro window cards:
  - 🚀 **Global Screen Capture**: `Ctrl + Shift + S`
  - ⚡ **Instant Copy & Close**: `Ctrl + C`
  - ↩️ **Undo / Redo Edit History**: `Ctrl + Z` / `Ctrl + Y`
  - 🔍 **Figma-Style Canvas Pan**: `Ctrl + Left-Click Drag`
  - 🧠 **100% Local AI Background Removal**: Powered by `u2netp` ONNX (<100ms inference)

#### 4. **Installation Section (`InstallationSection.jsx` - Dual-Tab Win95 Window)**
- A Win95 window container matching Attached Image 2 with two interactive tabs:
  - **Tab 1 — Desktop**: Displays `desktopRelease` version badge, published date, file size (158.3 MB), platform (Windows x64), direct `.exe` download button, and expandable release notes.
  - **Tab 2 — Mobile**: Displays `mobileRelease` version badge (`mobile-v1.0.0`), published date, file size, platform (Android / iOS), direct download link to release assets, and mobile instructions.

#### 5. **Contributing Section (`ContributingSection.jsx`)**
- Open-source GitHub repository card at the bottom with star count link.

#### 6. **Footer (`Footer.jsx`)**
- Retro Win95 Taskbar style footer with live clock and copyright.

---

### 🧪 Phase 5 — Build Verification & Final QA

1. Run production build in `website/`:
   ```powershell
   cd website
   npm run build
   ```
2. Verify 0 lint warnings, 0 compile errors, clean component rendering, and responsive layout across mobile and desktop viewports.
