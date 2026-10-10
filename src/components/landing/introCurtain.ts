const SEEN_KEY = 'globalorators_intro_seen';

/** Decided once, synchronously, so the hero can delay its own entrance to match. */
export function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage blocked: the curtain simply plays again next visit
  }
}

/** Seconds the hero waits so its entrance plays as the curtain lifts. */
export const INTRO_HERO_DELAY = 1.15;
