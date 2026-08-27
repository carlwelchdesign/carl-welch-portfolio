import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dependabot = await readFile(new URL('../../.github/dependabot.yml', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../../.github/workflows/portfolio-container.yml', import.meta.url), 'utf8');
const runbook = await readFile(new URL('../docs/REPOSITORY_SECURITY_OPERATIONS.md', import.meta.url), 'utf8');

assert.match(dependabot, /^version: 2$/m);
assert.equal((dependabot.match(/package-ecosystem:/g) ?? []).length, 3);
for (const ecosystem of ['npm', 'docker', 'github-actions']) {
  assert.match(dependabot, new RegExp(`package-ecosystem: ${ecosystem}`));
}
assert.equal((dependabot.match(/interval: weekly/g) ?? []).length, 3);
assert.equal((dependabot.match(/timezone: America\/Los_Angeles/g) ?? []).length, 3);
assert.match(dependabot, /production-minor-and-patch:/);
assert.match(dependabot, /development-minor-and-patch:/);
assert.match(dependabot, /open-pull-requests-limit: 5/);
assert.match(dependabot, /open-pull-requests-limit: 2/);
assert.match(dependabot, /open-pull-requests-limit: 3/);

assert.match(workflow, /aquasecurity\/trivy-action@[a-f0-9]{40}/);
assert.match(workflow, /severity: HIGH,CRITICAL/);
assert.match(workflow, /node site\/scripts\/check-repository-security\.mjs/);

for (const boundary of [
  'vulnerability alerts are enabled',
  'automated security fixes are enabled and not paused',
  'secret scanning and code scanning unavailable or disabled',
  'Do not add a CodeQL workflow',
  'Recheck repository security settings quarterly',
]) {
  assert.ok(runbook.includes(boundary), `Repository security runbook is missing: ${boundary}`);
}

console.log('Repository security checks passed: bounded Dependabot updates, pinned Trivy gate, and capability boundaries.');
