'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PublicJoleneAdapterError, type PublicJoleneAdapter } from './public-adapter';
import {
  PUBLIC_JOLENE_LIMITS,
  type JobFitResponse,
  type JobRequirementAssessment,
  type PublicEvidenceCitation,
} from './public-contract';
import { PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION } from './public-fixtures';
import {
  JobDescriptionPolicyError,
  prepareJobDescription,
  type JobDescriptionRedaction,
} from './job-description-policy';
import { JoleneCitationLink } from './jolene-evidence';
import { PublicJoleneContractError } from './public-validation';

const assessmentLabels: Record<JobRequirementAssessment, string> = {
  direct: 'Direct evidence',
  adjacent: 'Adjacent evidence',
  missing: 'Missing evidence',
  unknown: 'Unknown',
};

const redactionLabels: Record<JobDescriptionRedaction, string> = {
  credential: 'credential-like value',
  private_path: 'private path',
  email: 'email address',
  phone: 'phone number',
};

type ComparisonState = {
  response: JobFitResponse;
  redactions: Array<{ type: JobDescriptionRedaction; count: number }>;
};

function describeError(error: unknown): string {
  if (error instanceof JobDescriptionPolicyError) {
    return 'That text includes instructions requesting private or internal information. Remove them before comparing the role.';
  }
  if (error instanceof PublicJoleneContractError) {
    return `Paste a job description between 1 and ${PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters.toLocaleString()} characters.`;
  }
  if (error instanceof PublicJoleneAdapterError) {
    if (error.code === 'rate_limited') return 'The comparison limit has been reached. Try again shortly.';
    if (error.code === 'version_mismatch') return 'This preview needs a contract update before it can compare the role safely.';
  }
  return 'The role could not be compared. Your pasted text remains only in this open panel so you can retry.';
}

function evidenceFor(
  evidenceIds: string[],
  citationsById: Map<string, PublicEvidenceCitation>,
): PublicEvidenceCitation[] {
  return evidenceIds
    .map((evidenceId) => citationsById.get(evidenceId))
    .filter((citation): citation is PublicEvidenceCitation => Boolean(citation));
}

export function JoleneJobFit({
  adapter,
  onAskQuestion,
}: {
  adapter: Pick<PublicJoleneAdapter, 'compareJob'>;
  onAskQuestion: (question: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [comparison, setComparison] = useState<ComparisonState | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (comparison) resultHeadingRef.current?.focus();
  }, [comparison]);

  function resetComparison() {
    setComparison(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (waiting) return;
    setError(null);

    try {
      const prepared = prepareJobDescription({ jobDescription: draft });
      setWaiting(true);
      const response = await adapter.compareJob({ jobDescription: prepared.jobDescription });
      setComparison({ response, redactions: prepared.redactions });
      setDraft('');
    } catch (comparisonError) {
      setError(describeError(comparisonError));
    } finally {
      setWaiting(false);
    }
  }

  if (comparison) {
    const { response, redactions } = comparison;
    const citationsById = new Map(response.citations.map((citation) => [citation.evidenceId, citation]));
    const counts = response.requirements.reduce<Record<JobRequirementAssessment, number>>(
      (totals, requirement) => ({ ...totals, [requirement.assessment]: totals[requirement.assessment] + 1 }),
      { direct: 0, adjacent: 0, missing: 0, unknown: 0 },
    );

    return (
      <section className="jolene-job-fit jolene-job-fit-results" aria-labelledby="jolene-job-fit-results-title">
        <div className="jolene-job-fit-result-header">
          <div>
            <p className="jolene-contact-kicker">Requirement evidence</p>
            <h3 id="jolene-job-fit-results-title" ref={resultHeadingRef} tabIndex={-1}>Comparison, not a verdict</h3>
          </div>
          <button type="button" onClick={resetComparison}>Compare another</button>
        </div>

        <p className="jolene-job-fit-policy">
          Each requirement stands on its own. Missing public evidence is not proof that Carl lacks the experience.
        </p>

        <dl className="jolene-job-fit-counts" aria-label="Requirement assessment counts">
          {(Object.keys(assessmentLabels) as JobRequirementAssessment[]).map((assessment) => (
            <div data-assessment={assessment} key={assessment}>
              <dt>{assessmentLabels[assessment]}</dt>
              <dd>{counts[assessment]}</dd>
            </div>
          ))}
        </dl>

        {redactions.length > 0 ? (
          <p className="jolene-job-fit-redactions" role="status">
            Removed before comparison: {redactions.map(({ type, count }) => `${count} ${redactionLabels[type]}`).join(', ')}.
          </p>
        ) : null}

        <ol className="jolene-job-fit-requirements">
          {response.requirements.map((requirement, index) => {
            const sources = evidenceFor(requirement.evidenceIds, citationsById);
            return (
              <li key={requirement.requirementId}>
                <header>
                  <span>Requirement {String(index + 1).padStart(2, '0')}</span>
                  <strong data-assessment={requirement.assessment}>{assessmentLabels[requirement.assessment]}</strong>
                </header>
                <h4>{requirement.requirement}</h4>
                <p>{requirement.explanation}</p>

                {sources.length > 0 ? (
                  <div className="jolene-job-fit-evidence">
                    <strong>Supporting evidence</strong>
                    {sources.map((citation) => (
                      <JoleneCitationLink
                        citation={citation}
                        corpusVersion={response.corpusVersion}
                        expectedCorpusVersion={PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION}
                        revokedEvidenceIds={[]}
                        key={citation.evidenceId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="jolene-job-fit-no-source">No public-approved fixture evidence cited.</p>
                )}

                {requirement.limitations.length > 0 ? (
                  <div className="jolene-job-fit-limitations">
                    <strong>Limitations</strong>
                    <ul>{requirement.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="jolene-job-fit-caveats">
          <strong>Read before using</strong>
          <ul>{response.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
        </div>

        {response.suggestedFollowUpQuestions.length > 0 ? (
          <div className="jolene-job-fit-followups">
            <p>Ask Jolene to explain</p>
            {response.suggestedFollowUpQuestions.map((question) => (
              <button type="button" key={question} onClick={() => onAskQuestion(question)}>{question}</button>
            ))}
          </div>
        ) : null}

        <p className="jolene-corpus-version">Public fixture corpus · {response.corpusVersion}</p>
      </section>
    );
  }

  return (
    <form className="jolene-job-fit" onSubmit={compare} aria-labelledby="jolene-job-fit-title">
      <p className="jolene-contact-kicker">Requirement evidence</p>
      <h3 id="jolene-job-fit-title">Paste a job description</h3>
      <p className="jolene-job-fit-policy">
        Jolene will classify individual requirements against reviewed public fixture evidence. She will not invent a qualification or issue a fit score.
      </p>
      <label htmlFor="jolene-job-description">Job description</label>
      <textarea
        ref={textareaRef}
        id="jolene-job-description"
        name="jobDescription"
        required
        rows={10}
        maxLength={PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters}
        value={draft}
        disabled={waiting}
        placeholder="Paste the role responsibilities and requirements here."
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
      />
      <div className="jolene-job-fit-meta">
        <span>{draft.length.toLocaleString()}/{PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters.toLocaleString()}</span>
        <span>Ephemeral · cleared when this view closes</span>
      </div>
      <p className="jolene-job-fit-privacy">
        Before comparison, email addresses, phone numbers, private paths, and credential-like strings are removed. Nothing is saved by this fixture.
      </p>
      {error ? <p className="jolene-contact-error" role="alert">{error}</p> : null}
      {waiting ? <p className="jolene-waiting" role="status">Checking requirement evidence…</p> : null}
      <button type="submit" disabled={waiting || !draft.trim()}>{waiting ? 'Comparing…' : 'Compare requirements'}</button>
    </form>
  );
}
