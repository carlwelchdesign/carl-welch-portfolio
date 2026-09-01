import { createHash } from 'node:crypto';

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function assertSocialCardCurrent(existing, rendered, slug) {
  if (existing.equals(rendered)) {
    return;
  }

  throw new Error(
    `${slug} share card is stale; run pnpm generate:social-cards. ` +
      `existing=${digest(existing)} rendered=${digest(rendered)}`,
  );
}

export function assertSocialCardRich(image, slug, minimumBytes = 200_000) {
  if (image.length < minimumBytes) {
    throw new Error(
      `${slug} share card is visually underweight; ` +
        `expected at least ${minimumBytes} bytes, received ${image.length}.`,
    );
  }

  if (image.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error(`${slug} share card must be a PNG.`);
  }

  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    throw new Error(`${slug} share card must be 1200x630; received ${width}x${height}.`);
  }
}
