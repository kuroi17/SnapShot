import { motion } from 'framer-motion'
import { GitBranch, Star, GitFork } from 'lucide-react'
import { Win95Window } from '../ui/Win95Window'

export function ContributingSection() {
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
          Open Source
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          SnapShot is free and open source. Contributions, issues, and stars are welcome.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <a
          href="https://github.com/kuroi17/SnapShot"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Win95Window title="kuroi17/SnapShot" className="w-full transition-all duration-200 hover:translate-y-[-2px]">
            <div className="flex items-center gap-4">
              <div className="win95-bevel-inset flex h-12 w-12 items-center justify-center bg-white/30">
                <GitBranch className="h-6 w-6 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-sans font-bold leading-tight text-black">
                  kuroi17/SnapShot
                </p>
                <p className="mt-0.5 text-[10px] font-sans leading-relaxed text-win95-dark-shadow">
                  Open-source screen capture with AI background removal
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-win95-shadow/20 pt-3">
              <span className="flex items-center gap-1 text-[10px] font-mono text-win95-dark-shadow">
                <Star className="h-3 w-3" />
                Star on GitHub
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-win95-dark-shadow">
                <GitFork className="h-3 w-3" />
                Fork
              </span>
            </div>
          </Win95Window>
        </a>
      </motion.div>
    </section>
  )
}