import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const repositoryRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const requiredRootEntries = ['app', 'docs', 'package.json', 'pnpm-lock.yaml', 'public', 'README.md', 'scripts'];
const forbiddenRootEntries = [
  'site',
  'design-mocks',
  'COPY_DIRECTION_REVIEW.md',
  'DELIVERY_POLICY.md',
  'PORTFOLIO_SITE_PLAN.md',
  'PORTFOLIO_SITE_PLAN_v1_REJECTED.md',
  'PUBLIC_JOLENE_DEPLOYMENT_ARCHITECTURE.md',
  'RELEASE_GATES.md',
];

for (const entry of requiredRootEntries) await access(join(repositoryRoot, entry));
for (const entry of forbiddenRootEntries) {
  await assert.rejects(access(join(repositoryRoot, entry)), `${entry} must not exist at repository root.`);
}

const workflow = await readFile(join(repositoryRoot, '.github/workflows/portfolio-container.yml'), 'utf8');
for (const stalePath of ['working-directory: site', 'node site/', 'docker build --tag carl-welch-portfolio:ci site', 'site/playwright-report', 'site/test-results']) {
  assert.equal(workflow.includes(stalePath), false, `Workflow still references the removed site/ wrapper: ${stalePath}`);
}

const dependabot = await readFile(join(repositoryRoot, '.github/dependabot.yml'), 'utf8');
assert.equal(dependabot.includes('directory: /site'), false, 'Dependabot still targets the removed site/ wrapper.');

console.log('Repository layout passed: the deployable portfolio lives at root with no legacy site/ wrapper or planning collateral.');
