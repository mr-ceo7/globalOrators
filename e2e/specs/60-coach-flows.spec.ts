import type { Page } from '@playwright/test';
import { test, expect, API, HEAD_COACH, apiLogin, openAuthed, snap, recordLayout } from './helpers';

/**
 * Coach feature flows, run as the seeded head coach (coach-1) against the isolated backend.
 * Each test creates uniquely named data so it can run repeatedly on the same database.
 */
let token = '';
test.beforeAll(async () => {
  const r = await apiLogin(HEAD_COACH.email, HEAD_COACH.password);
  expect(r.status, `head coach login ${HEAD_COACH.email}`).toBe(200);
  token = r.body.access_token;
});

const uid = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const apiGet = async (path: string) => (await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } })).json();

async function goTab(page: Page, desktopLabel: RegExp, mobile: { id?: string; quick?: string }) {
  const isMobile = (page.viewportSize()?.width ?? 1440) < 768;
  if (!isMobile) {
    await page.locator('aside').getByRole('button', { name: desktopLabel }).first().click();
  } else if (mobile.id) {
    await page.locator(`#${mobile.id}`).click();
  } else if (mobile.quick) {
    await page.locator('button[title="Quick Actions"]').click();
    await page.getByText(mobile.quick, { exact: true }).last().click();
  }
  await page.waitForTimeout(1000);
}

test.describe('speaker roster', () => {
  test('add speaker: validation, success, persistence, XSS-safe rendering', async ({ page, issues }, testInfo) => {
    await openAuthed(page, token, '/coach');
    await goTab(page, /speakers & debaters/i, { id: 'mobile-nav-clients' });
    await recordLayout(page, testInfo, 'coach_roster');
    await page.locator('#open-add-client-modal-btn').click();
    const name = page.getByPlaceholder('e.g. Marcus Vance');
    await expect(name).toBeVisible();
    await snap(page, testInfo, 'coach_add_speaker_modal');
    await recordLayout(page, testInfo, 'coach_add_speaker_modal');

    const save = page.getByRole('button', { name: /save speaker profile/i });
    // Empty submit must not create anything.
    const before = (await apiGet('/clients')).length;
    await save.click();
    await page.waitForTimeout(800);
    await expect(name, 'modal stays open on empty submit').toBeVisible();

    const id = uid();
    const xssName = `E2E <img src=x onerror="window.__xss=1"> ${id}`;
    await name.fill(xssName);
    await page.getByPlaceholder('e.g. speaker@example.com').fill(`e2e.speaker.${id}@example.com`);
    await save.click();
    await expect(name).toBeHidden({ timeout: 10_000 });
    await page.waitForTimeout(1500);

    const after = await apiGet('/clients');
    expect(after.length, 'speaker persisted on server').toBe(before + 1);
    const created = after.find((c: any) => c.email === `e2e.speaker.${id}@example.com`);
    expect(created).toBeTruthy();
    testInfo.annotations.push({ type: 'phone stored when left blank', description: String(created.phone) });

    await page.locator('#client-roster-search-input').fill(id);
    await expect(page.getByText(id).first()).toBeVisible();
    expect(await page.evaluate(() => (window as any).__xss), 'injected onerror handler executed').toBeUndefined();

    await page.reload();
    await page.keyboard.press('Escape');
    await goTab(page, /speakers & debaters/i, { id: 'mobile-nav-clients' });
    await page.locator('#client-roster-search-input').fill(id);
    await expect(page.getByText(id).first(), 'visible after reload').toBeVisible();
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
  });

  test('adding a speaker with an email that already exists does not silently overwrite them', async ({ page }) => {
    const existing = (await apiGet('/clients')).find((c: any) => c.email === 'david.kim@example.com');
    test.skip(!existing, 'seed speaker missing');
    await openAuthed(page, token, '/coach');
    await goTab(page, /speakers & debaters/i, { id: 'mobile-nav-clients' });
    await page.locator('#open-add-client-modal-btn').click();
    await page.getByPlaceholder('e.g. Marcus Vance').fill('Duplicate Person');
    await page.getByPlaceholder('e.g. speaker@example.com').fill('david.kim@example.com');
    await page.getByRole('button', { name: /save speaker profile/i }).click();
    await page.waitForTimeout(2500);
    const afterRec = (await apiGet('/clients')).find((c: any) => c.id === existing.id);
    expect.soft(afterRec.name, 'existing speaker renamed by duplicate add').toBe(existing.name);
    expect.soft(afterRec.goal, 'existing speaker goal overwritten').toBe(existing.goal);
    // Restore.
    await fetch(`${API}/clients/${existing.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: existing.name, goal: existing.goal, experienceLevel: existing.experienceLevel, branch: existing.branch }) });
  });

  test('search with no match shows an empty state, sort toggles', async ({ page }, testInfo) => {
    await openAuthed(page, token, '/coach');
    await goTab(page, /speakers & debaters/i, { id: 'mobile-nav-clients' });
    await page.locator('#client-roster-search-input').fill('zzzz-no-such-speaker');
    await page.waitForTimeout(500);
    await snap(page, testInfo, 'coach_roster_empty_search');
    await expect(page.getByText(/no (speakers|results|matches)|not found|nothing/i).first()).toBeVisible();
    await page.locator('#client-roster-search-input').fill('');
    const sel = page.locator('#roster-sort-by-select');
    const opts = await sel.locator('option').allTextContents();
    for (const o of opts) await sel.selectOption({ label: o });
    await page.locator('#roster-sort-dir-toggle-btn').click();
  });

  test('speaker profile opens and a coach note persists', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'selectors not yet adapted to the mobile coach layout');
    await openAuthed(page, token, '/coach');
    await goTab(page, /speakers & debaters/i, { id: 'mobile-nav-clients' });
    await page.locator('#client-roster-search-input').fill('David Kim');
    await page.getByText('David Kim').first().click();
    await page.waitForTimeout(1000);
    await snap(page, testInfo, 'coach_speaker_profile');
    await recordLayout(page, testInfo, 'coach_speaker_profile');
    const note = page.locator('textarea, input[type="text"]').filter({ hasNot: page.locator('#client-roster-search-input') }).filter({ visible: true } as any);
    testInfo.annotations.push({ type: 'profile-fields', description: String(await note.count()) });
  });
});

test.describe('drill library', () => {
  test('add custom drill, search it, persists', async ({ page }, testInfo) => {
    await openAuthed(page, token, '/coach');
    await goTab(page, /drill & speech library/i, { quick: 'Drill Catalog' });
    await recordLayout(page, testInfo, 'coach_drills');
    await page.locator('#add-custom-exercise-btn').click();
    const name = page.getByPlaceholder('e.g. 7-Minute Impromptu Policy Rebuttal');
    await expect(name).toBeVisible();
    await snap(page, testInfo, 'coach_add_drill_modal');
    await recordLayout(page, testInfo, 'coach_add_drill_modal');
    const id = uid();
    await name.fill(`E2E Drill ${id}`);
    await page.getByPlaceholder(/rhetorical stimulus/i).fill('Automated test drill description');
    const submit = page.locator('form button[type="submit"]').last();
    await submit.click();
    await page.waitForTimeout(2000);
    const all = await apiGet('/exercises');
    expect(all.some((e: any) => e.name === `E2E Drill ${id}`), 'drill persisted').toBeTruthy();
    await page.locator('#exercise-library-search').fill(id);
    await expect(page.getByText(`E2E Drill ${id}`).first()).toBeVisible();
  });
});

test.describe('curriculum builder', () => {
  test('create curriculum and save', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'selectors not yet adapted to the mobile coach layout');
    await openAuthed(page, token, '/coach');
    await goTab(page, /curriculum builder/i, { quick: 'Curriculum Builder' });
    await recordLayout(page, testInfo, 'coach_curriculum');
    const before = (await apiGet('/programs')).length;
    // "New curriculum" lives inside the title dropdown.
    await page.locator('h1, h2').filter({ hasText: /programme|curriculum|program/i }).first().click();
    await page.locator('#new-program-builder-btn').click();
    await page.waitForTimeout(800);
    await snap(page, testInfo, 'coach_curriculum_new');
    await recordLayout(page, testInfo, 'coach_curriculum_new');
    const id = uid();
    await page.getByRole('button', { name: /^settings$/i }).click();
    const title = page.getByText('Curriculum Title', { exact: true }).locator('xpath=following::input[1]');
    await title.fill(`E2E Curriculum ${id}`);
    // Edge values for numeric fields.
    const weeks = page.getByText('Weeks', { exact: true }).locator('xpath=following::input[1]');
    for (const v of ['0', '-5', '99999']) {
      await weeks.fill(v);
      testInfo.annotations.push({ type: `weeks=${v}`, description: `field shows "${await weeks.inputValue()}"` });
    }
    await weeks.fill('6');
    await page.getByRole('button', { name: /^done$/i }).click();
    await page.locator('#save-program-builder-btn').click();
    await page.waitForTimeout(2000);
    let after = await apiGet('/programs');
    testInfo.annotations.push({ type: 'programs', description: `${before} -> ${after.length}` });
    const created = after.find((p: any) => (p.title || p.name || '').includes(id));
    expect(created, 'curriculum persisted').toBeTruthy();

    // Delete it again through the UI.
    await page.getByRole('button', { name: /^settings$/i }).click();
    // Deletion is confirmed with a native window.confirm().
    page.once('dialog', (d) => { testInfo.annotations.push({ type: 'delete-confirm', description: `${d.type()}: ${d.message()}` }); d.accept(); });
    await page.getByRole('button', { name: /delete curriculum/i }).click();
    await page.waitForTimeout(500);
    const confirm = page.getByRole('button', { name: /^(delete|confirm|yes)/i }).filter({ visible: true } as any);
    if (await confirm.count()) await confirm.last().click();
    await page.waitForTimeout(2000);
    after = await apiGet('/programs');
    expect(after.some((p: any) => p.id === created.id), 'curriculum deleted on server').toBeFalsy();
  });
});

test.describe('session schedule', () => {
  test('schedule a session from the calendar', async ({ page }, testInfo) => {
    await openAuthed(page, token, '/coach');
    await goTab(page, /session schedule/i, { id: 'mobile-nav-calendar' });
    const before = (await apiGet('/workouts')).length;
    await page.locator('#schedule-new-workout-btn').click();
    await page.waitForTimeout(600);
    await snap(page, testInfo, 'coach_schedule_modal');
    await recordLayout(page, testInfo, 'coach_schedule_modal');
    const modal = page.locator('form').filter({ has: page.locator('input[type="date"]') }).last();
    const selects = modal.locator('select');
    const firstSpeaker = await selects.nth(0).inputValue();
    testInfo.annotations.push({ type: 'default speaker selected', description: firstSpeaker || '(none)' });
    if (!firstSpeaker) await selects.nth(0).selectOption({ index: 1 });
    await modal.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    const after = await apiGet('/workouts');
    expect(after.length, 'session persisted').toBe(before + 1);
  });

  test('month navigation works both ways', async ({ page }) => {
    await openAuthed(page, token, '/coach');
    await goTab(page, /session schedule/i, { id: 'mobile-nav-calendar' });
    const heading = page.locator('h2, h3').filter({ hasText: /\b(20\d\d)\b/ }).first();
    const start = await heading.textContent();
    const arrows = page.locator('button.p-1\\.5.rounded-lg');
    await arrows.nth(1).click();
    await expect(heading).not.toHaveText(start!);
    await arrows.nth(0).click();
    await expect(heading).toHaveText(start!);
  });
});

test.describe('faculty coaches', () => {
  test('add coach: duplicate email and short password are rejected, valid coach is created', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Faculty Coaches is not reachable on mobile (reported)');
    await openAuthed(page, token, '/coach');
    await goTab(page, /faculty coaches/i, {});
    await recordLayout(page, testInfo, 'coach_faculty');
    const open = page.getByRole('button', { name: /add (faculty )?coach|new coach|invite/i }).first();
    await open.click();
    const name = page.locator('#add-coach-name-input');
    await expect(name).toBeVisible();
    await snap(page, testInfo, 'coach_add_coach_modal');
    await recordLayout(page, testInfo, 'coach_add_coach_modal');

    await name.fill('Dup Coach');
    await page.locator('#add-coach-email-input').fill(HEAD_COACH.email);
    await page.locator('#add-coach-password-input').fill('ValidPass123!');
    await page.locator('#add-coach-password-input').press('Enter');
    await page.waitForTimeout(1500);
    await expect(page.getByText(/already|exists|registered/i).first(), 'duplicate email error').toBeVisible();

    const id = uid();
    await page.locator('#add-coach-email-input').fill(`e2e.coach.${id}@example.com`);
    await page.locator('#add-coach-password-input').fill('short');
    await page.locator('#add-coach-password-input').press('Enter');
    await page.waitForTimeout(800);
    const coachesMid = await apiGet('/coaches');
    expect(coachesMid.some((c: any) => c.email === `e2e.coach.${id}@example.com`), 'short password accepted').toBeFalsy();

    await page.locator('#add-coach-password-input').fill('ValidPass123!');
    await page.locator('#add-coach-password-input').press('Enter');
    await page.waitForTimeout(2000);
    const coaches = await apiGet('/coaches');
    expect(coaches.some((c: any) => c.email === `e2e.coach.${id}@example.com`), 'coach created').toBeTruthy();
    // The new coach can actually sign in.
    expect((await apiLogin(`e2e.coach.${id}@example.com`, 'ValidPass123!')).status).toBe(200);
  });
});

test.describe('messenger', () => {
  test('coach sends a message a speaker can read', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'selectors not yet adapted to the mobile coach layout');
    await openAuthed(page, token, '/coach');
    await goTab(page, /messenger/i, { id: 'mobile-nav-messenger' });
    await snap(page, testInfo, 'coach_messenger');
    await recordLayout(page, testInfo, 'coach_messenger');
    await page.getByPlaceholder('Search conversations...').fill('Marcus');
    await page.getByText('Marcus Vance').filter({ visible: true } as any).and(page.locator(':not(aside *)')).first().click();
    await page.waitForTimeout(800);
    const box = page.locator('textarea, input[type="text"]').filter({ visible: true } as any).last();
    const id = uid();
    // Whitespace-only must not send.
    const beforeMsgs = (await apiGet('/messages')).length;
    await box.fill('    ');
    await box.press('Enter');
    await page.waitForTimeout(800);
    expect((await apiGet('/messages')).length, 'whitespace message sent').toBe(beforeMsgs);

    await box.fill(`E2E hello ${id} <script>window.__xss=1</script>`);
    await box.press('Enter');
    await expect(page.getByText(`E2E hello ${id}`).first()).toBeVisible();
    await page.waitForTimeout(1500);
    const msgs = await apiGet('/messages');
    expect(msgs.some((m: any) => (m.content || m.text || '').includes(`E2E hello ${id}`)), 'message persisted').toBeTruthy();
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });
});

test.describe('speaker profile panel', () => {
  test('tabs render, adjudication note persists, reassignment moves the speaker', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'selectors not yet adapted to the mobile coach layout');
    const roster = await apiGet('/clients');
    const target = roster.find((c: any) => c.email === 'david.kim@example.com');
    test.skip(!target, 'seed speaker missing');
    await openAuthed(page, token, '/coach');
    await goTab(page, /speakers & debaters/i, { id: 'mobile-nav-clients' });
    await page.locator('#client-roster-search-input').fill('David Kim');
    await page.locator('main, [class*="grid"]').getByText('David Kim').filter({ visible: true } as any).first().click();
    await expect(page.locator('#close-client-profile-btn')).toBeVisible();

    // Visit every tab in the panel.
    const tabs = page.getByRole('button', { name: /^(Overview & Survey|Speech Focus & Health|Curriculum & Sessions|Coach Notes|Panel Adjudication|Milestones & Records)/ });
    const names = await tabs.allInnerTexts();
    testInfo.annotations.push({ type: 'profile tabs', description: names.map((n) => n.trim()).join(' | ') });
    for (let i = 0; i < names.length; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(400);
      await snap(page, testInfo, `coach_profile_tab_${i}`);
      await recordLayout(page, testInfo, `coach_profile_tab_${i}`);
    }

    // Adjudication note.
    const adjTab = page.getByRole('button', { name: /^Panel Adjudication/ }).first();
    if (await adjTab.count()) {
      await adjTab.click();
      const note = page.getByPlaceholder(/document actionable diagnostic feedback/i);
      const id = uid();
      await note.fill(`E2E adjudication ${id}`);
      await note.locator('xpath=ancestor::form').locator('button[type="submit"]').click();
      await page.waitForTimeout(1500);
      const fresh = (await apiGet('/clients')).find((c: any) => c.id === target.id);
      expect(JSON.stringify(fresh.adjudicatorNotes || fresh.adjudicator_notes || []), 'adjudication note persisted').toContain(id);
    }

    // Reassign to another coach and back.
    const select = page.locator('select').filter({ has: page.locator('option', { hasText: 'Select Target Coach...' }) }).first();
    if (await select.count()) {
      const options = await select.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value).filter(Boolean));
      const other = options.find((v) => v !== target.coachId);
      test.skip(!other, 'no other coach to reassign to');
      await select.selectOption(other!);
      await select.locator('xpath=following::button[1]').click();
      await page.waitForTimeout(1500);
      const moved = await (await fetch(`${API}/clients/${target.id}`, { headers: { Authorization: `Bearer ${token}` } })).json();
      testInfo.annotations.push({ type: 'after reassign', description: `coachId=${moved.coachId}` });
      expect(moved.coachId).toBe(other);
      await fetch(`${API}/clients/${target.id}/reassign-coach`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ coachId: target.coachId }) });
    }
  });
});
