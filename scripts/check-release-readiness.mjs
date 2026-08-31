import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repositoryRoot = process.cwd();
const [manifest, readme, historicalAudit, regressionPolicy] = await Promise.all([
  readJson('contracts/validated-public-evidence-manifest.json'),
  readText('README.md'),
  readText('docs/PORTFOLIO_RELEASE_READINESS_2026-08-27.md'),
  readText('docs/REGRESSION_TEST_POLICY.md'),
]);

assert.equal(manifest.schemaVersion, '1.0.0');
assert.match(manifest.corpusVersion, /^career:[a-f0-9]{64}$/);
assert.equal(manifest.corpusHash, `sha256:${manifest.corpusVersion.slice('career:'.length)}`);
assert.equal(manifest.evidenceCount, 41);
assert.deepEqual(manifest.revokedEvidenceIds, []);

for (const currentBoundary of [
  'carl-welch-portfolio.vercel.app',
  'same-origin portfolio routes',
  'Public Jolene uses a separately deployed, read-only career delegate',
  'Private memory, Obsidian content, private MCP tools, and owner actions are outside this repository',
  'server-side public Jolene configuration',
]) {
  assert.ok(readme.includes(currentBoundary), `README is missing the current release boundary: ${currentBoundary}`);
}

for (const staleClaim of [
  'The application is intentionally kept local',
  'no delegate hostname is deployed',
  'production configuration remains disabled',
  'They do not call a live Jolene service',
  'A future live adapter may consume only',
]) {
  assert.equal(readme.includes(staleClaim), false, `README contains stale release copy: ${staleClaim}`);
}

assert.match(historicalAudit, /14\/14 Playwright/);
assert.match(historicalAudit, /9\/9 blockers passed/);
assert.match(historicalAudit, /zero automated contact intents/);
assert.match(historicalAudit, /PR #63 adds bearer verification/);
assert.match(historicalAudit, /managed production secret/);
assert.match(historicalAudit, /August 27, 2026 release-candidate checkpoint/);

assert.match(regressionPolicy, /Every confirmed regression must add or strengthen an automated test/);
assert.match(regressionPolicy, /A regression is not complete and must not be reported as fixed until that test/);
assert.match(regressionPolicy, /Internal state labels alone are insufficient/);
assert.match(readme, /REGRESSION_TEST_POLICY\.md/);

console.log('Release-readiness checks passed: production documentation, reviewed corpus, public boundaries, and historical gate evidence are consistent.');

async function readJson(path) {
  return JSON.parse(await readText(path));
}

async function readText(path) {
  return readFile(resolve(repositoryRoot, path), 'utf8');
}
