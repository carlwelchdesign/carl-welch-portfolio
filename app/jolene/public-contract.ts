export const PUBLIC_JOLENE_SCHEMA_VERSION = '1.0.0' as const;
export type PublicJoleneSchemaVersion = `${number}.${number}.${number}`;

export const PUBLIC_JOLENE_ENDPOINTS = {
  manifest: '/v1/public-evidence/manifest',
  answer: '/v1/portfolio/answer',
  jobFit: '/v1/portfolio/job-fit',
  contactIntent: '/v1/portfolio/contact-intent',
} as const;

export const PUBLIC_JOLENE_LIMITS = {
  questionCharacters: 800,
  jobDescriptionCharacters: 12_000,
  answerCharacters: 4_000,
  answerClaims: 5,
  answerCitations: 5,
  claimCharacters: 4_000,
  evidenceIdsPerClaim: 5,
  responseLimitations: 8,
  claimLimitations: 8,
  limitationCharacters: 2_000,
  followUpQuestions: 4,
  followUpQuestionCharacters: 240,
  citationTitleCharacters: 240,
  citationHrefCharacters: 2_000,
  revokedEvidenceIds: 1_000,
  jobRequirements: 24,
  jobRequirementCharacters: 600,
  jobRequirementExplanationCharacters: 2_000,
  evidenceIdsPerRequirement: 3,
  jobCitations: 72,
  requirementLimitations: 4,
  jobCaveats: 8,
  contactNameCharacters: 100,
  contactEmailCharacters: 254,
  contactOrganizationCharacters: 120,
  contactMessageCharacters: 2_000,
  contactResponseMessageCharacters: 1_000,
  errorMessageCharacters: 240,
  supportedSchemaVersions: 4,
  conversationTurns: 4,
  conversationEvidenceIds: 5,
} as const;

export const evidenceStrengths = ['strong', 'moderate', 'limited'] as const;
export type EvidenceStrength = (typeof evidenceStrengths)[number];

export const evidenceStrengthDescriptions: Record<EvidenceStrength, string> = {
  strong: 'This source directly supports the statement.',
  moderate: 'This source supports the statement with some context.',
  limited: 'This source supports a narrower or closely related point.',
};

export const projectMaturities = [
  'not_applicable',
  'planning',
  'prototype',
  'development',
  'pre_release',
  'deployed_demo',
  'production',
  'released_product',
] as const;
export type ProjectMaturity = (typeof projectMaturities)[number];

export const publicEvidenceSourceTypes = [
  'resume',
  'employer_history',
  'recommendation',
  'project',
  'repository',
  'release_artifact',
  'portfolio_page',
  'confirmed_fact',
] as const;
export type PublicEvidenceSourceType = (typeof publicEvidenceSourceTypes)[number];

export const jobRequirementAssessments = ['direct', 'adjacent', 'missing', 'unknown'] as const;
export type JobRequirementAssessment = (typeof jobRequirementAssessments)[number];

export const publicJoleneErrorCodes = [
  'invalid_request',
  'unavailable',
  'rate_limited',
  'budget_exhausted',
  'version_mismatch',
  'request_rejected',
] as const;
export type PublicJoleneErrorCode = (typeof publicJoleneErrorCodes)[number];

export type PublicEvidenceManifest = {
  schemaVersion: PublicJoleneSchemaVersion;
  corpusVersion: string;
  corpusHash: `sha256:${string}`;
  generatedAt: string;
  reviewedAt: string | null;
  evidenceCount: number;
  revokedEvidenceIds: string[];
};

export type PublicEvidenceCitation = {
  evidenceId: string;
  title: string;
  href: string;
  sourceType: PublicEvidenceSourceType;
  strength: EvidenceStrength;
  maturity: ProjectMaturity;
  lastReviewedAt: string;
};

export type PublicClaim = {
  claimId: string;
  text: string;
  evidenceIds: string[];
  evidenceStrength: EvidenceStrength;
  maturity: ProjectMaturity;
  limitations: string[];
};

export const publicConversationResponseBeats = [
  'contextual_spark',
  'story_turn',
  'candid_directness',
  'quiet_care',
  'none',
] as const;
export type PublicConversationResponseBeat = (typeof publicConversationResponseBeats)[number];

export type PublicConversationContext = {
  corpusVersion: string;
  projectPath?: string;
  evidenceIds?: string[];
  responseBeat?: PublicConversationResponseBeat;
  turnCount: number;
  expiresAt: string;
};

export type PortfolioAnswerRequest = {
  question: string;
  conversationContext?: PublicConversationContext;
};

export type PortfolioAnswerResponse = {
  schemaVersion: PublicJoleneSchemaVersion;
  answer: string;
  claims: PublicClaim[];
  citations: PublicEvidenceCitation[];
  limitations: string[];
  suggestedFollowUpQuestions: string[];
  corpusVersion: string;
  conversationContext?: PublicConversationContext;
};

export type JobFitRequest = {
  jobDescription: string;
};

export type JobRequirementResult = {
  requirementId: string;
  requirement: string;
  assessment: JobRequirementAssessment;
  explanation: string;
  evidenceIds: string[];
  limitations: string[];
};

export type JobFitResponse = {
  schemaVersion: PublicJoleneSchemaVersion;
  requirements: JobRequirementResult[];
  citations: PublicEvidenceCitation[];
  caveats: string[];
  suggestedFollowUpQuestions: string[];
  corpusVersion: string;
};

export type ContactIntentRequest = {
  name: string;
  email: string;
  organization?: string;
  message: string;
  consent: true;
};

export type ContactIntentResponse = {
  schemaVersion: PublicJoleneSchemaVersion;
  intentId: string;
  status: 'pending_review';
  submittedAt: string;
  message: string;
};

export type PublicJoleneErrorResponse = {
  schemaVersion: typeof PUBLIC_JOLENE_SCHEMA_VERSION;
  code: PublicJoleneErrorCode;
  message: string;
  requestId: `req:${string}`;
  retryAfterSeconds?: number;
  supportedSchemaVersions?: string[];
};
