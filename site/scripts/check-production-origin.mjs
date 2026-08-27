import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const rawOrigin = process.env.PORTFOLIO_BASE_URL;
assert(rawOrigin, 'PORTFOLIO_BASE_URL is required.');

const origin = new URL(rawOrigin);
assert.equal(origin.protocol, 'https:', 'Production verification requires HTTPS.');
assert(!['localhost', '127.0.0.1', '::1'].includes(origin.hostname), 'Production verification cannot target loopback.');

const profiles = [
  {
    name: 'desktop',
    context: { viewport: { width: 1440, height: 1000 } },
    network: null,
    budgets: { lcp: 2_500, cls: 0.1, longTasks: 3 },
  },
  {
    name: 'mobile',
    context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    network: null,
    budgets: { lcp: 2_500, cls: 0.1, longTasks: 3 },
  },
  {
    name: 'mobile-throttled-4g-cpu4x',
    context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    network: {
      latency: 150,
      downloadThroughput: 1_600_000 / 8,
      uploadThroughput: 750_000 / 8,
      connectionType: 'cellular4g',
      cpuRate: 4,
    },
    budgets: { lcp: 2_500, cls: 0.1, longTasks: 3 },
  },
];

const browser = await chromium.launch();
const measurements = [];

try {
  for (const profile of profiles) {
    const context = await browser.newContext(profile.context);
    const page = await context.newPage();

    if (profile.network) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: profile.network.latency,
        downloadThroughput: profile.network.downloadThroughput,
        uploadThroughput: profile.network.uploadThroughput,
        connectionType: profile.network.connectionType,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.network.cpuRate });
    }

    await page.addInitScript(() => {
      globalThis.__portfolioVitals = { lcp: 0, cls: 0, longTasks: 0 };
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) globalThis.__portfolioVitals.lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) globalThis.__portfolioVitals.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        globalThis.__portfolioVitals.longTasks += list.getEntries().length;
      }).observe({ type: 'longtask', buffered: true });
    });

    await page.goto(origin.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(profile.network ? 5_000 : 2_500);

    const result = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      return {
        ...globalThis.__portfolioVitals,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
        domContentLoaded: navigation.domContentLoadedEventEnd,
        load: navigation.loadEventEnd,
        transferBytes: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
        resourceCount: resources.length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    assert(result.lcp > 0, `${profile.name} did not produce an LCP measurement.`);
    assert(result.lcp <= profile.budgets.lcp, `${profile.name} LCP exceeded ${profile.budgets.lcp} ms.`);
    assert(result.cls <= profile.budgets.cls, `${profile.name} CLS exceeded ${profile.budgets.cls}.`);
    assert(result.longTasks <= profile.budgets.longTasks, `${profile.name} exceeded its long-task budget.`);
    assert(result.overflow <= 0, `${profile.name} has horizontal overflow.`);

    measurements.push({ profile: profile.name, ...result });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Production performance checks passed for ${origin.origin}.`);
for (const measurement of measurements) console.log(JSON.stringify(measurement));
