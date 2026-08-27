'use client';

import {
  evidenceStrengthDescriptions,
  type PortfolioAnswerResponse,
  type ProjectMaturity,
  type PublicEvidenceCitation,
} from './public-contract';
import { resolvePublicEvidenceCitation } from './public-evidence-navigation';

export type JoleneAnswerEvidence = Pick<
  PortfolioAnswerResponse,
  'claims' | 'citations' | 'limitations' | 'suggestedFollowUpQuestions' | 'corpusVersion'
> & {
  expectedCorpusVersion?: string;
  revokedEvidenceIds?: string[];
};

type JoleneEvidenceProps = {
  evidence: JoleneAnswerEvidence;
};

const maturityLabels: Record<ProjectMaturity, string> = {
  not_applicable: 'Not applicable',
  planning: 'Planning',
  prototype: 'Prototype',
  development: 'Development',
  pre_release: 'Pre-release',
  deployed_demo: 'Deployed demo',
  production: 'Production',
  released_product: 'Released product',
};

const strengthLabels = {
  strong: 'Direct support',
  moderate: 'Supporting context',
  limited: 'Related context',
} as const;

export function JoleneCitationLink({
  citation,
  corpusVersion,
  expectedCorpusVersion,
  revokedEvidenceIds,
}: {
  citation: PublicEvidenceCitation;
  corpusVersion: string;
  expectedCorpusVersion?: string;
  revokedEvidenceIds?: string[];
}) {
  const resolution = resolvePublicEvidenceCitation(citation, {
    corpusVersion,
    expectedCorpusVersion,
    revokedEvidenceIds,
  });
  const details = (
    <>
      <span>{citation.title}</span>
      <small>
        {citation.sourceType.replaceAll('_', ' ')} · {strengthLabels[citation.strength]} · {maturityLabels[citation.maturity]}
      </small>
    </>
  );

  if (resolution.status === 'available' || resolution.status === 'superseded') {
    return (
      <a className="jolene-citation" href={resolution.target.href}>
        {details}
        {resolution.status === 'superseded' ? <small>Updated evidence target</small> : null}
      </a>
    );
  }

  const statusLabels = {
    review_required: 'This source is not published',
    revoked: 'This source is no longer available',
    version_mismatch: 'This source link needs an update',
    unavailable: 'Source unavailable',
  } as const;

  return (
    <span className="jolene-citation jolene-citation-unavailable" role="note">
      {details}
      <small>{statusLabels[resolution.status]}</small>
    </span>
  );
}

export function JoleneEvidence({ evidence }: JoleneEvidenceProps) {
  const sourceCount = evidence.citations.length;
  const hasClaims = evidence.claims.length > 0;
  const citationsById = new Map(evidence.citations.map((citation) => [citation.evidenceId, citation]));

  return (
    <details className="jolene-evidence" {...(!hasClaims ? { open: true } : {})}>
      <summary>
        <span>{hasClaims ? 'See what supports this answer' : 'No matching example found'}</span>
        <small>{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</small>
      </summary>

      <div className="jolene-evidence-body">
        {hasClaims ? (
          <ol className="jolene-claims">
            {evidence.claims.map((claim, index) => {
              const claimCitations = claim.evidenceIds
                .map((evidenceId) => citationsById.get(evidenceId))
                .filter((citation): citation is PublicEvidenceCitation => Boolean(citation));

              return (
                <li key={claim.claimId}>
                  <details className="jolene-claim">
                    <summary>
                      <span>Point {String(index + 1).padStart(2, '0')}</span>
                      <strong>{claim.text}</strong>
                      <small>{strengthLabels[claim.evidenceStrength]} · {maturityLabels[claim.maturity]}</small>
                    </summary>
                    <div className="jolene-claim-body">
                      <p className="jolene-strength-note">
                        {evidenceStrengthDescriptions[claim.evidenceStrength]}
                      </p>

                      <div className="jolene-claim-sources">
                        <strong>Open the sources</strong>
                        {claimCitations.map((citation) => (
                          <JoleneCitationLink
                            citation={citation}
                            corpusVersion={evidence.corpusVersion}
                            expectedCorpusVersion={evidence.expectedCorpusVersion}
                            revokedEvidenceIds={evidence.revokedEvidenceIds}
                            key={citation.evidenceId}
                          />
                        ))}
                      </div>

                      {claim.limitations.length > 0 ? (
                        <div className="jolene-claim-limitations">
                          <strong>What this doesn’t establish</strong>
                          <ul>
                            {claim.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="jolene-no-evidence">
            I couldn’t find a strong enough example in Carl’s portfolio to support that answer.
          </p>
        )}

        <div className="jolene-response-limitations">
          <strong>Worth knowing</strong>
          <ul>
            {evidence.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </div>

      </div>
    </details>
  );
}
