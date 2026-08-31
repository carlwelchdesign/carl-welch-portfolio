import assert from 'node:assert/strict';
import * as Sentry from '@sentry/browser';
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

let transportedEnvelope;
const inMemoryTransport = () => ({
  send: async (envelope) => {
    assert.equal(transportedEnvelope, undefined, 'Expected one Sentry event envelope');
    transportedEnvelope = envelope;
    return { statusCode: 200 };
  },
  flush: async () => true,
});

Sentry.init({
  dsn: 'https://public@example.invalid/1',
  enabled: true,
  environment: 'production-fixture',
  release: 'portfolio-privacy-fixture@1',
  sendDefaultPii: false,
  maxBreadcrumbs: 25,
  tracesSampleRate: 0,
  defaultIntegrations: false,
  transport: inMemoryTransport,
  beforeSend: scrubSentryEvent,
  beforeBreadcrumb: scrubSentryBreadcrumb,
  initialScope: {
    tags: {
      service: 'portfolio-browser',
      privacy_profile: 'public-technical-only-v1',
    },
  },
});
Sentry.setUser(null);

Sentry.withScope((scope) => {
  scope.setTag('surface', 'privacy-transport-fixture');
  scope.setTag('route', '/fixture');
  scope.setContext('runtime', { name: 'browser', component: 'global-error' });
  scope.setContext('visitor', {
    email: 'visitor@example.com',
    ip: '198.51.100.12',
    prompt: secret,
  });
  scope.setExtra('contactPayload', { phone: '805-555-0100', message: secret });
  scope.setExtra('technical', {
    component: 'global-error',
    token: secret,
    file: '/Users/carl.welch/Documents/private/source.ts',
  });
  Sentry.captureException(new TypeError(`SDK transport failure for ${secret} at visitor@example.com`));
});

assert.equal(await Sentry.flush(1_000), true);
assert.ok(transportedEnvelope, 'The in-memory Sentry transport did not receive an envelope');

const [, envelopeItems] = transportedEnvelope;
const eventItem = envelopeItems.find(([itemHeader]) => itemHeader.type === 'event');
assert.ok(eventItem, 'The Sentry envelope did not contain an error event');
const [, transportedEvent] = eventItem;
const transportedSerialized = JSON.stringify(transportedEvent);

for (const prohibited of [
  secret,
  'visitor@example.com',
  '198.51.100.12',
  '805-555-0100',
  '/Users/carl.welch',
  'contactPayload',
  'prompt',
  'visitor',
  'token',
]) {
  assert.equal(transportedSerialized.includes(prohibited), false, `Transport leaked prohibited value: ${prohibited}`);
}

assert.equal(transportedEvent.environment, 'production-fixture');
assert.equal(transportedEvent.release, 'portfolio-privacy-fixture@1');
assert.equal(transportedEvent.tags.service, 'portfolio-browser');
assert.equal(transportedEvent.tags.privacy_profile, 'public-technical-only-v1');
assert.equal(transportedEvent.tags.surface, 'privacy-transport-fixture');
assert.equal(transportedEvent.tags.route, '/fixture');
assert.deepEqual(transportedEvent.contexts.runtime, { name: 'browser', component: 'global-error' });
assert.equal(transportedEvent.extra.technical.component, 'global-error');
assert.equal(transportedEvent.exception.values[0].type, 'TypeError');
assert.equal(
  transportedEvent.exception.values[0].value,
  '[TypeError] message redacted by portfolio privacy policy',
);
assert.ok(transportedEvent.exception.values[0].stacktrace.frames.length > 0, 'Expected useful technical stack frames');

assert.equal(await Sentry.close(1_000), true);

console.log('Sentry privacy boundary passed through policy fixtures and the real SDK transport');
