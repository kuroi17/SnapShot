# 🔄 Phase 4 — GitHub Actions Release Pipeline Automation

## 🎯 Goal

Create `.github/workflows/release.yml` so that pushing a version tag (e.g., `git tag v1.1.0 && git push origin v1.1.0`) automatically compiles the .NET 10 WPF single-file executable `SnapShot.exe`, creates a new GitHub Release, and attaches the binary automatically.

---

## ⚙️ GitHub Actions Workflow (`.github/workflows/release.yml`)

```yaml
name: Build & Release SnapShot

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-and-release:
    runs-on: windows-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup .NET 10 SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore dependencies
        run: dotnet restore src/SnapShot.csproj

      - name: Publish Standalone Executable
        run: dotnet publish src/SnapShot.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o publish/

      - name: Create GitHub Release
        id: create_release
        uses: softprops/action-gh-release@v2
        with:
          files: publish/SnapShot.exe
          name: SnapShot ${{ github.ref_name }}
          draft: false
          prerelease: false
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📋 General Instructions & Tasks

1. Create `.github/workflows/release.yml` in the repository root.
2. Verify token permissions (`contents: write`) in workflow configuration.
3. Test triggering the workflow using a test version tag or manual `workflow_dispatch`.

---

## ✅ Phase 4 Definition of Done

* `.github/workflows/release.yml` passes cleanly on GitHub Actions.
* Release binary `SnapShot.exe` is uploaded automatically to GitHub Releases when a tag is pushed.
