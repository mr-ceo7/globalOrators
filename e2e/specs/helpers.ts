import { test as base, expect, Page, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const API = `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || 8105}/api`;
export const COACH = { email: 'coach@globalorators.com', password: 'CoachSecurePassword123' };
// coach-1 is the seeded head coach that owns the seeded speakers. start-e2e-servers.sh pins its
// credentials via DEFAULT_COACH_EMAIL / DEFAULT_COACH_PASSWORD so the suite never depends on .env.
export const HEAD_COACH = {
  email: process.env.E2E_HEAD_EMAIL || 'head.coach@e2e.test',
  password: process.env.E2E_HEAD_PASSWORD || 'E2eHeadCoach!2026',
};
// Pinned by start-e2e-servers.sh.
export const COACH_INVITE_CODE = 'e2e-faculty-invite';
export const SPEAKER_EMAIL = 'marcus.vance@example.com';
// TESTING=true backend accepts this OTP for any issued code (see backend/app/routers/auth.py).
export const TEST_OTP = '123456';


/**
 * Injected into every page: WCAG contrast of an element's text against its effective
 * background (alpha-blended through ancestors), plus a page-wide scan of low-contrast text.
 */
const CONTRAST_SCRIPT = `
(() => {
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bottom) => { const a = top[3]; return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1]; };
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // gradients/images: skip
      const c = parse(cs.backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    let acc = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) acc = blend(layers[i], acc);
    return acc;
  };
  window.__contrastOf = (el) => {
    const cs = getComputedStyle(el); let fg = parse(cs.color); const bg = bgOf(el);
    if (!fg || !bg) return 21;
    const op = parseFloat(cs.opacity); if (fg[3] < 1 || op < 1) fg = blend([fg[0], fg[1], fg[2], fg[3] * op], bg);
    const a = lum(fg), b = lum(bg); return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  };
  window.__lowContrast = (min = 3) => {
    const out = []; const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const txt = t.textContent.trim(); const el = t.parentElement;
      if (!txt || txt.length < 2 || !el || seen.has(el) || !el.offsetParent) continue; seen.add(el);
      const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
      const ratio = window.__contrastOf(el);
      if (ratio < min) out.push({ text: txt.slice(0, 50), ratio, color: getComputedStyle(el).color, cls: String(el.className).slice(0, 90) });
    }
    return out;
  };
})();
`;

type Issue = { kind: string; detail: string; url?: string };

/**
 * Collects console errors, uncaught exceptions and failed API responses for every test and
 * attaches them to the report. Tests fail on uncaught page errors; the rest are recorded
 * as findings so one noisy request does not hide the remaining checks.
 */
export const test = base.extend<{ issues: Issue[] }>({
  issues: [async ({ page }, use, testInfo) => {
    const issues: Issue[] = [];
    await page.addInitScript(CONTRAST_SCRIPT);
    if (process.env.E2E_THEME) await page.addInitScript((t) => { try { localStorage.setItem('globalorators_theme', t); } catch {} }, process.env.E2E_THEME);
    page.on('console', (msg) => {
      if (msg.type() === 'error') issues.push({ kind: 'console', detail: msg.text().slice(0, 400), url: page.url() });
    });
    page.on('pageerror', (err) => issues.push({ kind: 'pageerror', detail: `${err.message}\n${err.stack?.split('\n').slice(0, 4).join('\n')}`, url: page.url() }));
    page.on('response', (res) => {
      const u = res.url();
      if (u.includes('/api/') && res.status() >= 400) {
        issues.push({ kind: `http ${res.status()}`, detail: `${res.request().method()} ${u.replace(/^https?:\/\/[^/]+/, '')}`, url: page.url() });
      }
    });
    page.on('requestfailed', (req) => {
      const f = req.failure()?.errorText || '';
      if (!f.includes('ERR_ABORTED')) issues.push({ kind: 'requestfailed', detail: `${req.url()} ${f}` });
    });
    await use(issues);
    recordIssues(testInfo, issues);
  }, { auto: true }],
});

function recordIssues(testInfo: TestInfo, issues: Issue[]) {
  if (!issues.length) return;
  const dir = path.join('e2e/.run/issues');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${testInfo.project.name}__${testInfo.titlePath.slice(1).join(' > ').replace(/[^\w.-]+/g, '_')}.json`);
  fs.writeFileSync(file, JSON.stringify(issues, null, 2));
  testInfo.annotations.push({ type: 'issues', description: `${issues.length} runtime issue(s)` });
}

export { expect };

export async function skipSplash(page: Page) {
  // Coach OS shows a ~2.2s splash; Escape dismisses it.
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
}

/** Layout heuristics that apply to every screen. Returns human-readable problems. */
export async function layoutAudit(page: Page) {
  return page.evaluate(() => {
    const problems: string[] = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1) {
      const offenders = Array.from(document.querySelectorAll('body *'))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 0 && r.right > vw + 1 && cs.position !== 'fixed' && !el.closest('[class*="overflow-x"]');
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).split(' ').slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
      problems.push(`horizontal overflow: scrollWidth ${document.documentElement.scrollWidth} > ${vw}; ${offenders.join(' | ')}`);
    }
    const unnamed = Array.from(document.querySelectorAll('button, a[href], [role="button"]')).filter((el) => {
      const h = el as HTMLElement;
      if (!h.offsetParent) return false;
      const name = (h.getAttribute('aria-label') || h.innerText || h.getAttribute('title') || '').trim();
      return !name && !h.querySelector('img[alt]:not([alt=""])');
    });
    if (unnamed.length) problems.push(`${unnamed.length} visible button/link(s) without accessible name: ${unnamed.slice(0, 4).map((e) => e.outerHTML.slice(0, 120)).join(' || ')}`);
    const unlabeled = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea')).filter((el) => {
      const h = el as HTMLInputElement;
      if (!h.offsetParent) return false;
      const byFor = h.id && document.querySelector(`label[for="${CSS.escape(h.id)}"]`);
      return !h.closest('label') && !byFor && !h.getAttribute('aria-label') && !h.getAttribute('aria-labelledby') && !h.title;
    });
    if (unlabeled.length) problems.push(`${unlabeled.length} form field(s) without a programmatic label: ${unlabeled.slice(0, 4).map((e) => (e as HTMLInputElement).placeholder || e.tagName.toLowerCase()).join(' | ')}`);
    const noAlt = Array.from(document.querySelectorAll('img:not([alt])')).filter((i) => (i as HTMLElement).offsetParent);
    if (noAlt.length) problems.push(`${noAlt.length} image(s) missing alt: ${noAlt.slice(0, 3).map((i) => (i as HTMLImageElement).src.slice(-60)).join(', ')}`);
    const broken = Array.from(document.querySelectorAll('img')).filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 0 && (i as HTMLElement).offsetParent && (i as HTMLImageElement).src);
    if (broken.length) problems.push(`${broken.length} broken image(s): ${broken.slice(0, 3).map((i) => (i as HTMLImageElement).src.slice(-80)).join(', ')}`);
    if (vw < 600) {
      const tiny = Array.from(document.querySelectorAll('button, a[href], input, select, [role="button"]')).filter((el) => {
        const r = el.getBoundingClientRect();
        return (el as HTMLElement).offsetParent && r.width > 0 && (r.width < 24 || r.height < 24);
      });
      if (tiny.length) problems.push(`${tiny.length} tap target(s) under 24px: ${tiny.slice(0, 4).map((e) => ((e as HTMLElement).innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30)).join(', ')}`);
    }
    return problems;
  });
}

export async function snap(page: Page, testInfo: TestInfo, name: string) {
  const dir = path.join('e2e/.run/shots' + (process.env.E2E_THEME ? `-${process.env.E2E_THEME}` : ''), testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

export async function recordLayout(page: Page, testInfo: TestInfo, name: string) {
  const problems = await layoutAudit(page);
  const low = await page.evaluate(() => (window as any).__lowContrast?.(3) ?? []).catch(() => []);
  if (low.length) problems.push(`${low.length} text element(s) below 3:1 contrast: ${low.slice(0, 6).map((l: any) => `"${l.text}" ${l.ratio}:1 (${l.color})`).join(' | ')}`);
  const dir = path.join('e2e/.run/layout' + (process.env.E2E_THEME ? `-${process.env.E2E_THEME}` : ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${testInfo.project.name}__${name}.json`), JSON.stringify(problems, null, 2));
  return problems;
}

export async function apiLogin(email = COACH.email, password = COACH.password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Logs the coach in through the real UI. */
export async function loginCoachUI(page: Page) {
  await page.goto('/coach');
  await skipSplash(page);
  // Two-step form: email check, then password.
  await page.locator('input[type="email"]').first().fill(COACH.email);
  await page.locator('button[type="submit"]').first().click();
  await page.locator('input[type="password"]').first().fill(COACH.password);
  await page.locator('button[type="submit"]').first().click();
  await page.getByText(/dashboard/i).first().waitFor({ timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await skipSplash(page);
}

export async function apiSpeakerToken(email = SPEAKER_EMAIL) {
  await fetch(`${API}/auth/otp/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  const res = await fetch(`${API}/auth/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code: TEST_OTP }) });
  const body = await res.json();
  if (!body?.access_token) throw new Error(`speaker login failed: ${res.status} ${JSON.stringify(body)}`);
  return body.access_token as string;
}

/** Fast auth: inject a JWT the same way apiClient stores it, then open the portal path. */
export async function openAuthed(page: Page, token: string, path: '/coach' | '/speaker') {
  await page.goto('/404-blank-bootstrap', { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => { localStorage.clear(); localStorage.setItem('globalorators_token', t); }, token);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await skipSplash(page);
  await page.waitForTimeout(1000);
}

/**
 * Clicks an element and reports whether anything observable happened within `ms`:
 * DOM change, network request, URL change, popup or dialog. Used to find dead buttons.
 */
export async function clickEffect(page: Page, locator: import('@playwright/test').Locator, ms = 1200) {
  const reqs: string[] = [];
  const onReq = (r: import('@playwright/test').Request) => { if (!/\.(png|jpe?g|webp|svg|woff2?)$/.test(r.url())) reqs.push(`${r.method()} ${r.url()}`); };
  let popup = false, dialog = false;
  const onPopup = () => { popup = true; };
  const onDialog = (d: import('@playwright/test').Dialog) => { dialog = true; d.dismiss().catch(() => {}); };
  page.on('request', onReq); page.on('popup', onPopup); page.on('dialog', onDialog);
  const urlBefore = page.url();
  await page.evaluate(() => {
    (window as any).__mut = 0;
    (window as any).__mo?.disconnect();
    (window as any).__mo = new MutationObserver((ms) => {
      for (const m of ms) if (m.type === 'childList' || m.type === 'characterData' || (m.type === 'attributes' && m.attributeName !== 'style')) (window as any).__mut++;
    });
    (window as any).__mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
  });
  let clickError = '';
  await locator.click({ timeout: 3000 }).catch((e) => { clickError = String(e.message).split('\n')[0]; });
  await page.waitForTimeout(ms);
  const mut = await page.evaluate(() => (window as any).__mut ?? 0).catch(() => -1);
  page.off('request', onReq); page.off('popup', onPopup); page.off('dialog', onDialog);
  return { mut, reqs, urlChanged: page.url() !== urlBefore, popup, dialog, clickError };
}
