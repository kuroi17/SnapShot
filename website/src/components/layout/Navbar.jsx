import { motion } from 'framer-motion';
import { ExternalLink, Download } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/5 bg-dark-canvas/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2.5 group">
          <img
            src="/snapshot_icon.png"
            alt="SnapShot"
            className="h-7 w-7 object-contain"
          />
          <span className="font-retro text-sm tracking-wide text-text-main">
            SnapShot
          </span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/kuroi17/SnapShot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-text-muted transition-colors hover:text-text-main"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">kuroi17/SnapShot</span>
          </a>

          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
