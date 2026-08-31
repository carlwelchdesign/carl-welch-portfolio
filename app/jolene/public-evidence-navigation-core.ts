export type PublicEvidenceTargetStatus = 'available' | 'review_required';

export type PublicEvidenceTarget = {
  evidenceId: string;
  href: string;
  anchorId: string;
  label: string;
  status: PublicEvidenceTargetStatus;
};

export type PublicEvidenceResolution =
  | { status: 'available'; target: PublicEvidenceTarget }
  | { status: 'superseded'; target: PublicEvidenceTarget; supersededEvidenceId: string }
  | { status: 'review_required' | 'revoked' | 'version_mismatch' | 'unavailable'; evidenceId: string };

export type ResolvePublicEvidenceOptions = {
  corpusVersion?: string;
  expectedCorpusVersion?: string;
  revokedEvidenceIds?: readonly string[];
};

const publicIdPattern = /^portfolio:[a-z-]+:[a-z0-9-]+(?::[a-z0-9-]+)*$/;

export function publicEvidenceAnchorId(evidenceId: string): string {
  if (!publicIdPattern.test(evidenceId)) throw new Error('Public evidence IDs must use the portfolio namespace.');
  return `evidence--${evidenceId.replaceAll(':', '--')}`;
}
export function resolveEvidenceTarget(
  evidenceId: string,
  targetsById: ReadonlyMap<string, PublicEvidenceTarget>,
  supersededEvidenceIds: ReadonlyMap<string, string>,
  options: ResolvePublicEvidenceOptions = {},
): PublicEvidenceResolution {
  if (options.expectedCorpusVersion && options.corpusVersion !== options.expectedCorpusVersion) {
    return { status: 'version_mismatch', evidenceId };
  }

  if (options.revokedEvidenceIds?.includes(evidenceId)) return { status: 'revoked', evidenceId };

  const replacementId = supersededEvidenceIds.get(evidenceId);
  if (replacementId) {
    const replacement = targetsById.get(replacementId);
    if (replacement?.status === 'available') {
      return { status: 'superseded', target: replacement, supersededEvidenceId: evidenceId };
    }
  }

  const target = targetsById.get(evidenceId);
  if (!target) return { status: 'unavailable', evidenceId };
  if (target.status === 'review_required') return { status: 'review_required', evidenceId };
  return { status: 'available', target };
}
