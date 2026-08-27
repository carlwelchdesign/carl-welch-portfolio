import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteRoot = process.cwd();
const manifestSource = await readFile(resolve(siteRoot, 'docs/archive-candidates.v1.json'), 'utf8');
const inventory = await readFile(resolve(siteRoot, 'docs/PORTFOLIO_ARCHIVE_INVENTORY.md'), 'utf8');
const manifest = JSON.parse(manifestSource);

assert.equal(manifest.schemaVersion, '1.0.0');
assert.equal(manifest.status, 'internal_review_only');
assert.equal(manifest.items.length, 12, 'Archive review queue must contain exactly 12 ranked candidates.');

const allowedPublicationStates = new Set(['candidate_review', 'needs_permission', 'private_only', 'reject']);
const ids = new Set();

for (const [index, item] of manifest.items.entries()) {
  assert.equal(item.rank, index + 1, `Archive rank is not contiguous at ${item.id}.`);
  assert.ok(!ids.has(item.id), `Duplicate archive candidate id: ${item.id}`);
  ids.add(item.id);
  assert.ok(allowedPublicationStates.has(item.publicationState), `Invalid publication state for ${item.id}.`);
  assert.ok(item.contribution.length > 40, `${item.id} is missing a bounded contribution statement.`);
  assert.ok(item.rightsNote.length > 30, `${item.id} is missing a rights boundary.`);
  assert.ok(item.captionDraft.length > 20, `${item.id} is missing a caption draft.`);
  assert.ok(item.altTextDraft.length > 20, `${item.id} is missing an alt-text decision.`);
  assert.ok(item.prohibitedInference.length > 20, `${item.id} is missing a prohibited inference.`);

  const assets = item.assets ?? [item.asset];
  assert.ok(assets.every(Boolean), `${item.id} is missing asset metadata.`);
  for (const asset of assets) {
    assert.match(asset.sourceLocator, /^legacy:carlsite\//, `${item.id} exposes an unexpected source locator.`);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/, `${item.id} has an invalid SHA-256.`);
    assert.ok(asset.width > 0 && asset.height > 0 && asset.bytes > 0, `${item.id} has invalid asset dimensions or size.`);
  }
}

for (const privateMarker of ['/Users/', 'mail.google.com', 'source-supplied-awaiting-original-email-recheck']) {
  assert.equal(manifestSource.includes(privateMarker), false, `Archive manifest exposes private source detail: ${privateMarker}`);
  assert.equal(inventory.includes(privateMarker), false, `Archive inventory exposes private source detail: ${privateMarker}`);
}

for (const source of [manifestSource, inventory]) {
  assert.equal(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(source), false, 'Archive records must not contain email addresses.');
}

assert.equal(manifest.items.find(({ id }) => id === 'archive-taser-axon-2009')?.publicationState, 'private_only');
assert.equal(manifest.items.find(({ id }) => id === 'archive-ignite-class-2012')?.publicationState, 'private_only');
assert.match(inventory, /2006 Webby Awards Honoree/);
assert.match(inventory, /must never say Carl personally won a Webby/i);
assert.match(inventory, /No source asset has been copied into `public\/`/);

console.log('Archive boundary checks passed: 12 ranked candidates, asset fingerprints, rights states, and privacy guards are intact.');
