import { test, expect, API, HEAD_COACH, apiLogin, skipSplash, snap, recordLayout } from './helpers';

const uid = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

async function inquiries() {
  const t = (await apiLogin(HEAD_COACH.email, HEAD_COACH.password)).body.access_token;
  return (await fetch(`${API}/inquiries`, { headers: { Authorization: `Bearer ${t}` } })).json();
}

test.describe('contact form', () => {
  test('inline validation, successful submit, double-submit guard', async ({ page }, testInfo) => {
    await page.goto('/contact');
    await skipSplash(page);
    const submit = page.locator('form').filter({ has: page.locator('#contact-name') }).locator('button[type="submit"]');
    await submit.click();
    await page.waitForTimeout(500);
    await snap(page, testInfo, 'contact_errors');
    await recordLayout(page, testInfo, 'contact_errors');
    const shown = await page.locator('#contact-name').evaluate((el: HTMLInputElement) => el.getAttribute('aria-invalid') === 'true' || !el.validity.valid);
    expect(shown, 'empty name flagged').toBeTruthy();

    await page.locator('#contact-email').fill('bad@');
    await page.locator('#contact-email').blur();
    await expect(page.getByText(/valid email/i).first()).toBeVisible();

    const id = uid();
    const before = (await inquiries()).length;
    await page.locator('#contact-name').fill(`E2E Contact ${id}`);
    await page.locator('#contact-email').fill(`contact.${id}@example.com`);
    await page.locator('#contact-message').fill('Automated end-to-end test message. Please ignore. '.repeat(3));
    const posts: number[] = [];
    page.on('response', (r) => { if (r.url().includes('/api/inquiries') && r.request().method() === 'POST') posts.push(r.status()); });
    await submit.dblclick();
    await page.waitForTimeout(2500);
    await snap(page, testInfo, 'contact_success');
    expect(posts.length, 'one POST for a double click').toBe(1);
    expect(posts[0]).toBeLessThan(300);
    expect((await inquiries()).length).toBe(before + 1);
    // Success replaces the form with a confirmation panel.
    await expect(page.locator('#contact-name')).toHaveCount(0);
  });

  test('network failure shows an error and keeps the typed message', async ({ page }) => {
    await page.goto('/contact');
    await skipSplash(page);
    await page.route('**/api/inquiries', (r) => r.abort('failed'));
    await page.locator('#contact-name').fill('Offline Person');
    await page.locator('#contact-email').fill('offline@example.com');
    await page.locator('#contact-message').fill('This message should survive a failed request.');
    await page.locator('form').filter({ has: page.locator('#contact-name') }).locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#contact-message')).toHaveValue('This message should survive a failed request.');
    const errText = await page.locator('[role="alert"], div.text-rose-400 > div, .text-rose-300, .text-red-400').filter({ visible: true } as any).first().textContent().catch(() => null);
    test.info().annotations.push({ type: 'error shown', description: String(errText) });
    expect(errText, 'user-facing error after network failure').toBeTruthy();
    expect(errText).not.toMatch(/^Failed to fetch$|TypeError/);
  });
});

test.describe('partner modal', () => {
  test('opens from audience cards, validates, submits, closes with Escape', async ({ page }, testInfo) => {
    await page.goto('/');
    await skipSplash(page);
    await page.getByRole('button', { name: /partner as school/i }).first().click();
    await expect(page.locator('#partner-dialog-title')).toBeVisible();
    await snap(page, testInfo, 'partner_modal');
    await recordLayout(page, testInfo, 'partner_modal');
    // Focus should move into the dialog.
    const focusInside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    testInfo.annotations.push({ type: 'focus moved into dialog', description: String(focusInside) });

    const submit = page.locator('[role="dialog"] button[type="submit"]');
    await submit.click();
    await expect(page.locator('#partner-org-error')).toBeVisible();
    const id = uid();
    await page.locator('#partner-org-name').fill(`E2E School ${id}`);
    await page.locator('#partner-email').fill(`partner.${id}@example.com`);
    const before = (await inquiries()).length;
    await submit.click();
    await page.waitForTimeout(2000);
    expect((await inquiries()).length).toBe(before + 1);

    await page.keyboard.press('Escape');
    await expect(page.locator('#partner-dialog-title')).toBeHidden();
  });
});

test.describe('landing navigation', () => {
  test('theme toggle persists across reload', async ({ page }) => {
    await page.goto('/');
    await skipSplash(page);
    const before = await page.evaluate(() => document.documentElement.className + '|' + document.documentElement.dataset.theme);
    await page.locator('#landing-theme-toggle').click();
    const after = await page.evaluate(() => document.documentElement.className + '|' + document.documentElement.dataset.theme);
    expect(after).not.toBe(before);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.className + '|' + document.documentElement.dataset.theme)).toBe(after);
  });

  test('mobile drawer opens, links navigate and close it, browser back works', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');
    await page.goto('/');
    await skipSplash(page);
    await page.locator('#mobile-toc-toggle').click();
    const drawer = page.locator('#mobile-nav-drawer');
    await expect(drawer).toBeVisible();
    await snap(page, testInfo, 'landing_mobile_drawer');
    await recordLayout(page, testInfo, 'landing_mobile_drawer');
    await drawer.getByText('About', { exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(drawer).toBeHidden();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    // Body scroll should not stay locked after closing the drawer.
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(overflow).not.toBe('hidden');
  });

  test('deep link refresh keeps the page', async ({ page }) => {
    for (const path of ['/about', '/academy', '/tournaments', '/contact']) {
      await page.goto(path);
      await page.reload();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
  });
});

test.describe('backend unavailable', () => {
  test('coach login shows a connection error instead of hanging', async ({ page }) => {
    await page.route('**/api/**', (r) => r.abort('connectionrefused'));
    await page.goto('/coach');
    await skipSplash(page);
    await page.locator('input[type="email"]').fill(HEAD_COACH.email);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    // check-email failure falls back to the password step; submitting must report the outage.
    const pw = page.locator('input[type="password"]');
    if (await pw.isVisible()) {
      await pw.fill('whatever123');
      await page.locator('button[type="submit"]').first().click();
    }
    await page.waitForTimeout(1500);
    const onRegister = await page.getByText('Create Coach Account', { exact: true }).first().isVisible().catch(() => false);
    expect.soft(onRegister, 'existing coach sent to "Create Coach Account" when the API is down').toBeFalsy();
    const msg = await page.locator('span.font-medium').filter({ visible: true } as any).allTextContents();
    test.info().annotations.push({ type: 'message', description: msg.join(' | ') });
    expect(msg.join(' ')).toMatch(/connect|network|server|unavailable|unreachable/i);
  });
});
