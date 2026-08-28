import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const contactIntentEnabled = process.env.JOLENE_UI_CONTACT_ENABLED === 'true';

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
