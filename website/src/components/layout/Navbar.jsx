import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

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
      </div>
    </motion.nav>
  );
}
