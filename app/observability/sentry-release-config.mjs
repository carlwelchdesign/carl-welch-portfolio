const REQUIRED_UPLOAD_KEYS = [
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_RELEASE',
];

export function readSentryReleaseUploadConfig(env) {
  const enabled = env.SENTRY_RELEASE_UPLOAD_ENABLED === 'true';
  if (!enabled) return { enabled: false };

  const missing = REQUIRED_UPLOAD_KEYS.filter((key) => !String(env[key] ?? '').trim());
  if (missing.length) {
    throw new Error(`Sentry release upload enabled without: ${missing.join(', ')}`);
  }
  const release = String(env.SENTRY_RELEASE).trim();
  if (!/^[a-zA-Z0-9._:@/-]{7,200}$/.test(release)) {
    throw new Error('SENTRY_RELEASE must be a stable commit or deployment identifier');
  }

  return {
    enabled: true,
    authToken: String(env.SENTRY_AUTH_TOKEN).trim(),
    org: String(env.SENTRY_ORG).trim(),
    project: String(env.SENTRY_PROJECT).trim(),
    release,
  };
}
