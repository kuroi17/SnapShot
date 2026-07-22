# 🎨 Phase 2 — Design System & Retro-Modern Windows 95 Styling

## 🎯 Goal

Establish the visual token system, typography, and retro-modern Windows 95 aesthetic ("Retro Win95 Classic meets Modern Minimalist").

---

## 💡 Skills Applied

* **`design-taste-frontend`**: Create a distinct, memorable visual identity combining classic 3D beveled borders with ultra-sleek dark mode glassmorphism.
* **`minimalist-ui`**: Ensure high typography legibility, balanced spacing, and clutter-free layout hierarchy.
* **`frontend-design`**: Establish responsive breakpoints (mobile, tablet, desktop, ultra-wide) and grid geometry.

---

## 🎨 Visual Design Token Architecture

### 1. Color Palette

```css
:root {
  /* Dark Canvas */
  --bg-main: #0c0d0e;
  --bg-card: #141517;
  --bg-card-hover: #1c1d20;

  /* Windows 95 Classic Bevel Tokens */
  --win95-bg: #d4d0c8;
  --win95-light: #ffffff;
  --win95-shadow: #808080;
  --win95-dark-shadow: #404040;

  /* Brand Accents */
  --accent-blue: #0078d7;
  --accent-cyan: #00f0ff;
  --accent-green: #28a745;

  /* Typography */
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
}
```

### 2. Retro 3D Bevel Utilities (`index.css`)

```css
.win95-bevel-outset {
  border-top: 2px solid var(--win95-light);
  border-left: 2px solid var(--win95-light);
  border-right: 2px solid var(--win95-dark-shadow);
  border-bottom: 2px solid var(--win95-dark-shadow);
  background-color: var(--win95-bg);
}

.win95-bevel-inset {
  border-top: 2px solid var(--win95-dark-shadow);
  border-left: 2px solid var(--win95-dark-shadow);
  border-right: 2px solid var(--win95-light);
  border-bottom: 2px solid var(--win95-light);
}

.win95-window-header {
  background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
  color: white;
  font-family: 'MS Sans Serif', 'Tahoma', sans-serif;
  font-weight: bold;
}
```

### 3. Typography & Google Fonts (`index.html`)

* **Primary Font**: `Inter` or `Outfit` (clean modern sans-serif)
* **Code & Hotkeys Font**: `JetBrains Mono` / `Consolas`
* **Retro Accent Font**: `MS Sans Serif` / `Pixelify Sans`

---

## 📋 General Instructions & Tasks

1. Update `website/src/index.css` with CSS variables, keyframe animations, and custom scrollbars.
2. Build reusable UI Primitives in `website/src/components/ui/`:
   * `Button.jsx` (Retro Win95 3D button variant + Modern Glow variant)
   * `Badge.jsx` (Status indicator badges)
   * `Card.jsx` (Win95 window frame with titlebar and minimize/maximize/close buttons)
   * `Tooltip.jsx` (Keyboard shortcut tooltip)
3. Ensure 100% responsive testing across mobile (<640px), tablet (768px), and desktop (>1024px).

---

## ✅ Phase 2 Definition of Done

* Design system tokens and utility classes active in `index.css`.
* UI Primitives built and responsive on all viewport sizes.
