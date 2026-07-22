import { motion } from "framer-motion";

import shot1 from "../../assets/Screenshot 2026-07-20 182604.png";
import shot2 from "../../assets/Screenshot 2026-07-22 134726.png";
import shot3 from "../../assets/Screenshot 2026-07-22 134834.png";
import shot4 from "../../assets/Screenshot 2026-07-22 134928.png";
import shot5 from "../../assets/Screenshot 2026-07-22 135127.png";
import shot6 from "../../assets/Screenshot 2026-07-22 140927.png";
import shot7 from "../../assets/Screenshot 2026-07-22 140529.png";

const showcaseItems = [
  {
    id: 1,
    img: shot1,
    title: "AI Cutout Result",
    desc: "Clean transparent PNG",
  },
  {
    id: 2,
    img: shot2,
    title: "Raw Capture Selection",
    desc: "Instant marquee cropping",
  },
  {
    id: 3,
    img: shot3,
    title: "Desktop Utility Interface",
    desc: "Windows system tray app",
  },
  {
    id: 4,
    img: shot4,
    title: "Precision Brush Canvas",
    desc: "Figma-style zoom & pan",
  },
  {
    id: 5,
    img: shot5,
    title: "Live Threshold Adjustment",
    desc: "Edge sensitivity tuning",
  },
  {
    id: 6,
    img: shot6,
    title: "Mobile Floating Bubble",
    desc: "System-wide screen capture",
  },
  {
    id: 7,
    img: shot7,
    title: "Mobile Touch Refinement",
    desc: "On-device AI processing",
  },
];

export function ShowcaseCarousel() {
  // Duplicate array for seamless infinite marquee loop
  const items = [...showcaseItems, ...showcaseItems];

  return (
    <section className="relative w-full overflow-hidden py-8 my-4 border-y border-win95-shadow/30 bg-black/40 backdrop-blur-sm select-none">
      <div className="flex w-full overflow-hidden">
        <motion.div
          className="flex gap-4 items-center pl-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 35,
            ease: "linear",
          }}
          style={{ width: "max-content" }}
        >
          {items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="win95-bevel-outset flex-shrink-0 w-72 md:w-96 bg-win95-bg p-1.5 transition-transform hover:scale-[1.02]"
            >
              <div className="win95-titlebar flex items-center justify-between px-1.5 py-0.5 text-[10px] mb-1 font-retro">
                <span className="truncate">{item.title}</span>
                <span className="text-[9px] opacity-80">{item.desc}</span>
              </div>
              <div className="win95-bevel-inset relative overflow-hidden bg-black aspect-[16/10]">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
