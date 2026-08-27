import assert from 'node:assert/strict';
import { handleSentryReconciliation } from '../app/observability/sentry-reconciliation-core.mjs';

const sensitive = 'private-event-message-do-not-retain';
const env = {
  SENTRY_ASANA_RECONCILIATION_ENABLED: 'true',
  CRON_SECRET: 'fixture-cron-secret',
  SENTRY_API_TOKEN: 'fixture-sentry-token',
  SENTRY_ORG: 'carl-portfolio',
  SENTRY_PROJECT: 'portfolio-browser',
  SENTRY_RECONCILIATION_ENVIRONMENT: 'production',
  SENTRY_RECONCILIATION_LIMIT: '25',
  SENTRY_ASANA_INTAKE_ENABLED: 'true',
  ASANA_ACCESS_TOKEN: 'fixture-asana-token',
  ASANA_PORTFOLIO_PROJECT_ID: 'portfolio-project',
  ASANA_IN_PROGRESS_SECTION_ID: 'in-progress-section',
  ASANA_WORKSPACE_ID: 'workspace',
};

const issue = {
  id: '24680',
  status: 'unresolved',
  level: 'error',
  count: '7',
  firstSeen: '2026-08-27T18:00:00Z',
  lastSeen: '2026-08-27T18:30:00Z',
  permalink: 'https://carl.sentry.io/issues/24680/?query=private',
  culprit: '/work/wave-factory-essentials?visitor=private',
  title: sensitive,
  project: { slug: 'portfolio-browser' },
};

function request(secret = env.CRON_SECRET) {
  return new Request('https://portfolio.example/api/cron/sentry-reconcile', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

let task = null;
let sentryCalls = 0;
let asanaCreates = 0;
async function fakeFetch(input, init = {}) {
  const url = String(input);
  const method = init.method ?? 'GET';
  if (url.startsWith('https://sentry.io/api/0/')) {
    sentryCalls += 1;
    assert.match(url, /organizations\/carl-portfolio\/issues\//);
    assert.match(url, /environment=production/);
    assert.match(url, /query=is%3Aunresolved/);
    assert.match(url, /project=portfolio-browser/);
    assert.equal(init.headers.Authorization, 'Bearer fixture-sentry-token');
    return Response.json([issue]);
  }
  if (method === 'GET' && url.includes('/tasks?')) {
    return Response.json({ data: task ? [task] : [], next_page: null });
  }
  if (method === 'POST' && url.endsWith('/tasks')) {
    asanaCreates += 1;
    const payload = JSON.parse(init.body);
    assert.equal(JSON.stringify(payload).includes(sensitive), false);
    task = { gid: 'asana-reconciled-1', memberships: [], ...payload.data };
    return Response.json({ data: { gid: task.gid } }, { status: 201 });
  }
  if (method === 'POST' && url.includes('/sections/')) {
    task.memberships = [{ section: { gid: 'in-progress-section' } }];
    return Response.json({ data: {} });
  }
  if (method === 'PUT' && url.includes('/tasks/')) {
    const payload = JSON.parse(init.body);
    task = { ...task, ...payload.data };
    return Response.json({ data: task });
  }
  if (method === 'POST' && url.endsWith('/stories')) return Response.json({ data: {} }, { status: 201 });
  return Response.json({ error: 'unexpected fake request' }, { status: 500 });
}

let response = await handleSentryReconciliation(request(), env, { fetch: fakeFetch });
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), {
  checked: 1,
  accepted: 1,
  created: 1,
  deduplicated: 0,
  updated: 0,
  rejected: 0,
});
assert.equal(asanaCreates, 1);
assert.equal(task.notes.includes(sensitive), false);
assert.match(task.notes, /Sentry issue ID: 24680/);
assert.match(task.notes, /State: open/);

response = await handleSentryReconciliation(request(), env, { fetch: fakeFetch });
assert.equal(response.status, 200);
assert.equal((await response.json()).deduplicated, 1);
assert.equal(asanaCreates, 1);
assert.equal(sentryCalls, 2);

response = await handleSentryReconciliation(request('wrong-secret'), env, { fetch: fakeFetch });
assert.equal(response.status, 401);

response = await handleSentryReconciliation(request(), { ...env, SENTRY_ASANA_RECONCILIATION_ENABLED: 'false' }, { fetch: fakeFetch });
assert.equal(response.status, 404);

response = await handleSentryReconciliation(request(), { ...env, SENTRY_API_TOKEN: '' }, { fetch: fakeFetch });
assert.equal(response.status, 503);

response = await handleSentryReconciliation(request(), env, {
  fetch: async (input) => String(input).startsWith('https://sentry.io/')
    ? Response.json({ error: 'provider outage' }, { status: 503 })
    : fakeFetch(input),
});
assert.equal(response.status, 502);

console.log('Sentry reconciliation safety net passed');
