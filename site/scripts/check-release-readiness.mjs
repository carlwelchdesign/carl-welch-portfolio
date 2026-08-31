import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteRoot = process.cwd();
const repositoryRoot = resolve(siteRoot, '..');
const [manifest, readme, architecture, gates, audit, regressionPolicy] = await Promise.all([
  readJson('contracts/validated-public-evidence-manifest.json'),
  readText('README.md'),
  readOptionalText('../PUBLIC_JOLENE_DEPLOYMENT_ARCHITECTURE.md'),
  readOptionalText('../RELEASE_GATES.md'),
  readText('docs/PORTFOLIO_RELEASE_READINESS_2026-08-27.md'),
  readText('docs/REGRESSION_TEST_POLICY.md'),
]);

assert.equal(manifest.schemaVersion, '1.0.0');
assert.match(manifest.corpusVersion, /^career:[a-f0-9]{64}$/);
assert.equal(manifest.corpusHash, `sha256:${manifest.corpusVersion.slice('career:'.length)}`);
assert.equal(manifest.evidenceCount, 41);
assert.deepEqual(manifest.revokedEvidenceIds, []);
assert.equal(Boolean(architecture), Boolean(gates), 'repository-level architecture and release-gate documents must be checked together');

for (const document of [readme, architecture, gates, audit].filter(Boolean)) {
  assert.ok(document.includes(manifest.corpusVersion), 'readiness documents must identify the reviewed corpus');
}

if (architecture && gates) {
  assert.match(architecture, /implemented and verified for local integration/i);
  assert.match(architecture, /no delegate hostname is deployed/i);
  assert.match(gates, /\| Public-approved career evidence .*\| passed \|/);
  assert.match(gates, /\| Portfolio live-Jolene integration .*\| passed \|/);
  assert.match(gates, /\| Public Jolene delegate availability .*\| not applicable \|/);
  assert.match(gates, /\| Deployment configuration .*\| passed \|/);
  assert.match(gates, /\| Rollback and kill-switch rehearsal .*\| passed \|/);
  assert.match(gates, /carl-welch-portfolio\.flakeysaturation\.chatgpt\.site/);
}
assert.match(readme, /production configuration remains disabled/i);
assert.match(audit, /14\/14 Playwright/);
assert.match(audit, /9\/9 blockers passed/);
assert.match(audit, /zero automated contact intents/);
assert.match(audit, /PR #63 adds bearer verification/);
assert.match(audit, /managed production secret/);
assert.match(readme, /server-only upstream token/);
assert.match(regressionPolicy, /Every confirmed regression must add or strengthen an automated test/);
assert.match(regressionPolicy, /A regression is not complete and must not be reported as fixed until that test/);
assert.match(regressionPolicy, /Internal state labels alone are insufficient/);
assert.match(readme, /REGRESSION_TEST_POLICY\.md/);

for (const staleClaim of [
  'proposed public evidence export and isolated public delegate endpoints are not verified live',
  'They do not call a live Jolene service',
  'A future live adapter may consume only',
]) {
  assert.equal(`${readme}\n${architecture ?? ''}`.includes(staleClaim), false, `stale readiness claim: ${staleClaim}`);
}

for (const prohibitedClaim of ['public launch is complete', 'production deployment is live']) {
  assert.equal(`${readme}\n${architecture ?? ''}\n${gates ?? ''}\n${audit}`.toLowerCase().includes(prohibitedClaim), false);
}

console.log('Release-readiness checks passed: reviewed corpus, local integration, disabled production, and approval gates are consistent.');

async function readJson(path) {
  return JSON.parse(await readText(path));
}

async function readText(path) {
  const base = path.startsWith('../') ? repositoryRoot : siteRoot;
  const normalized = path.startsWith('../') ? path.slice(3) : path;
  return readFile(resolve(base, normalized), 'utf8');
}

async function readOptionalText(path) {
  try {
    return await readText(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}
