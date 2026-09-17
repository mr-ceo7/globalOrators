/**
 * Dynamic Jitsi Domain Discovery Service
 * Queries the active infrastructure tunnel domain in real-time,
 * ensuring automatic zero-downtime updates when Cloudflare tunnels rotate.
 */

let cachedJitsiDomain: string | null = null;

export async function fetchLiveJitsiDomain(): Promise<string> {
  if (cachedJitsiDomain) {
    return cachedJitsiDomain;
  }

  const fallbackDomain = (import.meta as any).env?.VITE_JITSI_DOMAIN || 'meet.globalorators.com';

  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return fallbackDomain;
  }

  try {
    const res = await fetch('/api/system/jitsi-domain', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': '1',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.domain && typeof data.domain === 'string') {
        const clean = data.domain.trim().replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
        if (clean.length > 3 && clean !== 'meet.globalorators.com' && !clean.includes('dummy') && !clean.includes('fresh-dynamic')) {
          cachedJitsiDomain = clean;
          return clean;
        }
      }
    }
  } catch {
    // Offline or test environment fallback
  }

  // If local development environment returned default fallback (meet.globalorators.com has no public DNS),
  // automatically query live production API to connect to the active VPS tunnel
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      const prodRes = await fetch('https://coach.globaloratorsproject.com/api/system/jitsi-domain', {
        headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': '1' }
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData?.domain && typeof prodData.domain === 'string') {
          const clean = prodData.domain.trim().replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
          if (clean.length > 3) {
            cachedJitsiDomain = clean;
            return clean;
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }

  return fallbackDomain;
}

export function clearJitsiDomainCache(): void {
  cachedJitsiDomain = null;
}
