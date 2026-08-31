import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const siteRoot = process.cwd();
const manifestSource = await readFile(resolve(siteRoot, 'docs/archive-candidates.v1.json'), 'utf8');
const inventory = await readFile(resolve(siteRoot, 'docs/PORTFOLIO_ARCHIVE_INVENTORY.md'), 'utf8');
const manifest = JSON.parse(manifestSource);
const { legacyArchiveProjects } = await loadTypescriptData(resolve(siteRoot, 'app/legacy-archive-data.ts'));

assert.equal(manifest.schemaVersion, '1.0.0');
assert.equal(manifest.status, 'complete_public_archive_approved');
assert.equal(manifest.approvedAt, '2026-08-27');
assert.equal(manifest.items.length, 12, 'Archive review queue must contain exactly 12 ranked candidates.');

const allowedPublicationStates = new Set(['public_approved', 'candidate_review', 'needs_permission', 'private_only', 'reject']);
const ids = new Set();
const publicItems = [];

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

  if (item.publicationState === 'public_approved') {
    publicItems.push(item);
    const publicAssets = item.publicAssets ?? [item.publicAsset];
    assert.ok(publicAssets.every(Boolean), `${item.id} is missing public asset metadata.`);
    for (const publicAsset of publicAssets) {
      assert.match(publicAsset.path, /^\/archive\/[a-z0-9-]+\.(?:jpg|png)$/);
      assert.match(publicAsset.sha256, /^[a-f0-9]{64}$/);
      assert.ok(publicAsset.width > 0 && publicAsset.height > 0);
      const publicBytes = await readFile(resolve(siteRoot, 'public', publicAsset.path.slice(1)));
      assert.equal(
        createHash('sha256').update(publicBytes).digest('hex'),
        publicAsset.sha256,
        `${item.id} public asset ${publicAsset.path} does not match its approved fingerprint.`,
      );
    }
  } else {
    assert.equal(item.publicAsset, undefined, `${item.id} must not expose a public asset.`);
    assert.equal(item.publicAssets, undefined, `${item.id} must not expose public assets.`);
  }
}

assert.equal(publicItems.length, 12, 'Exactly twelve historical project records are approved for public display.');
assert.deepEqual(
  legacyArchiveProjects.map(({ id }) => id),
  publicItems.map(({ id }) => id),
  'Public archive data must exactly match the approved manifest order.',
);
for (const project of legacyArchiveProjects) {
  const manifestItem = publicItems.find(({ id }) => id === project.id);
  const projectImages = [project.image, ...(project.additionalImages ?? [])];
  const manifestAssets = manifestItem.publicAssets ?? [manifestItem.publicAsset];
  assert.deepEqual(
    projectImages.map(({ src, width, height }) => ({ path: src, width, height })),
    manifestAssets.map(({ path, width, height }) => ({ path, width, height })),
    `${project.id} public image set drifted from the manifest.`,
  );
}

for (const privateMarker of ['/Users/', 'mail.google.com', 'source-supplied-awaiting-original-email-recheck']) {
  assert.equal(manifestSource.includes(privateMarker), false, `Archive manifest exposes private source detail: ${privateMarker}`);
  assert.equal(inventory.includes(privateMarker), false, `Archive inventory exposes private source detail: ${privateMarker}`);
}

for (const source of [manifestSource, inventory]) {
  assert.equal(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(source), false, 'Archive records must not contain email addresses.');
}

assert.equal(manifest.items.every(({ publicationState }) => publicationState === 'public_approved'), true);
assert.match(inventory, /2006 Webby Awards Honoree/);
assert.match(inventory, /2006 Graphic Design USA Certificate of Excellence in Communication and Graphic Design/);
assert.match(inventory, /must not present either as Carl’s individual award/i);
assert.match(inventory, /Twelve bounded project records and nineteen selected images have been copied into `public\/archive\/`/);
assert.match(inventory, /complete reviewed visual archive/i);

console.log('Archive checks passed: 12 approved records, 19 exact public image fingerprints, and bounded contribution claims are intact.');
