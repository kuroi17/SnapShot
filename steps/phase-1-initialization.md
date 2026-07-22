# 🛠️ Phase 1 — Project Initialization & Monorepo Setup

## 🎯 Goal

Initialize the `website/` frontend application in the existing monorepo (`kuroi17/SnapShot`) using **Vite + React + TailwindCSS**, while establishing project scripts and developer tooling.

---

## 💡 Skills Applied

* **`react-expert`**: Configure Vite + React project structure, ESLint/Prettier rules, and clean directory layout.
* **`vercel-react-best-practices`**: Setup project configuration for seamless Vercel deployment.

---

## 📋 General Instructions & Tasks

1. **Initialize Vite React Application**:
   ```powershell
   # In workspace root (c:\Users\HP LAPTOP 15s\SnapShot)
   npx -y create-vite website --template react
   ```
2. **Install Core & Styling Dependencies**:
   * `tailwindcss`, `@tailwindcss/vite` (or `postcss`, `autoprefixer`)
   * `lucide-react` (icons)
   * `framer-motion` (smooth micro-animations)
   * `clsx`, `tailwind-merge` (utility styling)
3. **Setup TailwindCSS Configuration**:
   * Configure custom color tokens:
     * Dark Canvas: `#121214`
     * Dark Card: `#18181B`
     * Win95 Bevel Light: `#FFFFFF`
     * Win95 Bevel Dark: `#808080`
     * Win95 Surface: `#D4D0C8`
     * Windows Blue Accent: `#0078D7`
     * Retro Cyan Glow: `#00F0FF`
4. **Establish Workspace Directory Structure**:
   ```text
   website/
   ├── public/
   │   ├── favicon.ico
   │   └── og-image.png
   ├── src/
   │   ├── assets/
   │   ├── components/
   │   │   ├── layout/
   │   │   ├── ui/
   │   │   └── sections/
   │   ├── hooks/
   │   ├── utils/
   │   ├── App.jsx
   │   └── index.css
   ├── index.html
   ├── package.json
   └── vite.config.js
   ```

---

## ✅ Phase 1 Definition of Done

* `website/` initializes and runs cleanly with `npm run dev`.
* TailwindCSS is loaded and verified with custom color tokens.
* Build test (`npm run build`) outputs clean bundle in `website/dist/`.
