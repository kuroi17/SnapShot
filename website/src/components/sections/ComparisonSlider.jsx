import { useRef, useState, useCallback, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

export function ComparisonSlider() {
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMove = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback((e) => {
    setDragging(true);
    handleMove(e.clientX);
    e.preventDefault();
  }, [handleMove]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => handleMove(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, handleMove]);

  return (
    <section className="flex flex-col items-center px-4 py-24">
      <div className="mb-8 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-cyan">
          See the Difference
        </span>
        <h2 className="mt-2 font-sans text-2xl font-bold tracking-tight text-text-main md:text-3xl">
          Raw capture vs AI cutout
        </h2>
      </div>

      <div className="w-full max-w-2xl">
        <div
          ref={containerRef}
          className="win95-bevel-inset relative cursor-ew-resize overflow-hidden select-none bg-dark-card"
          style={{ aspectRatio: '16/10' }}
          onPointerDown={onPointerDown}
          role="slider"
          aria-label="Image comparison slider"
          aria-valuenow={Math.round(sliderPos)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setSliderPos((p) => Math.min(100, p + 2));
            if (e.key === 'ArrowLeft') setSliderPos((p) => Math.max(0, p - 2));
          }}
        >
          <img
            src="/Visualization.jpg"
            alt="Original raw screenshot capture"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="/Visualization.jpg"
              alt="Background removed cutout"
              className="absolute top-0 left-0 h-full w-full object-cover"
              style={{
                filter: 'contrast(1.1) saturate(1.1) brightness(1.05)',
                width: `calc(100% / ${sliderPos / 100})`,
                maxWidth: 'none',
              }}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 to-transparent pointer-events-none" />
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xl">
              <MoveHorizontal className="h-4 w-4 text-black" />
            </div>
          </div>

          <span className="absolute bottom-2 left-2 rounded win95-bevel-inset bg-win95-bg px-1.5 py-0.5 text-[10px] font-mono text-black select-none">
            Raw Capture
          </span>
          <span className="absolute bottom-2 right-2 rounded win95-bevel-inset bg-win95-bg px-1.5 py-0.5 text-[10px] font-mono text-black select-none">
            Cutout
          </span>
        </div>
      </div>
    </section>
  );
}
