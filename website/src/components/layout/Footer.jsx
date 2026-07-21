import { useState, useEffect } from 'react';

export function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    }
    updateClock();
    const id = setInterval(updateClock, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="win95-bevel-outset fixed bottom-0 left-0 right-0 z-50 flex h-8 items-center bg-win95-bg px-2 py-0.5 text-black">
      <button className="win95-bevel-outset flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-sans font-bold leading-none cursor-pointer select-none active:win95-bevel-inset">
        <span className="text-[13px] leading-none">⧉</span>
        Start
      </button>

      <div className="mx-2 h-5 w-px bg-win95-shadow" />

      <span className="text-[11px] font-sans leading-none text-black/70 select-none">
        SnapShot — Capture. Refine. Share.
      </span>

      <div className="ml-auto flex items-center gap-1">
        <span className="text-[11px] font-sans leading-none text-black/50 select-none hidden sm:inline">
          © {new Date().getFullYear()} kuroi17
        </span>
        <div className="win95-bevel-inset flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-sans leading-none select-none">
          <span className="text-[10px]">🔊</span>
          <span className="font-mono text-[10px] tracking-wide">{time || '--:--'}</span>
        </div>
      </div>
    </footer>
  );
}
