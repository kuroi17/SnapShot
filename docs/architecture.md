# Architecture

## Overview

SnapShot is a monorepo containing:

| Directory | Description |
|-----------|-------------|
| `desktop/` | Windows desktop C# WPF application |
| `website/` | Official landing page (Vite + React) |
| `docs/` | Shared project documentation |

## Desktop Application

The desktop app uses .NET 10 with WPF for the UI and ONNX Runtime for local AI inference.

### Key Components

- **CaptureOverlay** — Full-screen transparent overlay for region selection
- **RefinementWindow** — Modal window for cutout refinement with brush editing
- **BackgroundRemovalService** — u2netp ONNX model inference for background removal
- **HotkeyService** — Global hotkey registration via Win32 APIs

All processing is done locally — no cloud dependencies.
