import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const routes = [
  '/',
  '/work',
  '/archive',
  '/about',
  '/capabilities',
  '/experience',
  '/recommendations',
  '/contact',
  '/work/job-search-os',
  '/work/flight-tracker-ai',
  '/work/wave-factory-essentials',
] as const;

const mobileViewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

async function expectCorePageContract(page: Page) {
  await expect(page.locator('main#main-content')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main-content');
  await expect(page.locator('[data-jolene-fixture-launcher]')).toHaveCount(0);
}

for (const route of routes) {
  test(`${route} renders without serious accessibility violations`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    page.on('pageerror', (error) => browserErrors.push(error.message));

    const response = await page.goto(route);
    expect(response).not.toBeNull();
    const responseHeaders = response?.headers() ?? {};
    expect(responseHeaders['content-security-policy']).toContain("default-src 'self'");
    expect(responseHeaders['content-security-policy']).not.toContain('upgrade-insecure-requests');
    expect(responseHeaders['strict-transport-security']).toBeUndefined();
    expect(response?.headers()['x-frame-options']).toBe('DENY');
    await expectCorePageContract(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const seriousViolations = results.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    );

    expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
    expect(browserErrors).toEqual([]);
  });
}

for (const viewport of mobileViewports) {
  test(`mobile layout is operable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/archive');
    await expectCorePageContract(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const undersizedTargets = await page.locator('a, button, summary, input, textarea, select').evaluateAll(
      (elements) => elements.flatMap((element) => {
        const target = element as HTMLElement;
        const box = target.getBoundingClientRect();
        const visible = box.width > 0 && box.height > 0 && getComputedStyle(target).visibility !== 'hidden';
        if (!visible || (box.width >= 44 && box.height >= 44)) return [];
        return [{
          label: target.getAttribute('aria-label') || target.textContent?.trim().slice(0, 60) || target.tagName,
          width: Math.round(box.width),
          height: Math.round(box.height),
        }];
      }),
    );
    expect(undersizedTargets, JSON.stringify(undersizedTargets, null, 2)).toEqual([]);

    const menu = page.locator('details.mobile-navigation');
    const summary = menu.locator('summary');
    await summary.focus();
    await summary.press('Enter');
    await expect(menu).toHaveAttribute('open', '');
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  });
}

test('career portrait connects the homepage to the selected archive and earlier record', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The current work has a history.' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the career arc' }).click();
  await expect(page).toHaveURL('/archive');
  await expect(page.getByRole('heading', { level: 1, name: 'The work behind the current work' })).toBeVisible();
  await expect(page.locator('#yuco')).toContainText('yU+co studio website');
  await expect(page.getByText('SapientNitro', { exact: true })).toBeVisible();
  await expect(page.getByText('General Dynamics', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Archive', exact: true }).first()).toBeVisible();
});

test('reduced motion preserves content and suppresses looping animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expectCorePageContract(page);
  const durations = await page.locator('.signal-orbit, .node-pulse').evaluateAll((elements) => (
    elements.map((element) => Number.parseFloat(getComputedStyle(element).animationDuration))
  ));
  expect(durations.length).toBeGreaterThan(0);
  expect(durations.every((duration) => duration <= 0.00001)).toBe(true);
});

test('server-rendered navigation and content remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expectCorePageContract(page);
  await expect(page.getByRole('link', { name: 'View selected work' })).toBeVisible();
  await context.close();
});

test('unknown routes return an accessible recovery page', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expectCorePageContract(page);
  await expect(page.getByRole('heading', { level: 1, name: 'That route isn’t part of the portfolio.' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Page recovery' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'View selected work' })).toHaveAttribute('href', '/work');
  await expect(page.getByRole('link', { name: 'Contact Carl' })).toHaveAttribute('href', '/contact');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
});

test('Sentry remains fail-closed without explicit production configuration', async ({ page, request }) => {
  const telemetryRequests: string[] = [];
  page.on('request', (request) => {
    if (/\.ingest\.sentry\.io|\/api\/\d+\/envelope/i.test(request.url())) {
      telemetryRequests.push(request.url());
    }
  });

  await page.goto('/');
  await expectCorePageContract(page);
  await page.waitForTimeout(250);

  expect(telemetryRequests).toEqual([]);
  const intake = await request.post('/api/ops/sentry', {
    data: { issue: { id: 'fixture-issue' } },
    headers: { 'x-servicehook-signature': '0'.repeat(64) },
  });
  expect(intake.status()).toBe(404);
  expect(intake.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(intake.headers()['x-content-type-options']).toBe('nosniff');
});
