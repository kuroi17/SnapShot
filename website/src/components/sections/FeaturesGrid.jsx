import { motion } from 'framer-motion';
import { Cpu, Zap, GlobeOff, Cable } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: '100% Local AI',
    description: 'ONNX Runtime runs entirely on your machine. No data ever leaves your computer.',
  },
  {
    icon: Zap,
    title: '<100ms Speed',
    description: 'Optimized U²-Net model delivers background removal in under 100 milliseconds.',
  },
  {
    icon: GlobeOff,
    title: 'Zero Cloud Uploads',
    description: 'Your screenshots stay private. No servers, no accounts, no tracking.',
  },
  {
    icon: Cable,
    title: 'Zero Install',
    description: 'Single portable executable. Unzip and run — no installer, no dependencies.',
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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeaturesGrid() {
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
          Everything runs locally. No cloud, no accounts, no compromises.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="win95-bevel-outset group flex flex-col gap-3 bg-win95-bg p-5 text-black transition-all duration-200 hover:translate-y-[-2px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="win95-bevel-inset flex h-8 w-8 items-center justify-center bg-white/30">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-sans text-sm font-bold leading-tight">
                  {feature.title}
                </h3>
              </div>
              <p className="text-[11px] font-sans leading-relaxed text-win95-dark-shadow">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
