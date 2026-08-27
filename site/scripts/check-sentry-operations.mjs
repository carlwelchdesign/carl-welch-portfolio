import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const runbook = await readFile(new URL('../docs/SENTRY_OPERATIONS_RUNBOOK.md', import.meta.url), 'utf8');
const requiredSections = [
  '### Scheduled reconciliation safety net',
  '## Trust and data flow',
  '## Severity and response expectations',
  '## Alert-to-ticket transition rules',
  '## Agent remediation playbook',
  '## Evidence matrix',
  '## Activation sequence',
  '## Monthly review',
  '## Disable and rollback',
];
for (const section of requiredSections) {
  assert.ok(runbook.includes(section), `Missing Sentry runbook section: ${section}`);
}

for (const scenario of [
  'Browser exception',
  'Worker exception',
  'Duplicate delivery',
  'Missed webhook',
  'Regression',
  'Sensitive synthetic payload',
  'Missing source map',
  'Asana outage',
  'Sentry outage or quota exhaustion',
  'Agent reproduction failure',
]) {
  assert.ok(runbook.includes(`| ${scenario} |`), `Missing Sentry scenario: ${scenario}`);
}

for (const guardrail of [
  'cannot merge, deploy, suppress alerts, resolve Sentry, or',
  'Monitoring readiness does not activate public Jolene',
  'SENTRY_ASANA_INTAKE_ENABLED=false',
  'No `vercel.json` schedule is committed yet',
  '/api/cron/sentry-reconcile',
  'Portfolio Sentry incident triage',
]) {
  assert.ok(runbook.includes(guardrail), `Missing Sentry operations guardrail: ${guardrail}`);
}

assert.match(runbook, /P0[\s\S]*P1[\s\S]*P2/);
assert.match(runbook, /Automated fixtures are not substitutes for real provider evidence/);
assert.doesNotMatch(runbook, /sntrys_[a-zA-Z0-9_-]{16,}/);

console.log('Sentry operations runbook boundary passed');
