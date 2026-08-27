import assert from 'node:assert/strict';
import {
  applyPortfolioSecurityHeaders,
  portfolioSecurityHeaders,
} from '../app/security/response-policy.mjs';

const requiredHeaders = [
  'Content-Security-Policy',
  'Cross-Origin-Opener-Policy',
  'Permissions-Policy',
  'Referrer-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
];
assert.deepEqual(Object.keys(portfolioSecurityHeaders), requiredHeaders);

const csp = portfolioSecurityHeaders['Content-Security-Policy'];
for (const directive of [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  'upgrade-insecure-requests',
]) {
  assert.ok(csp.includes(directive), `Missing CSP directive: ${directive}`);
}
assert.doesNotMatch(csp, /unsafe-eval|https?:\/\/\*(?:\s|;|$)/);

const original = new Response('preserved body', {
  status: 404,
  statusText: 'Not Found',
  headers: { 'Cache-Control': 'no-store', 'X-Existing': 'preserved' },
});
const hardened = applyPortfolioSecurityHeaders(original);
assert.equal(hardened.status, 404);
assert.equal(hardened.statusText, 'Not Found');
assert.equal(hardened.headers.get('cache-control'), 'no-store');
assert.equal(hardened.headers.get('x-existing'), 'preserved');
assert.equal(hardened.headers.get('x-frame-options'), 'DENY');
assert.equal(await hardened.text(), 'preserved body');

console.log('Portfolio security-header policy passed');
