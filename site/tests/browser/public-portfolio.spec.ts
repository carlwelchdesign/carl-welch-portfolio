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
  '/work/supraconscious-avatar-ai',
  '/work/argent-matchmaking',
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

test('homepage gives recruiters a synchronized proof summary', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const proof = page.getByRole('region', { name: 'Portfolio at a glance' });
  await expect(proof.locator('dt')).toHaveCount(4);
  await expect(proof.locator('dd')).toHaveText(['20+', '5', '13', '5']);
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
  await expect(closing.getByRole('link', { name: 'Résumé' })).toHaveAttribute('href', '/carl-welch-resume.pdf');
  await expect(closing.getByRole('link', { name: 'Résumé' })).toHaveAttribute('download', '');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const [route, expectedGalleryImages] of [
  ['/work/job-search-os', 6],
  ['/work/flight-tracker-ai', 3],
  ['/work/wave-factory-essentials', 5],
  ['/work/supraconscious-avatar-ai', 3],
  ['/work/argent-matchmaking', 3],
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

for (const [route, role, scope] of [
  ['/work/job-search-os', 'Independent product engineer', 'Product strategy, interface design, and full-stack implementation'],
  ['/work/flight-tracker-ai', 'Independent product engineer', 'Product design, frontend engineering, and Rust service integration'],
  ['/work/wave-factory-essentials', 'Creator and plug-in engineer', 'DSP, plug-in architecture, interface design, and product direction'],
  ['/work/supraconscious-avatar-ai', 'Independent product engineer', 'Product strategy, AI system design, and full-stack implementation'],
  ['/work/argent-matchmaking', 'Product engineer and system designer', 'Product strategy, interface art direction, platform architecture, and implementation'],
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
  ['/work/argent-matchmaking', 'Job Search OS', '/work/job-search-os'],
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

  const lauraBaran = page.getByRole('listitem', { name: 'Laura Baran recommendation' });
  await expect(lauraBaran).toContainText('3D virtual & augmented reality program');
  await expect(lauraBaran).not.toContainText('3D hologram program');
});

test('recommendation highlights use direct excerpts and link to the full testimony', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/recommendations');

  const highlights = page.getByRole('navigation', { name: 'Recommendation highlights' });
  await expect(highlights.getByRole('link')).toHaveCount(4);
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
  await expect(page.getByRole('listitem', { name: 'Jason Conover recommendation' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
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
  await expect(field.getByRole('heading', { name: 'The work moved from defense and finance to entertainment, commerce, and culture.' })).toBeVisible();
  await expect(field).toContainText('Some were direct roles. Many came through agencies, studios, and project teams.');
  await expect(field.locator('.legacy-client-mark-grid img')).toHaveCount(35);
  await expect(field.locator('.legacy-client-mark-grid > li')).toHaveCount(36);

  for (const index of [0, 17, 34]) {
    const image = field.locator('.legacy-client-mark-grid img').nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(170);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

test('work overview shows every flagship gallery preview without broken media', async ({ page }) => {
  await page.goto('/work');
  const projects = [
    { name: 'Job Search OS', previews: 6 },
    { name: 'Flight Tracker AI', previews: 3 },
    { name: 'Wave Factory Essentials', previews: 5 },
    { name: 'Supraconscious Avatar AI', previews: 3 },
    { name: 'Argent Matchmaking', previews: 3 },
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
  await expect(page.getByRole('region', { name: 'Let’s talk about what you’re building.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact');

  await page.goto('/recommendations');
  await expect(page.getByRole('navigation', { name: 'Recommendation highlights' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mentorship/ })).toHaveAttribute(
    'href',
    '#evidence--portfolio--source--recommendation--jason-conover-2017-07-17',
  );

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
