import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertSocialCardCurrent, assertSocialCardRich } from './social-card-integrity.mjs';

const existing = Buffer.alloc(1024 * 1024, 0x11);
const matching = Buffer.from(existing);
const stale = Buffer.alloc(1024 * 1024, 0x22);

assert.doesNotThrow(() => assertSocialCardCurrent(existing, matching, 'matching-card'));

assert.throws(
  () => assertSocialCardCurrent(existing, stale, 'stale-card'),
  (error) => {
    assert.match(error.message, /^stale-card share card is stale;/);
    assert.match(error.message, /existing=[a-f0-9]{64} rendered=[a-f0-9]{64}$/);
    assert.ok(error.message.length < 256, 'stale-card errors must not dump binary image buffers');
    return true;
  },
);

assert.throws(
  () => assertSocialCardRich(Buffer.alloc(199_999), 'underweight-card'),
  /underweight-card share card is visually underweight/,
);

const homepageCard = await readFile(resolve(process.cwd(), 'public/social/carl-welch-portfolio.png'));
const homepageManifest = JSON.parse(
  await readFile(resolve(process.cwd(), 'docs/home-social-card.v1.json'), 'utf8'),
);
assert.equal(homepageManifest.schemaVersion, '1.0.0');
assert.equal(homepageManifest.output, '/social/carl-welch-portfolio.png');
assert.deepEqual(homepageManifest.dimensions, { width: 1200, height: 630 });
assert.equal(homepageManifest.sources.length, 3);
assert.equal(new Set(homepageManifest.sources.map(({ src }) => src)).size, 3);
assert.doesNotThrow(() =>
  assertSocialCardRich(homepageCard, 'carl-welch-portfolio', homepageManifest.minimumBytes),
);

console.log('Social-card integrity failures stay bounded and actionable.');
