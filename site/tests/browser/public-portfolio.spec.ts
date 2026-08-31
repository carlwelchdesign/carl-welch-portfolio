import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { githubProjects } from '../../app/github-projects';
import { projects } from '../../app/portfolio-data';
import { recommendations } from '../../app/recommendations-data';

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
  '/work/supraconscious-avatar-ai',
  '/work/argent-matchmaking',
  '/work/jolene-ai',
  '/work/progression-lab-ai',
] as const;

const mobileViewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

async function expectCorePageContract(page: Page) {
  await expect(page.locator('main#main-content')).toBeVisible();
  await expect(page.locator('main#main-content')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main-content');
  await expect(page.locator('[data-jolene-fixture-launcher]')).toHaveCount(0);
}

test('skip navigation transfers focus into main content on every public route', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const skipLink = page.locator('a.skip-link');
    const main = page.locator('main#main-content');

    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await expect(main).toBeFocused();
    await page.keyboard.press('Tab');
    const focusContinuesInsideMain = await main.evaluate((element) => element.contains(document.activeElement));
    expect(focusContinuesInsideMain, `${route} sends the next Tab outside main content`).toBe(true);
  }
});

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

test('all return-to-index controls meet the mobile touch-target contract', async ({ page }) => {
  const routeControls = [
    ['/', '.project-index-return', 7],
    ['/work', '.project-index-return', 7],
    ['/archive', '.archive-map-return', 6],
    ['/capabilities', '.capability-index-return', 5],
    ['/experience', '.career-index-return', 11],
    ['/recommendations', '.recommendation-highlights-return', 13],
  ] as const;

  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    for (const [route, selector, count] of routeControls) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const controls = page.locator(selector);
      await expect(controls).toHaveCount(count);
      const undersized = await controls.evaluateAll((links) => links.flatMap((link) => {
        const bounds = link.getBoundingClientRect();
        if (bounds.width >= 44 && bounds.height >= 44) return [];
        return [{
          label: link.textContent?.trim() || link.tagName,
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        }];
      }));
      expect(
        undersized,
        `${route} has undersized return controls at ${viewport.width}px: ${JSON.stringify(undersized)}`,
      ).toEqual([]);
    }
  }
});

test('return-to-index controls expose unique contextual names and preserve their destinations', async ({ page }) => {
  const routeControls = [
    ['/', '.project-index-return', 7, '#work-index'],
    ['/work', '.project-index-return', 7, '#work-index'],
    ['/archive', '.archive-map-return', 6, '#archive-map'],
    ['/capabilities', '.capability-index-return', 5, '#capability-index'],
    ['/experience', '.career-index-return', 11, '#career-index'],
    ['/recommendations', '.recommendation-highlights-return', 13, '#recommendation-highlights'],
  ] as const;

  for (const [route, selector, count, destination] of routeControls) {
    await page.goto(route);
    const controls = page.locator(selector);
    await expect(controls).toHaveCount(count);

    const links = await controls.evaluateAll((elements) => elements.map((element) => ({
      accessibleName: element.getAttribute('aria-label'),
      destination: element.getAttribute('href'),
    })));
    const accessibleNames = links.map(({ accessibleName }) => accessibleName);

    expect(accessibleNames.every((name) => name?.startsWith('Return to ')), route).toBe(true);
    expect(new Set(accessibleNames).size, `${route} has repeated return-control names`).toBe(count);
    expect(links.every((link) => link.destination === destination), route).toBe(true);
  }
});

test('return-to-index controls transfer focus to their fragment destinations', async ({ page }) => {
  const routes = [
    ['/work', '.project-index-return', '#work-index'],
    ['/archive', '.archive-map-return', '#archive-map'],
    ['/capabilities', '.capability-index-return', '#capability-index'],
    ['/experience', '.career-index-return', '#career-index'],
    ['/recommendations', '.recommendation-highlights-return', '#recommendation-highlights'],
  ] as const;

  for (const [route, selector, destination] of routes) {
    await page.goto(route);
    const returnLink = page.locator(selector).first();
    await returnLink.scrollIntoViewIfNeeded();
    await returnLink.click();

    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator(destination)).toBeFocused();
  }
});

test('return-to-index links retain native fragment navigation without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const routes = [
    ['/work', '.project-index-return', '#work-index'],
    ['/archive', '.archive-map-return', '#archive-map'],
    ['/capabilities', '.capability-index-return', '#capability-index'],
    ['/experience', '.career-index-return', '#career-index'],
    ['/recommendations', '.recommendation-highlights-return', '#recommendation-highlights'],
  ] as const;

  for (const [route, selector, destination] of routes) {
    await page.goto(route);
    const returnLink = page.locator(selector).first();
    await returnLink.scrollIntoViewIfNeeded();
    await returnLink.click();

    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator(destination)).toBeVisible();
  }

  await context.close();
});

test('page indexes transfer focus to every selected content destination', async ({ page }) => {
  const indexes = [
    ['/work', '#work-index a'],
    ['/archive', '#archive-map a'],
    ['/capabilities', '#capability-index a'],
    ['/experience', '#career-index a'],
    ['/recommendations', '#recommendation-highlights a'],
  ] as const;

  for (const [route, selector] of indexes) {
    await page.goto(route);
    const hrefs = await page.locator(selector).evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs.length, `${route} must expose indexed destinations`).toBeGreaterThan(0);

    for (const href of hrefs) {
      expect(href, `${route} index link is missing a fragment destination`).toMatch(/^#[a-z0-9-]+$/);
      if (!href) throw new Error(`${route} index link is missing a fragment destination`);
      const indexLink = page.locator(`${selector}[href="${href}"]`);
      await indexLink.focus();
      await indexLink.press('Enter');

      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.locator(href)).toBeFocused();
    }
  }
});

test('page indexes retain native forward fragment navigation without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const indexes = [
    ['/work', '#work-index a'],
    ['/archive', '#archive-map a'],
    ['/capabilities', '#capability-index a'],
    ['/experience', '#career-index a'],
    ['/recommendations', '#recommendation-highlights a'],
  ] as const;

  for (const [route, selector] of indexes) {
    await page.goto(route);
    const indexLink = page.locator(selector).first();
    const href = await indexLink.getAttribute('href');
    expect(href, `${route} index link is missing a fragment destination`).toMatch(/^#[a-z0-9-]+$/);
    if (!href) throw new Error(`${route} index link is missing a fragment destination`);
    await indexLink.focus();
    await indexLink.press('Enter');

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(href)).toBeVisible();
  }

  await context.close();
});

test('homepage selected-work action transfers focus and preserves native fallback', async ({ browser, page }) => {
  await page.goto('/');
  const selectedWorkAction = page.getByRole('link', { name: 'View selected work', exact: true });
  await selectedWorkAction.focus();
  await selectedWorkAction.press('Enter');

  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator('#work')).toBeFocused();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto('/');
  const nativeAction = noScriptPage.getByRole('link', { name: 'View selected work', exact: true });
  await nativeAction.focus();
  await nativeAction.press('Enter');

  await expect(noScriptPage).toHaveURL(/\/#work$/);
  await expect(noScriptPage.locator('#work')).toBeVisible();
  await noScriptContext.close();
});

test('every public route meets the mobile control-size and overflow contract', async ({ page }) => {
  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} overflows at ${viewport.width}px`).toBeLessThanOrEqual(0);

      const undersizedTargets = await page.locator('a, button, summary, input, textarea, select').evaluateAll(
        (elements) => elements.flatMap((element) => {
          const target = element as HTMLElement;
          const box = target.getBoundingClientRect();
          const styles = getComputedStyle(target);
          const visible = box.width > 0 && box.height > 0 && styles.visibility !== 'hidden' && styles.display !== 'none';
          if (!visible || (box.width >= 44 && box.height >= 44)) return [];
          return [{
            label: target.getAttribute('aria-label') || target.textContent?.trim().slice(0, 60) || target.tagName,
            width: Math.round(box.width),
            height: Math.round(box.height),
          }];
        }),
      );
      expect(
        undersizedTargets,
        `${route} has undersized controls at ${viewport.width}px: ${JSON.stringify(undersizedTargets)}`,
      ).toEqual([]);
    }
  }
});

test('fixed mobile targets preserve author attribution and architecture disclosure behavior', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/recommendations');
  const authorLinks = page.locator('.recommendation-card footer strong a');
  await expect(authorLinks).toHaveCount(13);
  await expect(page.getByRole('link', { name: 'David Allen on LinkedIn (opens in a new tab)', exact: true })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/davidallengtd/',
  );

  await page.goto('/work/job-search-os');
  const connections = page.locator('.architecture-connections');
  const disclosure = connections.getByText('Read system connections', { exact: true });
  await disclosure.focus();
  await expect(disclosure).toBeFocused();
  await disclosure.press('Enter');
  await expect(connections).toHaveAttribute('open', '');
});

test('primary navigation identifies the current portfolio section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Carl Welch home' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).locator('[aria-current="page"]')).toHaveCount(0);

  const sectionRoutes = [
    ['/work', 'Work'],
    ['/archive', 'Archive'],
    ['/about', 'About'],
    ['/experience', 'Experience'],
    ['/recommendations', 'Recommendations'],
    ['/work/job-search-os', 'Work'],
    ['/work/flight-tracker-ai', 'Work'],
    ['/work/wave-factory-essentials', 'Work'],
    ['/work/supraconscious-avatar-ai', 'Work'],
    ['/work/argent-matchmaking', 'Work'],
    ['/work/jolene-ai', 'Work'],
    ['/work/progression-lab-ai', 'Work'],
  ] as const;

  for (const [route, label] of sectionRoutes) {
    await page.goto(route);
    const navigation = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  }

  await page.goto('/contact');
  await expect(page.locator('a.build-label')).toHaveAttribute('aria-current', 'page');
});

test('mobile navigation identifies every current primary destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileRoutes = [
    ['/work/job-search-os', 'Work'],
    ['/archive', 'Archive'],
    ['/about', 'About'],
    ['/capabilities', 'Capabilities'],
    ['/experience', 'Experience'],
    ['/recommendations', 'Recommendations'],
    ['/contact', 'Contact'],
  ] as const;

  for (const [route, label] of mobileRoutes) {
    await page.goto(route);
    const menu = page.locator('details.mobile-navigation');
    await menu.locator('summary').click();
    const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  }
});

test('collapsed mobile menu communicates the current section at every phone width', async ({ page }) => {
  const locationRoutes = [
    ['/', 'Home'],
    ['/work', 'Work'],
    ['/archive', 'Archive'],
    ['/about', 'About'],
    ['/capabilities', 'Capabilities'],
    ['/experience', 'Experience'],
    ['/recommendations', 'Recommendations'],
    ['/contact', 'Contact'],
    ['/work/job-search-os', 'Work'],
    ['/work/flight-tracker-ai', 'Work'],
    ['/work/wave-factory-essentials', 'Work'],
    ['/work/supraconscious-avatar-ai', 'Work'],
    ['/work/argent-matchmaking', 'Work'],
    ['/work/jolene-ai', 'Work'],
    ['/work/progression-lab-ai', 'Work'],
  ] as const;

  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    for (const [route, section] of locationRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const menu = page.locator('details.mobile-navigation');
      const summary = menu.locator('summary');
      await expect(menu).not.toHaveAttribute('open', '');
      await expect(summary).toHaveAttribute('aria-label', `Menu, current section: ${section}`);
      await expect(summary.locator('.mobile-navigation-location')).toHaveText(section);

      const bounds = await summary.boundingBox();
      expect(bounds, `${route} menu is missing at ${viewport.width}px`).not.toBeNull();
      expect(bounds?.height, `${route} menu is too short at ${viewport.width}px`).toBeGreaterThanOrEqual(44);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} overflows at ${viewport.width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test('mobile menu supports keyboard, outside-pointer, and destination dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work');
  const menu = page.locator('details.mobile-navigation');
  const summary = menu.locator('summary');
  await expect(menu).toHaveAttribute('data-dismissal-ready', 'true');

  await summary.click();
  await expect(menu).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();

  await summary.click();
  await page.locator('main#main-content').click();
  await expect(menu).not.toHaveAttribute('open', '');

  await summary.click();
  await menu.getByRole('link', { name: 'Archive', exact: true }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(summary).toHaveAttribute('aria-label', 'Menu, current section: Archive');
});

test('homepage gives recruiters a synchronized proof summary', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const proof = page.getByRole('region', { name: 'Portfolio at a glance' });
  await expect(proof.locator('dt')).toHaveCount(4);
  await expect(proof.locator('dd')).toHaveText(['20+', '5', '13', '7']);
  await expect(proof).toContainText('Years across interactive and product work');
  await expect(proof).toContainText('Product engineering roles since 2016');
  await expect(proof).toContainText('Professional recommendations');
  await expect(proof).toContainText('Flagship projects with full case studies');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('homepage closes with a direct recruiter next step', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const closing = page.getByRole('region', { name: 'Let’s talk about what you’re building.' });
  await expect(closing).toContainText('If you’re hiring for senior product engineering');
  await expect(closing.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact');
  const resume = closing.getByRole('link', { name: 'Download Carl Welch résumé (PDF)' });
  await expect(resume).toHaveAttribute('href', '/carl-welch-resume.pdf');
  await expect(resume).toHaveAttribute('download', '');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const [route, expectedGalleryImages] of [
  ['/work/job-search-os', 6],
  ['/work/flight-tracker-ai', 3],
  ['/work/wave-factory-essentials', 5],
  ['/work/supraconscious-avatar-ai', 3],
  ['/work/argent-matchmaking', 3],
  ['/work/progression-lab-ai', 2],
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

test('Supraconscious case study uses the current public product screenshots', async ({ page }) => {
  await page.goto('/work/supraconscious-avatar-ai#project-gallery');

  await expect(page.locator('.project-detail-image img')).toHaveAttribute('src', /current-landing/);
  await expect(page.locator('#project-gallery img[src*="reflection-method"]')).toHaveCount(1);
  await expect(page.locator('#project-gallery img[src*="plans-and-access"]')).toHaveCount(1);
  await expect(page.locator('#project-gallery img[src*="mobile-landing"]')).toHaveCount(1);
  await expect(page.locator('img[src*="journal-workspace"], img[src*="privacy-settings"], img[src*="pricing-page"]')).toHaveCount(0);
});

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

test('Job Search OS renders a source-grounded product topology instead of the rejected static artifact', async ({ page }) => {
  await page.goto('/work/job-search-os');
  await expect(page.locator('img[src*="system-topology"]')).toHaveCount(0);
  await expect(page.getByText('System topology', { exact: true })).toHaveCount(0);

  const architecture = page.locator('#architecture .architecture-card');
  await expect(architecture).toContainText('Human-reviewed career operations');
  await expect(architecture).toContainText('PostgreSQL');
  await expect(architecture).toContainText('pgvector');
  await expect(architecture).toContainText('LangGraph');
  await expect(architecture).toContainText('MCP');
  await expect(architecture).toContainText('approved only');
  expect(await architecture.locator('.architecture-step').count()).toBeGreaterThanOrEqual(10);
});

for (const route of [
  '/work/job-search-os',
  '/work/flight-tracker-ai',
  '/work/wave-factory-essentials',
  '/work/supraconscious-avatar-ai',
  '/work/argent-matchmaking',
  '/work/progression-lab-ai',
] as const) {
  test(`${route} renders a responsive project-specific system map`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${route}#architecture`);

    const architecture = page.locator('#architecture .architecture-card');
    await expect(architecture.locator('.architecture-summary')).toBeVisible();
    expect(await architecture.locator('.architecture-group').count()).toBeGreaterThanOrEqual(3);
    expect(await architecture.locator('.architecture-step').count()).toBeGreaterThanOrEqual(10);
    expect(await architecture.locator('.architecture-step p').count()).toBeGreaterThanOrEqual(10);
    expect(await architecture.locator('.architecture-connectors > g > path').count()).toBeGreaterThanOrEqual(10);
    await expect(architecture.locator('.architecture-step').first()).toHaveCSS('border-top-color', /rgb\(/);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(architecture.locator('.architecture-connectors')).toBeVisible();
    expect(await architecture.locator('.architecture-step').count()).toBeGreaterThanOrEqual(10);
    const diagramOverflow = await architecture.locator('.architecture-viewport').evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(diagramOverflow).toBeGreaterThan(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const [route, heading, decision] of [
  ['/work/job-search-os', 'Turning a fragmented search into one operating system.', 'Evidence over invention'],
  ['/work/flight-tracker-ai', 'Making a dense air picture understandable and reviewable.', 'Live when available, repeatable when needed'],
  ['/work/wave-factory-essentials', 'Treating every plug-in as a product, not a demo.', 'Build for the host from the start'],
  ['/work/supraconscious-avatar-ai', 'Building a reflection product that can be governed.', 'Govern retrieval before expanding it'],
  ['/work/argent-matchmaking', 'Designing for judgment, discretion, and human review.', 'Human-led by design'],
  ['/work/progression-lab-ai', 'Turning harmonic intent into something a musician can hear, inspect, and keep.', 'Constrain model output'],
] as const) {
  test(`${route} explains the problem, contribution, and product decisions`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${route}#case-study`);

    const story = page.locator('#case-study');
    await expect(story.getByRole('heading', { name: heading })).toBeVisible();
    await expect(story.getByText('The problem', { exact: true })).toBeVisible();
    await expect(story.getByText('What I built', { exact: true })).toBeVisible();
    await expect(story.getByText(decision, { exact: true })).toBeVisible();
    await expect(story.locator('.project-story-decisions li')).toHaveCount(3);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('Jolene case study publishes the approved origin story and stable evidence anchor', async ({ page }) => {
  const originAnchor = '#evidence--portfolio--claim--jolene-ai--origin';

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/work/jolene-ai${originAnchor}`);

  const story = page.locator('#case-study');
  await expect(story.getByRole('heading', { name: 'From a Nevada field camp to a governed chief-of-staff agent.' })).toBeVisible();
  await expect(story).toContainText('After a March 2026 layoff');
  await expect(story).toContainText('BLM land in Nevada');
  await expect(story).toContainText('generator, Starlink, and my MacBook');
  await expect(story).toContainText('Jolene is not Dolly, does not impersonate her, and does not imply her endorsement.');

  const originEvidence = page.locator(originAnchor);
  await expect(originEvidence).toBeVisible();
  await expect(originEvidence).toContainText('comforting, capable chief-of-staff agent');
  await expect(originEvidence).toBeFocused();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('Jolene case study presents distinct character sheets, the build retrospective, and current architecture', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/jolene-ai#project-gallery');

  const gallery = page.locator('#project-gallery');
  const media = gallery.locator('.project-gallery-item img');
  await expect(media).toHaveCount(4);
  for (const image of await media.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  const sources = await media.evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(new Set(sources).size).toBe(4);
  await expect(gallery.getByText('Conversation state ensemble', { exact: true })).toBeVisible();
  await expect(gallery.getByText('Canonical identity lock', { exact: true })).toBeVisible();
  await expect(gallery.getByText('Greeting keyframes', { exact: true })).toBeVisible();
  await expect(gallery.getByText('Approved runtime atlas', { exact: true })).toBeVisible();

  await gallery.getByRole('button', { name: 'Open full-size view of Greeting keyframes' }).click();
  const viewer = page.getByRole('dialog', { name: 'Jolene AI full-size image viewer' });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByText('Greeting keyframes', { exact: true })).toBeVisible();
  await viewer.getByRole('button', { name: 'Close' }).click();
  await expect(viewer).not.toBeVisible();

  const retrospective = page.locator('#retrospective');
  await expect(retrospective.getByRole('heading', { name: 'The character only became reliable when art direction became engineering.' })).toBeVisible();
  await expect(retrospective.locator('.project-retrospective-grid > li')).toHaveCount(4);
  await expect(retrospective).toContainText('Identity drift between poses');
  await expect(retrospective).toContainText('Transparency versus intentional white');

  const architecture = page.locator('#architecture');
  const architectureMap = architecture.locator('.architecture-map').last();
  await expect(architectureMap.locator('[data-architecture-node="retrieval"]')).toContainText('Public hybrid RAG');
  await expect(architectureMap.locator('[data-architecture-node="retrieval"]')).toContainText('Lexical + embeddings');
  await expect(architectureMap.locator('[data-architecture-node="retrieval"]')).toContainText('Reciprocal-rank fusion');
  await expect(architectureMap.locator('[data-architecture-node="corpus"]')).toContainText('Reviewed career artifact');
  await expect(architectureMap.locator('[data-architecture-node="corpus"]')).toContainText('Five chapters, 16 roles, 92 published records');
  await expect(architectureMap.locator('[data-architecture-node="evaluation"]')).toContainText('132 cases, 192 turns, red team');

  const evidence = page.getByRole('region', { name: 'Jolene AI evidence and boundaries' });
  await expect(evidence).toContainText('retrieval-augmented generation (RAG)');
  await expect(evidence).toContainText('bounded in-memory vector index');
  await expect(evidence).toContainText('separate vector database');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const [route, role, scope] of [
  ['/work/job-search-os', 'Independent product engineer', 'Product strategy, interface design, and full-stack implementation'],
  ['/work/flight-tracker-ai', 'Independent product engineer', 'Product design, frontend engineering, and Rust service integration'],
  ['/work/wave-factory-essentials', 'Creator and plug-in engineer', 'DSP, plug-in architecture, interface design, and product direction'],
  ['/work/supraconscious-avatar-ai', 'Independent product engineer', 'Product strategy, AI system design, and full-stack implementation'],
  ['/work/argent-matchmaking', 'Product engineer and system designer', 'Product strategy, interface art direction, platform architecture, and implementation'],
  ['/work/jolene-ai', 'Product architect and lead builder', 'Product direction, agent architecture, evidence design, character and behavior direction, implementation, evaluation, and release governance'],
  ['/work/progression-lab-ai', 'Creator and independent product engineer', 'Product strategy, interaction design, full-stack engineering, AI orchestration, and music playback'],
] as const) {
  test(`${route} presents recruiter-readable project facts above the fold`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(route);

    const facts = page.getByRole('definition').first();
    await expect(page.locator('.project-facts')).toContainText(role);
    await expect(page.locator('.project-facts')).toContainText(scope);
    await expect(page.locator('.project-facts dt')).toHaveCount(4);
    await expect(page.locator('.project-facts dd')).toHaveCount(4);
    await expect(facts).toBeAttached();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const [route, nextProject, nextHref] of [
  ['/work/job-search-os', 'Flight Tracker AI', '/work/flight-tracker-ai'],
  ['/work/flight-tracker-ai', 'Wave Factory Essentials', '/work/wave-factory-essentials'],
  ['/work/wave-factory-essentials', 'Supraconscious Avatar AI', '/work/supraconscious-avatar-ai'],
  ['/work/supraconscious-avatar-ai', 'Argent Matchmaking', '/work/argent-matchmaking'],
  ['/work/argent-matchmaking', 'Jolene AI', '/work/jolene-ai'],
  ['/work/jolene-ai', 'ProgressionLab', '/work/progression-lab-ai'],
  ['/work/progression-lab-ai', 'Job Search OS', '/work/job-search-os'],
] as const) {
  test(`${route} continues to the next flagship case study`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    const continuation = page.locator('.project-continuation');
    await expect(continuation.getByRole('heading', { name: 'Next case study' })).toBeVisible();
    await expect(continuation.getByRole('link', { name: `Next case study: ${nextProject}` })).toHaveAttribute('href', nextHref);
    await expect(continuation.getByRole('link', { name: /View all selected work/ })).toHaveAttribute('href', '/work');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('flagship project links identify destinations and new-tab behavior', async ({ page }) => {
  for (const project of projects) {
    await page.goto(`/work/${project.slug}`);
    const links = page.getByRole('region', { name: 'Project links' });
    const repository = links.getByRole('link', {
      name: `Open ${project.name} repository on GitHub (opens in a new tab)`,
      exact: true,
    });

    await expect(repository).toHaveAttribute('href', project.repositoryUrl);
    await expect(repository).toHaveAttribute('target', '_blank');
    await expect(repository).toHaveAttribute('rel', /\bnoreferrer\b/);

    if (project.liveUrl) {
      const liveDemo = links.getByRole('link', {
        name: `Open ${project.name} live demo (opens in a new tab)`,
        exact: true,
      });
      await expect(liveDemo).toHaveAttribute('href', project.liveUrl);
      await expect(liveDemo).toHaveAttribute('target', '_blank');
      await expect(liveDemo).toHaveAttribute('rel', /\bnoreferrer\b/);
      await expect(links.getByRole('link')).toHaveCount(2);
    } else {
      await expect(links.getByRole('link')).toHaveCount(1);
    }
  }
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

test('homepage career portrait shows exact archival proof with mobile browsing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const proof = page.locator('.career-portrait-proof');
  const rail = proof.locator(':scope > ol');
  const links = proof.getByRole('link');

  await expect(proof.getByText('From the archive')).toBeVisible();
  await expect(proof.getByText('Swipe to browse')).toBeVisible();
  await expect(links).toHaveCount(4);
  expect(await links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))).toEqual([
    '/archive#legacy-dkny',
    '/archive#legacy-gm-defense',
    '/archive#legacy-gtd-iq',
    '/archive#legacy-ufc-japan',
  ]);
  await expect(proof.locator('strong')).toHaveText([
    'DKNY e-commerce',
    'GM Defense immersive training',
    'GTD IQ application',
    'UFC Japan social takeover',
  ]);

  const images = proof.locator('img');
  await expect(images).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    const dimensions = await image.evaluate((element) => {
      const source = element as HTMLImageElement;
      return { naturalWidth: source.naturalWidth, renderedWidth: source.getBoundingClientRect().width };
    });
    expect(dimensions.naturalWidth).toBe(240);
    expect(dimensions.renderedWidth).toBeLessThanOrEqual(240);
  }

  const railDimensions = await rail.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(railDimensions.scrollWidth).toBeGreaterThan(railDimensions.clientWidth);
  await rail.evaluate((element) => { element.scrollLeft = 0; });
  await links.last().focus();
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await links.first().focus();
  await links.first().press('Enter');
  await page.waitForURL(/\/archive#legacy-dkny$/);
  await expect(page.locator('#legacy-dkny')).toBeInViewport({ timeout: 5000 });
});

test('archive map makes the full historical record navigable', async ({ page }) => {
  await page.goto('/archive');
  const map = page.getByRole('navigation', { name: 'Archive map' });
  const destinations = [
    ['Career portrait', '#archive-portrait', 'One career thesis'],
    ['Career chapters', '#career-chapters', '4 chapters'],
    ['Featured yU+co record', '#yuco', '2006 to 2007'],
    ['Selected visual archive', '#visual-archive', '11 projects'],
    ['Working archive', '#working-archive', '16 images'],
    ['Professional range', '#professional-range', 'Earlier work'],
  ] as const;

  await expect(map).toBeVisible();
  await expect(map.getByRole('link')).toHaveCount(destinations.length);
  await expect(page.locator('.archive-map-return')).toHaveCount(destinations.length);
  for (const [name, href, count] of destinations) {
    const link = map.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toContainText(count);
    const section = page.locator(href);
    await expect(section).toHaveCount(1);
    await expect(section.getByRole('link', { name: /Archive map/ })).toHaveAttribute('href', '#archive-map');
  }

  const workingArchive = map.getByRole('link', { name: /Working archive/ });
  await workingArchive.focus();
  await expect(workingArchive).toBeFocused();
  await workingArchive.click();
  await expect(page).toHaveURL(/\/archive#working-archive$/);
  await expect(page.locator('#working-archive')).toBeInViewport();
  const returnLink = page.locator('#working-archive').getByRole('link', { name: /Archive map/ });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.click();
  await expect(page).toHaveURL(/\/archive#archive-map$/);
  await expect(map).toBeInViewport();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/archive');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

  const lauraBaran = page.getByRole('listitem', { name: 'Laura Baran recommendation' });
  await expect(lauraBaran).toContainText('3D virtual & augmented reality program');
  await expect(lauraBaran).not.toContainText('3D hologram program');
});

test('recommendation profile links identify LinkedIn and new-tab behavior', async ({ page }) => {
  await page.goto('/recommendations');
  const profileLinks = page.locator('.recommendation-card footer strong a[target="_blank"]');
  await expect(profileLinks).toHaveCount(recommendations.length);

  const renderedLinks = await profileLinks.evaluateAll((links) => links.map((link) => ({
    accessibleName: link.getAttribute('aria-label'),
    href: link.getAttribute('href'),
    rel: link.getAttribute('rel'),
    target: link.getAttribute('target'),
    visibleName: link.textContent?.trim(),
  })));

  expect(renderedLinks).toEqual(recommendations.map((recommendation) => ({
    accessibleName: `${recommendation.name} on LinkedIn (opens in a new tab)`,
    href: recommendation.authorProfileUrl,
    rel: 'noreferrer',
    target: '_blank',
    visibleName: recommendation.name,
  })));
});

test('recommendation highlights use direct excerpts and link to the full testimony', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/recommendations');

  const highlights = page.getByRole('navigation', { name: 'Recommendation highlights' });
  await expect(highlights.getByRole('link')).toHaveCount(4);
  await expect(page.locator('.recommendation-highlights-return')).toHaveCount(13);
  for (const returnLink of await page.locator('.recommendation-highlights-return').all()) {
    await expect(returnLink).toHaveAttribute('href', '#recommendation-highlights');
  }
  await expect(highlights).toContainText('Product craft');
  await expect(highlights).toContainText('Carl’s been a true mentor.');
  await expect(highlights).toContainText("Carl's experience, persistence, and (most of all) calm always saved the day.");
  await expect(highlights).toContainText('Carl Welch is a rare breed of web expert.');

  const mentorship = highlights.getByRole('link', { name: /Mentorship/ });
  await expect(mentorship).toHaveAttribute(
    'href',
    '#evidence--portfolio--source--recommendation--jason-conover-2017-07-17',
  );
  await mentorship.click();
  await expect(page).toHaveURL(/#evidence--portfolio--source--recommendation--jason-conover-2017-07-17$/);
  const jasonConover = page.getByRole('listitem', { name: 'Jason Conover recommendation' });
  await expect(jasonConover).toBeVisible();
  const returnLink = jasonConover.getByRole('link', { name: /Recommendation highlights/ });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.click();
  await expect(page).toHaveURL(/\/recommendations#recommendation-highlights$/);
  await expect(highlights).toBeInViewport();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('recommendations close with clear recruiter next steps', async ({ page }) => {
  await page.goto('/recommendations');
  const closing = page.getByRole('region', { name: 'See the work they’re talking about.' });
  const actions = closing.getByRole('navigation', { name: 'Continue from the recommendations' });
  const destinations = [
    ['View selected work', '/work#work-index'],
    ['Trace the career', '/experience#career-index'],
    ['Contact Carl', '/contact'],
  ] as const;

  await expect(closing).toBeVisible();
  await expect(actions.getByRole('link')).toHaveCount(destinations.length);
  for (const [name, href] of destinations) {
    const link = actions.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    await link.focus();
    await expect(link).toBeFocused();
  }

  await actions.getByRole('link', { name: 'View selected work' }).click();
  await expect(page).toHaveURL(/\/work#work-index$/);
  await expect(page.locator('#work-index')).toBeInViewport();

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/recommendations');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const undersizedLinks = await actions.getByRole('link').evaluateAll((links) => (
      links.filter((link) => {
        const bounds = link.getBoundingClientRect();
        return bounds.width < 44 || bounds.height < 44;
      }).length
    ));
    expect(undersizedLinks).toBe(0);
  }
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

test('professional profile links identify destinations and new-tab behavior', async ({ page }) => {
  await page.goto('/contact');

  const expectedLinks = [
    ['Open Carl Welch’s LinkedIn profile (opens in a new tab)', 'https://www.linkedin.com/in/carlwelch'],
    ['Open Carl Welch’s GitHub profile (opens in a new tab)', 'https://github.com/carlwelchdesign'],
    ['Carl Welch on LinkedIn (opens in a new tab)', 'https://www.linkedin.com/in/carlwelch'],
    ['Carl Welch on GitHub (opens in a new tab)', 'https://github.com/carlwelchdesign'],
  ] as const;

  for (const [name, href] of expectedLinks) {
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
  }

  const emailLinks = page.locator('a[href^="mailto:"]');
  const resumeLinks = page.locator('a[download]');
  await expect(emailLinks).toHaveCount(2);
  await expect(resumeLinks).toHaveCount(2);
  expect(await emailLinks.evaluateAll((links) => links.every((link) => !link.hasAttribute('target')))).toBe(true);
  expect(await resumeLinks.evaluateAll((links) => links.every((link) => !link.hasAttribute('target')))).toBe(true);
});

test('résumé downloads identify Carl and the PDF file type on every public route', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const resumeLinks = page.getByRole('link', { name: 'Download Carl Welch résumé (PDF)', exact: true });
    const expectedCount = route === '/' ? 3 : route === '/contact' ? 2 : 1;

    await expect(resumeLinks).toHaveCount(expectedCount);
    expect(await resumeLinks.evaluateAll((links) => links.every((link) => (
      link.getAttribute('href') === '/carl-welch-resume.pdf' &&
      link.hasAttribute('download') &&
      link.getAttribute('type') === 'application/pdf' &&
      !link.hasAttribute('target')
    )))).toBe(true);
  }
});

test('capability index maps every strength to supporting work', async ({ page }) => {
  await page.goto('/capabilities');
  const index = page.getByRole('navigation', { name: 'Capability index' });
  const destinations = [
    ['Product interface systems', '#product-interface-systems', '3 examples'],
    ['Bounded AI workflows', '#bounded-ai-workflows', '3 examples'],
    ['Security and platform boundaries', '#security-and-platform-boundaries', '3 examples'],
    ['Creative technology', '#creative-technology', '3 examples'],
    ['Technical leadership', '#technical-leadership', '2 examples'],
  ] as const;

  await expect(index).toBeVisible();
  await expect(index.getByRole('link')).toHaveCount(destinations.length);
  await expect(page.locator('.capability-index-return')).toHaveCount(destinations.length);
  for (const [name, href, count] of destinations) {
    const link = index.getByRole('link', { name: new RegExp(name) });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toContainText(count);
    const section = page.locator(href);
    await expect(section).toHaveCount(1);
    await expect(section.getByRole('link', { name: /Capability index/ })).toHaveAttribute(
      'href',
      '#capability-index',
    );
  }

  const leadership = index.getByRole('link', { name: /Technical leadership/ });
  await leadership.focus();
  await expect(leadership).toBeFocused();
  await leadership.click();
  await expect(page).toHaveURL(/\/capabilities#technical-leadership$/);
  await expect(page.locator('#technical-leadership')).toBeInViewport();
  const returnLink = page.locator('#technical-leadership').getByRole('link', { name: /Capability index/ });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.click();
  await expect(page).toHaveURL(/\/capabilities#capability-index$/);
  await expect(index).toBeInViewport();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/capabilities');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('capabilities closing routes recruiters to deeper proof', async ({ page }) => {
  await page.goto('/capabilities');
  const nextSteps = page.getByRole('navigation', { name: 'Explore proof behind the capabilities' });
  const destinations = [
    ['Case studies', '/work#work-index', '#work-index'],
    ['Repositories', '/work#public-repositories', '#public-repositories'],
    ['Recommendations', '/recommendations#recommendation-highlights', '#recommendation-highlights'],
  ] as const;

  await expect(nextSteps).toBeVisible();
  await expect(nextSteps.getByRole('link')).toHaveCount(destinations.length);
  for (const [name, href] of destinations) {
    const link = nextSteps.getByRole('link', { name: new RegExp(name) });
    await expect(link).toHaveAttribute('href', href);
    await link.focus();
    await expect(link).toBeFocused();
  }

  for (const [name, , target] of destinations) {
    await page.goto('/capabilities');
    await nextSteps.getByRole('link', { name: new RegExp(name) }).click();
    await expect(page.locator(target)).toHaveCount(1);
    await expect(page.locator(target)).toBeInViewport();
  }

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/capabilities');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const undersizedLinks = await nextSteps.getByRole('link').evaluateAll((links) => (
      links.filter((link) => {
        const bounds = link.getBoundingClientRect();
        return bounds.width < 44 || bounds.height < 44;
      }).length
    ));
    expect(undersizedLinks).toBe(0);
  }
});

test('experience career index exposes the full professional arc', async ({ page }) => {
  await page.goto('/experience');
  const index = page.getByRole('navigation', { name: 'Career index' });
  const destinations = [
    ['Recent product engineering', '#recent-product-roles'],
    ['The Army, art school, and GWAR', '#career-army-art-school-gwar'],
    ['Learning the web by building all of it', '#career-early-full-stack-web'],
    ['Immersive systems before AR was a product category', '#career-immersive-systems'],
    ['Brand systems, GTD, and Evidence.com', '#career-gtd-evidence-com'],
    ['Agency range without losing the engineering', '#career-agency-creative-technology'],
    ['Teaching code made the work legible', '#career-teaching-code'],
  ] as const;

  await expect(index).toBeVisible();
  await expect(index.getByRole('link')).toHaveCount(destinations.length);
  await expect(page.locator('.career-index-return')).toHaveCount(11);
  for (const [label, href] of destinations) {
    await expect(index.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href);
    await expect(page.locator(href)).toHaveCount(1);
  }
  for (const returnLink of await page.locator('.career-index-return').all()) {
    await expect(returnLink).toHaveAttribute('href', '#career-index');
  }

  const evidenceLink = index.getByRole('link', { name: /Brand systems, GTD, and Evidence.com/ });
  await evidenceLink.focus();
  await expect(evidenceLink).toBeFocused();
  await evidenceLink.click();
  await expect(page).toHaveURL(/\/experience#career-gtd-evidence-com$/);
  await expect(page.locator('#career-gtd-evidence-com')).toBeInViewport();
  const returnLink = page.locator('#career-gtd-evidence-com').getByRole('link', { name: /Career index/ });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.click();
  await expect(page).toHaveURL(/\/experience#career-index$/);
  await expect(index).toBeInViewport();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/experience');
  await expect(page.getByRole('navigation', { name: 'Career index' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('experience presents the full early-career foundation without flattening it into a client list', async ({ page }) => {
  await page.goto('/experience#career-foundations');
  const foundations = page.locator('.career-foundation-list > li');
  await expect(foundations).toHaveCount(6);
  await expect(page.getByRole('heading', { level: 3, name: 'The Army, art school, and GWAR' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Immersive systems before AR was a product category' })).toBeVisible();
  await expect(page.getByText('PHP', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('MySQL', { exact: true }).first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('805-403-4819');
});

test('experience presents the historical client range with explicit agency and team context', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/experience#career-foundations');
  const field = page.locator('.legacy-client-field');
  const viewport = page.getByRole('region', { name: 'Historical client and project index' });
  await expect(field.getByRole('heading', { name: 'The work moved from defense and finance to entertainment, commerce, and culture.' })).toBeVisible();
  await expect(field).toContainText('Some were direct roles. Many came through agencies, studios, and project teams.');
  await expect(field.getByText('35 selected marks')).toBeVisible();
  await expect(field.getByText('Swipe to browse')).toBeVisible();
  await expect(viewport).toHaveAttribute('aria-describedby', 'legacy-client-mark-guide');
  await expect(field.locator('.legacy-client-mark-grid img')).toHaveCount(35);
  await expect(field.locator('.legacy-client-mark-grid > li')).toHaveCount(36);

  for (const index of [0, 17, 34]) {
    const image = field.locator('.legacy-client-mark-grid img').nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(170);
  }

  await page.evaluate(() => document.fonts.ready);
  expect(await field.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThan(1050);
  const mobileScroll = await viewport.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(mobileScroll.scrollWidth).toBeGreaterThan(mobileScroll.clientWidth);
  await viewport.evaluate((element) => { element.scrollLeft = 0; });
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/experience#career-foundations');
  await page.evaluate(() => document.fonts.ready);
  const desktopField = page.locator('.legacy-client-field');
  expect(await desktopField.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThan(1250);
  expect(await desktopField.locator('.legacy-client-mark-grid').evaluate((element) => (
    getComputedStyle(element).gridTemplateColumns.split(' ').length
  ))).toBe(8);
  const linkedMarks = desktopField.locator('.legacy-client-mark-grid a');
  await expect(linkedMarks).toHaveCount(9);
  expect(await linkedMarks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual([
    '/archive#legacy-coca-cola',
    '/archive#legacy-dkny',
    '/archive#legacy-gm-defense',
    '/archive#legacy-gtd-iq',
    '/archive#legacy-magento-social',
    '/archive#legacy-metal-gear-solid',
    '/archive#legacy-ufc-japan',
    '/archive#legacy-political-animals',
    '/archive#legacy-300',
  ]);
  for (const staticMark of ['GWAR', 'TASER', 'Walt Disney Pictures']) {
    const mark = desktopField.getByText(staticMark, { exact: true });
    await expect(mark.locator('xpath=parent::li').locator('a')).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const cocaColaLink = page.getByRole('link', { name: 'View archived work related to Coca-Cola' });
  await cocaColaLink.focus();
  await expect(cocaColaLink).toBeFocused();
  await cocaColaLink.press('Enter');
  await page.waitForURL(/\/archive#legacy-coca-cola$/);
  await expect(page.locator('#legacy-coca-cola')).toBeInViewport({ timeout: 5000 });
});

test('archive adds a responsive working contact sheet without stretching the small originals', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/archive#legacy-gm-defense');
  const archive = page.locator('.legacy-working-archive');
  await expect(archive.getByRole('heading', { name: 'The hands-on years left a lot of fingerprints.' })).toBeVisible();
  await expect(archive.locator('.legacy-working-grid > li')).toHaveCount(16);
  await expect(archive.locator('.legacy-working-grid img')).toHaveCount(16);
  await expect(archive).toContainText('PETROL Advertising');
  await expect(archive).toContainText('PHP and MySQL');

  for (const index of [0, 7, 15]) {
    const image = archive.locator('.legacy-working-grid img').nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('working archive search finds source-backed projects and keeps inspection inside the result set', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/archive');

  const archive = page.locator('.legacy-working-archive');
  const search = archive.getByRole('search', { name: 'Search the visual working archive' });
  const input = search.getByRole('searchbox', { name: 'Find work by project, organization, or technology' });
  const gridItems = archive.locator('.legacy-working-grid > li');

  await expect(archive.locator('.legacy-working-grid')).toHaveAttribute('data-inspector-ready', 'true');
  await expect(search.getByText('16 of 16 projects')).toBeVisible();
  await input.fill('General Dynamics');
  await expect(search.getByText('1 of 16 projects')).toBeVisible();
  await expect(gridItems).toHaveCount(1);
  await expect(archive.getByRole('heading', { name: 'GM Defense immersive training' })).toBeVisible();
  await expect(archive.getByRole('heading', { name: 'GTD IQ application' })).toHaveCount(0);

  await archive.getByRole('button', { name: 'Inspect GM Defense immersive training' }).click();
  const dialog = page.locator('.legacy-inspector');
  await expect(dialog).toContainText('01 of 1');
  await dialog.getByRole('button', { name: /^Next/ }).click();
  await expect(dialog.getByRole('heading', { name: 'GM Defense immersive training' })).toBeVisible();
  await page.keyboard.press('Escape');

  await search.getByRole('button', { name: 'Clear search' }).click();
  await expect(search.getByText('16 of 16 projects')).toBeVisible();
  await expect(gridItems).toHaveCount(16);

  await input.fill('not a project in this archive');
  await expect(search.getByText('0 of 16 projects')).toBeVisible();
  await expect(archive.getByRole('heading', { name: 'Try a project, organization, discipline, or technology.' })).toBeVisible();
  await archive.getByRole('button', { name: 'Show all 16 projects' }).click();
  await expect(gridItems).toHaveCount(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('archive inspector supports focused keyboard and mobile review without upscaling small sources', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/archive#legacy-gm-defense');

  const controls = page.getByRole('button', { name: /^Inspect / });
  await expect(controls).toHaveCount(16);
  await expect(page.locator('.legacy-working-grid')).toHaveAttribute('data-inspector-ready', 'true');
  const firstControl = controls.first();
  await firstControl.click();

  const dialog = page.locator('.legacy-inspector');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'GM Defense immersive training' })).toBeVisible();
  await expect(dialog.getByText('General Dynamics / GM Defense')).toBeVisible();

  const imageDimensions = await dialog.locator('figure img').evaluate((element) => {
    const image = element as HTMLImageElement;
    return { naturalWidth: image.naturalWidth, renderedWidth: image.getBoundingClientRect().width };
  });
  expect(imageDimensions.naturalWidth).toBe(240);
  expect(imageDimensions.renderedWidth).toBeLessThanOrEqual(240);

  const animationDuration = await dialog.evaluate((element) => getComputedStyle(element).animationDuration);
  const animationMilliseconds = animationDuration.endsWith('ms')
    ? Number.parseFloat(animationDuration)
    : Number.parseFloat(animationDuration) * 1000;
  expect(animationMilliseconds).toBeLessThanOrEqual(0.02);

  await dialog.getByRole('button', { name: /^Next/ }).click();
  await expect(dialog.getByRole('heading', { name: 'GTD IQ application' })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('heading', { name: 'GM Defense immersive training' })).toBeVisible();

  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(firstControl).toBeFocused();
  await expect(page.locator('#legacy-gm-defense')).toHaveCount(1);
});

test('visitor-facing routes avoid internal editorial and evidence-system language', async ({ page }) => {
  const rejectedCopy = /supported role|reviewed image record|reviewed public evidence only|public corpus|evidence model|view evidence map|claim limitations|requirement evidence|current résumé|message collection|privacy-safe crop|date unverified|source-verified recommendation|review-only lead channels|approved career facts|explicitly approval-gated|current boundaries/i;
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText(rejectedCopy);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} overflows at ${viewport.width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test('GitHub archive actions identify each project and external destination', async ({ page }) => {
  await page.goto('/work#public-repositories');

  for (const project of githubProjects) {
    const card = page.getByRole('heading', { level: 3, name: project.name }).locator('xpath=ancestor::article');
    const expectedLinks = [
      {
        name: `Open ${project.name} repository preview on GitHub (opens in a new tab)`,
        href: project.url,
      },
      {
        name: `Open ${project.name} repository on GitHub (opens in a new tab)`,
        href: project.url,
      },
      {
        name: `View ${project.name} repository on GitHub (opens in a new tab)`,
        href: project.url,
      },
      ...(project.homepage ? [{
        name: `Open ${project.name} live site (opens in a new tab)`,
        href: project.homepage,
      }] : []),
    ];

    await expect(card.getByRole('link')).toHaveCount(expectedLinks.length);
    for (const expectedLink of expectedLinks) {
      const link = card.getByRole('link', { name: expectedLink.name, exact: true });
      await expect(link).toHaveAttribute('href', expectedLink.href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
    }
  }
});

test('work overview shows every flagship gallery preview without broken media', async ({ page }) => {
  await page.goto('/work');
  const projects = [
    { name: 'Job Search OS', previews: 6 },
    { name: 'Flight Tracker AI', previews: 3 },
    { name: 'Wave Factory Essentials', previews: 5 },
    { name: 'Supraconscious Avatar AI', previews: 3 },
    { name: 'Argent Matchmaking', previews: 3 },
    { name: 'Jolene AI', previews: 4 },
    { name: 'ProgressionLab', previews: 2 },
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

test('flagship project actions name their destination and fit every phone width', async ({ page }) => {
  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/work');

    for (const project of projects) {
      const chapter = page.locator(`#work-${project.slug}`);
      const action = chapter.getByRole('link', { name: `View ${project.name}`, exact: true });
      await expect(action).toHaveAttribute('href', `/work/${project.slug}`);
      const bounds = await action.boundingBox();
      expect(bounds, `${project.name} action is not rendered at ${viewport.width}px`).not.toBeNull();
      expect(bounds?.width, `${project.name} action overflows at ${viewport.width}px`).toBeLessThanOrEqual(viewport.width - 40);
    }
  }
});

test('work index lets recruiters jump to each flagship project', async ({ page }) => {
  await page.goto('/work');
  const index = page.getByRole('navigation', { name: 'Project index' });
  const projects = [
    ['Job Search OS', '#work-job-search-os'],
    ['Flight Tracker AI', '#work-flight-tracker-ai'],
    ['Wave Factory Essentials', '#work-wave-factory-essentials'],
    ['Supraconscious Avatar AI', '#work-supraconscious-avatar-ai'],
    ['Argent Matchmaking', '#work-argent-matchmaking'],
    ['Jolene AI', '#work-jolene-ai'],
    ['ProgressionLab', '#work-progression-lab-ai'],
  ] as const;

  await expect(index).toBeVisible();
  const links = index.getByRole('link');
  await expect(links).toHaveCount(projects.length);
  await expect(page.locator('.project-index-return')).toHaveCount(projects.length);
  for (const [name, href] of projects) {
    await expect(index.getByRole('link', { name: new RegExp(name) })).toHaveAttribute('href', href);
    const chapter = page.locator(href);
    await expect(chapter).toHaveCount(1);
    await expect(chapter.getByRole('link', { name: /Project index/ })).toHaveAttribute('href', '#work-index');
  }

  const flightTrackerLink = index.getByRole('link', { name: /Flight Tracker AI/ });
  await flightTrackerLink.focus();
  await expect(flightTrackerLink).toBeFocused();
  await flightTrackerLink.click();
  await expect(page).toHaveURL(/\/work#work-flight-tracker-ai$/);
  await expect(page.locator('#work-flight-tracker-ai')).toBeInViewport();
  const returnLink = page.locator('#work-flight-tracker-ai').getByRole('link', { name: /Project index/ });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.click();
  await expect(page).toHaveURL(/\/work#work-index$/);
  await expect(index).toBeInViewport();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work');
  await expect(page.getByRole('navigation', { name: 'Project index' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('homepage project index supports a complete recruiter scan and return path', async ({ page }) => {
  await page.goto('/');
  const index = page.getByRole('navigation', { name: 'Project index' });
  const projects = [
    ['Job Search OS', '#work-job-search-os'],
    ['Flight Tracker AI', '#work-flight-tracker-ai'],
    ['Wave Factory Essentials', '#work-wave-factory-essentials'],
    ['Supraconscious Avatar AI', '#work-supraconscious-avatar-ai'],
    ['Argent Matchmaking', '#work-argent-matchmaking'],
    ['Jolene AI', '#work-jolene-ai'],
    ['ProgressionLab', '#work-progression-lab-ai'],
  ] as const;

  await expect(index).toBeVisible();
  await expect(index.getByRole('link')).toHaveCount(projects.length);
  await expect(page.locator('.project-index-return')).toHaveCount(projects.length);
  for (const [name, href] of projects) {
    await expect(index.getByRole('link', { name: new RegExp(name) })).toHaveAttribute('href', href);
    await expect(page.locator(href).getByRole('link', { name: /Project index/ })).toHaveAttribute(
      'href',
      '#work-index',
    );
  }

  const projectLink = index.getByRole('link', { name: /Flight Tracker AI/ });
  await projectLink.focus();
  await expect(projectLink).toBeFocused();
  await projectLink.click();
  await expect(page).toHaveURL(/\/#work-flight-tracker-ai$/);
  await expect(page.locator('#work-flight-tracker-ai')).toBeInViewport();

  const returnLink = page.locator('#work-flight-tracker-ai').getByRole('link', { name: /Project index/ });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.click();
  await expect(page).toHaveURL(/\/#work-index$/);
  await expect(index).toBeInViewport();

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const undersizedLinks = await index.getByRole('link').evaluateAll((links) => (
      links.filter((link) => {
        const bounds = link.getBoundingClientRect();
        return bounds.width < 44 || bounds.height < 44;
      }).length
    ));
    expect(undersizedLinks).toBe(0);
  }
});

test('flagship case studies publish unique 1200×630 social cards', async ({ page }, testInfo) => {
  const expectedOrigin = new URL(testInfo.project.use.baseURL as string).origin;
  for (const slug of [
    'job-search-os',
    'flight-tracker-ai',
    'wave-factory-essentials',
    'supraconscious-avatar-ai',
    'argent-matchmaking',
    'jolene-ai',
    'progression-lab-ai',
  ]) {
    await page.goto(`/work/${slug}`);
    const expectedImage = `${expectedOrigin}/social/${slug}.png`;
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', expectedImage);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', expectedImage);

    const response = await page.request.get(`/social/${slug}.png`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    const image = await response.body();
    const dimensions = new DataView(image.buffer, image.byteOffset, image.byteLength);
    expect(dimensions.getUint32(16)).toBe(1200);
    expect(dimensions.getUint32(20)).toBe(630);
  }
});

test('Flight Tracker leads with the dense live regional traffic workspace', async ({ page }) => {
  await page.goto('/work');
  const chapter = page.getByRole('heading', { level: 2, name: 'Flight Tracker AI' }).locator('xpath=ancestor::section');
  const leadImage = chapter.locator('.project-image');
  await expect(leadImage).toHaveAttribute('src', /live-traffic-weather\.png/);
  await expect(leadImage).toHaveAttribute('alt', /158 aircraft/);
  await leadImage.scrollIntoViewIfNeeded();
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
  const homepageProjectIndex = page.getByRole('navigation', { name: 'Project index' });
  await expect(homepageProjectIndex.getByRole('link')).toHaveCount(7);
  await expect(homepageProjectIndex.getByRole('link', { name: /Flight Tracker AI/ })).toHaveAttribute(
    'href',
    '#work-flight-tracker-ai',
  );
  await expect(page.getByRole('region', { name: 'Let’s talk about what you’re building.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact');
  const homepageArchiveLink = page.getByRole('link', { name: 'View DKNY e-commerce in the archive' });
  await expect(homepageArchiveLink).toHaveAttribute('href', '/archive#legacy-dkny');
  await homepageArchiveLink.click();
  await page.waitForURL(/\/archive#legacy-dkny$/);
  await expect(page.locator('#legacy-dkny')).toHaveCount(1);
  await expect(page.locator('.legacy-working-grid > li')).toHaveCount(16);

  await page.goto('/work');
  const projectIndex = page.getByRole('navigation', { name: 'Project index' });
  await expect(projectIndex.getByRole('link')).toHaveCount(7);
  await expect(projectIndex.getByRole('link', { name: /Argent Matchmaking/ })).toHaveAttribute(
    'href',
    '#work-argent-matchmaking',
  );
  await expect(page.locator('.project-index-return')).toHaveCount(7);
  await expect(page.locator('#work-argent-matchmaking').getByRole('link', { name: /Project index/ })).toHaveAttribute(
    'href',
    '#work-index',
  );

  await page.goto('/capabilities');
  const capabilityNextSteps = page.getByRole('navigation', { name: 'Explore proof behind the capabilities' });
  await expect(capabilityNextSteps.getByRole('link')).toHaveCount(3);
  await expect(capabilityNextSteps.getByRole('link', { name: /Repositories/ })).toHaveAttribute(
    'href',
    '/work#public-repositories',
  );

  await page.goto('/archive');
  const archiveMap = page.getByRole('navigation', { name: 'Archive map' });
  await expect(archiveMap.getByRole('link')).toHaveCount(6);
  await expect(archiveMap.getByRole('link', { name: /Working archive/ })).toHaveAttribute(
    'href',
    '#working-archive',
  );
  await expect(page.locator('.archive-map-return')).toHaveCount(6);
  await expect(page.locator('#professional-range').getByRole('link', { name: /Archive map/ })).toHaveAttribute(
    'href',
    '#archive-map',
  );

  await page.goto('/recommendations');
  await expect(page.getByRole('navigation', { name: 'Recommendation highlights' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mentorship/ })).toHaveAttribute(
    'href',
    '#evidence--portfolio--source--recommendation--jason-conover-2017-07-17',
  );
  const recommendationNextSteps = page.getByRole('navigation', { name: 'Continue from the recommendations' });
  await expect(recommendationNextSteps.getByRole('link')).toHaveCount(3);
  await expect(recommendationNextSteps.getByRole('link', { name: 'Trace the career' })).toHaveAttribute(
    'href',
    '/experience#career-index',
  );
  await expect(page.locator('.recommendation-highlights-return')).toHaveCount(13);
  await expect(page.getByRole('listitem', { name: 'David Allen recommendation' }).getByRole('link', {
    name: /Recommendation highlights/,
  })).toHaveAttribute('href', '#recommendation-highlights');

  await page.goto('/capabilities');
  const capabilityIndex = page.getByRole('navigation', { name: 'Capability index' });
  await expect(capabilityIndex.getByRole('link')).toHaveCount(5);
  await expect(capabilityIndex.getByRole('link', { name: /Creative technology/ })).toHaveAttribute(
    'href',
    '#creative-technology',
  );
  await expect(page.locator('.capability-index-return')).toHaveCount(5);
  await expect(page.locator('#technical-leadership').getByRole('link', { name: /Capability index/ })).toHaveAttribute(
    'href',
    '#capability-index',
  );

  await page.goto('/experience');
  const careerIndex = page.getByRole('navigation', { name: 'Career index' });
  await expect(careerIndex.getByRole('link')).toHaveCount(7);
  await expect(careerIndex.getByRole('link', { name: /The Army, art school, and GWAR/ })).toHaveAttribute(
    'href',
    '#career-army-art-school-gwar',
  );
  await expect(page.locator('.career-index-return')).toHaveCount(11);
  await expect(page.locator('#career-teaching-code').getByRole('link', { name: /Career index/ })).toHaveAttribute(
    'href',
    '#career-index',
  );
  const archiveLink = page.getByRole('link', { name: 'View archived work related to Coca-Cola' });
  await expect(archiveLink).toHaveAttribute('href', '/archive#legacy-coca-cola');
  await archiveLink.click();
  await page.waitForURL(/\/archive#legacy-coca-cola$/);
  await expect(page.locator('#legacy-coca-cola')).toHaveCount(1);

  await page.goto('/work/job-search-os#project-gallery');
  await expect(page.locator('#project-gallery img')).toHaveCount(6);
  await expect(page.getByText('Application assistant', { exact: true })).toBeVisible();
  await expect(page.getByText('System topology', { exact: true })).toHaveCount(0);
  expect(await page.locator('.architecture-step').count()).toBeGreaterThanOrEqual(10);
  await expect(page.locator('.architecture-step').getByText('External channels', { exact: true })).toBeVisible();
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
