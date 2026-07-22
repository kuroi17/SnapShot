import { motion } from 'framer-motion';
import { Sparkles, Zap, ShieldCheck, Paintbrush } from 'lucide-react';
import { Win95Window } from '../ui/Win95Window';

const items = [
  {
    icon: Sparkles,
    title: 'Auto Background Removal to Clipboard',
    desc: 'Capture any area — local AI instantly strips the background and copies a clean, transparent PNG directly to your clipboard.',
    shortcutInfo: { keys: ['Ctrl', 'C'], label: 'Copy to Clipboard' },
  },
  {
    icon: Zap,
    title: 'Global Hotkey & Floating Bubble',
    desc: 'Press Ctrl+Shift+S anywhere on Windows or tap the floating camera bubble from any mobile app to capture in seconds.',
    shortcutInfo: { keys: ['Ctrl', 'Shift', 'S'], label: 'Activate Capture' },
  },
  {
    icon: ShieldCheck,
    title: '100% On-Device & Private',
    desc: 'Zero cloud uploads. No external APIs, no logins, no data tracking. Everything processes locally on your own hardware.',
    shortcutInfo: { keys: ['Ctrl', 'Z'], label: 'Undo', secondary: { keys: ['Ctrl', 'Y'], label: 'Redo' } },
  },
  {
    icon: Paintbrush,
    title: 'Precision Touch & Canvas Editing',
    desc: 'Fine-tune cutouts with real-time restore/remove brushes, live threshold slider, and Figma-style zoom & pan controls.',
    shortcutInfo: { keys: ['Ctrl', 'Drag'], label: 'Figma-Style Canvas Pan' },
  },
];

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[10px] font-mono leading-none select-none border-t-[2px] border-l-[2px] border-r-[2px] border-b-[2px] border-t-win95-light border-l-win95-light border-r-win95-dark-shadow border-b-win95-dark-shadow bg-win95-bg text-black">
      {children}
    </kbd>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function FeaturesAndShortcuts() {
  return (
    <section className="flex flex-col items-center px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 text-center"
      >
        <h2 className="font-sans text-2xl font-bold tracking-tight text-text-main md:text-3xl">
          Simple, Fast &amp; Direct-to-Clipboard
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          Select anything on your screen. Get a transparent PNG in seconds.
        </p>
      </motion.div>

      <Win95Window title="Features &amp; Shortcuts" className="w-full max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const sc = item.shortcutInfo;
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="win95-bevel-outset flex flex-col justify-between gap-3 bg-win95-bg p-4 text-black transition-all duration-200"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="win95-bevel-inset flex h-8 w-8 items-center justify-center bg-white/30 text-accent-blue">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-sans text-sm font-bold leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] font-sans leading-relaxed text-win95-dark-shadow">
                    {item.desc}
                  </p>
                </div>

                {sc && (
                  <div className="pt-2 border-t border-win95-shadow/30 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, kIdx) => (
                        <span key={k} className="inline-flex items-center gap-1">
                          <Kbd>{k}</Kbd>
                          {kIdx < sc.keys.length - 1 && (
                            <span className="text-[10px] text-win95-dark-shadow font-mono">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                      <span className="ml-1.5 text-[10px] font-sans font-medium text-win95-dark-shadow">
                        {sc.label}
                      </span>
                    </div>

                    {sc.secondary && (
                      <div className="flex items-center gap-1">
                        {sc.secondary.keys.map((k, kIdx) => (
                          <span key={k} className="inline-flex items-center gap-1">
                            <Kbd>{k}</Kbd>
                            {kIdx < sc.secondary.keys.length - 1 && (
                              <span className="text-[10px] text-win95-dark-shadow font-mono">
                                +
                              </span>
                            )}
                          </span>
                        ))}
                        <span className="ml-1.5 text-[10px] font-sans font-medium text-win95-dark-shadow">
                          {sc.secondary.label}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </Win95Window>
    </section>
  );
}