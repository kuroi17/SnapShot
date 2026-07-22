# ⚡ Phase 3 — Interactive Components & Dynamic Features

## 🎯 Goal

Build all major landing page sections, the dynamic GitHub Releases API integration hook (`useGitHubRelease`), the interactive Before/After image comparison slider, and the keyboard shortcuts guide.

---

## 💡 Skills Applied

* **`ui-ux-pro-max`**: Implement high-touch interactive components (Before/After comparison slider, live release card).
* **`react-expert`**: Build custom React hooks with error boundaries, loading skeletons, and memory cleanup.
* **`shadcn-ui` / `shadcn`**: Use accessible primitives for modal dialogues and tooltips where appropriate.

---

## 🧩 Component Architecture

```text
src/components/
├── layout/
│   ├── Navbar.jsx              # Navigation with logo, GitHub star counter, and quick download
│   └── Footer.jsx              # Retro Win95 taskbar footer with live clock & copyright
└── sections/
    ├── HeroSection.jsx         # Headline, retro camera icon animation, and CTA buttons
    ├── DownloadCard.jsx        # Dynamic GitHub Release API card (v1.0.0, download URL, size)
    ├── ComparisonSlider.jsx    # Interactive Before/After image cutout comparison slider
    ├── FeaturesGrid.jsx        # 100% Local AI, ONNX speed, zero-cloud privacy features
    └── ShortcutsSection.jsx    # Interactive keyboard shortcut cheat sheet (Ctrl+Shift+S, Ctrl+C)
```

---

## 🔌 Dynamic GitHub API Integration Hook (`useGitHubRelease.js`)

```javascript
import { useState, useEffect } from 'react';

export function useGitHubRelease() {
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLatestRelease() {
      try {
        const res = await fetch('https://api.github.com/repos/kuroi17/SnapShot/releases/latest');
        if (!res.ok) throw new Error('Release not found');
        const data = await res.json();

        const exeAsset = data.assets?.find(a => a.name.endsWith('.exe')) || data.assets?.[0];

        setRelease({
          version: data.tag_name || 'v1.0.0',
          title: data.name || 'SnapShot Release',
          publishedAt: new Date(data.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          downloadUrl: exeAsset ? exeAsset.browser_download_url : 'https://github.com/kuroi17/SnapShot/releases',
          fileSize: exeAsset ? (exeAsset.size / (1024 * 1024)).toFixed(1) + ' MB' : '158 MB',
          notes: data.body || '',
        });
      } catch (err) {
        setError(true);
        // Fallback default state so site never breaks
        setRelease({
          version: 'v1.0.0',
          downloadUrl: 'https://github.com/kuroi17/SnapShot/releases',
          fileSize: '158 MB',
          publishedAt: 'July 2026',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLatestRelease();
  }, []);

  return { release, loading, error };
}
```

---

## 📋 General Instructions & Tasks

1. **Build `HeroSection.jsx`**:
   * Displays retro pixel-art camera logo (`src/Assets/snapshot_icon.png`).
   * Bold headline: *"One keystroke from screen selection to transparent PNG."*
   * Primary CTA: **Download SnapShot.exe** + Secondary CTA: **View on GitHub**.
2. **Build `DownloadCard.jsx`**:
   * Uses `useGitHubRelease()` hook.
   * Displays Win95-styled window container with version badge (`v1.0.0`), published date, file size, direct download button, and release notes expandable modal.
3. **Build `ComparisonSlider.jsx`**:
   * Interactive drag handle comparing raw screenshot (`Visualization.jpg`) vs background-removed transparent PNG cutout.
4. **Build `ShortcutsSection.jsx`**:
   * Visual keyboard hotkey cards:
     * `Ctrl + Shift + S` (Global Screen Capture)
     * `Ctrl + C` (Instant Copy Cutout & Close)
     * `Ctrl + Left-Click Drag` (Figma Canvas Panning)
     * `Ctrl + Z / Y` (Undo / Redo)

---

## ✅ Phase 3 Definition of Done

* All 5 sections rendered and interactive.
* GitHub API fetches live data and falls back gracefully on network failure.
* Before/After comparison slider responds to drag and touch events smoothly.
