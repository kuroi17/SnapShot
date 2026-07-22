# SnapShot Website + Automated Release System

## 🎯 Goal

Build an official SnapShot website that automatically stays synchronized with the latest desktop application release.

The workflow should be:

```text
Developer changes SnapShot
        ↓
Commit + Push
        ↓
GitHub Actions builds the application
        ↓
New GitHub Release is created
        ↓
Website fetches the latest release
        ↓
Download section automatically updates
```

The website should not require manual editing every time a new version of SnapShot is released.

---

# 🧠 Core Architecture

```text
┌────────────────────────────┐
│     SnapShot Repository    │
│                            │
│  Desktop App               │
│  Website                   │
│  GitHub Actions            │
└──────────────┬─────────────┘
               │
               ▼
       GitHub Actions
               │
               ▼
       Build SnapShot.exe
               │
               ▼
       GitHub Release
               │
               ▼
       GitHub Releases API
               │
               ▼
        SnapShot Website
```

---

# 📁 Recommended Repository Structure

```text
SnapShot/
├── src/
│   ├── SnapShot.csproj
│   ├── App.xaml
│   ├── CaptureOverlay.xaml
│   ├── RefinementWindow.xaml
│   ├── Services/
│   └── Assets/
│
├── website/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .github/
│   └── workflows/
│       └── release.yml
│
├── README.md
└── LICENSE
```

---

# 🌐 Website Responsibilities

The website should serve as:

* Official SnapShot landing page
* Product showcase
* Download page
* Feature documentation
* Release information page
* Project information hub

The website should not manually hardcode the latest release information.

Instead, it should retrieve release data dynamically.

---

# 📦 Download Section

Example:

```text
┌──────────────────────────────────────┐
│          Download SnapShot           │
│                                      │
│             v1.2.0                   │
│                                      │
│  ✨ Improved background removal      │
│  🎨 New refinement tools             │
│  ⚡ Performance improvements         │
│                                      │
│        [ Download SnapShot ]         │
│                                      │
│       Released July 2026             │
└──────────────────────────────────────┘
```

The website should dynamically retrieve:

* Latest version
* Release name
* Release description
* Release date
* Download URL
* Release asset name
* Release page URL

---

# 🔄 Automatic Release Workflow

## Developer Workflow

The developer should only need to:

```text
1. Modify SnapShot
2. Test locally
3. Commit changes
4. Push changes
5. Create a version tag or release trigger
```

Example:

```bash
git add .
git commit -m "Add improved brush controls"
git push
```

Then the release process should be automated.

---

# ⚙️ GitHub Actions Pipeline

The pipeline should:

```text
Trigger
   ↓
Checkout repository
   ↓
Install .NET SDK
   ↓
Restore dependencies
   ↓
Build application
   ↓
Publish self-contained EXE
   ↓
Create GitHub Release
   ↓
Upload SnapShot.exe
```

Example conceptual workflow:

```text
Code Push
   ↓
GitHub Actions
   ↓
dotnet publish
   ↓
SnapShot.exe
   ↓
GitHub Release
```

---

# 🏷️ Versioning Strategy

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
v1.0.0
v1.1.0
v1.1.1
v2.0.0
```

### Major

Breaking changes:

```text
v1.0.0 → v2.0.0
```

### Minor

New features:

```text
v1.0.0 → v1.1.0
```

### Patch

Bug fixes:

```text
v1.1.0 → v1.1.1
```

---

# 📝 Release Description

Each GitHub Release should contain a release description.

Example:

```markdown
## What's New

### ✨ New Features
- Added improved brush controls
- Added new preview backgrounds

### ⚡ Improvements
- Improved image processing performance

### 🐛 Bug Fixes
- Fixed clipboard issue
- Fixed zoom navigation issue
```

The website should display this release information automatically.

---

# 🔌 Website Data Flow

The website should retrieve release information from GitHub.

Conceptually:

```text
Website
   ↓
GitHub Releases API
   ↓
Latest Release
   ↓
Extract:
├── Version
├── Release Description
├── Date
├── EXE Download URL
└── Release Page URL
```

The website should then render:

```text
Latest Version
        ↓
Release Description
        ↓
Download Button
```

---

# 💻 Website Download Component

The download component should:

1. Fetch the latest GitHub Release.
2. Find the correct Windows executable asset.
3. Display the latest version.
4. Display release notes.
5. Generate the download button.
6. Link directly to the latest `.exe`.

Example logic:

```text
Fetch latest release
        ↓
Find asset named:
SnapShot.exe
        ↓
Get browser_download_url
        ↓
Render Download Button
```

---

# 🛡️ Error Handling

The website should gracefully handle:

### GitHub API unavailable

Display:

```text
Latest release information is temporarily unavailable.
```

### No release exists

Display:

```text
The first release is coming soon.
```

### EXE asset not found

Display:

```text
Download temporarily unavailable.
```

The entire website should not break just because the GitHub API fails.

---

# 🚀 Recommended Implementation Phases

## Phase 1 — Website Foundation

Build:

* Landing page
* Hero section
* Product explanation
* Features section
* Download section
* Footer

At this stage, the download button may be temporary.

---

## Phase 2 — GitHub Release Integration

Implement:

```text
Website
   ↓
GitHub API
   ↓
Latest Release
```

Display:

* Version
* Release date
* Release description
* Download button

---

## Phase 3 — Automated Build Pipeline

Create:

```text
.github/workflows/release.yml
```

The workflow should:

```text
Build
   ↓
Publish
   ↓
Create Release
   ↓
Upload SnapShot.exe
```

---

## Phase 4 — End-to-End Testing

Test the complete workflow:

```text
1. Modify desktop application.

2. Commit changes.

3. Push code.

4. Trigger release workflow.

5. GitHub Actions builds SnapShot.exe.

6. GitHub Release is created.

7. Website fetches the new release.

8. Website automatically displays:
   - New version
   - New description
   - New download link
```

The developer should not need to manually update the website.

---

# 🎯 Final Desired Developer Experience

The ideal workflow is:

```text
Developer:
"SnapShot v1.3.0 is ready."

        ↓

git push

        ↓

GitHub Actions:
"Building..."

        ↓

GitHub:
"Release v1.3.0 created."

        ↓

Website:
"Latest release updated automatically."
```

---

# 🏁 Definition of Done

The system is complete when:

```text
A new SnapShot release is created
        ↓
The EXE is automatically built
        ↓
The EXE is automatically uploaded
        ↓
The release notes are published
        ↓
The website automatically displays
the new release information
        ↓
Users can immediately download
the newest version
```

The final system should eliminate manual synchronization between:

```text
Desktop Application
        ↕
GitHub Release
        ↕
Official Website
```

The website should always represent the latest official SnapShot release automatically.
