import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-cyan/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        <div className="animate-[glow-pulse_3s_ease-in-out_infinite] rounded-full">
          <div className="win95-bevel-outset flex h-24 w-24 items-center justify-center rounded-full bg-win95-bg p-4">
            <img
              src="/snapshot_icon.png"
              alt="SnapShot"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl text-center font-sans text-4xl font-bold leading-tight tracking-tight text-text-main md:text-5xl lg:text-6xl"
      >
        One keystroke from screen selection to{' '}
        <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
          transparent PNG
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 max-w-xl text-center text-base leading-relaxed text-text-muted"
      >
        Lightweight desktop screen capture with instant AI-powered background removal.
        100% local, zero cloud uploads.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-wrap items-center gap-4"
      >
        <Button
          variant="glow"
          size="lg"
          onClick={() => {
            document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Get SnapShot
        </Button>
      </motion.div>
    </section>
  );
}
