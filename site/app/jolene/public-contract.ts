export const PUBLIC_JOLENE_SCHEMA_VERSION = '1.0.0' as const;

export const PUBLIC_JOLENE_ENDPOINTS = {
  manifest: '/v1/public-evidence/manifest',
  answer: '/v1/portfolio/answer',
  jobFit: '/v1/portfolio/job-fit',
  contactIntent: '/v1/portfolio/contact-intent',
} as const;

export const PUBLIC_JOLENE_LIMITS = {
  questionCharacters: 800,
  sessionTokenCharacters: 256,
  jobDescriptionCharacters: 12_000,
  contactNameCharacters: 100,
  contactEmailCharacters: 254,
  contactOrganizationCharacters: 120,
  contactMessageCharacters: 2_000,
} as const;

export const evidenceStrengths = ['strong', 'moderate', 'limited'] as const;
export type EvidenceStrength = (typeof evidenceStrengths)[number];

export const evidenceStrengthDescriptions: Record<EvidenceStrength, string> = {
  strong: 'Direct, reviewed public evidence supports the claim as written.',
  moderate: 'Reviewed public evidence supports the claim with material context or qualification.',
  limited: 'Reviewed public evidence supports only a narrower or adjacent statement.',
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

export type PublicEvidenceManifest = {
  schemaVersion: typeof PUBLIC_JOLENE_SCHEMA_VERSION;
  corpusVersion: string;
  corpusHash: `sha256:${string}`;
  generatedAt: string;
  reviewedAt: string;
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

export type PortfolioAnswerRequest = {
  question: string;
  sessionToken?: string;
};

export type PortfolioAnswerResponse = {
  schemaVersion: typeof PUBLIC_JOLENE_SCHEMA_VERSION;
  answer: string;
  claims: PublicClaim[];
  citations: PublicEvidenceCitation[];
  limitations: string[];
  suggestedFollowUpQuestions: string[];
  corpusVersion: string;
  sessionToken?: string;
};

export type JobFitRequest = {
  jobDescription: string;
  sessionToken?: string;
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
  schemaVersion: typeof PUBLIC_JOLENE_SCHEMA_VERSION;
  requirements: JobRequirementResult[];
  citations: PublicEvidenceCitation[];
  caveats: string[];
  suggestedFollowUpQuestions: string[];
  corpusVersion: string;
  sessionToken?: string;
};

export type ContactIntentRequest = {
  name: string;
  email: string;
  organization?: string;
  message: string;
  consent: true;
};

export type ContactIntentResponse = {
  schemaVersion: typeof PUBLIC_JOLENE_SCHEMA_VERSION;
  intentId: string;
  status: 'pending_review';
  submittedAt: string;
  message: string;
};
