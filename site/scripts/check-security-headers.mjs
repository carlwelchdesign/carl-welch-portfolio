import assert from 'node:assert/strict';
import {
  applyPortfolioSecurityHeaders,
  portfolioSecurityHeaders,
  portfolioSecurityHeadersForUrl,
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

const httpsHeaders = portfolioSecurityHeadersForUrl('https://portfolio.example/work');
assert.equal(httpsHeaders, portfolioSecurityHeaders);
assert.match(httpsHeaders['Content-Security-Policy'], /upgrade-insecure-requests/);
assert.equal(httpsHeaders['Strict-Transport-Security'], 'max-age=31536000; includeSubDomains');

const httpHeaders = portfolioSecurityHeadersForUrl('http://192.168.1.127:4173/');
assert.doesNotMatch(httpHeaders['Content-Security-Policy'], /upgrade-insecure-requests/);
assert.equal(httpHeaders['Strict-Transport-Security'], undefined);
assert.equal(httpHeaders['Cross-Origin-Opener-Policy'], undefined);
assert.equal(httpHeaders['X-Content-Type-Options'], 'nosniff');
assert.equal(httpHeaders['X-Frame-Options'], 'DENY');

assert.equal(portfolioSecurityHeadersForUrl('not a url'), portfolioSecurityHeaders);

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

const localResponse = applyPortfolioSecurityHeaders(
  new Response('local preview', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
  'http://192.168.1.127:4173/',
);
assert.doesNotMatch(localResponse.headers.get('content-security-policy') ?? '', /upgrade-insecure-requests/);
assert.equal(localResponse.headers.has('strict-transport-security'), false);
assert.equal(localResponse.headers.has('cross-origin-opener-policy'), false);
assert.equal(localResponse.headers.get('cache-control'), 'no-cache');
assert.equal(await localResponse.text(), 'local preview');

const staticResponse = applyPortfolioSecurityHeaders(
  new Response('body { color: black; }', {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'text/css; charset=utf-8',
    },
  }),
  'https://portfolio.example/_next/static/css/index.hash.css',
);
assert.equal(staticResponse.headers.get('cache-control'), 'public, max-age=31536000, immutable');

console.log('Portfolio security-header policy passed');
