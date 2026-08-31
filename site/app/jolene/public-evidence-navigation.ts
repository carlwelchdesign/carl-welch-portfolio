import {
  publicEvidenceAnchorId,
  resolveEvidenceTarget,
  type PublicEvidenceTarget,
  type PublicEvidenceResolution,
  type PublicEvidenceTargetStatus,
  type ResolvePublicEvidenceOptions,
} from './public-evidence-navigation-core.js';
import type { PublicEvidenceCitation } from './public-contract.js';
import { publicEvidenceTargetRecords } from './public-evidence-targets.js';

export { publicEvidenceAnchorId } from './public-evidence-navigation-core.js';

function target(evidenceId: string, path: string, label: string, status: PublicEvidenceTargetStatus): PublicEvidenceTarget {
  const anchorId = publicEvidenceAnchorId(evidenceId);
  return { evidenceId, href: `${path}#${anchorId}`, anchorId, label, status };
}

const targets: PublicEvidenceTarget[] = publicEvidenceTargetRecords.map(([evidenceId, path, label, status]) =>
  target(evidenceId, path, label, status),
);

const targetsById = new Map(targets.map((item) => [item.evidenceId, item]));
const targetsByHref = new Map(targets.map((item) => [item.href, item]));
if (targetsById.size !== targets.length) throw new Error('Public evidence navigation contains duplicate IDs.');
if (targetsByHref.size !== targets.length) throw new Error('Public evidence navigation contains duplicate targets.');
if (targets.some((item) => !/^\/[a-z0-9/-]+#evidence--portfolio--/.test(item.href))) {
  throw new Error('Public evidence navigation targets must remain site-relative portfolio anchors.');
}

const supersededEvidenceIds = new Map([
  ['fixture:project:job-search-os:approval-boundary', 'portfolio:claim:job-search-os:approval-boundary'],
  ['fixture:project:flight-tracker-ai:typed-system', 'portfolio:claim:flight-tracker-ai:typed-system'],
]);

const providerCitationAliases = buildProviderCitationAliases();

export function listPublicEvidenceTargets(): readonly PublicEvidenceTarget[] {
  return targets;
}

export function resolvePublicEvidenceTarget(
  evidenceId: string,
  options: ResolvePublicEvidenceOptions = {},
): PublicEvidenceResolution {
  return resolveEvidenceTarget(evidenceId, targetsById, supersededEvidenceIds, options);
}

export function resolvePublicEvidenceCitation(
  citation: Pick<PublicEvidenceCitation, 'evidenceId' | 'href'>,
  options: ResolvePublicEvidenceOptions = {},
): PublicEvidenceResolution {
  const direct = resolvePublicEvidenceTarget(citation.evidenceId, options);
  if (direct.status !== 'unavailable') return direct;

  const target = targetsByHref.get(citation.href);
  if (target) {
    if (target.status === 'review_required') return { status: 'review_required', evidenceId: citation.evidenceId };
    return { status: 'available', target };
  }

  const alias = providerCitationAliases.get(citation.href);
  return alias ? { status: 'available', target: alias } : direct;
}

function buildProviderCitationAliases(): ReadonlyMap<string, PublicEvidenceTarget> {
  const aliases = new Map<string, PublicEvidenceTarget>();
  const available = targets.filter((item) => item.status === 'available');

  aliases.set('/capabilities', {
    evidenceId: 'portfolio:source:capabilities',
    href: '/capabilities#main-content',
    anchorId: 'main-content',
    label: 'Capabilities and supporting evidence',
    status: 'available',
  });

  aliases.set('/carl-welch-resume.pdf', {
    evidenceId: 'portfolio:source:resume',
    href: '/carl-welch-resume.pdf',
    anchorId: '',
    label: 'Carl Welch résumé',
    status: 'available',
  });

  for (const item of available) {
    const project = item.evidenceId.match(/^portfolio:source:project:([a-z0-9-]+)$/)?.[1];
    if (project) {
      aliases.set(`/work/${project}`, item);
      aliases.set(`/work/${project}#evidence`, {
        evidenceId: item.evidenceId,
        href: `/work/${project}#evidence`,
        anchorId: 'evidence',
        label: `${item.label} evidence`,
        status: 'available',
      });
    }

    const employer = item.evidenceId.match(/^portfolio:source:experience:([a-z0-9-]+)$/)?.[1];
    if (employer) {
      aliases.set(`/experience#${employer}`, {
        evidenceId: item.evidenceId,
        href: `/experience#${employer}`,
        anchorId: employer,
        label: item.label,
        status: 'available',
      });
    }
  }

  return aliases;
}
