import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const notFound = await readFile(new URL('../app/not-found.tsx', import.meta.url), 'utf8');
const errorBoundary = await readFile(new URL('../app/error.tsx', import.meta.url), 'utf8');
const globalErrorBoundary = await readFile(new URL('../app/global-error.tsx', import.meta.url), 'utf8');

assert.match(notFound, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
assert.match(notFound, /id="main-content"/);
assert.match(notFound, /aria-label="Page recovery"/);
for (const route of ['/', '/work', '/contact']) {
  assert.ok(notFound.includes(`href="${route}"`), `404 page is missing recovery route: ${route}`);
}

assert.match(errorBoundary, /captureException\(error\)/);
assert.match(errorBoundary, /onClick=\{reset\}/);
assert.doesNotMatch(errorBoundary, /error\.message|error\.stack|error\.digest|prepared for review/i);
assert.match(errorBoundary, /use one of these links to keep exploring/i);
assert.doesNotMatch(errorBoundary, /form response|visitor message|stored here/i);

assert.match(globalErrorBoundary, /<html lang="en">/);
assert.match(globalErrorBoundary, /<body style=\{pageStyle\}>/);
assert.match(globalErrorBoundary, /Sentry\.getClient\(\)/);
assert.match(globalErrorBoundary, /beforeSend: scrubSentryEvent/);
assert.match(globalErrorBoundary, /beforeBreadcrumb: scrubSentryBreadcrumb/);
assert.match(globalErrorBoundary, /sendDefaultPii: false/);
assert.match(globalErrorBoundary, /capturedErrors\.has\(error\)/);
assert.match(globalErrorBoundary, /scope\.setTag\('surface', 'global-error-boundary'\)/);
assert.match(globalErrorBoundary, /scope\.setTag\('route', 'root-layout'\)/);
assert.match(globalErrorBoundary, /captureException\(error\)/);
assert.match(globalErrorBoundary, /aria-label="Error recovery"/);
assert.match(globalErrorBoundary, /onClick=\{reset\}/);
for (const route of ['/', '/contact']) {
  assert.ok(globalErrorBoundary.includes(`href="${route}"`), `Global error page is missing recovery route: ${route}`);
}
assert.doesNotMatch(globalErrorBoundary, /error\.message|error\.stack|error\.digest/);

console.log('Recovery checks passed: accessible 404 routes plus privacy-safe route and root error boundaries.');
