import { motion } from 'framer-motion';
import { Monitor, Copy, Undo2, Hand, ArrowRightFromLine } from 'lucide-react';
import { Win95Window } from '../ui/Win95Window';

const shortcuts = [
  {
    keys: ['Ctrl', 'Shift', 'S'],
    label: 'Global Screen Capture',
    icon: Monitor,
    description: 'Trigger region selection from anywhere',
  },
  {
    keys: ['Ctrl', 'C'],
    label: 'Instant Copy & Close',
    icon: Copy,
    description: 'Copy cutout to clipboard and exit',
  },
  {
    keys: ['Ctrl', 'Z'],
    label: 'Undo',
    icon: Undo2,
    description: 'Step back through edit history',
    secondary: { keys: ['Ctrl', 'Y'], label: 'Redo', icon: ArrowRightFromLine },
  },
  {
    keys: ['Ctrl', 'Left-Click'],
    label: 'Canvas Panning',
    icon: Hand,
    description: 'Drag to pan around zoomed canvas',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

function Kbd({ children }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[10px] font-mono leading-none select-none
        border-t-[2px] border-l-[2px] border-r-[2px] border-b-[2px]
        border-t-win95-light border-l-win95-light border-r-win95-dark-shadow border-b-win95-dark-shadow
        bg-win95-bg text-black"
    >
      {children}
    </kbd>
  );
}

export function ShortcutsSection() {
  return (
    <section className="flex flex-col items-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center"
      >
        <h2 className="font-sans text-2xl font-bold tracking-tight text-text-main md:text-3xl">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          Stay in flow. Every action is one keystroke away.
        </p>
      </motion.div>

      <Win95Window title="Keyboard Shortcuts" className="w-full max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <motion.div
                key={shortcut.label}
                variants={cardVariants}
                className="win95-bevel-outset flex items-start gap-3 bg-win95-bg p-4 text-black transition-all duration-200"
              >
                <div className="win95-bevel-inset flex h-9 w-9 shrink-0 items-center justify-center bg-white/30">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={key} className="flex items-center gap-1">
                        <Kbd>{key}</Kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-[10px] font-mono text-win95-dark-shadow">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-1.5 text-[11px] font-sans font-bold leading-tight">
                    {shortcut.label}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-sans leading-relaxed text-win95-dark-shadow">
                    {shortcut.description}
                  </p>

                  {shortcut.secondary && (
                    <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-win95-shadow/20 pt-2">
                      {shortcut.secondary.keys.map((key, i) => (
                        <span key={key} className="flex items-center gap-1">
                          <Kbd>{key}</Kbd>
                          {i < shortcut.secondary.keys.length - 1 && (
                            <span className="text-[10px] font-mono text-win95-dark-shadow">+</span>
                          )}
                        </span>
                      ))}
                      <span className="ml-0.5 text-[10px] font-sans text-win95-dark-shadow">
                        {shortcut.secondary.label}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Win95Window>
    </section>
  );
}
