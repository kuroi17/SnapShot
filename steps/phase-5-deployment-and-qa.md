# 🚀 Phase 5 — Vercel Deployment, SEO & Quality Assurance

## 🎯 Goal

Deploy `website/` to Vercel, setup automatic GitHub deployment, configure SEO meta tags, and test Open Graph social media cards.

---

## 💡 Skills Applied

* **`vercel-react-best-practices`**: Configure Vercel build settings (`Root Directory: website`, `Build Command: npm run build`, `Output Directory: dist`).
* **`web-design-guidelines`**: SEO Optimization, Open Graph protocol (`og:image`, `og:title`, `og:description`), Twitter Card metadata, and Web Accessibility (a11y).
* **`security-audit`**: Sanitize input, prevent XSS, and ensure CORS security on external GitHub API calls.

---

## 📋 Open Graph & SEO Tags (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>SnapShot — Local AI Screen-to-Object Capture Tool for Windows</title>
    <meta name="title" content="SnapShot — Local AI Screen-to-Object Capture Tool for Windows" />
    <meta name="description" content="Select anything on your screen, remove its background 100% locally with AI (<100ms), refine the cutout, and copy transparent PNG directly to clipboard. Zero cloud uploads." />

    <!-- Open Graph / Facebook / Discord -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://snapshot-app.vercel.app/" />
    <meta property="og:title" content="SnapShot — Local AI Screen-to-Object Capture Tool" />
    <meta property="og:description" content="One keystroke from screen selection to transparent PNG on your clipboard. 100% local AI background removal." />
    <meta property="og:image" content="https://snapshot-app.vercel.app/og-image.png" />

    <!-- Twitter Card -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="SnapShot — Local AI Screen-to-Object Capture Tool" />
    <meta property="twitter:description" content="One keystroke from screen selection to transparent PNG on your clipboard." />
    <meta property="twitter:image" content="https://snapshot-app.vercel.app/og-image.png" />
  </head>
  <body class="bg-[#0c0d0e] text-gray-100 antialiased selection:bg-[#0078d7] selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## ⚙️ Vercel Deployment Steps

1. **Connect Vercel to `kuroi17/SnapShot` Repository**:
   * Root Directory: `website`
   * Framework Preset: `Vite`
   * Build Command: `npm run build`
   * Output Directory: `dist`
2. **Automatic Deployments**:
   * Every commit pushed to `main` triggers a production deployment on Vercel automatically.

---

## ✅ Phase 5 Definition of Done

* Site is live on Vercel at `snapshot.vercel.app`.
* Open Graph card previews display correctly when link is pasted in Discord, Twitter, or Slack.
* Lighthouse Performance & Accessibility score >90.
