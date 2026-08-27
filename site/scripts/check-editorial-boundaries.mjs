import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const siteRoot = process.cwd();
const repositoryRoot = resolve(siteRoot, '..');
const brief = await readFile(resolve(siteRoot, 'docs/PORTFOLIO_MESSAGING_BRIEF.md'), 'utf8');
const releaseGates = await readOptionalFile(resolve(repositoryRoot, 'RELEASE_GATES.md'));

const requiredSections = [
  '## Audience hierarchy',
  '## Literal positioning statement',
  '## Value proposition',
  '## Messaging pillars',
  '## Proof hierarchy',
  '## Tone rules',
  '## Objection handling',
  '## Page-by-page messaging map',
  '## Natural search and discoverability vocabulary',
  '## Claim matrix',
  '## Historical placement recommendation',
  '## Decisions required from Carl before PORT-MSG-002',
];

for (const section of requiredSections) {
  assert.ok(brief.includes(section), `Messaging brief is missing ${section}.`);
}

for (const state of ['Review required', 'Not ready for publication']) {
  assert.ok(brief.includes(state), `Messaging claim matrix is missing the ${state} state.`);
}

for (const privateMarker of ['/Users/', 'mail.google.com', 'source-supplied-awaiting-original-email-recheck']) {
  assert.equal(brief.includes(privateMarker), false, `Messaging brief exposes private source detail: ${privateMarker}`);
}

assert.equal(
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(brief),
  false,
  'Messaging brief must not contain an email address.',
);
assert.match(brief, /Webby Awards Honoree/);
assert.match(brief, /original Gmail threads and any image permissions must be rechecked before publication/i);
if (releaseGates) {
  assert.match(releaseGates, /\| LinkedIn recommendation provenance and publication .*\| passed \|/);
}

const publicSource = await readApplicationSource(resolve(siteRoot, 'app'));
for (const rejectedLine of [
  'AI that shows its work',
  'Make the hard parts visible',
  'Code can have a point of view',
]) {
  assert.equal(publicSource.includes(rejectedLine), false, `Rejected portfolio copy returned: ${rejectedLine}`);
}

console.log('Editorial boundary checks passed: review brief, claim states, private-source minimization, and rejected-copy guards are intact.');

async function readApplicationSource(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return readApplicationSource(path);
    if (!['.ts', '.tsx'].includes(extname(entry.name))) return '';
    return readFile(path, 'utf8');
  }));
  return files.join('\n');
}

async function readOptionalFile(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return '';
    throw error;
  }
}
