import { defineConfig, devices } from '@playwright/test';

const contactIntentEnabled = process.env.JOLENE_UI_CONTACT_ENABLED === 'true';
const port = contactIntentEnabled ? 4181 : 4180;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'jolene-capabilities.spec.ts',
  outputDir: './test-results/jolene-capabilities',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: [
      `export NEXT_PUBLIC_SITE_URL=${baseURL}`,
      'export NEXT_PUBLIC_JOLENE_MODE=fixture',
      `export JOLENE_PUBLIC_CONTACT_INTENT_ENABLED=${String(contactIntentEnabled)}`,
      `pnpm build && PORT=${port} HOSTNAME=127.0.0.1 node dist/standalone/server.js`,
    ].join('; '),
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
