import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const policy = JSON.parse(await readFile(
  resolve(process.cwd(), 'operations/sentry-alert-policy.v1.json'),
  'utf8',
));

assert.equal(policy.schemaVersion, '1.0.0');
assert.equal(policy.status, 'proposed');
assert.equal(policy.activation.enabled, false);
assert.equal(policy.activation.ownerApprovalState, 'pending');
assert.deepEqual(policy.activation.environments, ['production']);
assert.deepEqual(policy.activation.approvedDestinations, []);
assert.deepEqual(policy.activation.providerRuleIds, []);

assert.deepEqual(
  policy.deduplication.keyFields,
  ['project', 'environment', 'service', 'issueId'],
);
assert.equal(policy.deduplication.resolvedBehavior, 'update_existing_incident');
assert.equal(policy.deduplication.regressionBehavior, 'reopen_existing_incident');
assert.equal(policy.deduplication.repeatedBehavior, 'update_frequency_without_new_notification');

const severityIds = policy.severities.map(({ id }) => id);
assert.deepEqual(severityIds, ['P0', 'P1', 'P2']);
assert.equal(new Set(severityIds).size, severityIds.length);

const severities = new Map(policy.severities.map((severity) => [severity.id, severity]));
assert.equal(severities.get('P0').afterHours, true);
assert.equal(severities.get('P0').notificationUrgency, 'immediate');
assert(severities.get('P0').conditions.includes('private_data_exposure'));
assert(severities.get('P0').conditions.includes('broad_production_outage'));
assert.equal(severities.get('P1').afterHours, false);
assert(severities.get('P1').conditions.includes('new_production_error'));
assert(severities.get('P1').conditions.includes('regressed_production_error'));
assert(severities.get('P1').conditions.includes('degraded_public_jolene_endpoint'));
assert.equal(severities.get('P2').afterHours, false);

for (const severity of policy.severities) {
  assert(Number.isInteger(severity.cooldownSeconds));
  assert(severity.cooldownSeconds >= 300);
  assert(severity.ownerAction);
}

const allowedFields = new Set(policy.notification.allowedFields);
for (const required of [
  'severity',
  'state',
  'service',
  'environment',
  'release',
  'route',
  'frequency',
  'affectedUserEstimate',
  'firstSeenAt',
  'lastSeenAt',
  'issueUrl',
]) {
  assert(allowedFields.has(required), `notification policy is missing ${required}`);
}

const prohibitedFields = new Set(policy.notification.prohibitedFields);
for (const prohibited of [
  'rawEvent',
  'visitorContent',
  'requestBody',
  'responseBody',
  'queryString',
  'urlFragment',
  'localPath',
  'secret',
  'privateJoleneContext',
]) {
  assert(prohibitedFields.has(prohibited), `notification policy must prohibit ${prohibited}`);
  assert(!allowedFields.has(prohibited), `${prohibited} cannot be notification-safe`);
}

assert.equal(policy.thresholds.approvalState, 'pending_owner_review');
assert.equal(policy.thresholds.newAndRegressedIssues, true);
assert.equal(policy.thresholds.sustainedErrorRate, null);
assert.equal(policy.thresholds.availabilityDegradation, null);

console.log('Sentry alert policy checks passed: severity, deduplication, cooldown, minimization, and activation gates are explicit.');
