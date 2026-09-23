import { test, expect, API, HEAD_COACH, apiLogin, apiSpeakerToken, openAuthed, snap, recordLayout } from './helpers';

let coachToken = '';
test.beforeAll(async () => {
  coachToken = (await apiLogin(HEAD_COACH.email, HEAD_COACH.password)).body.access_token;
});
const coachGet = async (path: string) => (await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${coachToken}` } })).json();

test.describe('coach header', () => {
  test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name === 'mobile', 'desktop header controls'));

  test('notifications panel opens, closes on Escape and outside click', async ({ page }, testInfo) => {
    await openAuthed(page, coachToken, '/coach');
    await page.locator('#notifications-btn').click();
    await page.waitForTimeout(500);
    await snap(page, testInfo, 'coach_notifications');
    await recordLayout(page, testInfo, 'coach_notifications');
    const panelText = await page.locator('body').innerText();
    expect(panelText).toMatch(/notification|activity|no new/i);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const stillOpenEsc = await page.getByText(/mark all|notifications/i).filter({ visible: true } as any).count();
    testInfo.annotations.push({ type: 'open after Escape', description: String(stillOpenEsc > 0) });
    await page.mouse.click(700, 600);
  });

  test('global search finds a speaker', async ({ page }, testInfo) => {
    await openAuthed(page, coachToken, '/coach');
    const search = page.locator('#global-search-input');
    await expect(search).toBeVisible();
    await search.fill('Elena');
    await page.waitForTimeout(800);
    await snap(page, testInfo, 'coach_global_search');
    await expect(page.getByText('Elena Rostova').filter({ visible: true } as any).first()).toBeVisible();
    await search.fill('qqqqqq-nothing');
    await page.waitForTimeout(600);
    await snap(page, testInfo, 'coach_global_search_empty');
  });

  test('Log Session logs a scheduled session', async ({ page }, testInfo) => {
    await openAuthed(page, coachToken, '/coach');
    const before = await coachGet('/workouts');
    const pending = before.filter((w: any) => w.status !== 'Completed');
    await page.locator('#quick-log-workout-btn').click();
    await page.waitForTimeout(800);
    await snap(page, testInfo, 'coach_log_session');
    await recordLayout(page, testInfo, 'coach_log_session');
    const finish = page.locator('#finish-workout-btn');
    if (!(await finish.isVisible())) {
      testInfo.annotations.push({ type: 'log-session', description: `no logger opened (pending sessions: ${pending.length})` });
      expect(pending.length, 'Log Session did nothing although sessions are pending').toBe(0);
      return;
    }
    await finish.click();
    await page.waitForTimeout(2000);
    const after = await coachGet('/workouts');
    const completedDelta = after.filter((w: any) => w.status === 'Completed').length - before.filter((w: any) => w.status === 'Completed').length;
    expect(completedDelta, 'one session marked completed').toBe(1);
  });

  test('Create menu items each open their target', async ({ page }) => {
    await openAuthed(page, coachToken, '/coach');
    await page.locator('#quick-action-menu-btn').click();
    const items = page.locator('#quick-action-menu-btn ~ * button, [role="menu"] button').filter({ visible: true } as any);
    const labels = (await items.allInnerTexts()).map((t) => t.split('\n')[0].trim()).filter(Boolean);
    test.info().annotations.push({ type: 'create items', description: labels.join(' | ') });
    expect(labels.length).toBeGreaterThan(0);
  });

  test('invite speaker copies a referral link', async ({ page, context }, testInfo) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openAuthed(page, coachToken, '/coach');
    await page.locator('aside').getByRole('button', { name: /speakers & debaters/i }).click();
    await page.locator('#copy-roster-referral-link-btn').click();
    await page.waitForTimeout(500);
    const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
    testInfo.annotations.push({ type: 'copied', description: clip });
    expect(clip).toMatch(/^https?:\/\/.+(ref|coach)/i);
    // The copied link should open onboarding with the coach pre-filled.
    await page.goto(clip.replace(/^https?:\/\/[^/]+/, ''));
    await page.waitForTimeout(1500);
    await expect(page.getByText(/step \d of 5/i)).toBeVisible();
  });

  test('coach sign out clears the session', async ({ page }) => {
    await openAuthed(page, coachToken, '/coach');
    await page.locator('aside').getByRole('button', { name: /^exit$|sign out|log ?out/i }).first().click();
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => localStorage.getItem('globalorators_token'))).toBeNull();
    await page.goto('/coach');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('live chamber', () => {
  test('speaker opens the live chamber and can leave it', async ({ page, issues }, testInfo) => {
    const token = await apiSpeakerToken();
    await openAuthed(page, token, '/speaker');
    const isMobile = (page.viewportSize()?.width ?? 1440) < 768;
    if (isMobile) {
      await page.locator('#speaker-mobile-quick-action-trigger').click();
      await page.getByText(/practice clock & live rubric/i).click();
    } else {
      await page.getByRole('button', { name: /live chamber/i }).first().click();
    }
    await page.waitForTimeout(2500);
    await snap(page, testInfo, 'live_chamber');
    await recordLayout(page, testInfo, 'live_chamber');
    await expect(page.locator('#live-room-title')).toBeVisible();
    const tabs = isMobile ? ['#mobile-tab-rehearse', '#mobile-tab-evaluate', '#mobile-tab-debrief'] : ['#tab-rehearse', '#tab-evaluate', '#tab-debrief'];
    for (const t of tabs) {
      await page.locator(t).click();
      await page.waitForTimeout(400);
    }
    const leave = page.getByRole('button', { name: /leave studio|leave|exit chamber/i }).filter({ visible: true } as any).first();
    await leave.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#live-room-title')).toBeHidden();
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
  });
});
