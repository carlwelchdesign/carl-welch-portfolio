'use client';

import {
  evidenceStrengthDescriptions,
  type PortfolioAnswerResponse,
  type ProjectMaturity,
  type PublicEvidenceCitation,
} from './public-contract';

export type JoleneAnswerEvidence = Pick<
  PortfolioAnswerResponse,
  'claims' | 'citations' | 'limitations' | 'suggestedFollowUpQuestions' | 'corpusVersion'
>;

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

function CitationLink({ citation }: { citation: PublicEvidenceCitation }) {
  return (
    <a className="jolene-citation" href={citation.href}>
      <span>{citation.title}</span>
      <small>
        {citation.sourceType.replaceAll('_', ' ')} · {citation.strength} · {maturityLabels[citation.maturity]}
      </small>
      <code>{citation.evidenceId}</code>
    </a>
  );
}

export function JoleneEvidence({ evidence }: JoleneEvidenceProps) {
  const sourceCount = evidence.citations.length;
  const hasClaims = evidence.claims.length > 0;
  const citationsById = new Map(evidence.citations.map((citation) => [citation.evidenceId, citation]));

  return (
    <details className="jolene-evidence" {...(!hasClaims ? { open: true } : {})}>
      <summary>
        <span>{hasClaims ? 'Review supporting evidence' : 'No supporting evidence found'}</span>
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
                  <header>
                    <span>Claim {String(index + 1).padStart(2, '0')}</span>
                    <span>{claim.evidenceStrength}</span>
                    <span>{maturityLabels[claim.maturity]}</span>
                  </header>
                  <p>{claim.text}</p>
                  <p className="jolene-strength-note">
                    {evidenceStrengthDescriptions[claim.evidenceStrength]}
                  </p>

                  <div className="jolene-claim-sources">
                    <strong>Supporting sources</strong>
                    {claimCitations.map((citation) => (
                      <CitationLink citation={citation} key={citation.evidenceId} />
                    ))}
                  </div>

                  {claim.limitations.length > 0 ? (
                    <div className="jolene-claim-limitations">
                      <strong>Claim limitations</strong>
                      <ul>
                        {claim.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="jolene-no-evidence">
            Jolene did not find public-approved evidence that could support a substantive claim.
          </p>
        )}

        <div className="jolene-response-limitations">
          <strong>Response limitations</strong>
          <ul>
            {evidence.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </div>

        <p className="jolene-corpus-version">Public corpus · {evidence.corpusVersion}</p>
      </div>
    </details>
  );
}
