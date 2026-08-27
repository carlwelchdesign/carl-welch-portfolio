import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.JOLENE_LIVE_PORTFOLIO_URL ?? 'http://127.0.0.1:3002';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const browserErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') browserErrors.push(message.text());
});
page.on('pageerror', (error) => browserErrors.push(error.message));

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('body').innerText()).trim().length > 0, 'page must render meaningful content');
  assert.equal(await page.locator('[data-nextjs-dialog], .vite-error-overlay').count(), 0, 'no framework error overlay');

  const launcher = page.getByRole('button', { name: /Ask Jolene/ });
  await launcher.click();
  await page.getByLabel('Ask about Carl’s work or experience').fill(
    'Which public project demonstrates Carl’s product engineering work?',
  );
  await page.getByRole('button', { name: 'Ask Jolene', exact: true }).click();
  await page.getByText('Review supporting evidence').waitFor();
  assert.match(await page.locator('.jolene-corpus-version').first().textContent(), /^Public corpus · career:/);

  await page.getByRole('button', { name: 'Compare role' }).click();
  await page.getByRole('textbox', { name: 'Job description' }).fill(
    'Build typed product interfaces and evidence-grounded AI systems.',
  );
  await page.getByRole('button', { name: /Compare requirements/ }).click();
  await page.getByRole('heading', { name: 'Comparison, not a verdict' }).waitFor();

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  assert.deepEqual(serious, [], JSON.stringify(serious, null, 2));
  assert.deepEqual(browserErrors, []);

  await page.getByRole('button', { name: 'Questions' }).click();
  await page.getByText('Review supporting evidence').click();
  const citation = page.locator('.jolene-citation').first();
  const citationHref = await citation.getAttribute('href');
  assert.match(citationHref, /^\/[a-z0-9/-]+#[a-z0-9-]+$/);
  await citation.click();
  await page.waitForURL((url) => url.hash.length > 1);
  const targetFocused = await page.evaluate(() => {
    const target = document.querySelector(':target[data-evidence-target]');
    return target instanceof HTMLElement && document.activeElement === target;
  });
  assert.equal(targetFocused, true, 'citation target must resolve and receive focus');
  await page.getByText(/^Supporting evidence:/).waitFor();
  await page.screenshot({ path: '/tmp/port-jol-009-live-mobile.png', fullPage: true });
  console.log('Live Jolene browser check passed: mobile launcher, answer evidence, job-fit, citation focus, accessibility, and console health.');
} finally {
  await context.close();
  await browser.close();
}
