import { test, expect, skipSplash, snap, recordLayout } from './helpers';

// Every public URL the SPA resolves (see LandingPage.tsx switch and AppContext portal routing).
const PUBLIC_ROUTES = [
  '/', '/about', '/academy', '/foundation', '/escapism', '/tournaments', '/testimonials', '/contact',
  '/onboarding', '/speaker', '/coach', '/does-not-exist',
];

for (const route of PUBLIC_ROUTES) {
  test(`crawl ${route}`, async ({ page, issues }, testInfo) => {
    const res = await page.goto(route);
    expect(res?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');
    await skipSplash(page);
    await page.waitForTimeout(800);
    const name = route === '/' ? 'home' : route.slice(1).replace(/\//g, '_');
    await snap(page, testInfo, `public_${name}`);
    await recordLayout(page, testInfo, `public_${name}`);
    await expect(page.locator('#root')).not.toBeEmpty();
    if (route === '/does-not-exist') {
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    }
    expect(issues.filter((i) => i.kind === 'pageerror')).toEqual([]);
  });
}
