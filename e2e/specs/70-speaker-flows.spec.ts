import type { Page } from '@playwright/test';
import { test, expect, API, apiSpeakerToken, openAuthed, snap, recordLayout } from './helpers';

/** Speaker app flows as seeded speaker Marcus Vance, with a fake microphone. */
test.use({
  permissions: ['microphone'],
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
});

let token = '';
let clientId = '';
test.beforeAll(async () => {
  token = await apiSpeakerToken();
  clientId = (await (await fetch(`${API}/clients/me`, { headers: { Authorization: `Bearer ${token}` } })).json()).id;
});
const apiGet = async (path: string) => (await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } })).json();
const uid = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

type Tab = 'today' | 'practice' | 'catharsis' | 'schedule' | 'habits' | 'progress' | 'coach';
const QUICK: Partial<Record<Tab, RegExp>> = { catharsis: /recordings & debriefs/i, progress: /wpm & clarity/i, schedule: /consultation calendar/i };

async function goSpeakerTab(page: Page, tab: Tab) {
  const isMobile = (page.viewportSize()?.width ?? 1440) < 768;
  if (!isMobile) {
    await page.locator(`#speaker-nav-${tab}`).click();
  } else if (QUICK[tab]) {
    await page.locator('#speaker-mobile-quick-action-trigger').click();
    await page.getByText(QUICK[tab]!).click();
  } else {
    await page.locator(`#speaker-mobile-nav-${tab}`).click();
  }
  await page.waitForTimeout(900);
}

test('every speaker tab renders without errors', async ({ page, issues }, testInfo) => {
  await openAuthed(page, token, '/speaker');
  for (const tab of ['today', 'practice', 'catharsis', 'schedule', 'habits', 'progress', 'coach'] as Tab[]) {
    await goSpeakerTab(page, tab);
    await snap(page, testInfo, `speaker_${tab}`);
    await recordLayout(page, testInfo, `speaker_${tab}`);
  }
  expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
});

test('voice recording uploads with the real duration and can be deleted', async ({ page }, testInfo) => {
  await openAuthed(page, token, '/speaker');
  await goSpeakerTab(page, 'practice');
  const before = await apiGet(`/recordings?clientId=${clientId}`);
  await page.getByRole('button', { name: /start voice recording/i }).click();
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: /stop rehearsal recording/i }).click();
  await page.waitForTimeout(3000);
  await snap(page, testInfo, 'speaker_after_recording');
  const after = await apiGet(`/recordings?clientId=${clientId}`);
  expect(after.length, 'recording uploaded').toBe(before.length + 1);
  const rec = after.find((r: any) => !before.some((b: any) => b.id === r.id));
  const secs = rec.duration_seconds ?? rec.durationSeconds ?? rec.duration;
  testInfo.annotations.push({ type: 'stored duration', description: String(secs) });
  expect(secs, 'stored duration of a ~3.5s recording').toBeGreaterThanOrEqual(2);

  // Stream endpoint serves the audio to its owner.
  const stream = await fetch(`${API}/recordings/${rec.id}/stream`, { headers: { Authorization: `Bearer ${token}` } });
  expect(stream.status).toBe(200);
  // Another speaker must not be able to stream it.
  const other = await apiSpeakerToken('elena.rostova@example.com');
  expect((await fetch(`${API}/recordings/${rec.id}/stream`, { headers: { Authorization: `Bearer ${other}` } })).status).toBeGreaterThanOrEqual(403);

  await fetch(`${API}/recordings/${rec.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
});

test('microphone denied shows a helpful message', async ({ browser }, testInfo) => {
  const ctx = await browser.newContext({ ...testInfo.project.use, permissions: [] });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
  });
  await openAuthed(page, token, '/speaker');
  await goSpeakerTab(page, 'practice');
  await page.getByRole('button', { name: /start voice recording/i }).click();
  await expect(page.getByText(/microphone permission required/i)).toBeVisible();
  await ctx.close();
});

test('journal: empty entry blocked, entry persists and renders safely', async ({ page }, testInfo) => {
  await openAuthed(page, token, '/speaker');
  await goSpeakerTab(page, 'catharsis');
  const box = page.getByPlaceholder(/write or summarize what you vocalized/i);
  await expect(box).toBeVisible();
  const before = (await apiGet(`/journals?clientId=${clientId}`)).length;
  await box.fill('   ');
  // Nothing to save: the button stays disabled rather than silently doing nothing.
  await expect(box.locator('xpath=ancestor::form').locator('button[type="submit"]')).toBeDisabled();
  expect((await apiGet(`/journals?clientId=${clientId}`)).length, 'whitespace journal saved').toBe(before);

  const id = uid();
  await box.fill(`E2E reflection ${id} <img src=x onerror="window.__xss=1">`);
  await box.locator('xpath=ancestor::form').locator('button[type="submit"]').click();
  await expect(page.getByText(`E2E reflection ${id}`).filter({ visible: true } as any).first()).toBeVisible();
  await expect.poll(async () => (await apiGet(`/journals?clientId=${clientId}`)).length).toBe(before + 1);
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  await page.reload();
  await page.keyboard.press('Escape');
  await goSpeakerTab(page, 'catharsis');
  await expect(page.getByText(`E2E reflection ${id}`).filter({ visible: true } as any).first(), 'journal visible after reload').toBeVisible();
});

test('assigned rituals are listed today and a toggle persists', async ({ page }, testInfo) => {
  await openAuthed(page, token, '/speaker');
  await goSpeakerTab(page, 'habits');
  await recordLayout(page, testInfo, 'speaker_habits');
  const logs = await apiGet(`/habits?clientId=${clientId}`);
  const assigned = new Set(logs.flatMap((l: any) => (l.habits || []).map((h: any) => h.title)));
  testInfo.annotations.push({ type: 'rituals assigned on server', description: [...assigned].join(', ') || '(none)' });
  test.skip(assigned.size === 0, 'speaker has no rituals');
  await expect(page.getByText(/no daily orator rituals active/i), 'assigned rituals missing from today view').toHaveCount(0);
  const first = [...assigned][0] as string;
  await page.getByText(first).filter({ visible: true } as any).first().click();
  await page.waitForTimeout(1500);
  const today = new Date().toISOString().split('T')[0];
  const todayLog = (await apiGet(`/habits?clientId=${clientId}`)).find((l: any) => l.date === today);
  expect(todayLog, 'today log created on toggle').toBeTruthy();
});

test('message to coach: blank blocked, message persists', async ({ page }, testInfo) => {
  await openAuthed(page, token, '/speaker');
  await goSpeakerTab(page, 'coach');
  await recordLayout(page, testInfo, 'speaker_messenger');
  const box = page.locator('textarea, input[type="text"]').filter({ visible: true } as any).last();
  const before = (await apiGet('/messages')).length;
  await box.fill('   ');
  await box.press('Enter');
  await page.waitForTimeout(800);
  expect((await apiGet('/messages')).length, 'blank message sent').toBe(before);
  const id = uid();
  await box.fill(`Speaker ping ${id}`);
  await box.press('Enter');
  await expect(page.getByText(`Speaker ping ${id}`).filter({ visible: true } as any).first()).toBeVisible();
  // Timestamps must be readable (seeded "Today, 09:30 AM" must not render as "oday,").
  await expect(page.getByText(/^oday,?$/).filter({ visible: true } as any), 'mangled timestamp').toHaveCount(0);
  await page.waitForTimeout(1500);
  expect((await apiGet('/messages')).some((m: any) => (m.content || m.text || '').includes(id)), 'message persisted').toBeTruthy();
});

test('sign out clears the session', async ({ page }) => {
  await openAuthed(page, token, '/speaker');
  const isMobile = (page.viewportSize()?.width ?? 1440) < 768;
  if (isMobile) await page.getByRole('button', { name: /speaker workspace profile and settings menu/i }).click();
  else await page.getByRole('button', { name: /profile and workspace settings|speaker workspace profile/i }).first().click();
  await page.getByRole('button', { name: /sign out|log ?out/i }).filter({ visible: true } as any).first().click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => localStorage.getItem('globalorators_token'))).toBeNull();
  await page.goto('/speaker');
  await expect(page.locator('input[type="email"]')).toBeVisible();
});
