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
    expect(responseHeaders['cache-control']).toBe('no-cache');
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

for (const [route, expectedGalleryImages] of [
  ['/work/job-search-os', 6],
  ['/work/flight-tracker-ai', 3],
  ['/work/wave-factory-essentials', 5],
] as const) {
  test(`${route} keeps its repository media gallery intact on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${route}#project-gallery`);

    const images = page.locator('#project-gallery img');
    await expect(images).toHaveCount(expectedGalleryImages);
    for (let index = 0; index < expectedGalleryImages; index += 1) {
      await images.nth(index).scrollIntoViewIfNeeded();
      await expect(images.nth(index)).toBeVisible();
      await expect.poll(() => images.nth(index).evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('project media viewer supports full-size keyboard inspection on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/job-search-os#project-gallery');

  const firstTrigger = page.getByRole('button', { name: 'Open full-size view of Application assistant' });
  await firstTrigger.click();

  const viewer = page.getByRole('dialog', { name: 'Job Search OS full-size image viewer' });
  await expect(viewer).toBeVisible();
  await expect(viewer).toContainText('01 / 06');
  await expect(viewer.getByText('Application assistant', { exact: true })).toBeVisible();
  await expect.poll(() => viewer.locator('img').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  await page.keyboard.press('ArrowRight');
  await expect(viewer).toContainText('02 / 06');
  await expect(viewer.getByText('Search operations', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(firstTrigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('Job Search OS uses the native architecture flow instead of the rejected topology artifact', async ({ page }) => {
  await page.goto('/work/job-search-os');
  await expect(page.locator('img[src*="system-topology"]')).toHaveCount(0);
  await expect(page.getByText('System topology', { exact: true })).toHaveCount(0);

  const architecture = page.getByRole('figure', { name: 'System architecture flow' });
  await expect(architecture.locator('.architecture-step')).toHaveCount(5);
  await expect(architecture).toContainText('Direct ATS, company, and review-only lead channels');
  await expect(architecture).toContainText('Manual or explicitly approval-gated');
});

test('career portrait connects the homepage to the selected archive and earlier record', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The current work has a history.' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the career arc' }).click();
  await expect(page).toHaveURL('/archive');
  await expect(page.getByRole('heading', { level: 1, name: 'The work behind the current work' })).toBeVisible();
  await expect(page.locator('#yuco')).toContainText('yU+co studio website');
  await expect(page.locator('#yuco')).toContainText('Graphic Design USA Certificate of Excellence in Communication and Graphic Design');
  await expect(page.locator('#yuco')).toContainText('2006 Webby Awards Honoree');
  await expect(page.getByRole('heading', { name: 'More visual work across the years.' })).toBeVisible();
  await expect(page.locator('.legacy-gallery-grid > li')).toHaveCount(11);
  await expect(page.locator('.selected-archive-art img, .legacy-gallery-grid img')).toHaveCount(19);
  await expect(page.getByRole('heading', { name: 'TASER AXON / Evidence.com interface' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Beatnik mobile UI concepts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ignite Creative Learning programming instruction' })).toBeVisible();
  await expect(page.locator('#archive-ignite-class-2012')).toContainText('Scratch (MIT)');
  await expect(page.locator('#archive-ignite-class-2012')).toContainText('JavaScript');
  await expect(page.locator('body')).not.toContainText(/preserved source material|preserved portfolio/i);
  await expect(page.getByText('SapientNitro', { exact: true })).toBeVisible();
  await expect(page.getByText('General Dynamics', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Archive', exact: true }).first()).toBeVisible();
});

test('recommendations read as professional testimony without publication audit copy', async ({ page }) => {
  await page.goto('/recommendations');
  await expectCorePageContract(page);
  await expect(page.getByRole('heading', { level: 2, name: 'What people say' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(
    /verified from|source-verified|approved by carl|approved for publication|correction or removal/i,
  );
  const davidAllen = page.getByRole('listitem', { name: 'David Allen recommendation' });
  await expect(davidAllen).toContainText('David was Carl’s employer');
  await expect(davidAllen).not.toContainText('David was Carl’s client');
});

test('contact page invites conversation without internal policy copy', async ({ page }) => {
  await page.goto('/contact');
  await expectCorePageContract(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Email Carl' })).toBeVisible();
  await expect(page.getByText('Have a role, product, or difficult problem in mind?')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(
    /current résumé|no form|message collection|visitor message is stored|reviewed public evidence only|public corpus/i,
  );
});

test('visitor-facing routes avoid internal editorial and evidence-system language', async ({ page }) => {
  const rejectedCopy = /supported role|reviewed image record|reviewed public evidence only|public corpus|evidence model|view evidence map|claim limitations|requirement evidence|current résumé|message collection/i;
  for (const route of ['/', '/about', '/archive', '/capabilities', '/work', '/contact', '/recommendations']) {
    await page.goto(route);
    await expect(page.locator('body')).not.toContainText(rejectedCopy);
  }
});

test('work overview shows every flagship gallery preview without broken media', async ({ page }) => {
  await page.goto('/work');
  const projects = [
    { name: 'Job Search OS', previews: 4 },
    { name: 'Flight Tracker AI', previews: 3 },
    { name: 'Wave Factory Essentials', previews: 4 },
  ];

  for (const project of projects) {
    const chapter = page.getByRole('heading', { level: 2, name: project.name }).locator('xpath=ancestor::section');
    await expect(chapter.getByRole('link', { name: `View ${project.name} case study` })).toHaveAttribute('href', /\/work\//);
    const previews = chapter.locator('.project-media-preview img');
    await expect(previews).toHaveCount(project.previews);
    await previews.first().scrollIntoViewIfNeeded();
    await expect.poll(() => previews.evaluateAll((images) => (
      images.every((image) => (image as HTMLImageElement).naturalWidth > 0)
    ))).toBe(true);
  }
});

test('Flight Tracker leads with the dense live regional traffic workspace', async ({ page }) => {
  await page.goto('/work');
  const chapter = page.getByRole('heading', { level: 2, name: 'Flight Tracker AI' }).locator('xpath=ancestor::section');
  const leadImage = chapter.locator('.project-image');
  await expect(leadImage).toHaveAttribute('src', /live-traffic-weather\.png/);
  await expect(leadImage).toHaveAttribute('alt', /158 aircraft/);
  await expect.poll(() => leadImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(1200);

  await page.goto('/work/flight-tracker-ai');
  const caseStudyLead = page.locator('.project-detail-image img');
  await expect(caseStudyLead).toHaveAttribute('src', /live-traffic-weather\.png/);
  await expect(page.getByText('Deterministic replay workspace', { exact: true })).toBeVisible();
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

  await page.goto('/work/job-search-os#project-gallery');
  await expect(page.locator('#project-gallery img')).toHaveCount(6);
  await expect(page.getByText('Application assistant', { exact: true })).toBeVisible();
  await expect(page.getByText('System topology', { exact: true })).toHaveCount(0);
  await expect(page.locator('.architecture-step')).toHaveCount(5);
  await expect(page.getByText('External actions', { exact: true })).toBeVisible();
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
