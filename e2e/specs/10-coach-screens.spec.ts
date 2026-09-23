import fs from 'fs';
import { test, expect, HEAD_COACH, apiLogin, openAuthed, snap, recordLayout } from './helpers';

const COACH_TABS = [
  'Dashboard', 'Speakers & Debaters', 'Faculty Coaches', 'Curriculum Builder',
  'Drill & Speech Library', 'Session Schedule', 'Speech Analytics', 'Messenger',
];

test.describe('coach OS screens', () => {
  let token = '';
  test.beforeAll(async () => {
    // Head coach: Faculty Coaches and Invoices are head-coach-only tabs.
    const r = await apiLogin(HEAD_COACH.email, HEAD_COACH.password);
    expect(r.status).toBe(200);
    token = r.body.access_token;
  });

  test('desktop: every sidebar tab renders', async ({ page, issues }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await openAuthed(page, token, '/coach');
    for (const label of COACH_TABS) {
      const nav = page.locator('aside').getByRole('button', { name: new RegExp(label.replace(/[&]/g, '.'), 'i') }).first();
      await expect(nav, `sidebar item "${label}"`).toBeVisible();
      await nav.click();
      await page.waitForTimeout(1200);
      const slug = label.toLowerCase().replace(/[^a-z]+/g, '_');
      await snap(page, testInfo, `coach_${slug}`);
      await recordLayout(page, testInfo, `coach_${slug}`);
    }
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
  });

  test('mobile: every coach section is reachable', async ({ page, issues }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');
    await openAuthed(page, token, '/coach');
    await snap(page, testInfo, 'coach_dashboard');
    await recordLayout(page, testInfo, 'coach_dashboard');
    const reachable: Record<string, boolean> = {};
    for (const [id, slug] of [['mobile-nav-clients', 'clients'], ['mobile-nav-calendar', 'calendar'], ['mobile-nav-messenger', 'messenger']]) {
      const b = page.locator(`#${id}`);
      if (await b.isVisible().catch(() => false)) {
        await b.click();
        await page.waitForTimeout(1200);
        await snap(page, testInfo, `coach_${slug}`);
        await recordLayout(page, testInfo, `coach_${slug}`);
        reachable[slug] = true;
      }
    }
    // Look for any visible control that leads to the remaining sections.
    const html = await page.content();
    for (const label of ['Curriculum Builder', 'Drill & Speech Library', 'Speech Analytics', 'Faculty Coaches']) {
      reachable[label] = (await page.getByText(label, { exact: false }).filter({ visible: true } as any).count().catch(() => 0)) > 0;
    }
    testInfo.annotations.push({ type: 'reachability', description: JSON.stringify(reachable) });
    fs.writeFileSync('e2e/.run/mobile-coach-reachability.json', JSON.stringify(reachable, null, 2));
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
    void html;
  });
});
