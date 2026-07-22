import { useEffect, useRef } from 'react';

export function WavyGridBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      const step = 45;
      const cols = Math.ceil(canvas.width / step) + 2;
      const rows = Math.ceil(canvas.height / step) + 2;

      // Vertical wavy grid lines
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        const baseX = c * step;
        for (let y = 0; y <= canvas.height + step; y += 15) {
          const waveX =
            Math.sin(y * 0.008 + time + c * 0.2) * 18 +
            Math.cos(y * 0.004 - time * 0.8) * 12;
          const x = baseX + waveX;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Horizontal wavy grid lines
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        const baseY = r * step;
        for (let x = 0; x <= canvas.width + step; x += 15) {
          const waveY =
            Math.sin(x * 0.008 + time + r * 0.2) * 18 +
            Math.cos(x * 0.004 - time * 0.8) * 12;
          const y = baseY + waveY;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
    />
  );
}
