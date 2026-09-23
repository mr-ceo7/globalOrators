import fs from 'fs';
import type { Page } from '@playwright/test';
import { test, apiLogin, apiSpeakerToken, openAuthed, skipSplash, clickEffect } from './helpers';

/**
 * Clicks every visible button/link on every screen, one at a time from a fresh state, and
 * records controls that produce no observable effect (no DOM change, request, navigation,
 * popup or dialog). Destructive controls are skipped here and covered in the flow specs.
 */
const SKIP = /delete|remove|archive|log ?out|sign ?out|deactivate|revoke|end call|leave/i;

type Opener = (page: Page) => Promise<void>;

async function controls(page: Page) {
  return page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, a[href], [role="button"], [role="tab"]')) as HTMLElement[];
    return els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return el.offsetParent !== null && r.width > 0 && r.height > 0 && !(el as HTMLButtonElement).disabled;
      })
      .map((el, i) => ({
        i,
        sig: `${el.tagName}|${el.id}|${(el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 60)}`,
        href: el.getAttribute('href') || '',
      }));
  });
}

function nth(page: Page, i: number) {
  return page.locator('button, a[href], [role="button"], [role="tab"]').filter({ visible: true } as any).filter({ hasNot: page.locator('[disabled]') } as any).nth(i);
}

async function probeScreen(page: Page, screen: string, open: Opener, project: string) {
  await open(page);
  const list = await controls(page);
  const results: any[] = [];
  let dirty = false;
  for (const c of list) {
    if (SKIP.test(c.sig)) { results.push({ ...c, skipped: true }); continue; }
    if (c.href.startsWith('mailto:') || c.href.startsWith('tel:')) { results.push({ ...c, external: c.href }); continue; }
    if (dirty) { await open(page); dirty = false; }
    const now = await controls(page);
    const idx = now.findIndex((x) => x.sig === c.sig);
    if (idx < 0) { results.push({ ...c, missingAfterReload: true }); continue; }
    const eff = await clickEffect(page, nth(page, idx));
    const dead = !eff.clickError && eff.mut === 0 && eff.reqs.length === 0 && !eff.urlChanged && !eff.popup && !eff.dialog;
    results.push({ ...c, ...eff, reqs: eff.reqs.slice(0, 5), dead });
    if (!dead) dirty = true;
  }
  fs.mkdirSync('e2e/.run/probe', { recursive: true });
  fs.writeFileSync(`e2e/.run/probe/${project}__${screen}.json`, JSON.stringify(results, null, 2));
  return results;
}

const PUBLIC = ['/', '/about', '/academy', '/foundation', '/escapism', '/tournaments', '/testimonials', '/contact', '/speaker', '/coach', '/onboarding'];

for (const route of PUBLIC) {
  test(`probe public ${route}`, async ({ page }, testInfo) => {
    test.setTimeout(15 * 60_000);
    const open: Opener = async (p) => {
      await p.goto(route, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(1200);
      await skipSplash(p);
    };
    await probeScreen(page, `public${route === '/' ? '_home' : route.replace(/\//g, '_')}`, open, testInfo.project.name);
  });
}

const COACH_TABS_DESKTOP = ['Dashboard', 'Speakers & Debaters', 'Faculty Coaches', 'Curriculum Builder', 'Drill & Speech Library', 'Session Schedule', 'Speech Analytics', 'Messenger'];

test.describe('coach', () => {
  let token = '';
  test.beforeAll(async () => { token = (await apiLogin()).body.access_token; });
  for (const tab of COACH_TABS_DESKTOP) {
    test(`probe coach ${tab}`, async ({ page }, testInfo) => {
      test.setTimeout(20 * 60_000);
      const mobile = testInfo.project.name === 'mobile';
      const open: Opener = async (p) => {
        await openAuthed(p, token, '/coach');
        if (tab === 'Dashboard') return;
        if (!mobile) {
          await p.locator('aside').getByRole('button', { name: new RegExp(tab.replace('&', '.'), 'i') }).first().click();
        } else {
          const ids: Record<string, string> = { 'Speakers & Debaters': 'mobile-nav-clients', 'Session Schedule': 'mobile-nav-calendar', Messenger: 'mobile-nav-messenger' };
          if (ids[tab]) await p.locator(`#${ids[tab]}`).click();
          else {
            const quick: Record<string, string> = { 'Curriculum Builder': 'Curriculum Builder', 'Drill & Speech Library': 'Drill Catalog', 'Speech Analytics': 'Speech Analytics' };
            test.skip(!quick[tab], 'not reachable on mobile (reported separately)');
            await p.locator('button[title="Quick Actions"]').click();
            await p.getByText(quick[tab], { exact: true }).last().click();
          }
        }
        await p.waitForTimeout(1200);
      };
      await probeScreen(page, `coach_${tab.replace(/\W+/g, '_')}`, open, testInfo.project.name);
    });
  }
});

const SPEAKER_TABS: [string, string, RegExp | null][] = [
  // [label, tab id, quick-action text on mobile (null = in the bottom bar)]
  ["Today's Rehearsal", 'today', null],
  ['Daily Drill Studio', 'practice', null],
  ['Vault', 'catharsis', /recordings & debriefs/i],
  ['Syllabus', 'schedule', /consultation calendar/i],
  ['Daily Orator Rituals', 'habits', null],
  ['Speech Analytics', 'progress', /wpm & clarity/i],
  ['Messenger', 'coach', null],
];

test.describe('speaker', () => {
  let token = '';
  test.beforeAll(async () => { token = await apiSpeakerToken(); });
  for (const [label, id, quick] of SPEAKER_TABS) {
    test(`probe speaker ${label}`, async ({ page }, testInfo) => {
      test.setTimeout(20 * 60_000);
      const mobile = testInfo.project.name === 'mobile';
      const open: Opener = async (p) => {
        await openAuthed(p, token, '/speaker');
        if (id === 'today') return;
        if (!mobile) await p.locator(`#speaker-nav-${id}`).click();
        else if (quick) {
          await p.locator('#speaker-mobile-quick-action-trigger').click();
          await p.getByText(quick).click();
        } else await p.locator(`#speaker-mobile-nav-${id}`).click();
        await p.waitForTimeout(1200);
      };
      await probeScreen(page, `speaker_${label.replace(/\W+/g, '_')}`, open, testInfo.project.name);
    });
  }
});
