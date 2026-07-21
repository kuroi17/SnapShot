<div align="center">
  <img src="src/Assets/snapshot_icon.png" alt="SnapShot Icon" width="160">

  <h1>SnapShot</h1>

  <p><strong>Local AI-powered screen-to-object capture for Windows.</strong></p>

  <p>
    Select anything on your screen, remove its background entirely on your device,
    refine the cutout, and paste it anywhere as a transparent PNG.
  </p>
</div>

<br>

<div align="center">
  <img src="src/Assets/Visualization.jpg" alt="SnapShot Visualization">
</div>

---

## ✨ What is SnapShot?

**SnapShot** is a lightweight, local-first Windows utility built with **.NET 10 and WPF** that turns anything on your screen into a clean, transparent, clipboard-ready object.

With a single global hotkey, you can:

1. Capture any region of your screen.
2. Remove its background using **local AI**.
3. Refine the result with real-time brushes and controls.
4. Copy the final transparent PNG directly to your clipboard.

### 🔒 100% Local AI Processing

SnapShot performs background removal entirely on your machine using a lightweight **u2netp ONNX model**.

**No cloud uploads. No external API calls. No server-side processing.**

Your captured images stay on your computer.

---

## 📦 Download

Get the latest pre-compiled executable from GitHub Releases:

[![Download SnapShot.exe](https://img.shields.io/badge/Download-SnapShot.exe-0078D7?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/kuroi17/SnapShot/releases/download/v1.0.0/SnapShot.exe)
[![GitHub Releases](https://img.shields.io/github/v/release/kuroi17/SnapShot?style=for-the-badge&color=28a745)](https://github.com/kuroi17/SnapShot/releases)

> **No installation required.** Run `SnapShot.exe`, and it will quietly run in the background from your Windows system tray.

### Quick Start

1. Run `SnapShot.exe`.
2. Press `Ctrl+Shift+S` from any application.
3. Drag a selection box over the object you want to extract.
4. Fine-tune the cutout using the threshold slider, zoom/pan controls, or paint brushes.
5. Press `Enter`, `Ctrl+C`, or click **Okay**.
6. Paste (`Ctrl+V`) the transparent PNG into Figma, Discord, Slack, Word, Paint, or any other application that supports images.

---

## ⚡ How It Works

* **Operating System:** Windows 10 / 11 (64-bit)
* **Runtime:** .NET 10.0
* **Architecture:** x64
* **AI Model:** Bundled alongside the executable in the `Assets/` subfolder

### 1. Capture

Press:

```text
Ctrl + Shift + S
```

from anywhere in Windows to activate the screen capture overlay.

Drag over the object you want to extract.

### 2. Remove the Background

SnapShot processes the selected image locally using the bundled **u2netp AI model**.

The result is generated directly on your machine without uploading your image anywhere.

### 3. Refine the Cutout

Fine-tune the result using:

* Threshold adjustment
* Restore brush
* Remove brush
* Zoom and pan controls
* Undo and redo history

### 4. Copy and Paste

Press `Enter`, `Ctrl+C`, or click **Okay** to copy the transparent PNG directly to your clipboard.

Then paste it anywhere:

**Figma · Discord · Slack · Word · Paint · Anywhere that supports images**

---

## 🚀 Features

### 🧠 Local AI Background Removal

* Lightweight **u2netp ONNX model**
* Runs entirely on-device
* No cloud processing or external API calls
* Approximately **4.7 MB model size**
* Background removal can complete in under **100 ms**, depending on your hardware
* **Enhanced Edge Accuracy**: Fine-detail retention (0.05 cutoff) for animal fur, thin ear tips, and whiskers without edge erosion or background color bleed

### 🎨 Real-Time Cutout Refinement

#### Restore Brush

Paint over removed areas to restore them.

A low-opacity background guide helps you trace the original image accurately.

#### Remove Brush

Erase unwanted foreground areas directly.

The low-opacity guide is hidden while removing areas for a cleaner editing experience.

#### Precision Controls

* Brush size from **1px to 60px**
* 1px increments
* Dedicated `-` and `+` controls
* **100% Precise Circle Cursor**: Dynamic translucent blue ring tracks brush radius and centers perfectly over mouse pointer tip at all zoom levels

### 🔍 Figma-Style Navigation

Navigate large cutouts smoothly with:

* `Ctrl` + Mouse Wheel — Zoom in / out
* `Ctrl` + `+` / `-` — Zoom in / out
* `Ctrl` + Left-click drag — Pan canvas (even in active brush mode)
* `Shift` + Mouse Wheel — Horizontal pan
* Two-finger touchpad swipe — Smooth horizontal & vertical pan
* Middle-click drag — Pan canvas
* `Spacebar` + Left-click drag — Pan canvas

### ↩️ Shortcuts & Editing History

* `Ctrl + C` — Instant copy cutout & close window
* `Ctrl + Z` — Undo brush stroke
* `Ctrl + Y` — Redo brush stroke
* `Escape` — Cancel capture
* `PreviewKeyDown Routing` — Shortcuts work reliably without accidental checkbox focus toggling

Retro-style UI buttons are also available directly in the refinement window.

### 🖼️ Background Preview Modes

Instantly switch between different preview backgrounds:

* 🏁 Light checkerboard
* 🏴 Dark checkerboard
* ⬜ Solid white
* ⬛ Solid black

Useful for checking edge quality and transparency against different backgrounds.

### ⚡ Smooth, Low-Latency Editing

Brush strokes directly manipulate the pixel buffer instead of re-running AI inference.

This keeps painting responsive and avoids unnecessary model re-evaluation during editing.

### 🔔 System Tray Indicator & Executable Icon

* **System Tray Indicator**: Startup balloon notification confirms SnapShot is active in background tray.
* **Native Embedded Icon**: Standalone `SnapShot.exe` embeds a 256x256 retro pixel-art camera icon displayed natively in Windows File Explorer.

---

## 🛠️ Build from Source

### Prerequisites

* [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

### 1. Clone the Repository

```powershell
git clone https://github.com/kuroi17/SnapShot.git
cd SnapShot
```

### 2. Build the Project

```powershell
dotnet build src/SnapShot.csproj -c Release
```

### 3. Publish as a Standalone Executable

To publish as a single standalone executable:

```powershell
dotnet publish src/SnapShot.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true
```

The output executable will be created at:

`src/bin/Release/net10.0-windows/win-x64/publish/SnapShot.exe`

---

## 📁 Repository Structure

* `src/App.xaml.cs` — Main application logic, tray icon, and global hotkey handler
* `src/CaptureOverlay.xaml.cs` — Full-screen selection overlay
* `src/RefinementWindow.xaml.cs` — Retro refinement modal, brush engine, zoom/pan, and clipboard integration
* `src/Services/BackgroundRemovalService.cs` — Local ONNX inference, color-guided filtering, edge decontamination, and image post-processing
* `src/Services/ClipboardService.cs` — Native WPF transparent PNG clipboard helper
* `src/Services/HotkeyService.cs` — Win32 global hotkey wrapper
* `src/Services/ScreenCaptureService.cs` — Win32 GDI screen capture helper

---

## 📄 License

This project is open-source and licensed under the **MIT License**.
