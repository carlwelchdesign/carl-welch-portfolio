import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const siteRoot = process.cwd();
const publicArchiveRoot = resolve(siteRoot, 'public/archive');
const expectedTreeDigest = '62a02ac6ea720fea33fdcf652ce8183512e9474a658b72e9fcadb77006a6ac6a';

const { legacyClientMarks, legacyWorkImages } = await loadTypescriptData(
  resolve(siteRoot, 'app/legacy-career-visuals.ts'),
);
const sourceRecord = await readFile(resolve(siteRoot, 'docs/LEGACY_VISUAL_SOURCE_2026.md'), 'utf8');
const presentation = await readFile(resolve(siteRoot, 'app/legacy-career-sections.tsx'), 'utf8');

assert.equal(legacyClientMarks.length, 35, 'The earlier-career mark field must retain 35 organizations and properties.');
assert.equal(legacyWorkImages.length, 16, 'The working archive must retain 16 selected historical images.');
assert.equal(new Set(legacyClientMarks.map(({ name }) => name)).size, 35, 'Client and project mark names must be unique.');
assert.equal(new Set(legacyClientMarks.map(({ src }) => src)).size, 35, 'Client and project mark assets must be unique.');
assert.equal(new Set(legacyWorkImages.map(({ id }) => id)).size, 16, 'Working-archive IDs must be unique.');
assert.equal(new Set(legacyWorkImages.map(({ image }) => image.src)).size, 16, 'Working-archive image paths must be unique.');

for (const item of legacyWorkImages) {
  assert.ok(item.contribution.length > 45, `${item.id} needs a bounded contribution statement.`);
  assert.ok(item.context.length > 2, `${item.id} needs visible studio, employer, or project context.`);
  assert.ok(item.technology.length >= 3, `${item.id} needs useful historical technology or discipline context.`);
  assert.ok(item.image.alt.length > 35, `${item.id} needs descriptive alt text.`);
  assert.match(item.image.src, /^\/archive\/working\/[a-z0-9-]+\.jpg$/);
}

for (const mark of legacyClientMarks) {
  assert.match(mark.src, /^\/archive\/client-marks\/[a-z0-9-]+\.jpg$/);
}

const expectedRelativePaths = [
  ...legacyClientMarks.map(({ src }) => src.replace('/archive/', '')),
  ...legacyWorkImages.map(({ image }) => image.src.replace('/archive/', '')),
].sort();
const actualRelativePaths = [
  ...(await readdir(resolve(publicArchiveRoot, 'client-marks'))).map((name) => `client-marks/${name}`),
  ...(await readdir(resolve(publicArchiveRoot, 'working'))).map((name) => `working/${name}`),
].sort();

assert.deepEqual(actualRelativePaths, expectedRelativePaths, 'Legacy visual public assets drifted from the curated data.');

const fingerprintLines = [];
for (const relativePath of actualRelativePaths) {
  const bytes = await readFile(resolve(publicArchiveRoot, relativePath));
  assert.equal(bytes[0], 0xff, `${relativePath} is not a JPEG asset.`);
  assert.equal(bytes[1], 0xd8, `${relativePath} is not a JPEG asset.`);
  fingerprintLines.push(`${relativePath}:${createHash('sha256').update(bytes).digest('hex')}`);
}
assert.equal(
  createHash('sha256').update(fingerprintLines.join('\n')).digest('hex'),
  expectedTreeDigest,
  'Legacy visual asset bytes changed without a new review decision.',
);

assert.match(sourceRecord, /portfolio:source:career:legacy-visuals-2026/);
assert.match(sourceRecord, /35 square client and organization marks/);
assert.match(sourceRecord, /69 raster screenshots and design artifacts/);
assert.match(sourceRecord, /do not independently establish direct employment, direct-client status, sole authorship/i);
assert.equal(/805-403-4819|carlwelchdesign@gmail\.com|\/Users\//i.test(sourceRecord), false);

assert.match(presentation, /Some were direct roles\. Many came through agencies, studios, and project teams\./);
assert.match(presentation, /editorial contact\s+sheet rather than stretched into hero images/);
assert.match(presentation, /Work across direct roles, agencies, studios, and client teams\./);

console.log(`Legacy career visual checks passed: ${legacyWorkImages.length} working images, ${legacyClientMarks.length} marks, and exact asset digest ${expectedTreeDigest}.`);
