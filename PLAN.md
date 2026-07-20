# SnapShot — Project Plan

## Overview

SnapShot is a zero-friction desktop utility that captures screen objects, removes their backgrounds, and copies the result as a transparent PNG to the clipboard — all with a single global hotkey.

The app lives in the system tray, waits for a hotkey, then presents a crosshair overlay for the user to select a region. The captured image is processed (background removed) and the transparent PNG is placed on the clipboard, ready to paste anywhere.

## Goal

Eliminate the multi-step workflow of: screenshot → open editor → manually erase background → save as PNG → copy. Replace it with one keystroke.

## Core Functions

| # | Function | Description |
|---|----------|-------------|
| 1 | **Global Hotkey** | A system-wide hotkey (e.g. `Ctrl+Shift+S`) that triggers the capture from any app |
| 2 | **Screen Capture Overlay** | A fullscreen crosshair overlay that lets the user drag-select a region |
| 3 | **Background Removal** | Process the captured region — remove the background, keep the foreground object |
| 4 | **Clipboard Copy** | Copy the resulting transparent PNG to the system clipboard automatically |
| 5 | **System Tray** | App lives in the system tray; no visible window needed during idle |

## Non-Goals

- No file saving (clipboard-only workflow)
- No editing tools (crop/resize/etc.)
- No cloud upload or sharing
- No history or gallery

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  System Tray                    │
│  (idle state, waits for hotkey)                 │
└──────────────────────┬──────────────────────────┘
                       │ hotkey pressed
                       ▼
┌─────────────────────────────────────────────────┐
│           Screen Capture Overlay                 │
│  (fullscreen transparent window, crosshair)     │
│  User drag-selects a region                     │
└──────────────────────┬──────────────────────────┘
                       │ captured image (bitmap)
                       ▼
┌─────────────────────────────────────────────────┐
│           Background Removal                    │
│  (process image → keep foreground → transparent)│
└──────────────────────┬──────────────────────────┘
                       │ transparent PNG (in memory)
                       ▼
┌─────────────────────────────────────────────────┐
│           Clipboard Copy                         │
│  (set PNG data to system clipboard)              │
└──────────────────────────────────────────────────┘
```

## Tech Stack (TBD)

The following options are under consideration. The final choice will be made based on storage footprint, development speed, and ecosystem fit.

| Option | Runtime | Bundle | Notes |
|--------|---------|--------|-------|
| **Go + Wails** | ~200MB | ~15MB | Lightweight, good perf, Go is pre-installed? |
| **C# .NET 10 + WPF/WinUI** | ~0MB (pre-installed) | ~80MB | Zero additional runtime cost |
| **Python + PyQt/PySide** | ~50MB | ~80MB | Fastest to prototype, easy image processing |
| **Electron** | ~150MB | ~150MB | Heavy but familiar (React) |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  System Tray                    │
│  (idle state, waits for hotkey)                 │
└──────────────────────┬──────────────────────────┘
                       │ hotkey pressed
                       ▼
┌─────────────────────────────────────────────────┐
│           Screen Capture Overlay                 │
│  (fullscreen transparent window, crosshair)     │
│  User drag-selects a region                     │
└──────────────────────┬──────────────────────────┘
                       │ captured image (bitmap)
                       ▼
┌─────────────────────────────────────────────────┐
│           Background Removal                    │
│  (process image → keep foreground → transparent)│
└──────────────────────┬──────────────────────────┘
                       │ transparent PNG (in memory)
                       ▼
┌─────────────────────────────────────────────────┐
│           Clipboard Copy                         │
│  (set PNG data to system clipboard)              │
└──────────────────────────────────────────────────┘
```

## Core Functions

| # | Function | Description |
|---|----------|-------------|
| 1 | **Global Hotkey** | System-wide hotkey (e.g. `Ctrl+Shift+S`) that triggers capture from any app |
| 2 | **Screen Capture Overlay** | Fullscreen transparent window with crosshair cursor; user drag-selects a region |
| 3 | **Background Removal** | Process the captured region — remove background, keep foreground object, output transparent PNG |
| 4 | **Clipboard Copy** | Copy the resulting transparent PNG to the system clipboard automatically |
| 5 | **System Tray** | App lives in system tray; no visible window during idle |

## Non-Goals

- No file saving (clipboard-only workflow)
- No editing tools (crop, resize, filters, etc.)
- No cloud upload or sharing
- No history, gallery, or recent captures
- No settings UI (config via config file or env)

## User Flow

```
1. User presses Ctrl+Shift+S (global hotkey)
2. Fullscreen overlay appears with crosshair cursor
3. User clicks and drags to select a region
4. Release → region is captured
5. Background is removed from the captured image
6. Transparent PNG is copied to clipboard
7. Overlay closes, app returns to tray
8. User pastes (Ctrl+V) anywhere
```

## Architecture

```
┌─────────────────────┐
│   System Tray App   │  ← always running, no window
│   (background)      │
└────────┬────────────┘
         │ global hotkey listener
         ▼
┌─────────────────────┐
│   Capture Overlay   │  ← fullscreen transparent window
│   (crosshair UI)    │
└────────┬────────────┘
         │ region selected
         ▼
┌─────────────────────┐
│   Image Processor   │  ← background removal
│   (in memory)       │
└────────┬────────────┘
         │ transparent PNG
         ▼
┌─────────────────────┐
│   Clipboard Setter   │  ← system clipboard API
└──────────────────────┘
```

## Tech Stack Options

| Option | Runtime | Bundle Size | Pros | Cons |
|--------|---------|-------------|------|------|
| **Go + Wails** | ~200MB | ~15MB | Small binary, good perf, cross-platform | Go not pre-installed |
| **C# .NET 10 + WPF** | 0MB (pre-installed) | ~80MB | Zero runtime cost, mature Windows APIs | Windows-only |
| **Python + PyQt** | ~50MB | ~80MB | Fastest to prototype, rich image libs | Bundle size |
| **Electron** | ~150MB | ~150MB | Familiar (React), huge ecosystem | Heaviest option |

## Development Phases

### Phase 1: Skeleton
- [ ] Scaffold project with chosen stack
- [ ] Create system tray icon with quit option
- [ ] Register global hotkey listener
- [ ] Verify hotkey triggers callback

### Phase 2: Capture
- [ ] Create fullscreen transparent overlay window
- [ ] Implement crosshair cursor
- [ ] Implement click-drag-release region selection
- [ ] Capture selected region as bitmap

### Phase 3: Processing
- [ ] Implement background removal algorithm
- [ ] Convert result to transparent PNG (in memory)
- [ ] Handle edge cases (empty selection, errors)

### Phase 4: Clipboard
- [ ] Set transparent PNG to system clipboard
- [ ] Verify paste works in target apps (Slack, Figma, etc.)

### Phase 5: Polish
- [ ] Error handling and edge cases
- [ ] App icon and metadata
- [ ] Build for distribution
- [ ] Test on clean machine

## Data Flow

```
Hotkey Press
    │
    ▼
Overlay Window (fullscreen, transparent)
    │
    ▼
Mouse Drag → Region Coordinates (x, y, w, h)
    │
    ▼
Screen Capture → Bitmap (from coordinates)
    │
    ▼
Background Removal → RGBA bitmap (transparent bg)
    │
    ▼
Encode as PNG (in memory)
    │
    ▼
Set to Clipboard (CF_DIB / PNG format)
    │
    ▼
Overlay closes → Back to tray
```

## Key Design Decisions

1. **Clipboard-only** — no file I/O, no temp files, no save dialogs. Everything stays in memory.
2. **Single hotkey** — one key combo to rule them all. No complex UI.
3. **No settings UI** — configuration via config file (JSON/TOML/YAML) if needed.
4. **Minimal dependencies** — prefer OS-native APIs where possible.
5. **Portable** — single binary, no installer, no registry changes.

## Edge Cases & Error Handling

- **Empty selection** (click without drag) → ignore, close overlay
- **Selection too small** (< 10px) → ignore, too small to be useful
- **Background removal fails** → fallback: copy original image as-is
- **Clipboard write fails** → silently fail, no crash
- **Multiple monitors** → capture across the entire virtual desktop
- **High DPI** → account for display scaling factor
- **Hotkey conflict** → warn if hotkey is already registered by another app

## Future Ideas (v2+)

- Configurable hotkey
- Multiple capture modes (window, fullscreen, region)
- "Keep" / "Retry" buttons in overlay
- Custom background color instead of transparent
- Auto-start with system
- Right-click tray menu with quick options

---

*This plan is language-agnostic. The implementation details will depend on the chosen tech stack.*
