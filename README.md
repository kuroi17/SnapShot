# SnapShot 📸

**Screen-to-Object Capture Tool** — One keystroke from screen selection to transparent PNG on your clipboard.

SnapShot is a lightweight, local-first Windows utility built on **.NET 10 + WPF** that allows you to capture any region of your screen, instantly remove its background using AI, refine the cutout with interactive brushes in real-time, and copy it straight to your clipboard.

![SnapShot Visualization](src/Assets/Visualization.jpg)

---

## Key Features

*   **Global Keystroke Activation**: Press `Ctrl+Shift+S` from any app or game to trigger the capture overlay instantly.
*   **Local AI Background Removal**: Uses a lightweight `u2netp` ONNX model (~4.7MB) running entirely on your machine. Cuts backgrounds in under 100ms.
*   **Retro Confirm & Preview Modal**: A classic Windows 95/98-style interface pops up showing your cutout on a checkerboard transparency grid.
    *   **Okay / Enter**: Confirm and copy to clipboard.
    *   **Cancel / Esc**: Dismiss safely without modifying clipboard.
*   **Real-time Refinement**: Drag the threshold slider to make the boundary more permissive (keep more object details) or aggressive (delete more background).
*   **Interactive Edit Brushes**:
    *   **Restore Brush**: Paint over erased areas to reveal the background image at full opacity.
    *   **Remove Brush**: Paint over unwanted foreground parts to make them fully transparent.
    *   *Note: In brush mode, the original image is displayed at 30% opacity in the background for easy tracing.*
*   **Buttery-Smooth, Zero-Lag Painting**: Paints by directly manipulating the preview bitmap buffer in memory. Bypasses the AI model and filters during drags, running at under 0.5ms per stroke.
*   **Undo & Redo (Ctrl+Z / Ctrl+Y)**: Full brush stroke history stack supported via retro buttons and keyboard shortcut bindings.
*   **DPI & Multi-Monitor Support**: Automatically handles custom monitor scaling, multi-monitor setups, and high-DPI screens via GDI `BitBlt` capture.
*   **Figma, Slack, & Discord Ready**: Copies raw transparent PNG bytes directly to the Windows clipboard for instant pasting.

---

## How It Works

1.  Start `SnapShot.exe` (it runs quietly in your Windows system tray).
2.  Press `Ctrl+Shift+S`.
3.  Drag a selection box over the object you want to extract.
4.  Fine-tune the cutout using the threshold slider or paint brushes.
5.  Press `Enter` or click **Okay**.
6.  Paste (`Ctrl+V`) the transparent PNG into Figma, Discord, Slack, Word, or Paint!

---

## Installation & Requirements

*   **Operating System**: Windows 10 / 11 (64-bit)
*   **Runtime**: .NET 10.0 (pre-installed on modern Windows, or downloadable from Microsoft)
*   **AI Model**: The utility requires `u2netp.onnx` to be located in the `Assets/` subfolder next to the executable.

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
To package the app into a single standalone EXE:
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
*   [`RefinementWindow.xaml.cs`](src/RefinementWindow.xaml.cs): The confirm modal, handling brush drawing, undo/redo stacks, and clipboard writes.
*   [`HotkeyService.cs`](src/Services/HotkeyService.cs): Global hotkey listener via Win32 `RegisterHotKey` P/Invoke.
*   [`ScreenCaptureService.cs`](src/Services/ScreenCaptureService.cs): High-performance GDI-based screen capture.
*   [`BackgroundRemovalService.cs`](src/Services/BackgroundRemovalService.cs): Runs ONNX runtime inference, Color Guided Filtering, morphological closing, and unsharp masking.
*   [`ClipboardService.cs`](src/Services/ClipboardService.cs): Writes transparent PNG streams to the clipboard using native WPF formats.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
