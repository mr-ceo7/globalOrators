import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Momentum scrolling for mouse wheels and trackpads on the landing site.
 * Touch keeps native scrolling; skipped for reduced-motion users. Returns a cleanup.
 */
export function startSmoothScroll(): () => void {
  // Needs ResizeObserver (missing in very old browsers and in jsdom tests)
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  let frame = 0;
  const raf = (time: number) => {
    lenis.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(frame);
    lenis.destroy();
  };
}
