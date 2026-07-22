import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useGitHubRelease } from '../../hooks/useGitHubRelease';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function DownloadCard() {
  const { desktopRelease, loading, error } = useGitHubRelease();
  const release = desktopRelease;
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <section id="download" className="flex flex-col items-center px-4 py-24">
      <div className="win95-bevel-outset inline-flex w-full max-w-md flex-col">
        <div className="win95-titlebar flex items-center gap-1 px-1 py-0.5 text-[11px] select-none">
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[10px]">⬇</span>
          <span className="flex-1 truncate tracking-normal font-retro">Download SnapShot</span>
          <div className="flex items-center gap-[2px]">
            <button className="win95-titlebar-btn" aria-label="Minimize">_</button>
            <button className="win95-titlebar-btn" aria-label="Close">&#10005;</button>
          </div>
        </div>

        <div className="bg-win95-bg p-4 text-black">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-win95-shadow" />
              <span className="text-[11px] font-sans text-win95-dark-shadow">Fetching latest release...</span>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="win95">{release?.version || 'v1.0.0'}</Badge>
                    <span className="text-[10px] font-mono text-win95-dark-shadow">
                      {release?.publishedAt || 'July 2026'}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed mt-2">
                    <span className="font-bold">Size:</span> {release?.fileSize || '158 MB'}
                  </p>
                  <p className="text-[11px] font-sans text-win95-dark-shadow leading-relaxed">
                    <span className="font-bold">Platform:</span> Windows x64
                  </p>
                </div>
              </div>

              <a
                href={release?.downloadUrl || 'https://github.com/kuroi17/SnapShot/releases'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="win95"
                  className="mt-3 w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download {release?.version || 'v1.0.0'}
                </Button>
              </a>

              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-sans text-win95-dark-shadow">
                  <AlertCircle className="h-3 w-3" />
                  Using cached release data — GitHub API unreachable
                </div>
              )}

              <button
                onClick={() => setNotesOpen(!notesOpen)}
                className="mt-3 flex w-full items-center justify-between px-1 py-1.5 text-[11px] font-sans text-black transition-colors hover:bg-win95-shadow/20"
              >
                <span className="font-bold">Release Notes</span>
                <motion.span
                  animate={{ rotate: notesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {notesOpen && (
                  <motion.div
                    key="notes"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="win95-bevel-inset mt-1 max-h-40 overflow-y-auto bg-white/30 p-2">
                      {release?.notes ? (
                        <pre className="text-[10px] font-mono leading-relaxed text-black/80 whitespace-pre-wrap">
                          {release.notes}
                        </pre>
                      ) : (
                        <p className="text-[10px] font-sans text-win95-dark-shadow">
                          No release notes available.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 pt-2 border-t border-win95-shadow/30">
                <a
                  href="https://github.com/kuroi17/SnapShot/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-[10px] font-sans text-accent-blue hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View all releases on GitHub
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
