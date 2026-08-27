import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const notFound = await readFile(new URL('../app/not-found.tsx', import.meta.url), 'utf8');
const errorBoundary = await readFile(new URL('../app/error.tsx', import.meta.url), 'utf8');

assert.match(notFound, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
assert.match(notFound, /id="main-content"/);
assert.match(notFound, /aria-label="Page recovery"/);
for (const route of ['/', '/work', '/contact']) {
  assert.ok(notFound.includes(`href="${route}"`), `404 page is missing recovery route: ${route}`);
}

assert.match(errorBoundary, /captureException\(error\)/);
assert.match(errorBoundary, /onClick=\{reset\}/);
assert.doesNotMatch(errorBoundary, /error\.message|error\.stack|error\.digest|prepared for review/i);
assert.match(errorBoundary, /No form response or visitor message is stored here/);

console.log('Recovery checks passed: accessible 404 routes and privacy-safe runtime-error boundary.');
