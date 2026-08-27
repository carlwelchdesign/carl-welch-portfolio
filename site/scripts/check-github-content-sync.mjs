import assert from 'node:assert/strict';
import {
  applyAcceptedMetadata,
  buildGitHubReview,
  normalizeLiveRepositories,
  renderReviewMarkdown,
  validateDecisions,
} from './github-content-sync-core.mjs';

const snapshotProjects = [{
  name: 'alpha',
  description: 'Hand-reviewed claim.',
  language: 'TypeScript',
  url: 'https://github.com/example/alpha',
  homepage: 'https://example.test',
  updatedAt: '2026-01-01T00:00:00Z',
  topics: ['reviewed'],
  stars: 7,
  kind: 'application',
}];
const repositoryIds = { alpha: 101 };
const snapshotReview = { sourceObservedAt: '2026-01-01T00:00:00Z', reviewer: 'Reviewer', appliedVersion: 3 };
const liveAlpha = {
  id: 101,
  name: 'alpha',
  language: 'Rust',
  html_url: 'https://github.com/example/alpha',
  updated_at: '2026-01-02T00:00:00Z',
  description: 'Unsupported external rewrite.',
  homepage: 'https://unreviewed.test',
  topics: ['unreviewed'],
};

const review = makeReview([liveAlpha]);
assert.deepEqual(review.changes.map(({ field }) => field), ['language', 'updatedAt']);
assert(!JSON.stringify(review.changes).includes('Unsupported external rewrite'));
assert(!JSON.stringify(review.changes).includes('unreviewed.test'));
assert.match(renderReviewMarkdown(review), /Proposed changes: 2/);
assert.deepEqual(makeReview([liveAlpha]).changes, review.changes, 'review order must be deterministic');

const deleted = makeReview([]);
assert.equal(deleted.changes[0].type, 'removed');
assert.equal(deleted.changes[0].publicationImpact, 'editorial-review-required');

const renamed = makeReview([{ ...liveAlpha, name: 'alpha-renamed', html_url: 'https://github.com/example/alpha-renamed' }]);
assert(renamed.changes.some((change) => change.type === 'renamed'));
assert(renamed.changes.some((change) => change.field === 'url'));

const added = makeReview([liveAlpha, {
  id: 202,
  name: 'new-project',
  language: 'Go',
  html_url: 'https://github.com/example/new-project',
  updated_at: '2026-01-03T00:00:00Z',
}]);
assert(added.changes.some((change) => change.type === 'added'));

const brokenMedia = makeReview([{ ...liveAlpha, language: 'TypeScript', updated_at: snapshotProjects[0].updatedAt }], new Map([['alpha', 'invalid']]));
assert.equal(brokenMedia.changes[0].type, 'media');

assert.throws(() => buildGitHubReview({
  snapshotProjects,
  repositoryIds,
  snapshotReview,
  liveRepositories: normalizeLiveRepositories([liveAlpha]),
  sourceObservedAt: snapshotReview.sourceObservedAt,
}), /Refusing stale/);

const incompleteDecision = {
  schemaVersion: 1,
  reviewHash: review.reviewHash,
  reviewer: 'Carl Welch',
  decisions: [{ changeId: review.changes[0].changeId, decision: 'accept' }],
};
assert.throws(() => validateDecisions(review, incompleteDecision), /Missing explicit decisions/);

const decisions = {
  schemaVersion: 1,
  reviewHash: review.reviewHash,
  reviewer: 'Carl Welch',
  decisions: review.changes.map(({ changeId }) => ({ changeId, decision: 'accept' })),
};
const source = `export const githubSnapshotDate = '2026-01-01';
export const githubSnapshotLabel = 'January 1, 2026';
export const githubSnapshotReview = {
  sourceObservedAt: '2026-01-01T00:00:00Z',
  reviewer: 'Reviewer',
  appliedVersion: 3,
};
const projects = [{
  name: 'alpha',
  description: 'Hand-reviewed claim.',
  language: 'TypeScript',
  url: 'https://github.com/example/alpha',
  homepage: 'https://example.test',
  updatedAt: '2026-01-01T00:00:00Z',
  topics: ['reviewed'],
}];
`;
const applied = applyAcceptedMetadata(source, review, decisions);
assert.equal(applied.applied.length, 2);
assert.match(applied.source, /language: 'Rust'/);
assert.match(applied.source, /updatedAt: '2026-01-02T00:00:00Z'/);
assert.match(applied.source, /description: 'Hand-reviewed claim.'/);
assert.match(applied.source, /homepage: 'https:\/\/example.test'/);
assert.match(applied.source, /appliedVersion: 4/);
assert.match(applied.source, /reviewer: 'Carl Welch'/);
assert.match(applied.source, /githubSnapshotLabel = 'January 4, 2026'/);

const removalDecisions = {
  schemaVersion: 1,
  reviewHash: deleted.reviewHash,
  reviewer: 'Carl Welch',
  decisions: deleted.changes.map(({ changeId }) => ({ changeId, decision: 'accept' })),
};
const removalResult = applyAcceptedMetadata(source, deleted, removalDecisions);
assert.equal(removalResult.source, source, 'accepting removal observation must not unpublish content');
assert.deepEqual(removalResult.requiresEditorial, [deleted.changes[0].changeId]);

console.log('GitHub content-sync checks passed: deterministic drift, rename, deletion, stale source, media, protected claims, and explicit decisions.');

function makeReview(payload, mediaStatus = new Map([['alpha', 'valid']])) {
  return buildGitHubReview({
    snapshotProjects,
    repositoryIds,
    snapshotReview,
    liveRepositories: normalizeLiveRepositories(payload),
    mediaStatus,
    sourceObservedAt: '2026-01-04T00:00:00Z',
  });
}
