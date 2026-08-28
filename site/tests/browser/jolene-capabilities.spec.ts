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
