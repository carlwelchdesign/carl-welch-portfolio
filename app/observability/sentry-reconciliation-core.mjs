import {
  deliverSentryIncident,
  normalizeSentryPayload,
  readSentryAsanaConfig,
} from './sentry-asana-intake-core.mjs';

const SENTRY_API_ORIGIN = 'https://sentry.io/api/0';
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

function firstString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function boundedSlug(value) {
  const candidate = firstString(value);
  return /^[a-zA-Z0-9_-]{1,96}$/.test(candidate) ? candidate : '';
}

function boundedLimit(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? Math.min(parsed, MAX_LIMIT)
    : DEFAULT_LIMIT;
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.byteLength !== b.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < a.byteLength; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function readReconciliationConfig(env) {
  const enabled = env.SENTRY_ASANA_RECONCILIATION_ENABLED === 'true';
  const config = {
    enabled,
    cronSecret: firstString(env.CRON_SECRET),
    sentryToken: firstString(env.SENTRY_API_TOKEN),
    organization: boundedSlug(env.SENTRY_ORG),
    project: boundedSlug(env.SENTRY_PROJECT),
    environment: boundedSlug(env.SENTRY_RECONCILIATION_ENVIRONMENT) || 'production',
    limit: boundedLimit(env.SENTRY_RECONCILIATION_LIMIT),
    timeoutMs: Math.min(Math.max(Number(env.SENTRY_RECONCILIATION_TIMEOUT_MS) || 8000, 1000), 15000),
  };
  if (!enabled) return config;
  if (!config.cronSecret || !config.sentryToken || !config.organization || !config.project) {
    throw new Error('reconciliation_configuration_incomplete');
  }
  return config;
}

async function listUnresolvedIssues(fetcher, config) {
  const url = new URL(`${SENTRY_API_ORIGIN}/organizations/${encodeURIComponent(config.organization)}/issues/`);
  url.searchParams.set('project', config.project);
  url.searchParams.set('environment', config.environment);
  url.searchParams.set('query', 'is:unresolved');
  url.searchParams.set('sort', 'date');
  url.searchParams.set('limit', String(config.limit));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetcher(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.sentryToken}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`sentry_${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload)) throw new Error('sentry_invalid_response');
    return payload.slice(0, config.limit);
  } finally {
    clearTimeout(timer);
  }
}

function incidentFromIssue(issue, project) {
  return normalizeSentryPayload({
    action: 'reconciliation',
    project: issue?.project ?? { slug: project },
    data: { group: issue },
  });
}

export async function handleSentryReconciliation(request, env, dependencies = {}) {
  let config;
  try {
    config = readReconciliationConfig(env);
  } catch {
    return json(503, { error: 'reconciliation_unavailable' });
  }
  if (!config.enabled) return json(404, { error: 'not_found' });
  if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  if (!constantTimeEqual(request.headers.get('authorization') ?? '', `Bearer ${config.cronSecret}`)) {
    return json(401, { error: 'unauthorized' });
  }

  let deliveryConfig;
  try {
    deliveryConfig = readSentryAsanaConfig(env);
    if (!deliveryConfig.enabled) return json(503, { error: 'reconciliation_unavailable' });
  } catch {
    return json(503, { error: 'reconciliation_unavailable' });
  }

  const fetcher = dependencies.fetch ?? fetch;
  try {
    const issues = await listUnresolvedIssues(fetcher, config);
    const result = { checked: issues.length, accepted: 0, created: 0, deduplicated: 0, updated: 0, rejected: 0 };
    for (const issue of issues) {
      const incident = incidentFromIssue(issue, config.project);
      if (!incident) {
        result.rejected += 1;
        continue;
      }
      const delivery = await deliverSentryIncident(incident, deliveryConfig, { fetch: fetcher });
      result.accepted += 1;
      if (delivery.created) result.created += 1;
      else if (delivery.deduplicated) result.deduplicated += 1;
      else result.updated += 1;
    }
    return json(200, result);
  } catch {
    return json(502, { error: 'reconciliation_failed' });
  }
}
