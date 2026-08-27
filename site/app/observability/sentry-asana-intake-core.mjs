const MAX_BODY_BYTES = 64 * 1024;
const MAX_ASANA_PAGES = 5;
const ASANA_PAGE_SIZE = 100;
const ASANA_API_ORIGIN = 'https://app.asana.com/api/1.0';
const ISSUE_MARKER_PREFIX = 'Sentry issue ID: ';
const INTAKE_START = '--- SENTRY INTAKE START ---';
const INTAKE_END = '--- SENTRY INTAKE END ---';

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function boundedToken(value, fallback, max = 128) {
  const normalized = firstString(value)
    .replace(/[^a-zA-Z0-9._:/-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, max);
  return normalized || fallback;
}

function boundedInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function safeIso(value) {
  const candidate = firstString(value);
  if (!candidate) return null;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function safeSentryUrl(value) {
  const candidate = firstString(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !/(?:^|\.)sentry\.io$/i.test(url.hostname)) return null;
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function safeRoute(value) {
  const candidate = firstString(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate, 'https://portfolio.invalid');
    const path = url.pathname.replace(/[^a-zA-Z0-9_./{}:-]/g, '').slice(0, 200);
    return path.startsWith('/') ? path : null;
  } catch {
    return null;
  }
}

function readTag(tags, key) {
  if (Array.isArray(tags)) {
    const pair = tags.find((entry) => Array.isArray(entry) && entry[0] === key);
    return pair?.[1];
  }
  return asRecord(tags)[key];
}

function stateFromPayload(payload, group) {
  const action = firstString(payload.action, payload.type).toLowerCase();
  const status = firstString(group.status, group.substatus).toLowerCase();
  if (action.includes('resolved') || status === 'resolved') return 'resolved';
  if (action.includes('regress') || action.includes('reopen') || status === 'unresolved') return 'regressed';
  return 'open';
}

function severityFromLevel(level) {
  const normalized = firstString(level).toLowerCase();
  if (normalized === 'fatal') return 'P0';
  if (normalized === 'error') return 'P1';
  return 'P2';
}

export function normalizeSentryPayload(value) {
  const payload = asRecord(value);
  const data = asRecord(payload.data);
  const issue = asRecord(payload.issue);
  const group = Object.keys(asRecord(data.group)).length ? asRecord(data.group) : issue;
  const event = asRecord(data.event);
  const project = asRecord(payload.project);
  const tags = event.tags;

  const issueId = boundedToken(firstString(group.id, group.shortId, issue.id), '', 96);
  if (!issueId) return null;

  const service = boundedToken(
    firstString(readTag(tags, 'service'), project.slug, project.name),
    'portfolio',
    64,
  );
  const environment = boundedToken(
    firstString(readTag(tags, 'environment'), event.environment, payload.environment),
    'unknown',
    48,
  );
  const release = boundedToken(
    firstString(readTag(tags, 'release'), event.release, group.firstRelease?.version),
    'unknown',
    128,
  );
  const route = safeRoute(
    firstString(readTag(tags, 'route'), asRecord(event.request).url, group.culprit),
  );
  const level = firstString(event.level, group.level, payload.level);
  const firstSeen = safeIso(firstString(group.firstSeen, event.dateCreated, payload.dateCreated));
  const lastSeen = safeIso(firstString(group.lastSeen, event.dateCreated, payload.dateCreated));
  const frequency = boundedInteger(firstString(group.count, event.count, payload.count));

  return {
    issueId,
    issueUrl: safeSentryUrl(firstString(group.permalink, group.url, issue.permalink, payload.webUrl)),
    service,
    environment,
    release,
    route,
    severity: severityFromLevel(level),
    state: stateFromPayload(payload, group),
    frequency,
    firstSeen,
    lastSeen,
  };
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value) {
  return bytesToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

export async function signSentryBody(secret, body) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.byteLength !== b.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < a.byteLength; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

export async function verifySentrySignature(secret, body, suppliedSignature) {
  const supplied = firstString(suppliedSignature).replace(/^sha256=/i, '').toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(supplied)) return false;
  return constantTimeEqual(await signSentryBody(secret, body), supplied);
}

function requireConfig(env) {
  const config = {
    enabled: env.SENTRY_ASANA_INTAKE_ENABLED === 'true',
    hookSecret: firstString(env.SENTRY_SERVICE_HOOK_SECRET),
    asanaToken: firstString(env.ASANA_ACCESS_TOKEN),
    projectId: boundedToken(env.ASANA_PORTFOLIO_PROJECT_ID, '', 64),
    sectionId: boundedToken(env.ASANA_IN_PROGRESS_SECTION_ID, '', 64),
    workspaceId: boundedToken(env.ASANA_WORKSPACE_ID, '', 64),
    timeoutMs: Math.min(Math.max(Number(env.SENTRY_ASANA_TIMEOUT_MS) || 8000, 1000), 15000),
  };
  if (!config.enabled) return config;
  if (!config.hookSecret || !config.asanaToken || !config.projectId || !config.sectionId) {
    throw new Error('intake_configuration_incomplete');
  }
  return config;
}

async function asanaRequest(fetcher, config, path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetcher(`${ASANA_API_ORIGIN}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.asanaToken}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
    if (!response.ok) throw new Error(`asana_${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function markerFor(issueId) {
  return `${ISSUE_MARKER_PREFIX}${issueId}`;
}

async function findIncidentTask(fetcher, config, issueId) {
  let offset = '';
  for (let page = 0; page < MAX_ASANA_PAGES; page += 1) {
    const query = new URLSearchParams({
      project: config.projectId,
      completed_since: '1970-01-01T00:00:00.000Z',
      limit: String(ASANA_PAGE_SIZE),
      opt_fields: 'gid,name,notes,completed,memberships.section.gid',
    });
    if (offset) query.set('offset', offset);
    const result = await asanaRequest(fetcher, config, `/tasks?${query}`);
    const match = Array.isArray(result.data)
      ? result.data.find((task) => firstString(task.notes).includes(markerFor(issueId)))
      : null;
    if (match) return match;
    offset = firstString(result.next_page?.offset);
    if (!offset) return null;
  }
  throw new Error('asana_task_scan_limit');
}

function makeTaskName(incident) {
  return `PORT-INC — ${incident.severity} ${incident.service} Sentry issue ${incident.issueId}`.slice(0, 200);
}

function makeTaskNotes(incident, digest) {
  const lines = [
    INTAKE_START,
    'Sanitized Sentry incident intake',
    markerFor(incident.issueId),
    `Delivery fingerprint: ${digest}`,
    `Severity: ${incident.severity}`,
    `State: ${incident.state}`,
    `Service: ${incident.service}`,
    `Environment: ${incident.environment}`,
    `Release: ${incident.release}`,
    `Route: ${incident.route ?? 'unknown'}`,
    `Frequency: ${incident.frequency ?? 'unknown'}`,
    `First seen: ${incident.firstSeen ?? 'unknown'}`,
    `Last seen: ${incident.lastSeen ?? 'unknown'}`,
    `Sentry issue: ${incident.issueUrl ?? 'provider URL unavailable'}`,
    '',
    'Acceptance criteria',
    '- Reproduce without copying visitor content or private professional context.',
    '- Add a regression test and a scoped remediation plan before editing code.',
    '- Open a reviewable pull request; do not auto-merge or auto-deploy.',
    '- Verify the approved production release before resolving Sentry or completing this task.',
    '',
    'Privacy boundary',
    'This record intentionally excludes exception messages, stack frames, request bodies, headers, users, prompts, transcripts, job descriptions, contact data, and evidence content.',
    INTAKE_END,
  ];
  return lines.join('\n');
}

function mergeTaskNotes(existingNotes, intakeNotes) {
  const existing = firstString(existingNotes);
  const start = existing.indexOf(INTAKE_START);
  const end = existing.indexOf(INTAKE_END);
  if (start >= 0 && end >= start) {
    return `${existing.slice(0, start)}${intakeNotes}${existing.slice(end + INTAKE_END.length)}`.trim();
  }
  return existing ? `${intakeNotes}\n\n${existing}` : intakeNotes;
}

function isInSection(task, sectionId) {
  return Array.isArray(task.memberships)
    && task.memberships.some((membership) => firstString(membership?.section?.gid) === sectionId);
}

async function ensureInProgressSection(fetcher, config, task, incident) {
  if (incident.state === 'resolved' && task.completed) return;
  if (isInSection(task, config.sectionId)) return;
  await asanaRequest(fetcher, config, `/sections/${config.sectionId}/addTask`, {
    method: 'POST',
    body: JSON.stringify({ data: { task: firstString(task.gid) } }),
  });
}

async function createIncident(fetcher, config, incident, digest) {
  const created = await asanaRequest(fetcher, config, '/tasks', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        name: makeTaskName(incident),
        notes: makeTaskNotes(incident, digest),
        completed: false,
        projects: [config.projectId],
        ...(config.workspaceId ? { workspace: config.workspaceId } : {}),
      },
    }),
  });
  const taskId = firstString(created.data?.gid);
  if (!taskId) throw new Error('asana_create_missing_task');
  await asanaRequest(fetcher, config, `/sections/${config.sectionId}/addTask`, {
    method: 'POST',
    body: JSON.stringify({ data: { task: taskId } }),
  });
  return { taskId, created: true, deduplicated: false };
}

async function updateIncident(fetcher, config, task, incident, digest) {
  await ensureInProgressSection(fetcher, config, task, incident);
  if (firstString(task.notes).includes(`Delivery fingerprint: ${digest}`)) {
    return { taskId: firstString(task.gid), created: false, deduplicated: true };
  }
  const taskId = firstString(task.gid);
  await asanaRequest(fetcher, config, `/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: {
        name: makeTaskName(incident),
        notes: mergeTaskNotes(task.notes, makeTaskNotes(incident, digest)),
        completed: incident.state === 'resolved' ? Boolean(task.completed) : false,
      },
    }),
  });
  await asanaRequest(fetcher, config, `/tasks/${taskId}/stories`, {
    method: 'POST',
    body: JSON.stringify({
      data: {
        text: `Sanitized Sentry transition received: ${incident.state}; severity ${incident.severity}; release ${incident.release}; route ${incident.route ?? 'unknown'}. Production verification remains required before completion.`,
      },
    }),
  });
  return { taskId, created: false, deduplicated: false };
}

export async function handleSentryAsanaIntake(request, env, dependencies = {}) {
  const fetcher = dependencies.fetch ?? fetch;
  let config;
  try {
    config = requireConfig(env);
  } catch {
    return json(503, { error: 'intake_unavailable' });
  }
  if (!config.enabled) return json(404, { error: 'not_found' });
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json(413, { error: 'payload_too_large' });
  }
  if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return json(415, { error: 'unsupported_media_type' });
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return json(413, { error: 'payload_too_large' });
  }
  const signature = request.headers.get('x-servicehook-signature')
    ?? request.headers.get('x-sentry-hook-signature');
  if (!(await verifySentrySignature(config.hookSecret, body, signature))) {
    return json(401, { error: 'invalid_signature' });
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return json(400, { error: 'invalid_json' });
  }
  const incident = normalizeSentryPayload(payload);
  if (!incident) return json(422, { error: 'unsupported_payload' });
  const digest = await sha256(JSON.stringify(incident));

  try {
    const existing = await findIncidentTask(fetcher, config, incident.issueId);
    const result = existing
      ? await updateIncident(fetcher, config, existing, incident, digest)
      : await createIncident(fetcher, config, incident, digest);
    return json(result.created ? 201 : 200, {
      accepted: true,
      created: result.created,
      deduplicated: result.deduplicated,
      taskId: result.taskId,
    });
  } catch {
    return json(502, { error: 'incident_delivery_failed' });
  }
}
