import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const protocol = await readFile(new URL('../docs/PORTFOLIO_RESEARCH_PROTOCOL.md', import.meta.url), 'utf8');
const record = JSON.parse(await readFile(new URL('../docs/research-session-record.v1.json', import.meta.url), 'utf8'));

for (const required of [
  'Consent script',
  'Task script',
  'Measures and release thresholds',
  'Finding taxonomy',
  'Decision boundary',
  'direct`, `adjacent`, `missing`, and `unknown',
  'untrusted ephemeral input',
  'P0 and blocks launch',
  'cannot approve',
]) {
  assert.ok(protocol.includes(required), `Research protocol is missing: ${required}`);
}

for (const prohibited of [
  /retain (?:the )?job description/i,
  /automatic(?:ally)? approve/i,
  /blanket fit conclusion is allowed/i,
]) {
  assert.doesNotMatch(protocol, prohibited);
}

assert.equal(record.schemaVersion, '1.0.0');
assert.equal(record.status, 'template');
assert.match(record.participantId, /^(HM|REC|PEER)-\d{2}$/);
assert.equal(record.consent, false);
assert.equal(record.retention.containsPersonalData, false);
assert.equal(record.retention.containsRawJobDescription, false);
assert.equal(record.retention.containsTranscript, false);
assert.ok(Array.isArray(record.tasks) && record.tasks.length > 0);
assert.ok(Array.isArray(record.findings));

console.log('Research protocol checks passed: consent, tasks, thresholds, privacy, and decision boundaries.');
