# SnapShot

**Screen-to-Object Capture Tool** — one keystroke from screen to transparent PNG.

Press `Ctrl+Shift+S` anywhere → drag to select a region → background is removed → transparent PNG is on your clipboard. Paste anywhere.

## How It Works

1. Press `Ctrl+Shift+S` (global hotkey, works from any app)
2. A fullscreen overlay appears — drag to select a region
3. Background is removed using AI (u2netp ONNX model)
4. Transparent PNG is copied to your clipboard
5. Paste anywhere — Figma, Slack, Discord, Word, etc.

## Download

Grab the latest EXE from [Releases](https://github.com/kuroi17/SnapShot/releases).

No installation needed. Just run the EXE — it lives in your system tray.

## Usage

1. Run `SnapShot.exe` — appears in system tray
2. Press `Ctrl+Shift+S` from any app
3. Drag to select a region
4. Paste the transparent PNG anywhere

To quit: right-click tray icon → Quit

## Build from Source

```powershell
dotnet build src/SnapShot.csproj -c Release
```

Publish as single EXE:
```powershell
dotnet publish src/SnapShot.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true
```

## License

MIT — see [LICENSE](LICENSE)
