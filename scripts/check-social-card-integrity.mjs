import assert from 'node:assert/strict';
import { assertSocialCardCurrent } from './social-card-integrity.mjs';

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

console.log('Social-card integrity failures stay bounded and actionable.');
