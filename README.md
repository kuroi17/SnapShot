# SnapShot 📸

**Screen-to-Object Capture Tool** — One keystroke from screen selection to transparent PNG on your clipboard.

SnapShot is a lightweight, local-first Windows utility built on **.NET 10 + WPF** that allows you to capture any region of your screen, instantly remove its background using AI, refine the cutout with interactive brushes in real-time, and copy it straight to your clipboard.

![SnapShot Visualization](src/Assets/Visualization.jpg)

---

## 📦 Download

Get the latest pre-compiled standalone executable directly from Releases:

[![Download SnapShot.exe](https://img.shields.io/badge/Download-SnapShot.exe-0078D7?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/kuroi17/SnapShot/releases/download/v1.0.0/SnapShot.exe)
[![GitHub Releases](https://img.shields.io/github/v/release/kuroi17/SnapShot?style=for-the-badge&color=28a745)](https://github.com/kuroi17/SnapShot/releases)

> **No installation required.** Just run `SnapShot.exe` — it lives quietly in your Windows system tray ready for `Ctrl+Shift+S`.

---

## Key Features

*   **Global Keystroke Activation**: Press `Ctrl+Shift+S` from any app or game to trigger the screen capture overlay instantly.
*   **Local AI Background Removal**: Uses a lightweight `u2netp` ONNX model (~4.7MB) running entirely on your machine. Cuts backgrounds in under 100ms.
*   **Retro Confirm & Preview Modal**: A classic Windows 95/98-style interface pops up showing your cutout.
    *   **Okay / Enter**: Confirm and copy to clipboard.
    *   **Esc / Window X**: Dismiss safely without modifying clipboard.
*   **Figma-Style Zoom & Pan**:
    *   **Zoom**: `Ctrl` + Mouse Wheel or `Ctrl` + `+`/`-`.
    *   **Pan**: `Shift` + Mouse Wheel (horizontal), two-finger touchpad swipe, Middle-Click drag, or `Spacebar` + Left-Click drag.
*   **Real-time Refinement**: Drag the threshold slider or click anywhere along the track to jump directly to values.
*   **Interactive Edit Brushes**:
    *   **Restore Brush**: Paint over erased areas with 70% low-opacity background guide visible for easy tracing.
    *   **Remove Brush**: Erase unwanted foreground parts directly to 0% opacity with low-opacity guide hidden for zero distraction.
    *   **Visible Circle Cursor**: Dynamic circle overlay tracks your mouse and scales in real-time with brush size and zoom.
    *   **1px Precision & Quick Buttons**: Slider supports 1px increments (1px to 60px) with dedicated `-` and `+` buttons.
*   **Floating Background Selectors**: Instant toggle buttons in top-right for:
    *   `🏁` Light Checkerboard Grid
    *   `🏴` Dark Checkerboard Grid
    *   `⬜` Solid White Fill
    *   `⬛` Solid Black Fill
*   **Undo & Redo (Ctrl+Z / Ctrl+Y)**: Full brush stroke history stack supported via retro buttons and keyboard shortcut bindings.
*   **Buttery-Smooth, Zero-Lag Painting**: Direct pixel-buffer memory manipulation bypasses model re-evaluations during drags (<0.5ms rendering).
*   **Figma, Slack, & Discord Ready**: Copies raw transparent PNG bytes directly to the Windows clipboard for instant pasting.

---

## How It Works

1.  Run `SnapShot.exe` (it lives in your Windows system tray).
2.  Press `Ctrl+Shift+S` from any app.
3.  Drag a selection box over the object you want to extract.
4.  Fine-tune the cutout using the threshold slider, zoom/pan controls, or paint brushes.
5.  Press `Enter` or click **Okay**.
6.  Paste (`Ctrl+V`) the transparent PNG into Figma, Discord, Slack, Word, or Paint!

---

## Installation & Requirements

*   **Operating System**: Windows 10 / 11 (64-bit)
*   **Runtime**: .NET 10.0 (pre-installed on modern Windows, or downloadable from Microsoft)
*   **AI Model**: Bundled alongside the executable in the `Assets/` subfolder.

---

## Build from Source

You will need the **.NET 10 SDK** installed to compile SnapShot.

### 1. Clone the repository
```powershell
git clone https://github.com/kuroi17/SnapShot.git
cd SnapShot
```

### 2. Compile the project
```powershell
dotnet build src/SnapShot.csproj -c Release
```

### 3. Publish as a Single Executable
To package the app into a standalone EXE:
```powershell
dotnet publish src/SnapShot.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true
```
The output executable will be generated at:
`src/bin/Release/net10.0-windows/win-x64/publish/SnapShot.exe`

---

## Architecture & Codebase

The project is structured simply and efficiently to maximize performance while minimizing disk footprint:

*   [`App.xaml.cs`](src/App.xaml.cs): Application entry, global hotkey registration, and tray orchestration.
*   [`CaptureOverlay.xaml.cs`](src/CaptureOverlay.xaml.cs): Fullscreen canvas overlay to capture screen coordinates.
*   [`RefinementWindow.xaml.cs`](src/RefinementWindow.xaml.cs): The confirm modal, handling brush drawing, undo/redo stacks, zoom/pan, and clipboard writes.
*   [`HotkeyService.cs`](src/Services/HotkeyService.cs): Global hotkey listener via Win32 `RegisterHotKey` P/Invoke.
*   [`ScreenCaptureService.cs`](src/Services/ScreenCaptureService.cs): High-performance GDI-based screen capture.
*   [`BackgroundRemovalService.cs`](src/Services/BackgroundRemovalService.cs): Runs ONNX runtime inference, Color Guided Filtering, morphological closing, and unsharp masking.
*   [`ClipboardService.cs`](src/Services/ClipboardService.cs): Writes transparent PNG streams to the clipboard using native WPF formats.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
