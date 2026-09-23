import { defineConfig, devices } from '@playwright/test';

// E2E suite runs against the isolated stack started by e2e/start-e2e-servers.sh
// (frontend :3100 -> backend :8105 by default, throwaway SQLite, TESTING=true so emails are
// simulated). E2E_FRONTEND_PORT / E2E_BACKEND_PORT select another stack.
export default defineConfig({
  testDir: './e2e/specs',
  outputDir: './e2e/.run/results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'e2e/.run/report', open: 'never' }]],
  use: {
    baseURL: `http://localhost:${process.env.E2E_FRONTEND_PORT || 3100}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
