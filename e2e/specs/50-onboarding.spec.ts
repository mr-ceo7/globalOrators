import { test, expect, skipSplash, snap, recordLayout } from './helpers';

/** Walks the public "Apply" funnel as an anonymous visitor. */
test.describe('onboarding (anonymous applicant)', () => {
  const next = (page) => page.getByRole('button', { name: /^continue$/i });

  test('validation on step 3 and full submission', async ({ page, issues }, testInfo) => {
    const alerts: string[] = [];
    page.on('dialog', (d) => { alerts.push(d.message()); d.dismiss().catch(() => {}); });

    await page.goto('/onboarding');
    await skipSplash(page);
    await snap(page, testInfo, 'onboarding_step1');
    await recordLayout(page, testInfo, 'onboarding_step1');

    // Step 1: pick a branch.
    await page.getByText('Global Orators Academy', { exact: true }).click();
    if (await next(page).isVisible()) await next(page).click();
    await expect(page.getByText(/step 2 of 5/i)).toBeVisible();
    await snap(page, testInfo, 'onboarding_step2');
    await recordLayout(page, testInfo, 'onboarding_step2');
    await next(page).click();

    // Step 3: empty required fields.
    await expect(page.getByText(/step 3 of 5/i)).toBeVisible();
    await page.locator('input[name="fullName"]').fill('');
    await next(page).click();
    await page.waitForTimeout(500);
    expect(await page.getByText(/step 3 of 5/i).isVisible(), 'blocked on step 3 with empty name').toBeTruthy();
    expect(alerts, 'validation uses inline errors, not alert()').toEqual([]);

    await page.locator('input[name="fullName"]').fill('E2E Applicant <b>bold</b>');
    await page.getByPlaceholder('nia@example.org').fill('not-an-email');
    await next(page).click();
    await page.waitForTimeout(500);
    expect(await page.getByText(/step 3 of 5/i).isVisible(), 'blocked on invalid email').toBeTruthy();

    const email = `applicant.${Date.now()}@example.com`;
    await page.getByPlaceholder('nia@example.org').fill(email);
    // Letters are stripped as you type; a too-short number is flagged inline.
    await page.getByPlaceholder('+254 700 000 000').fill('abc');
    await expect(page.getByPlaceholder('+254 700 000 000')).toHaveValue('');
    await page.getByPlaceholder('+254 700 000 000').fill('123');
    await next(page).click();
    await expect(page.getByText(/at least 7 digits/i).first()).toBeVisible();
    expect(alerts, 'no browser alert() pop-ups').toEqual([]);
    await page.getByPlaceholder('+254 700 000 000').fill('+254 712 345 678');
    await next(page).click();
    await snap(page, testInfo, 'onboarding_step4');
    await recordLayout(page, testInfo, 'onboarding_step4');

    // Step 4 -> 5.
    await expect(page.getByText(/step 4 of 5/i)).toBeVisible();
    await next(page).click();
    await expect(page.getByText(/step 5 of 5/i)).toBeVisible();
    await snap(page, testInfo, 'onboarding_step5');
    await recordLayout(page, testInfo, 'onboarding_step5');

    // Submit: button must not allow a double submission.
    const finish = page.getByRole('button', { name: /enter orators app/i });
    const posts: number[] = [];
    page.on('response', (r) => { if (r.url().endsWith('/api/clients') && r.request().method() === 'POST') posts.push(r.status()); });
    await finish.dblclick();
    await page.waitForTimeout(6000);
    await snap(page, testInfo, 'onboarding_after_submit');

    expect(posts.length, 'exactly one intake POST').toBe(1);
    expect(posts[0]).toBeLessThan(300);
    // The new applicant should land inside the speaker app and stay there.
    const url = page.url();
    const onLanding = await page.getByText(/words shape nations/i).isVisible().catch(() => false);
    const authErr = await page.getByText('AuthenticationError').isVisible().catch(() => false);
    testInfo.annotations.push({ type: 'after-submit', description: `url=${url} landing=${onLanding} authErrToast=${authErr}` });
    expect(onLanding, 'applicant bounced to landing page after submitting').toBeFalsy();
    expect(authErr, '"AuthenticationError" shown to applicant').toBeFalsy();

    // The applicant verifies their email with the passcode that was just sent, then lands in the app.
    const otp = page.locator('input[maxlength="6"], input[inputmode="numeric"]').first();
    await expect(otp, 'passcode step shown after applying').toBeVisible();
    await expect(page.getByText(/application received/i).first()).toBeVisible();
    await otp.fill('123456');
    await page.locator('button[type="submit"]').first().click();
    await expect(page.locator('[id^="speaker-nav"], [id^="speaker-mobile-nav"]').filter({ visible: true } as any).first(), 'inside the speaker app').toBeVisible({ timeout: 20_000 });
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
  });

  test('applying with an already-enrolled email leads to sign-in, not an overwrite', async ({ page }) => {
    await page.goto('/onboarding');
    await skipSplash(page);
    await page.getByText('Global Orators Academy', { exact: true }).click();
    if (await next(page).isVisible()) await next(page).click();
    await next(page).click();
    await page.locator('input[name="fullName"]').fill('Impostor');
    await page.getByPlaceholder('nia@example.org').fill('marcus.vance@example.com');
    await page.getByPlaceholder('+254 700 000 000').fill('+254 712 345 678');
    await next(page).click();
    await next(page).click();
    await page.getByRole('button', { name: /enter orators app/i }).click();
    await expect(page.getByText(/already exists/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[type="email"]')).toHaveValue('marcus.vance@example.com');
  });

  test('back button keeps entered data', async ({ page }) => {
    await page.goto('/onboarding');
    await skipSplash(page);
    await page.getByText('Global Orators Academy', { exact: true }).click();
    if (await next(page).isVisible()) await next(page).click();
    await next(page).click();
    await page.locator('input[name="fullName"]').fill('Persisted Name');
    await page.getByRole('button', { name: /previous/i }).click();
    await next(page).click();
    await expect(page.locator('input[name="fullName"]')).toHaveValue('Persisted Name');
  });

  test('refresh mid-flow', async ({ page }, testInfo) => {
    await page.goto('/onboarding');
    await skipSplash(page);
    await page.getByText('Global Orators Academy', { exact: true }).click();
    if (await next(page).isVisible()) await next(page).click();
    await next(page).click();
    await page.locator('input[name="fullName"]').fill('Refresh Me');
    await page.reload();
    await skipSplash(page);
    const step = await page.getByText(/step \d of 5/i).textContent();
    const nameInput = page.locator('input[name="fullName"]');
    const kept = (await nameInput.count()) ? await nameInput.inputValue() : '(field not on screen)';
    testInfo.annotations.push({ type: 'refresh', description: `${step}; name kept="${kept}"` });
    expect.soft(kept, 'typed data survives a refresh').toBe('Refresh Me');
  });
});
