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
  'unavailable',
  'rate_limited',
  'version_mismatch',
] as const;

export type PublicJoleneFixtureScenario = (typeof publicJoleneFixtureScenarios)[number];

const fixtureCorpusVersion = 'fixture-2026-08-25.1';
const fixtureGeneratedAt = '2026-08-25T20:00:00.000Z';
const fixtureReviewedAt = '2026-08-25T19:30:00.000Z';

const citations: PublicEvidenceCitation[] = [
  {
    evidenceId: 'fixture:project:job-search-os:approval-boundary',
    title: 'Fixture evidence — Job Search OS approval boundary',
    href: '/work/job-search-os',
    sourceType: 'portfolio_page',
    strength: 'strong',
    maturity: 'production',
    lastReviewedAt: fixtureReviewedAt,
  },
  {
    evidenceId: 'fixture:project:flight-tracker-ai:typed-system',
    title: 'Fixture evidence — Flight Tracker AI typed system',
    href: '/work/flight-tracker-ai',
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

function createAnswerResponse(scenario: PublicJoleneFixtureScenario, sessionToken?: string): PortfolioAnswerResponse {
  if (scenario === 'no_evidence') {
    return {
      schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
      answer: 'Fixture response: the public evidence set does not support a reliable answer to that question.',
      claims: [],
      citations: [],
      limitations: ['No matching public-approved fixture evidence was available.'],
      suggestedFollowUpQuestions: ['Would you like to ask about a published project or professional role instead?'],
      corpusVersion: fixtureCorpusVersion,
      sessionToken,
    };
  }

  const selectedCitations = scenario === 'partial_evidence' ? citations.slice(0, 1) : citations;
  return {
    schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
    answer:
      scenario === 'partial_evidence'
        ? 'Fixture response: the available public evidence supports part of the question, but not a complete conclusion.'
        : 'Fixture response: Carl has built typed product systems that keep consequential AI-assisted actions behind explicit review boundaries.',
    claims: [
      {
        claimId: 'fixture:claim:bounded-product-systems',
        text:
          scenario === 'partial_evidence'
            ? 'Job Search OS demonstrates an explicit approval boundary for consequential external actions.'
            : 'The fixture evidence demonstrates typed product architecture and explicit approval boundaries across selected projects.',
        evidenceIds: selectedCitations.map((citation) => citation.evidenceId),
        evidenceStrength: scenario === 'partial_evidence' ? 'limited' : 'strong',
        maturity: scenario === 'partial_evidence' ? 'production' : 'deployed_demo',
        limitations:
          scenario === 'partial_evidence'
            ? ['This fixture does not establish the broader qualification implied by the question.']
            : ['Project maturity differs between the cited systems.'],
      },
    ],
    citations: selectedCitations,
    limitations:
      scenario === 'partial_evidence'
        ? ['The evidence supports a narrower statement than the question requests.']
        : ['These are deterministic development fixtures, not live public Jolene results.'],
    suggestedFollowUpQuestions: [
      'Which project best demonstrates Carl’s approach to approval boundaries?',
      'What limitations remain in the cited work?',
    ],
    corpusVersion: fixtureCorpusVersion,
    sessionToken,
  };
}

function createJobFitResponse(scenario: PublicJoleneFixtureScenario, sessionToken?: string): JobFitResponse {
  if (scenario === 'no_evidence') {
    return {
      schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
      requirements: [
        {
          requirementId: 'fixture:requirement:unresolved',
          requirement: 'The supplied role requirement',
          assessment: 'unknown',
          explanation: 'The public fixture evidence is insufficient to classify this requirement.',
          evidenceIds: [],
          limitations: ['Unknown is not evidence that the qualification is present or absent.'],
        },
      ],
      citations: [],
      caveats: ['This fixture cannot support a blanket fit conclusion.'],
      suggestedFollowUpQuestions: ['Which requirement should be clarified with Carl directly?'],
      corpusVersion: fixtureCorpusVersion,
      sessionToken,
    };
  }

  const requirements: JobFitResponse['requirements'] = [
    {
      requirementId: 'fixture:requirement:typed-product-ui',
      requirement: 'Build typed product interfaces',
      assessment: 'direct',
      explanation: 'The fixture cites a typed browser-to-service product implementation.',
      evidenceIds: [citations[1].evidenceId],
      limitations: ['A portfolio project does not establish experience in every product domain.'],
    },
    {
      requirementId: 'fixture:requirement:bounded-ai',
      requirement: 'Design safe AI-assisted workflows',
      assessment: scenario === 'partial_evidence' ? 'adjacent' : 'direct',
      explanation:
        scenario === 'partial_evidence'
          ? 'The fixture demonstrates an approval boundary but not the role’s full operating environment.'
          : 'The fixture directly cites a system with approval-gated consequential actions.',
      evidenceIds: [citations[0].evidenceId],
      limitations: scenario === 'partial_evidence' ? ['Production scale and team context are not established.'] : [],
    },
    {
      requirementId: 'fixture:requirement:kubernetes',
      requirement: 'Operate Kubernetes in production',
      assessment: 'missing',
      explanation: 'No supporting Kubernetes evidence appears in the fixture corpus.',
      evidenceIds: [],
      limitations: ['Missing public evidence does not prove the experience has never occurred.'],
    },
  ];
  return {
    schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
    requirements,
    citations,
    caveats: [
      'This is a requirement-by-requirement fixture, not a recommendation to hire or a blanket fit score.',
      'A visitor should confirm missing or ambiguous requirements with Carl directly.',
    ],
    suggestedFollowUpQuestions: [
      'Which requirement has the strongest direct evidence?',
      'Which missing requirement should be discussed in an interview?',
    ],
    corpusVersion: fixtureCorpusVersion,
    sessionToken,
  };
}

function createContactIntentResponse(): ContactIntentResponse {
  return {
    schemaVersion: PUBLIC_JOLENE_SCHEMA_VERSION,
    intentId: 'fixture:contact-intent:001',
    status: 'pending_review',
    submittedAt: fixtureGeneratedAt,
    message: 'Fixture response: the contact request is pending Carl’s review. No outbound action was taken.',
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
      return parsePublicEvidenceManifest(manifest);
    },
    async answer(request) {
      const normalizedRequest = parsePortfolioAnswerRequest(request);
      enforceOperationalScenario(scenario);
      return parsePortfolioAnswerResponse(createAnswerResponse(scenario, normalizedRequest.sessionToken));
    },
    async compareJob(request) {
      const normalizedRequest = parseJobFitRequest(request);
      enforceOperationalScenario(scenario);
      return parseJobFitResponse(createJobFitResponse(scenario, normalizedRequest.sessionToken));
    },
    async submitContactIntent(request) {
      parseContactIntentRequest(request);
      enforceOperationalScenario(scenario);
      return parseContactIntentResponse(createContactIntentResponse());
    },
  };
}
