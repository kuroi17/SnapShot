# SnapShot Desktop

Windows desktop application built with **.NET 10** and **WPF** for AI-powered screen-to-object capture.

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

## Build

```powershell
dotnet build src/SnapShot.csproj -c Release
```

## Publish

```powershell
dotnet publish src/SnapShot.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true
```

## Project Structure

- `src/App.xaml.cs` — Application entry point, tray icon, global hotkey
- `src/CaptureOverlay.xaml.cs` — Full-screen selection overlay
- `src/RefinementWindow.xaml.cs` — Cutout refinement modal with brush engine, zoom/pan, clipboard
- `src/Services/` — ONNX inference, clipboard, hotkey, and screen capture services
