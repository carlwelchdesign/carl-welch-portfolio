import {
  publicEvidenceAnchorId,
  resolveEvidenceTarget,
  type PublicEvidenceTarget,
  type PublicEvidenceResolution,
  type PublicEvidenceTargetStatus,
  type ResolvePublicEvidenceOptions,
} from './public-evidence-navigation-core';
import { publicEvidenceTargetRecords } from './public-evidence-targets';

export { publicEvidenceAnchorId } from './public-evidence-navigation-core';

function target(evidenceId: string, path: string, label: string, status: PublicEvidenceTargetStatus): PublicEvidenceTarget {
  const anchorId = publicEvidenceAnchorId(evidenceId);
  return { evidenceId, href: `${path}#${anchorId}`, anchorId, label, status };
}

const targets: PublicEvidenceTarget[] = publicEvidenceTargetRecords.map(([evidenceId, path, label, status]) =>
  target(evidenceId, path, label, status),
);

const targetsById = new Map(targets.map((item) => [item.evidenceId, item]));
if (targetsById.size !== targets.length) throw new Error('Public evidence navigation contains duplicate IDs.');
if (targets.some((item) => !/^\/[a-z0-9/-]+#evidence--portfolio--/.test(item.href))) {
  throw new Error('Public evidence navigation targets must remain site-relative portfolio anchors.');
}

const supersededEvidenceIds = new Map([
  ['fixture:project:job-search-os:approval-boundary', 'portfolio:claim:job-search-os:approval-boundary'],
  ['fixture:project:flight-tracker-ai:typed-system', 'portfolio:claim:flight-tracker-ai:typed-system'],
]);

export function listPublicEvidenceTargets(): readonly PublicEvidenceTarget[] {
  return targets;
}

export function resolvePublicEvidenceTarget(
  evidenceId: string,
  options: ResolvePublicEvidenceOptions = {},
): PublicEvidenceResolution {
  return resolveEvidenceTarget(evidenceId, targetsById, supersededEvidenceIds, options);
}
