import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const policy = JSON.parse(await readFile(
  resolve(process.cwd(), 'operations/sentry-alert-policy.v1.json'),
  'utf8',
));

assert.equal(policy.schemaVersion, '1.0.0');
assert.equal(
  policy.status,
  'provider_configured_resolution_transition_requires_provider_supported_trigger',
);
assert.equal(policy.activation.enabled, true);
assert.equal(policy.activation.ownerApprovalState, 'approved');
assert.deepEqual(policy.activation.environments, ['production']);
assert.deepEqual(policy.activation.approvedDestinations, ['sentry_member:Carl Welch']);
assert.deepEqual(policy.activation.providerRuleIds, ['3910542', '3914366', '3914414']);
assert.equal(policy.activation.providerEnvironmentScope, 'production');

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

assert.equal(
  policy.thresholds.approvalState,
  'new_and_regressed_approved_metric_thresholds_pending_baseline',
);
assert.equal(policy.thresholds.newAndRegressedIssues, true);
assert.equal(policy.thresholds.sustainedErrorRate, null);
assert.equal(policy.thresholds.availabilityDegradation, null);

assert.deepEqual(
  policy.providerRules.map(({ id }) => id),
  policy.activation.providerRuleIds,
);

const providerRules = new Map(policy.providerRules.map((rule) => [rule.severity, rule]));
assert.equal(providerRules.get('P0').cooldownSeconds, severities.get('P0').cooldownSeconds);
assert.equal(providerRules.get('P1').cooldownSeconds, severities.get('P1').cooldownSeconds);
assert.equal(providerRules.get('P0').destination, 'sentry_member:Carl Welch');
assert.equal(providerRules.get('P1').destination, 'sentry_member:Carl Welch');
assert(providerRules.get('P0').triggers.includes('new_high_priority_issue'));
assert(providerRules.get('P1').triggers.includes('new_issue'));
assert(providerRules.get('P1').triggers.includes('resolved_issue'));
assert(providerRules.get('P1').triggers.includes('regressed_issue'));
assert.equal(providerRules.get('lifecycle').notifyEveryTrigger, true);
assert.equal(providerRules.get('lifecycle').destination, 'sentry_member:Carl Welch');
assert(providerRules.get('lifecycle').triggers.includes('resolved_issue'));
assert(providerRules.get('lifecycle').triggers.includes('regressed_issue'));

assert.equal(policy.validation.builtInTestNotification, 'passed');
assert.match(policy.validation.syntheticIssueId, /^\d+$/);
assert.match(policy.validation.syntheticIssueShortId, /^CARL-WELCH-PORTFOLIO-BROWSER-\d+$/);
assert.equal(policy.validation.p0Transition, 'passed');
assert.equal(policy.validation.p1Transition, 'passed');
assert.equal(
  policy.validation.resolutionTransition,
  'blocked_manual_resolution_does_not_trigger_provider_alert',
);
assert.equal(policy.validation.regressionTransition, 'passed');

console.log('Sentry alert policy checks passed: severity, deduplication, cooldown, minimization, and activation gates are explicit.');
