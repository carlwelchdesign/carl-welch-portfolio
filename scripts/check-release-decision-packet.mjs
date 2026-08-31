import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteRoot = process.cwd();
const source = await readFile(resolve(siteRoot, 'docs/release-decisions.v1.json'), 'utf8');
const packet = await readFile(resolve(siteRoot, 'docs/PORTFOLIO_RELEASE_DECISION_PACKET.md'), 'utf8');
const decisions = JSON.parse(source);

assert.equal(decisions.schemaVersion, '1.0.0');
assert.equal(decisions.status, 'approved_for_verified_static_release');
assert.equal(decisions.approvedAt, '2026-08-27');
assert.equal(decisions.decisions.length, 12);
assert.equal(new Set(decisions.decisions.map(({ id }) => id)).size, 12);

for (const [index, decision] of decisions.decisions.entries()) {
  assert.equal(decision.id, `PORT-DEC-${String(index + 1).padStart(3, '0')}`);
  assert.ok(['approved', 'approved_with_gate', 'approved_with_verification_gate'].includes(decision.status));
  assert.ok(decision.options.length >= 2);
  assert.ok(decision.reason.length > 40);
  assert.ok(decision.owningTasks.length > 0);
  assert.ok(decision.options.includes(decision.selected));
  if (decision.recommended !== null) assert.ok(decision.options.includes(decision.recommended));
}

for (const requiredTask of [
  'PORT-CONTENT-001',
  'PORT-REC-001',
  'PORT-META-001',
  'PORT-PLATFORM-002',
  'PORT-QA-001',
  'PORT-RELEASE-001',
  'PORT-LAUNCH-001',
  'PORT-AVATAR-002',
]) {
  assert.ok(decisions.decisions.some(({ owningTasks }) => owningTasks.includes(requiredTask)), `Decision packet omits ${requiredTask}.`);
}

for (const privateMarker of ['/Users/', 'mail.google.com', '127.0.0.1:8431']) {
  assert.equal(source.includes(privateMarker), false, `Decision manifest exposes private or local detail: ${privateMarker}`);
  assert.equal(packet.includes(privateMarker), false, `Decision packet exposes private or local detail: ${privateMarker}`);
}

for (const text of [source, packet]) {
  assert.equal(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text), false, 'Decision packet must not contain an email address.');
}

assert.match(packet, /approved for a verified static release/i);
assert.match(packet, /A green repository alone does not satisfy/i);
assert.match(packet, /2006 Webby Awards Honoree/);
assert.match(packet, /2006 Graphic Design USA Certificate of Excellence in Communication and Graphic Design/);
assert.match(packet, /neither may be presented as Carl’s individual award/i);

console.log('Release decision checks passed: 12 approved selections, owning gates, non-decisions, and verification boundaries are intact.');
