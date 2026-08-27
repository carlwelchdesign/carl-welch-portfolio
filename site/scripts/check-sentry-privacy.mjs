import assert from 'node:assert/strict';
import { scrubSentryBreadcrumb, scrubSentryEvent } from '../app/observability/sentry-policy.mjs';

const secret = 'never-send-this-value';
const scrubbed = scrubSentryEvent({
  event_id: 'opaque-event-id',
  message: 'TypeError while loading https://example.com/work?candidate=carl#private',
  exception: { values: [{ type: 'TypeError', value: `failed for ${secret}` }] },
  user: { id: 'visitor-123', email: 'visitor@example.com', ip_address: '198.51.100.12' },
  request: {
    method: 'POST',
    url: 'https://example.com/api/jolene?session=private#fragment',
    headers: { authorization: `Bearer ${secret}`, cookie: `session=${secret}` },
    data: { jobDescription: secret, prompt: secret, contactPayload: secret },
  },
  contexts: {
    runtime: { name: 'workerd' },
    private: { transcript: secret, evidenceBody: secret },
  },
  extra: {
    file: '/Users/carl.welch/Documents/private/source.ts',
    visitorEmail: 'visitor@example.com',
    visitorIp: '198.51.100.12',
    visitorIpv6: '2001:db8:85a3::8a2e:370:7334',
  },
});

assert.ok(scrubbed);
const serialized = JSON.stringify(scrubbed);
assert.equal(serialized.includes(secret), false);
assert.equal(serialized.includes('visitor@example.com'), false);
assert.equal(serialized.includes('198.51.100.12'), false);
assert.equal(serialized.includes('2001:db8'), false);
assert.equal(serialized.includes('/Users/carl.welch'), false);
assert.equal(scrubbed.message, undefined);
assert.equal(scrubbed.exception.values[0].value, '[TypeError] message redacted by portfolio privacy policy');
assert.equal(scrubbed.request.url, 'https://example.com/api/jolene');
assert.equal(scrubbed.request.method, 'POST');
assert.deepEqual(scrubbed.contexts.runtime, { name: 'workerd' });

assert.equal(scrubSentryBreadcrumb({ category: 'ui.click', message: 'Ask Jolene' }), null);
assert.deepEqual(
  scrubSentryBreadcrumb({
    category: 'navigation',
    data: { from: 'https://example.com/?private=yes', to: 'https://example.com/work' },
  }),
  {
    category: 'navigation',
    data: { from: 'https://example.com/', to: 'https://example.com/work' },
  },
);

console.log('Sentry privacy boundary passed');
