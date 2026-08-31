import {
  PUBLIC_JOLENE_SCHEMA_VERSION,
  type ContactIntentResponse,
  type JobFitResponse,
  type PortfolioAnswerResponse,
  type PublicEvidenceCitation,
  type PublicEvidenceManifest,
} from './public-contract.js';
import {
  PublicJoleneAdapterError,
  type PublicJoleneAdapter,
} from './public-adapter.js';
import {
  parseContactIntentRequest,
  parseContactIntentResponse,
  parseJobFitRequest,
  parseJobFitResponse,
  parsePortfolioAnswerRequest,
  parsePortfolioAnswerResponse,
  parsePublicEvidenceManifest,
} from './public-validation.js';

export const publicJoleneFixtureScenarios = [
  'success',
  'partial_evidence',
  'no_evidence',
  'empty_corpus',
  'unavailable',
  'rate_limited',
  'version_mismatch',
] as const;

export type PublicJoleneFixtureScenario = (typeof publicJoleneFixtureScenarios)[number];

export const PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION = `career:${'a8'.repeat(32)}`;
const fixtureCorpusVersion = PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION;
const fixtureGeneratedAt = '2026-08-25T20:00:00.000Z';
const fixtureReviewedAt = '2026-08-25T19:30:00.000Z';

const citations: PublicEvidenceCitation[] = [
  {
    evidenceId: 'career:00000000-0000-4000-8000-000000000001',
    title: 'Job Search OS: review workflow',
    href: '/work/job-search-os#evidence--portfolio--claim--job-search-os--approval-boundary',
    sourceType: 'portfolio_page',
    strength: 'strong',
    maturity: 'production',
    lastReviewedAt: fixtureReviewedAt,
  },
  {
    evidenceId: 'career:00000000-0000-4000-8000-000000000002',
    title: 'Flight Tracker AI: typed product system',
    href: '/work/flight-tracker-ai#evidence--portfolio--claim--flight-tracker-ai--typed-system',
    sourceType: 'portfolio_page',
    strength: 'moderate',
    maturity: 'deployed_demo',
    lastReviewedAt: fixtureReviewedAt,
  },
];

const manifest: PublicEvidenceManifest = {
  schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
  corpusVersion: fixtureCorpusVersion,
  corpusHash: `sha256:${'a8'.repeat(32)}`,
  generatedAt: fixtureGeneratedAt,
  reviewedAt: fixtureReviewedAt,
  evidenceCount: citations.length,
  revokedEvidenceIds: [],
};

const emptyManifest: PublicEvidenceManifest = {
  ...manifest,
  corpusVersion: `career:${'00'.repeat(32)}`,
  corpusHash: `sha256:${'00'.repeat(32)}`,
  reviewedAt: null,
  evidenceCount: 0,
};

function createAnswerResponse(scenario: PublicJoleneFixtureScenario): PortfolioAnswerResponse {
  if (scenario === 'no_evidence' || scenario === 'empty_corpus') {
    return {
      schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
      answer: 'I couldn’t find a reliable example for that question.',
      claims: [],
      citations: [],
      limitations: ['The available portfolio examples do not cover this question.'],
      suggestedFollowUpQuestions: ['Would you like to ask about a published project or professional role instead?'],
      corpusVersion: scenario === 'empty_corpus' ? emptyManifest.corpusVersion : fixtureCorpusVersion,
    };
  }

  const selectedCitations = scenario === 'partial_evidence' ? citations.slice(0, 1) : citations;
  return {
    schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
    answer:
      scenario === 'partial_evidence'
        ? 'The available examples support part of the question, but not a complete conclusion.'
        : 'Carl has built typed product systems that keep consequential AI-assisted actions behind explicit review boundaries.',
    claims: [
      {
        claimId: '10000000-0000-4000-8000-000000000001',
        text:
          scenario === 'partial_evidence'
            ? 'Job Search OS demonstrates an explicit approval boundary for consequential external actions.'
            : 'Selected projects demonstrate typed product architecture and explicit approval boundaries.',
        evidenceIds: selectedCitations.map((citation) => citation.evidenceId),
        evidenceStrength: scenario === 'partial_evidence' ? 'limited' : 'strong',
        maturity: scenario === 'partial_evidence' ? 'production' : 'deployed_demo',
        limitations:
          scenario === 'partial_evidence'
            ? ['The available examples do not establish the broader qualification implied by the question.']
            : ['Project maturity differs between the cited systems.'],
      },
    ],
    citations: selectedCitations,
    limitations:
      scenario === 'partial_evidence'
        ? ['The evidence supports a narrower statement than the question requests.']
        : ['This preview uses sample answers while the live connection is off.'],
    suggestedFollowUpQuestions: [
      'Which project best demonstrates Carl’s approach to approval boundaries?',
      'What limitations remain in the cited work?',
    ],
    corpusVersion: fixtureCorpusVersion,
  };
}

function createJobFitResponse(scenario: PublicJoleneFixtureScenario): JobFitResponse {
  if (scenario === 'no_evidence' || scenario === 'empty_corpus') {
    return {
      schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
      requirements: [
        {
          requirementId: 'req:0000000000000001',
          requirement: 'The supplied role requirement',
          assessment: 'unknown',
          explanation: 'The available portfolio examples are not enough to classify this requirement.',
          evidenceIds: [],
          limitations: ['Unknown is not evidence that the qualification is present or absent.'],
        },
      ],
      citations: [],
      caveats: ['This comparison is not a recommendation to hire or a blanket fit score.'],
      suggestedFollowUpQuestions: ['Which requirement should be clarified with Carl directly?'],
      corpusVersion: scenario === 'empty_corpus' ? emptyManifest.corpusVersion : fixtureCorpusVersion,
    };
  }

  const requirements: JobFitResponse['requirements'] = [
    {
      requirementId: 'req:0000000000000002',
      requirement: 'Build typed product interfaces',
      assessment: 'direct',
      explanation: 'A cited project shows a typed browser-to-service product implementation.',
      evidenceIds: [citations[1].evidenceId],
      limitations: ['A portfolio project does not establish experience in every product domain.'],
    },
    {
      requirementId: 'req:0000000000000003',
      requirement: 'Design safe AI-assisted workflows',
      assessment: scenario === 'partial_evidence' ? 'adjacent' : 'direct',
      explanation:
        scenario === 'partial_evidence'
          ? 'The example demonstrates an approval boundary but not the role’s full operating environment.'
          : 'A cited system uses approval gates for consequential actions.',
      evidenceIds: [citations[0].evidenceId],
      limitations: scenario === 'partial_evidence' ? ['Production scale and team context are not established.'] : [],
    },
    {
      requirementId: 'req:0000000000000004',
      requirement: 'Operate Kubernetes in production',
      assessment: 'missing',
      explanation: 'The portfolio does not currently include a Kubernetes example.',
      evidenceIds: [],
      limitations: ['Missing public evidence does not prove the experience has never occurred.'],
    },
  ];
  return {
    schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
    requirements,
    citations,
    caveats: [
      'This comparison considers each requirement separately; it is not a recommendation to hire or a blanket fit score.',
      'A visitor should confirm missing or ambiguous requirements with Carl directly.',
    ],
    suggestedFollowUpQuestions: [
      'Which requirement has the strongest direct evidence?',
      'Which missing requirement should be discussed in an interview?',
    ],
    corpusVersion: fixtureCorpusVersion,
  };
}

function createContactIntentResponse(): ContactIntentResponse {
  return {
    schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
    intentId: '20000000-0000-4000-8000-000000000001',
    status: 'pending_review',
    submittedAt: fixtureGeneratedAt,
    message: 'Your contact request is ready for Carl to review. No outbound action was taken.',
  };
}

function enforceOperationalScenario(scenario: PublicJoleneFixtureScenario): void {
  if (scenario === 'unavailable') {
    throw new PublicJoleneAdapterError('unavailable', 'Public Jolene is temporarily unavailable.');
  }
  if (scenario === 'rate_limited') {
    throw new PublicJoleneAdapterError('rate_limited', 'The public request limit has been reached.', 60);
  }
  if (scenario === 'version_mismatch') {
    throw new PublicJoleneAdapterError(
      'version_mismatch',
      `The fixture service is not compatible with schema ${PUBLIC_JOLENE_SCHEMA_VERSION}.`,
    );
  }
}

export function createFixturePublicJoleneAdapter(
  scenario: PublicJoleneFixtureScenario = 'success',
): PublicJoleneAdapter {
  return {
    async getManifest() {
      enforceOperationalScenario(scenario);
      return parsePublicEvidenceManifest(scenario === 'empty_corpus' ? emptyManifest : manifest);
    },
    async answer(request) {
      parsePortfolioAnswerRequest(request);
      enforceOperationalScenario(scenario);
      await new Promise((resolve) => setTimeout(resolve, 600));
      return parsePortfolioAnswerResponse(createAnswerResponse(scenario));
    },
    async compareJob(request) {
      parseJobFitRequest(request);
      enforceOperationalScenario(scenario);
      return parseJobFitResponse(createJobFitResponse(scenario));
    },
    async submitContactIntent(request) {
      parseContactIntentRequest(request);
      enforceOperationalScenario(scenario);
      return parseContactIntentResponse(createContactIntentResponse());
    },
  };
}
