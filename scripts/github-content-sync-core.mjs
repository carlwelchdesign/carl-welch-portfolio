import { createHash } from 'node:crypto';

const mutableFields = new Map([
  ['language', 'language'],
  ['url', 'url'],
  ['updatedAt', 'updatedAt'],
]);

const compareText = (left, right) => String(left).localeCompare(String(right), 'en');

export function normalizeLiveRepositories(payload) {
  if (!Array.isArray(payload)) throw new Error('GitHub returned an unexpected repository payload.');

  return payload.map((repository) => {
    if (!Number.isInteger(repository.id) || !repository.name || !repository.html_url || !repository.updated_at) {
      throw new Error('GitHub repository payload is missing required observed metadata.');
    }

    return {
      repositoryId: repository.id,
      name: repository.name,
      language: repository.language ?? null,
      url: repository.html_url,
      updatedAt: repository.updated_at,
    };
  }).sort((left, right) => compareText(left.name, right.name));
}

function proposal(type, repositoryId, name, detail = {}) {
  const field = detail.field ? `:${detail.field}` : '';
  return {
    changeId: `github:${type}:${repositoryId}:${name}${field}`,
    type,
    repositoryId,
    name,
    ...detail,
  };
}

export function buildGitHubReview({
  snapshotProjects,
  repositoryIds,
  snapshotReview,
  liveRepositories,
  excludedRepositoryIds = [],
  mediaStatus = new Map(),
  sourceObservedAt,
}) {
  if (!sourceObservedAt || Number.isNaN(Date.parse(sourceObservedAt))) {
    throw new Error('sourceObservedAt must be a valid ISO timestamp.');
  }
  if (Date.parse(sourceObservedAt) <= Date.parse(snapshotReview.sourceObservedAt)) {
    throw new Error(`Refusing stale GitHub observation ${sourceObservedAt}; current snapshot was reviewed at ${snapshotReview.sourceObservedAt}.`);
  }

  const excludedIds = new Set(excludedRepositoryIds);
  if (excludedIds.size !== excludedRepositoryIds.length || [...excludedIds].some((id) => !Number.isInteger(id))) {
    throw new Error('Excluded repository IDs must be unique integers.');
  }

  const snapshotById = new Map();
  for (const project of snapshotProjects) {
    const repositoryId = repositoryIds[project.name];
    if (!Number.isInteger(repositoryId)) throw new Error(`Missing stable repository ID for ${project.name}.`);
    if (snapshotById.has(repositoryId)) throw new Error(`Duplicate stable repository ID ${repositoryId}.`);
    snapshotById.set(repositoryId, project);
  }

  const liveById = new Map();
  for (const repository of liveRepositories) {
    if (liveById.has(repository.repositoryId)) throw new Error(`Duplicate live repository ID ${repository.repositoryId}.`);
    liveById.set(repository.repositoryId, repository);
  }

  const changes = [];
  for (const [repositoryId, snapshot] of snapshotById) {
    const live = liveById.get(repositoryId);
    if (!live) {
      changes.push(proposal('removed', repositoryId, snapshot.name, {
        before: { name: snapshot.name, url: snapshot.url },
        publicationImpact: 'editorial-review-required',
      }));
      continue;
    }

    const wasRenamed = live.name !== snapshot.name;
    if (wasRenamed) {
      changes.push(proposal('renamed', repositoryId, snapshot.name, {
        before: snapshot.name,
        after: live.name,
        publicationImpact: 'editorial-review-required',
      }));
    }

    for (const [field] of mutableFields) {
      if ((snapshot[field] ?? null) !== (live[field] ?? null)) {
        changes.push(proposal('metadata', repositoryId, snapshot.name, {
          field,
          before: snapshot[field] ?? null,
          after: live[field] ?? null,
          publicationImpact: wasRenamed ? 'editorial-review-required' : 'reviewed-metadata-only',
        }));
      }
    }
  }

  for (const [repositoryId, live] of liveById) {
    if (!snapshotById.has(repositoryId) && !excludedIds.has(repositoryId)) {
      changes.push(proposal('added', repositoryId, live.name, {
        after: live,
        publicationImpact: 'editorial-review-required',
      }));
    }
  }

  for (const project of snapshotProjects) {
    const status = mediaStatus.get(project.name);
    if (status && status !== 'valid') {
      changes.push(proposal('media', repositoryIds[project.name], project.name, {
        field: 'archiveImage',
        before: status,
        after: 'valid',
        publicationImpact: 'asset-review-required',
      }));
    }
  }

  changes.sort((left, right) => compareText(left.changeId, right.changeId));
  const corpus = JSON.stringify({ sourceObservedAt, changes });
  return {
    schemaVersion: 1,
    source: 'github-public-repositories',
    sourceObservedAt,
    currentAppliedVersion: snapshotReview.appliedVersion,
    reviewHash: createHash('sha256').update(corpus).digest('hex'),
    changes,
    protectedEditorialFields: [
      'description',
      'homepage',
      'topics',
      'stars',
      'kind',
      'maturity',
      'ownership',
      'evidenceStrength',
      'publicApproval',
    ],
  };
}

export function validateDecisions(review, decisionDocument) {
  if (decisionDocument.schemaVersion !== 1) throw new Error('Decision document schemaVersion must be 1.');
  if (decisionDocument.reviewHash !== review.reviewHash) throw new Error('Decision document reviewHash does not match this review.');
  if (!decisionDocument.reviewer?.trim()) throw new Error('Decision document requires a reviewer.');
  if (!Array.isArray(decisionDocument.decisions)) throw new Error('Decision document requires a decisions array.');

  const decisions = new Map();
  for (const entry of decisionDocument.decisions) {
    if (!['accept', 'reject'].includes(entry.decision)) throw new Error(`Invalid decision for ${entry.changeId}.`);
    if (decisions.has(entry.changeId)) throw new Error(`Duplicate decision for ${entry.changeId}.`);
    decisions.set(entry.changeId, entry.decision);
  }

  const expected = new Set(review.changes.map((change) => change.changeId));
  const missing = [...expected].filter((changeId) => !decisions.has(changeId));
  const unknown = [...decisions.keys()].filter((changeId) => !expected.has(changeId));
  if (missing.length) throw new Error(`Missing explicit decisions for: ${missing.join(', ')}.`);
  if (unknown.length) throw new Error(`Unknown decisions supplied for: ${unknown.join(', ')}.`);

  return review.changes.map((change) => ({ ...change, decision: decisions.get(change.changeId) }));
}

export function applyAcceptedMetadata(source, review, decisionDocument) {
  const reviewedChanges = validateDecisions(review, decisionDocument);
  let nextSource = source;
  const applied = [];
  const requiresEditorial = [];

  for (const change of reviewedChanges) {
    if (change.decision !== 'accept') continue;
    if (change.type !== 'metadata' || change.publicationImpact !== 'reviewed-metadata-only') {
      requiresEditorial.push(change.changeId);
      continue;
    }

    const field = mutableFields.get(change.field);
    const blockPattern = new RegExp(`(name: '${escapeRegExp(change.name)}',[\\s\\S]*?\\n\\s+${field}: )(${literalPattern(change.before)})(,)`);
    const matches = [...nextSource.matchAll(new RegExp(blockPattern.source, 'g'))];
    if (matches.length !== 1) throw new Error(`Could not safely locate one ${field} field for ${change.name}.`);
    nextSource = nextSource.replace(blockPattern, `$1${toSourceLiteral(change.after)}$3`);
    applied.push(change.changeId);
  }

  if (applied.length) {
    nextSource = replaceSingle(nextSource, /sourceObservedAt: '[^']+'/, `sourceObservedAt: '${review.sourceObservedAt}'`, 'sourceObservedAt');
    nextSource = replaceSingle(nextSource, /reviewer: '[^']+'/, `reviewer: '${escapeSource(decisionDocument.reviewer.trim())}'`, 'reviewer');
    nextSource = replaceSingle(nextSource, /appliedVersion: \d+/, `appliedVersion: ${review.currentAppliedVersion + 1}`, 'appliedVersion');
    const date = review.sourceObservedAt.slice(0, 10);
    nextSource = replaceSingle(nextSource, /export const githubSnapshotDate = '[^']+';/, `export const githubSnapshotDate = '${date}';`, 'githubSnapshotDate');
    const label = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
    nextSource = replaceSingle(nextSource, /export const githubSnapshotLabel = '[^']+';/, `export const githubSnapshotLabel = '${label}';`, 'githubSnapshotLabel');
  }

  return { source: nextSource, applied, requiresEditorial };
}

export function renderReviewMarkdown(review) {
  const lines = [
    '# GitHub portfolio content review',
    '',
    `- Source observed: ${review.sourceObservedAt}`,
    `- Current applied version: ${review.currentAppliedVersion}`,
    `- Review hash: \`${review.reviewHash}\``,
    `- Proposed changes: ${review.changes.length}`,
    '',
    'GitHub metadata cannot change editorial claims or publish/unpublish a project. Added, removed, renamed, and asset changes require a separate editorial decision.',
    '',
  ];

  if (!review.changes.length) return [...lines, 'No drift detected.', ''].join('\n');
  lines.push('| Change ID | Type | Before | After | Gate |', '| --- | --- | --- | --- | --- |');
  for (const change of review.changes) {
    lines.push(`| \`${change.changeId}\` | ${change.type} | ${cell(change.before)} | ${cell(change.after)} | ${change.publicationImpact} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function cell(value) {
  if (value === undefined) return 'Not available';
  return `\`${JSON.stringify(value).replaceAll('|', '\\|')}\``;
}

function replaceSingle(source, pattern, replacement, label) {
  const matches = source.match(new RegExp(pattern.source, 'g')) ?? [];
  if (matches.length !== 1) throw new Error(`Could not safely locate one ${label}.`);
  return source.replace(pattern, replacement);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeSource(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function toSourceLiteral(value) {
  return value === null ? 'null' : `'${escapeSource(value)}'`;
}

function literalPattern(value) {
  return value === null ? 'null' : `'${escapeRegExp(escapeSource(value))}'`;
}
