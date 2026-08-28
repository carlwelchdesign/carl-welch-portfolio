import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const contactIntentEnabled = process.env.JOLENE_UI_CONTACT_ENABLED === 'true';
const scenario = process.env.JOLENE_UI_SCENARIO ?? 'success';

test(`contact intent is ${contactIntentEnabled ? 'available' : 'hidden'} when configured`, async ({ page }) => {
  await page.goto('/');

  const launcher = page.getByRole('button', { name: /Ask Jolene/ });
  await launcher.click();

  const panel = page.getByRole('dialog', { name: 'Ask Jolene' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Close Jolene chat' })).toBeFocused();

  const contactButton = panel.getByRole('button', { name: 'Request contact' });
  if (contactIntentEnabled) {
    await expect(contactButton).toBeVisible();
    await contactButton.click();
    await expect(page.getByRole('heading', { name: 'Contact Carl', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ask Carl to follow up' })).toBeVisible();
  } else {
    await expect(contactButton).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Ask Carl to follow up' })).toHaveCount(0);
  }

  const results = await new AxeBuilder({ page })
    .include('.jolene-panel')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const seriousViolations = results.violations.filter(
    ({ impact }) => impact === 'serious' || impact === 'critical',
  );
  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test(`returned ${scenario === 'unavailable' ? 'error' : 'answer'} keeps keyboard focus in the conversation`, async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Ask Jolene/ }).click();

  const panel = page.getByRole('dialog', { name: 'Ask Jolene' });
  const starter = panel.getByRole('button', {
    name: 'Which project best shows Carl’s product engineering work?',
  });
  await starter.focus();
  await starter.click();

  if (scenario === 'unavailable') {
    const errorResponse = panel.locator('.jolene-message[data-role="assistant"]').filter({
      hasText: 'Jolene is unavailable right now.',
    });
    await expect(errorResponse).toBeFocused();
    await expect(errorResponse).toContainText('I don’t have a reliable answer for that yet.');
    await expect(panel.locator('.jolene-avatar')).toHaveAttribute('data-avatar-state', 'offline');
    return;
  }

  const answer = panel.locator('.jolene-message[data-role="assistant"]').filter({
    hasText: 'Carl has built typed product systems',
  });
  await expect(answer).toBeFocused();
  await expect(answer).toContainText('explicit review boundaries');

  const evidence = answer.locator('details.jolene-evidence');
  const evidenceSummary = evidence.locator(':scope > summary');
  await expect(evidenceSummary).toContainText('2 sources');
  await evidenceSummary.click();
  await expect(evidence.getByText('Point 01')).toBeVisible();
  await evidence.locator('details.jolene-claim > summary').click();
  await expect(evidence.getByRole('link', { name: /Job Search OS: review workflow/ })).toBeVisible();
  await expect(evidence.getByRole('link', { name: /Flight Tracker AI: typed product system/ })).toBeVisible();

  const followUps = panel.locator('.jolene-starters');
  await expect(followUps.getByText('Ask next')).toBeVisible();
  await expect(followUps.getByRole('button')).toHaveCount(2);
});

test('country-host cameo appears once, leaves cleanly, and returns only with chat', async ({ page }) => {
  await page.addInitScript(() => window.sessionStorage.removeItem('jolene-country-host-intro-seen-v1'));
  await page.goto('/');

  const cameo = page.locator('.jolene-cameo');
  await expect(cameo).toBeVisible({ timeout: 2_000 });
  await expect(cameo).toContainText('Howdy, folks!');
  await expect(cameo.locator('.jolene-avatar')).toHaveCount(1);
  await expect(cameo).toBeHidden({ timeout: 5_000 });
  await expect(page.locator('.jolene-avatar')).toHaveCount(0);

  await page.getByRole('button', { name: /Ask Jolene/ }).click();
  const panel = page.getByRole('dialog', { name: 'Ask Jolene' });
  const avatar = panel.locator('.jolene-avatar');
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute('data-avatar-state', /greet|idle/);

  const question = panel.getByLabel('Ask about Carl’s work or experience');
  await question.fill('Which project best shows Carl’s product engineering work?');
  await expect(avatar).toHaveAttribute('data-avatar-state', 'listen');
  await panel.getByRole('button', { name: 'Ask Jolene', exact: true }).click();

  if (scenario === 'unavailable') {
    await expect(avatar).toHaveAttribute('data-avatar-state', 'offline');
  } else {
    await expect(avatar).toHaveAttribute('data-avatar-state', 'speak');
    const evidence = panel.locator('details.jolene-evidence').last();
    await evidence.locator(':scope > summary').click();
    await expect(avatar).toHaveAttribute('data-avatar-state', 'evidence');
  }

  await panel.getByRole('button', { name: 'Close Jolene chat' }).click();
  await expect(page.locator('.jolene-avatar')).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(1_000);
  await expect(cameo).toHaveCount(0);
});

test('pixel avatar stays clear of controls at an iPhone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => window.sessionStorage.setItem('jolene-country-host-intro-seen-v1', 'true'));
  await page.goto('/');
  await page.getByRole('button', { name: /Ask Jolene/ }).click();

  const panel = page.getByRole('dialog', { name: 'Ask Jolene' });
  const avatar = panel.locator('.jolene-avatar');
  const close = panel.getByRole('button', { name: 'Close Jolene chat' });
  const question = panel.getByLabel('Ask about Carl’s work or experience');
  await expect(panel).toBeVisible();
  await expect(avatar).toBeVisible();
  await expect(close).toBeVisible();
  await expect(question).toBeVisible();

  await expect(avatar).toHaveCSS('pointer-events', 'none');
  await expect(avatar.locator('img')).toHaveCSS('image-rendering', 'pixelated');
  await expect(avatar).toHaveAttribute('data-avatar-facing', 'left');
  const panelBounds = await panel.boundingBox();
  const avatarBounds = await avatar.boundingBox();
  const closeBounds = await close.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(avatarBounds).not.toBeNull();
  expect(closeBounds).not.toBeNull();
  expect(panelBounds!.x).toBeGreaterThanOrEqual(0);
  expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(390);
  expect(closeBounds!.x + closeBounds!.width).toBeLessThanOrEqual(390);
  expect(avatarBounds!.x + avatarBounds!.width).toBeLessThanOrEqual(closeBounds!.x);
});

test('reduced motion skips the unsolicited cameo and uses static state frames', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => window.sessionStorage.removeItem('jolene-country-host-intro-seen-v1'));
  await page.goto('/');
  await page.waitForTimeout(1_000);
  await expect(page.locator('.jolene-cameo')).toHaveCount(0);

  await page.getByRole('button', { name: /Ask Jolene/ }).click();
  const avatar = page.getByRole('dialog', { name: 'Ask Jolene' }).locator('.jolene-avatar');
  const initialFrame = await avatar.getAttribute('data-avatar-frame');
  await page.waitForTimeout(750);
  const settledFrame = await avatar.getAttribute('data-avatar-frame');
  expect(initialFrame).toBe('greet-2');
  expect(settledFrame).toBe('idle-0');
});

test('missing pose assets fail over to the approved static master', async ({ page }) => {
  await page.route(/\/jolene\/sprites\/.*\.png(?:\?.*)?$/, (route) => route.abort());
  await page.addInitScript(() => window.sessionStorage.setItem('jolene-country-host-intro-seen-v1', 'true'));
  await page.goto('/');
  await page.getByRole('button', { name: /Ask Jolene/ }).click();
  const avatar = page.getByRole('dialog', { name: 'Ask Jolene' }).locator('.jolene-avatar');
  await expect(avatar).toHaveAttribute('data-avatar-fallback', 'master');
  await expect(avatar.locator('img')).toHaveAttribute('src', '/jolene/jolene-country-host-master.png');
  await expect(avatar).toBeVisible();
});
