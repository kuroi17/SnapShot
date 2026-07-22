import { motion } from 'framer-motion'
import { Cpu, Zap, GlobeOff, Cable } from 'lucide-react'
import { Win95Window } from '../ui/Win95Window'

const items = [
  {
    icon: Cpu,
    title: '100% Local AI Background Removal',
    desc: 'ONNX Runtime with u2netp runs entirely on your machine. No data ever leaves your computer.',
    keys: null,
  },
  {
    icon: Zap,
    title: '<100ms Inference Speed',
    desc: 'Optimized ONNX model delivers background removal in under 100 milliseconds on any modern GPU.',
    keys: null,
  },
  {
    icon: GlobeOff,
    title: 'Zero Cloud Uploads',
    desc: 'Your screenshots stay private. No servers, no accounts, no tracking, no data leaks.',
    keys: null,
  },
  {
    icon: Cable,
    title: 'Zero Install',
    desc: 'Single portable executable. Unzip and run — no installer, no dependencies, no registry.',
    keys: null,
  },
]

const shortcuts = [
  { keys: ['Ctrl', 'Shift', 'S'], label: 'Global Screen Capture' },
  { keys: ['Ctrl', 'C'], label: 'Instant Copy & Close' },
  { keys: ['Ctrl', 'Z'], label: 'Undo', secondary: { keys: ['Ctrl', 'Y'], label: 'Redo' } },
  { keys: ['Ctrl', 'Drag'], label: 'Fig‑style Canvas Pan' },
]

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[10px] font-mono leading-none select-none border-t-[2px] border-l-[2px] border-r-[2px] border-b-[2px] border-t-win95-light border-l-win95-light border-r-win95-dark-shadow border-b-win95-dark-shadow bg-win95-bg text-black">
      {children}
    </kbd>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function FeaturesAndShortcuts() {
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
          Built for speed, designed for privacy
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          Everything runs locally. Every action is one keystroke away.
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
          {items.map((item, i) => {
            const Icon = item.icon
            const sc = shortcuts[i]
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="win95-bevel-outset flex flex-col gap-3 bg-win95-bg p-4 text-black transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="win95-bevel-inset flex h-8 w-8 items-center justify-center bg-white/30">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-sans text-sm font-bold leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[11px] font-sans leading-relaxed text-win95-dark-shadow">
                  {item.desc}
                </p>
                {sc && (
                  <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-win95-shadow/20 pt-2">
                    {sc.keys.map((key, i) => (
                      <span key={key} className="flex items-center gap-1">
                        <Kbd>{key}</Kbd>
                        {i < sc.keys.length - 1 && (
                          <span className="text-[10px] font-mono text-win95-dark-shadow">+</span>
                        )}
                      </span>
                    ))}
                    <span className="ml-1 text-[10px] font-sans font-bold text-win95-dark-shadow">
                      {sc.label}
                    </span>
                    {sc.secondary && (
                      <span className="ml-1.5 flex items-center gap-1 border-l border-win95-shadow/20 pl-1.5">
                        {sc.secondary.keys.map((key, i) => (
                          <span key={key} className="flex items-center gap-1">
                            <Kbd>{key}</Kbd>
                            {i < sc.secondary.keys.length - 1 && (
                              <span className="text-[10px] font-mono text-win95-dark-shadow">+</span>
                            )}
                          </span>
                        ))}
                        <span className="text-[10px] font-sans font-bold text-win95-dark-shadow">
                          {sc.secondary.label}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </Win95Window>
    </section>
  )
}