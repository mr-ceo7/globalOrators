import { test, expect, API, COACH, COACH_INVITE_CODE, SPEAKER_EMAIL, TEST_OTP, skipSplash, apiSpeakerToken, openAuthed, snap } from './helpers';

async function speakerEmailStep(page, email: string) {
  await page.goto('/speaker');
  await skipSplash(page);
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole('button', { name: /send login passcode/i }).click();
}

test.describe('speaker login', () => {
  test('rejects malformed email without calling the API', async ({ page }) => {
    const calls: string[] = [];
    page.on('request', (r) => r.url().includes('/otp/send') && calls.push(r.url()));
    await speakerEmailStep(page, 'not-an-email');
    // Native type=email validation or the app's own message must block submission.
    const nativeInvalid = await page.locator('input[type="email"]').evaluate((el: HTMLInputElement) => !el.validity.valid);
    const appMsg = await page.getByText(/valid email/i).isVisible().catch(() => false);
    expect(nativeInvalid || appMsg).toBeTruthy();
    expect(calls).toEqual([]);
  });

  test('wrong and short passcodes show errors, correct one signs in', async ({ page }, testInfo) => {
    await speakerEmailStep(page, SPEAKER_EMAIL);
    const otp = page.locator('input[inputmode="numeric"], input[autocomplete="one-time-code"], input[maxlength="6"]').first();
    await expect(otp).toBeVisible();
    await otp.fill('12');
    // Submit stays disabled until all 6 digits are entered.
    await expect(page.locator('button[type="submit"]').first()).toBeDisabled();
    await otp.fill('000000');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    await snap(page, testInfo, 'speaker_login_wrong_otp');
    // A typo must keep the user on the passcode step with a readable error.
    await expect(otp, 'still on passcode step after wrong code').toBeVisible();
    await expect(page.getByText(/invalid|expired|incorrect/i).first()).toBeVisible();
    await otp.fill(TEST_OTP);
    await page.locator('button[type="submit"]').first().click();
    await expect(page.locator('[id^="speaker-nav"], [id^="speaker-mobile-nav"], [id^="mobile-speaker"]').filter({ visible: true } as any).first()).toBeVisible({ timeout: 20_000 });
    // Session survives a reload.
    await page.reload();
    await skipSplash(page);
    await expect(page.locator('[id^="speaker-nav"], [id^="speaker-mobile-nav"], [id^="mobile-speaker"]').filter({ visible: true } as any).first()).toBeVisible({ timeout: 20_000 });
  });

  test('unknown email is routed to onboarding after verification', async ({ page }) => {
    const email = `new.${Date.now()}@example.com`;
    await speakerEmailStep(page, email);
    const otp = page.locator('input[inputmode="numeric"], input[autocomplete="one-time-code"], input[maxlength="6"]').first();
    await expect(otp, 'OTP step for a never-seen email').toBeVisible();
    await otp.fill(TEST_OTP);
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/onboarding/, { timeout: 20_000 });
  });

  test('valid magic link signs the speaker in and is single-use', async ({ page, browser }, testInfo) => {
    const res = await fetch(`${API}/auth/otp/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: SPEAKER_EMAIL }) });
    const link: string = (await res.json()).magic_link;
    expect(link, 'non-production API returns the magic link').toBeTruthy();
    const path = link.replace(/^https?:\/\/[^/]+/, '');
    testInfo.annotations.push({ type: 'magic link host', description: link.split('/speaker')[0] });
    await page.goto(path);
    await expect(page.locator('[id^="speaker-nav"], [id^="speaker-mobile-nav"]').filter({ visible: true } as any).first()).toBeVisible({ timeout: 20_000 });
    await expect.poll(() => page.url(), { message: 'token removed from the URL', timeout: 5000 }).not.toContain('magic_token');
    // Re-using the same link in a fresh browser must fail.
    const ctx = await browser.newContext();
    const p2 = await ctx.newPage();
    await p2.goto(path);
    await expect(p2.getByText(/invalid|expired|failed/i).first()).toBeVisible({ timeout: 15_000 });
    await ctx.close();
  });

  test('invalid magic link shows an error instead of hanging', async ({ page }) => {
    await page.goto(`/speaker?magic_token=bogus-token&email=${SPEAKER_EMAIL}`);
    await expect(page.getByText(/invalid|expired|failed/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('garbage token in storage does not crash and shows login', async ({ page, issues }) => {
    await openAuthed(page, 'garbage.token.value', '/speaker');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
  });

  test('speaker session cannot open the coach app', async ({ page }) => {
    // Real login flow: token + cached user (role=speaker), then visit /coach.
    await speakerEmailStep(page, SPEAKER_EMAIL);
    await page.locator('input[maxlength="6"], input[inputmode="numeric"]').first().fill(TEST_OTP);
    await page.locator('button[type="submit"]').first().click();
    await expect(page.locator('[id^="speaker-nav"], [id^="speaker-mobile-nav"], [id^="mobile-speaker"]').filter({ visible: true } as any).first()).toBeVisible({ timeout: 20_000 });
    await page.goto('/coach');
    await skipSplash(page);
    await expect(page.locator('aside').getByRole('button', { name: /speakers & debaters/i })).toHaveCount(0);
    await expect(page.locator('#mobile-nav-clients')).toHaveCount(0);
  });

  test('speaker token without cached user is not treated as a coach', async ({ page }) => {
    // AppContext.isAuthenticatedCoach falls back to `true` when no cached user exists.
    const token = await apiSpeakerToken();
    await openAuthed(page, token, '/coach');
    await expect(page.locator('aside').getByRole('button', { name: /speakers & debaters/i })).toHaveCount(0);
    await expect(page.locator('#mobile-nav-clients')).toHaveCount(0);
  });
});

test.describe('coach login', () => {
  async function emailStep(page, email: string) {
    await page.goto('/coach');
    await skipSplash(page);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('button[type="submit"]').first().click();
  }

  test('wrong password shows an error', async ({ page }) => {
    await emailStep(page, COACH.email);
    await page.locator('input[type="password"]').fill('WrongPassword999');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    const err = page.locator('div:has(> svg.lucide-circle-alert, > svg.lucide-alert-circle) > span').first();
    await expect(err).toBeVisible();
    await expect(err, 'human-readable error, not an exception name').not.toHaveText(/^AuthenticationError$/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // The message must be readable: WCAG AA needs 4.5:1 for small text.
    const ratio = await err.evaluate((el) => (window as any).__contrastOf(el));
    expect(ratio, 'error message contrast ratio').toBeGreaterThanOrEqual(4.5);
  });

  test('correct password signs in and survives reload, logout clears session', async ({ page }) => {
    await emailStep(page, COACH.email);
    await page.locator('input[type="password"]').fill(COACH.password);
    await page.locator('button[type="submit"]').first().click();
    await expect(page.getByText(/dashboard|overview/i).filter({ visible: true } as any).first()).toBeVisible({ timeout: 20_000 });
    await page.reload();
    await skipSplash(page);
    await expect(page.locator('input[type="password"], input[type="email"]')).toHaveCount(0);
    const token = await page.evaluate(() => localStorage.getItem('globalorators_token'));
    expect(token).toBeTruthy();
  });

  test('new coach can register through the UI with an invite code', async ({ page }, testInfo) => {
    await emailStep(page, `newcoach.${Date.now()}@example.com`);
    const name = page.getByPlaceholder(/coach nia/i);
    await expect(name).toBeVisible();
    await name.fill('E2E Test Coach');
    await page.getByPlaceholder(/minimum 8/i).fill('StrongPass123!');

    // A wrong invite code is refused with a readable message.
    await page.getByLabel(/faculty invite code/i).fill('not-the-code');
    await page.locator('button[type="submit"]').first().click();
    const err = page.getByText(/invite code/i).filter({ visible: true } as any).first();
    await expect(err).toBeVisible();
    await snap(page, testInfo, 'coach_register_wrong_invite');

    await page.getByLabel(/faculty invite code/i).fill(COACH_INVITE_CODE);
    await page.locator('button[type="submit"]').first().click();
    await expect(page.getByText(/dashboard|overview/i).filter({ visible: true } as any).first()).toBeVisible({ timeout: 20_000 });
  });

  test('short password is rejected client-side on register', async ({ page }) => {
    await emailStep(page, `short.${Date.now()}@example.com`);
    await page.getByPlaceholder(/coach nia/i).fill('Shorty');
    await page.getByPlaceholder(/minimum 8/i).fill('abc');
    await page.locator('button[type="submit"]').first().click();
    const blocked = await page.getByPlaceholder(/minimum 8/i).evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(blocked || (await page.getByText(/at least 8/i).isVisible())).toBeTruthy();
    await expect(page.getByText(/dashboard|overview/i)).toHaveCount(0);
  });
});
