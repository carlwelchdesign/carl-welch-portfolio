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
