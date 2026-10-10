import React, { useEffect, useRef } from 'react';

// Every line is a claim already made elsewhere on the homepage
const highlights = [
  'PAUDC 2026 — Overall Champions',
  'WUDC 2026 — Grand Finalists',
  'Harvard WorldMUN 2026 — Best Delegation',
  '1,450+ Youth Trained',
  '48 Partner Institutions',
  '16 Tournament Squads',
  '100% Grant-Funded Fellowships',
  'Kenya · Uganda · Ghana · South Africa',
];

const Star: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 20 20" className={`w-3 h-3 shrink-0 ${className}`} aria-hidden="true">
    <path d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" fill="currentColor" />
  </svg>
);

// One strip of tape: drifts on its own, speeds up with scroll speed and follows scroll direction
const Strip: React.FC<{ className: string; starClass: string; direction: 1 | -1 }> = ({ className, starClass, direction }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let x = 0;
    let lastY = window.scrollY;
    let boost = 0;
    let visible = false;

    const tick = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      // Capped so jump-scrolls (anchor links) don't fling the strip
      boost = Math.max(-6, Math.min(6, boost * 0.9 + delta * 0.08));
      x -= direction * ((delta < 0 ? -1 : 1) * 0.45 + boost);
      const half = track.scrollWidth / 2;
      if (half > 0) x = ((x % half) - half) % half;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      if (visible) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        lastY = window.scrollY;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(track);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [direction]);

  const items = [...highlights, ...highlights];
  return (
    <div className={`overflow-hidden py-3 ${className}`}>
      <div ref={trackRef} className="flex w-max items-center gap-6 will-change-transform">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6 whitespace-nowrap" aria-hidden={i >= highlights.length}>
            <span className="font-mono font-bold text-[11px] sm:text-xs tracking-widest uppercase">{item}</span>
            <Star className={starClass} />
          </span>
        ))}
      </div>
    </div>
  );
};

/** Two crossed strips of highlights laid over the seam between two bands. */
export const HighlightTicker: React.FC = () => (
  <div className="relative z-20 h-0" role="region" aria-label="Highlights">
    <div className="absolute left-0 right-0 -top-12 h-24 overflow-x-clip">
      <div className="absolute -left-8 -right-8 top-0">
        <Strip className="bg-[#C89630] text-[#181B1F] rotate-[2.2deg] shadow-[0_6px_16px_rgba(0,0,0,0.18)]" starClass="text-[#181B1F]" direction={-1} />
      </div>
      <div className="absolute -left-8 -right-8 top-11">
        <Strip className="bg-[#181B1F] text-[#E3B95C] -rotate-[1.8deg] shadow-[0_10px_24px_rgba(0,0,0,0.3)]" starClass="text-[#C89630]" direction={1} />
      </div>
    </div>
  </div>
);
