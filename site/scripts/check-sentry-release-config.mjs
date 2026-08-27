import assert from 'node:assert/strict';
import { readSentryReleaseUploadConfig } from '../app/observability/sentry-release-config.mjs';

assert.deepEqual(readSentryReleaseUploadConfig({}), { enabled: false });
assert.deepEqual(readSentryReleaseUploadConfig({ SENTRY_RELEASE_UPLOAD_ENABLED: 'false' }), { enabled: false });
assert.throws(
  () => readSentryReleaseUploadConfig({ SENTRY_RELEASE_UPLOAD_ENABLED: 'true' }),
  /SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_RELEASE/,
);
assert.throws(
  () => readSentryReleaseUploadConfig({
    SENTRY_RELEASE_UPLOAD_ENABLED: 'true',
    SENTRY_AUTH_TOKEN: 'fixture-token',
    SENTRY_ORG: 'fixture-org',
    SENTRY_PROJECT: 'fixture-project',
    SENTRY_RELEASE: 'not valid spaces',
  }),
  /stable commit or deployment identifier/,
);

const enabled = readSentryReleaseUploadConfig({
  SENTRY_RELEASE_UPLOAD_ENABLED: 'true',
  SENTRY_AUTH_TOKEN: 'fixture-token',
  SENTRY_ORG: 'fixture-org',
  SENTRY_PROJECT: 'fixture-project',
  SENTRY_RELEASE: 'bb64f64f227fec81e082bdd80f3376ff56d5792f',
});
assert.equal(enabled.enabled, true);
assert.equal(enabled.release, 'bb64f64f227fec81e082bdd80f3376ff56d5792f');

console.log('Sentry release-upload configuration boundary passed');
