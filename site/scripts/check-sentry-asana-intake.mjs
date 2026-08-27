import assert from 'node:assert/strict';
import {
  handleSentryAsanaIntake,
  normalizeSentryPayload,
  signSentryBody,
} from '../app/observability/sentry-asana-intake-core.mjs';

const secret = 'fixture-hook-secret';
const baseEnv = {
  SENTRY_ASANA_INTAKE_ENABLED: 'true',
  SENTRY_SERVICE_HOOK_SECRET: secret,
  ASANA_ACCESS_TOKEN: 'fixture-asana-token',
  ASANA_PORTFOLIO_PROJECT_ID: 'portfolio-project',
  ASANA_IN_PROGRESS_SECTION_ID: 'in-progress-section',
  ASANA_WORKSPACE_ID: 'workspace',
};

const sensitive = 'do-not-retain-this';
const payload = {
  action: 'triggered',
  project: { slug: 'portfolio-browser' },
  data: {
    group: {
      id: '998877',
      level: 'error',
      count: '14',
      firstSeen: '2026-08-27T06:00:00Z',
      lastSeen: '2026-08-27T06:10:00Z',
      permalink: 'https://carl.sentry.io/issues/998877/?query=private#event',
      title: sensitive,
      culprit: '/work/job-search-os?candidate=private',
    },
    event: {
      release: 'bb64f64',
      environment: 'production',
      message: sensitive,
      request: { data: { prompt: sensitive }, headers: { authorization: sensitive } },
    },
  },
};

const normalized = normalizeSentryPayload(payload);
assert.deepEqual(normalized, {
  issueId: '998877',
  issueUrl: 'https://carl.sentry.io/issues/998877/',
  service: 'portfolio-browser',
  environment: 'production',
  release: 'bb64f64',
  route: '/work/job-search-os',
  severity: 'P1',
  state: 'open',
  frequency: 14,
  firstSeen: '2026-08-27T06:00:00.000Z',
  lastSeen: '2026-08-27T06:10:00.000Z',
});
assert.equal(JSON.stringify(normalized).includes(sensitive), false);

const body = JSON.stringify(payload);
const signature = await signSentryBody(secret, body);
function makeRequest(candidateBody = body, candidateSignature = signature) {
  return new Request('https://portfolio.example/api/ops/sentry', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-servicehook-signature': candidateSignature,
    },
    body: candidateBody,
  });
}

const calls = [];
let task = null;
async function fakeFetch(url, init = {}) {
  calls.push({ url, init });
  const method = init.method ?? 'GET';
  if (method === 'GET' && url.includes('/tasks?')) {
    assert.ok(url.includes('completed_since=1970-01-01T00%3A00%3A00.000Z'));
    return Response.json({ data: task ? [task] : [], next_page: null });
  }
  if (method === 'POST' && url.endsWith('/tasks')) {
    const request = JSON.parse(init.body);
    assert.equal(JSON.stringify(request).includes(sensitive), false);
    task = { gid: 'asana-incident-1', memberships: [], ...request.data };
    return Response.json({ data: { gid: task.gid } }, { status: 201 });
  }
  if (method === 'POST' && url.includes('/sections/')) {
    if (task) task.memberships = [{ section: { gid: 'in-progress-section' } }];
    return Response.json({ data: {} });
  }
  if (method === 'PUT' && url.includes('/tasks/asana-incident-1')) {
    const request = JSON.parse(init.body);
    assert.equal(request.data.completed, false);
    task = { ...task, ...request.data };
    return Response.json({ data: task });
  }
  if (method === 'POST' && url.endsWith('/stories')) return Response.json({ data: {} }, { status: 201 });
  return Response.json({ error: 'unexpected fake request' }, { status: 500 });
}

let response = await handleSentryAsanaIntake(makeRequest(), baseEnv, { fetch: fakeFetch });
assert.equal(response.status, 201);
assert.deepEqual(await response.json(), {
  accepted: true,
  created: true,
  deduplicated: false,
  taskId: 'asana-incident-1',
});
assert.ok(task.notes.includes('Sentry issue ID: 998877'));
assert.equal(task.notes.includes(sensitive), false);
task.notes += '\n\nHuman remediation notes must survive intake updates.';

response = await handleSentryAsanaIntake(makeRequest(), baseEnv, { fetch: fakeFetch });
assert.equal(response.status, 200);
assert.equal((await response.json()).deduplicated, true);
assert.equal(calls.filter((call) => call.url.endsWith('/stories')).length, 0);

const regressionBody = JSON.stringify({ ...payload, action: 'regression', data: { ...payload.data, group: { ...payload.data.group, count: 15 } } });
response = await handleSentryAsanaIntake(
  makeRequest(regressionBody, await signSentryBody(secret, regressionBody)),
  baseEnv,
  { fetch: fakeFetch },
);
assert.equal(response.status, 200);
assert.equal((await response.json()).deduplicated, false);
assert.equal(task.completed, false);
assert.ok(task.notes.includes('State: regressed'));
assert.ok(task.notes.includes('Human remediation notes must survive intake updates.'));
assert.equal(calls.filter((call) => call.url.endsWith('/stories')).length, 1);

const resolvedBody = JSON.stringify({ ...payload, action: 'resolved' });
response = await handleSentryAsanaIntake(
  makeRequest(resolvedBody, await signSentryBody(secret, resolvedBody)),
  baseEnv,
  { fetch: fakeFetch },
);
assert.equal(response.status, 200);
assert.equal(task.completed, false);
assert.ok(task.notes.includes('State: resolved'));

response = await handleSentryAsanaIntake(makeRequest(body, '0'.repeat(64)), baseEnv, { fetch: fakeFetch });
assert.equal(response.status, 401);

response = await handleSentryAsanaIntake(makeRequest(), { ...baseEnv, SENTRY_ASANA_INTAKE_ENABLED: 'false' }, { fetch: fakeFetch });
assert.equal(response.status, 404);

response = await handleSentryAsanaIntake(makeRequest(), { ...baseEnv, ASANA_ACCESS_TOKEN: '' }, { fetch: fakeFetch });
assert.equal(response.status, 503);

response = await handleSentryAsanaIntake(
  makeRequest(),
  baseEnv,
  { fetch: async () => Response.json({ error: 'outage' }, { status: 503 }) },
);
assert.equal(response.status, 502);

const oversized = JSON.stringify({ issue: { id: '1' }, padding: 'x'.repeat(70 * 1024) });
response = await handleSentryAsanaIntake(
  makeRequest(oversized, await signSentryBody(secret, oversized)),
  baseEnv,
  { fetch: fakeFetch },
);
assert.equal(response.status, 413);

console.log('Sentry-to-Asana intake boundary passed');
