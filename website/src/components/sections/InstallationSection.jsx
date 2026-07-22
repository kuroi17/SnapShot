import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Monitor,
  Smartphone,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useGitHubRelease } from "../../hooks/useGitHubRelease";
import { Button } from "../ui/Button";

const tabs = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

const win95TabActive =
  "bg-win95-bg text-black relative z-10 border-t-2 border-l-2 border-r-2 border-t-win95-light border-l-win95-light border-r-win95-dark-shadow";
const win95TabInactive =
  "bg-win95-shadow/30 text-win95-dark-shadow cursor-pointer border-t-2 border-l-2 border-r-2 border-t-win95-shadow border-l-win95-shadow border-r-win95-dark-shadow";

export function InstallationSection() {
  const { desktopRelease, mobileRelease, loading, error } = useGitHubRelease();
  const [activeTab, setActiveTab] = useState("desktop");

  const current = activeTab === "desktop" ? desktopRelease : mobileRelease;

  return (
    <section id="download" className="flex flex-col items-center px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 text-center"
      >
        <h2 className="font-sans text-2xl font-bold tracking-tight text-text-main md:text-3xl">
          Get SnapShot
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          Download the latest release for your platform.
        </p>
      </motion.div>

      <div className="win95-bevel-outset inline-flex w-full max-w-md flex-col">
        <div className="win95-titlebar flex items-center gap-1 px-1 py-0.5 text-[11px] select-none">
          <span className="flex-1 truncate tracking-normal font-retro">
            Install SnapShot
          </span>
          <div className="flex items-center gap-[2px]">
            <button className="win95-titlebar-btn" aria-label="Minimize">
              _
            </button>
            <button className="win95-titlebar-btn" aria-label="Maximize">
              口
            </button>
            <button className="win95-titlebar-btn" aria-label="Close">
              &#10005;
            </button>
          </div>
        </div>

        <div className="flex items-end gap-1 px-2 pt-2 bg-win95-bg border-b border-win95-dark-shadow">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-sans font-bold select-none transition-colors ${
                  isActive ? win95TabActive : win95TabInactive
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-win95-bg">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-win95-shadow" />
              <span className="text-[11px] font-sans text-win95-dark-shadow">
                Fetching latest release...
              </span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === "desktop" ? (
                  <DesktopPanel release={current} error={error} />
                ) : (
                  <MobilePanel release={current} error={error} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

function DesktopPanel({ release, error }) {
  const [showNotes, setShowNotes] = useState(true);

  const defaultReleaseNotes = `• 100% Local AI Background Removal (u2netp ONNX engine)
• Zero-delay global hotkey (Ctrl + Shift + S)
• Real-time refine brush & threshold controls
• Direct-to-clipboard transparent PNG output
• Figma-style zoom (Scroll) and pan (Ctrl + Drag)`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block bg-win95-dark-shadow px-1.5 py-0.5 text-[10px] font-mono text-white">
              {release?.version || "desktop-v1.0.0"}
            </span>
            <span className="text-[10px] font-mono text-win95-dark-shadow">
              {release?.publishedAt || "July 2026"}
            </span>
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed">
              <span className="font-bold">Size:</span>{" "}
              {release?.fileSize || "158 MB"}
            </p>
            <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed">
              <span className="font-bold">Platform:</span> Windows x64
            </p>
            <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed">
              <span className="font-bold">Format:</span> Standalone .exe (no install)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1 text-[11px] font-sans font-bold text-win95-dark-shadow hover:text-black mb-1 select-none"
        >
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              showNotes ? "" : "-rotate-90"
            }`}
          />
          <span>Release Notes &amp; Details</span>
        </button>

        {showNotes && (
          <div className="win95-bevel-inset bg-win95-bg p-2.5 max-h-32 overflow-y-auto text-[11px] font-mono text-black leading-relaxed whitespace-pre-wrap select-text border border-win95-dark-shadow">
            {release?.description || defaultReleaseNotes}
          </div>
        )}
      </div>

      <a
        href={
          release?.downloadUrl || "https://github.com/kuroi17/SnapShot/releases"
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="win95"
          className="mt-4 w-full flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download {release?.version || "desktop-v1.0.0"}
        </Button>
      </a>

      {error && (
        <p className="mt-2 text-[10px] font-sans text-win95-dark-shadow text-center">
          Using cached data — GitHub API unreachable
        </p>
      )}
    </div>
  );
}

function MobilePanel({ release, error }) {
  const [showNotes, setShowNotes] = useState(true);

  const defaultReleaseNotes = `• System-wide Floating Camera Overlay Bubble
• 100% On-Device ONNX AI inference (<150ms)
• Touch-optimized refinement canvas with cursor ring
• One-tap Copy transparent PNG to Clipboard
• Win95 retro UI styling and error boundaries`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block bg-win95-dark-shadow px-1.5 py-0.5 text-[10px] font-mono text-white">
              {release?.version || "mobile-v1.0.0"}
            </span>
            <span className="text-[10px] font-mono text-win95-dark-shadow">
              {release?.publishedAt || "July 2026"}
            </span>
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed">
              <span className="font-bold">Platform:</span> Android (APK)
            </p>
            <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed">
              <span className="font-bold">Framework:</span> Expo / React Native
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1 text-[11px] font-sans font-bold text-win95-dark-shadow hover:text-black mb-1 select-none"
        >
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              showNotes ? "" : "-rotate-90"
            }`}
          />
          <span>Release Notes &amp; Details</span>
        </button>

        {showNotes && (
          <div className="win95-bevel-inset bg-win95-bg p-2.5 max-h-32 overflow-y-auto text-[11px] font-mono text-black leading-relaxed whitespace-pre-wrap select-text border border-win95-dark-shadow">
            {release?.description || defaultReleaseNotes}
          </div>
        )}
      </div>

      <a
        href={
          release?.downloadUrl || "https://github.com/kuroi17/SnapShot/releases"
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="win95"
          className="mt-4 w-full flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download {release?.version || "mobile-v1.0.0"}
        </Button>
      </a>

      {error && (
        <p className="mt-2 text-[10px] font-sans text-win95-dark-shadow text-center">
          Using cached data — GitHub API unreachable
        </p>
      )}
    </div>
  );
}
