import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['scripts/sync-github-content.mjs'], {
  cwd: process.cwd(),
  encoding: 'utf8',
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) process.exit(result.status ?? 1);

if (!result.stdout.includes('Proposed changes: 0')) {
  throw new Error('GitHub archive has review-required drift. Run pnpm sync:github -- --write-review <path> to freeze a review artifact.');
}
