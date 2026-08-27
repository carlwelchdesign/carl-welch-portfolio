import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteRoot = process.cwd();
const source = await readFile(resolve(siteRoot, 'docs/legacy-asset-recovery.v1.json'), 'utf8');
const record = await readFile(resolve(siteRoot, 'docs/PORTFOLIO_LEGACY_ASSET_RECOVERY.md'), 'utf8');
const manifest = JSON.parse(source);

assert.equal(manifest.schemaVersion, '1.0.0');
assert.equal(manifest.status, 'internal_review_only');
assert.equal(manifest.recoveries.length, 8);
assert.equal(manifest.unrecovered.length, 4);

const ids = new Set();
for (const item of manifest.recoveries) {
  assert.ok(!ids.has(item.id), `Duplicate recovery id: ${item.id}`);
  ids.add(item.id);
  assert.match(item.sourceLocator, /^legacy:carlsite\//);
  assert.match(item.sha256, /^[a-f0-9]{64}$/);
  assert.ok(item.bytes > 0);
  assert.ok(['needs_permission', 'private_only', 'reject'].includes(item.publicationState));
  assert.notEqual(item.publicationState, 'publish');
  assert.ok(item.reason.length > 40);
}

for (const item of manifest.recoveries.filter(({ declaredExtension }) => declaredExtension === 'swf')) {
  assert.equal(item.publicationState, 'private_only');
  assert.equal(item.safetyState, 'do_not_execute');
}

assert.equal(manifest.recoveries.find(({ declaredExtension }) => declaredExtension === 'flv')?.safetyState, 'offline_media_inspection_only');
assert.equal(manifest.recoveries.find(({ id }) => id === 'recovery-almost-alice-psd')?.safetyState, 'do_not_serve_mislabeled_source');

for (const privateMarker of ['/Users/', 'mail.google.com']) {
  assert.equal(source.includes(privateMarker), false, `Recovery manifest exposes private source detail: ${privateMarker}`);
  assert.equal(record.includes(privateMarker), false, `Recovery record exposes private source detail: ${privateMarker}`);
}

for (const text of [source, record]) {
  assert.equal(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text), false, 'Recovery records must not contain email addresses.');
}

assert.match(record, /did not copy assets into the portfolio, execute Flash content, play private media, or make a publication decision/i);
assert.match(record, /No conversion is justified yet/);

console.log('Legacy recovery checks passed: source fingerprints, quarantine decisions, unresolved gaps, and privacy boundaries are intact.');
