import {
  PUBLIC_JOLENE_LIMITS,
  evidenceStrengths,
  jobRequirementAssessments,
  projectMaturities,
  publicEvidenceSourceTypes,
  type ContactIntentRequest,
  type ContactIntentResponse,
  type EvidenceStrength,
  type JobFitRequest,
  type JobFitResponse,
  type JobRequirementAssessment,
  type JobRequirementResult,
  type PortfolioAnswerRequest,
  type PortfolioAnswerResponse,
  type ProjectMaturity,
  type PublicClaim,
  type PublicEvidenceCitation,
  type PublicEvidenceManifest,
  type PublicEvidenceSourceType,
  type PublicJoleneSchemaVersion,
} from './public-contract.js';
import { requireCompatibleSchemaVersion } from './public-compatibility.js';
import { PublicJoleneContractError } from './public-contract-error.js';

export { PublicJoleneContractError } from './public-contract-error.js';

type JsonRecord = Record<string, unknown>;

function readRecord(value: unknown, path: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new PublicJoleneContractError(path, 'must be an object');
  }
  return value as JsonRecord;
}

function readString(value: unknown, path: string, maximumCharacters?: number): string {
  if (typeof value !== 'string') throw new PublicJoleneContractError(path, 'must be a string');
  const normalized = value.trim();
  if (!normalized) throw new PublicJoleneContractError(path, 'must not be empty');
  if (maximumCharacters !== undefined && normalized.length > maximumCharacters) {
    throw new PublicJoleneContractError(path, `must be at most ${maximumCharacters} characters`);
  }
  return normalized;
}

function readOptionalString(value: unknown, path: string, maximumCharacters: number): string | undefined {
  if (value === undefined) return undefined;
  return readString(value, path, maximumCharacters);
}

function readStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) throw new PublicJoleneContractError(path, 'must be an array');
  return value.map((item, index) => readString(item, `${path}[${index}]`));
}

function readArray<T>(value: unknown, path: string, parse: (item: unknown, path: string) => T): T[] {
  if (!Array.isArray(value)) throw new PublicJoleneContractError(path, 'must be an array');
  return value.map((item, index) => parse(item, `${path}[${index}]`));
}

function readEnum<const T extends readonly string[]>(value: unknown, options: T, path: string): T[number] {
  if (typeof value !== 'string' || !options.includes(value)) {
    throw new PublicJoleneContractError(path, `must be one of ${options.join(', ')}`);
  }
  return value as T[number];
}

function readIsoDate(value: unknown, path: string): string {
  const date = readString(value, path);
  if (!Number.isFinite(Date.parse(date))) throw new PublicJoleneContractError(path, 'must be an ISO date-time');
  return date;
}

function requireUnique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) {
    throw new PublicJoleneContractError(path, 'must not contain duplicate identifiers');
  }
}

function readSchemaVersion(value: unknown, path: string): PublicJoleneSchemaVersion {
  requireCompatibleSchemaVersion(value, path);
  return value as PublicJoleneSchemaVersion;
}

function parseCitation(value: unknown, path: string): PublicEvidenceCitation {
  const item = readRecord(value, path);
  const href = readString(item.href, `${path}.href`);
  if ((!href.startsWith('/') || href.startsWith('//')) && !href.startsWith('https://')) {
    throw new PublicJoleneContractError(`${path}.href`, 'must be a site-relative or HTTPS URL');
  }
  return {
    evidenceId: readString(item.evidenceId, `${path}.evidenceId`),
    title: readString(item.title, `${path}.title`),
    href,
    sourceType: readEnum(item.sourceType, publicEvidenceSourceTypes, `${path}.sourceType`) as PublicEvidenceSourceType,
    strength: readEnum(item.strength, evidenceStrengths, `${path}.strength`) as EvidenceStrength,
    maturity: readEnum(item.maturity, projectMaturities, `${path}.maturity`) as ProjectMaturity,
    lastReviewedAt: readIsoDate(item.lastReviewedAt, `${path}.lastReviewedAt`),
  };
}

function parseClaim(value: unknown, path: string): PublicClaim {
  const item = readRecord(value, path);
  const evidenceIds = readStringArray(item.evidenceIds, `${path}.evidenceIds`);
  requireUnique(evidenceIds, `${path}.evidenceIds`);
  if (evidenceIds.length === 0) {
    throw new PublicJoleneContractError(`${path}.evidenceIds`, 'public claims require cited evidence');
  }
  return {
    claimId: readString(item.claimId, `${path}.claimId`),
    text: readString(item.text, `${path}.text`),
    evidenceIds,
    evidenceStrength: readEnum(item.evidenceStrength, evidenceStrengths, `${path}.evidenceStrength`) as EvidenceStrength,
    maturity: readEnum(item.maturity, projectMaturities, `${path}.maturity`) as ProjectMaturity,
    limitations: readStringArray(item.limitations, `${path}.limitations`),
  };
}

function validateEvidenceReferences(
  citations: readonly PublicEvidenceCitation[],
  references: readonly { evidenceIds: readonly string[] }[],
  path: string,
): void {
  const availableEvidence = new Set(citations.map((citation) => citation.evidenceId));
  for (const [index, reference] of references.entries()) {
    for (const evidenceId of reference.evidenceIds) {
      if (!availableEvidence.has(evidenceId)) {
        throw new PublicJoleneContractError(`${path}[${index}].evidenceIds`, `references missing citation ${evidenceId}`);
      }
    }
  }
}

function parseRequirement(value: unknown, path: string): JobRequirementResult {
  const item = readRecord(value, path);
  const assessment = readEnum(
    item.assessment,
    jobRequirementAssessments,
    `${path}.assessment`,
  ) as JobRequirementAssessment;
  const evidenceIds = readStringArray(item.evidenceIds, `${path}.evidenceIds`);
  requireUnique(evidenceIds, `${path}.evidenceIds`);
  if ((assessment === 'direct' || assessment === 'adjacent') && evidenceIds.length === 0) {
    throw new PublicJoleneContractError(`${path}.evidenceIds`, `${assessment} assessments require cited evidence`);
  }
  return {
    requirementId: readString(item.requirementId, `${path}.requirementId`),
    requirement: readString(item.requirement, `${path}.requirement`),
    assessment,
    explanation: readString(item.explanation, `${path}.explanation`),
    evidenceIds,
    limitations: readStringArray(item.limitations, `${path}.limitations`),
  };
}

export function parsePublicEvidenceManifest(value: unknown): PublicEvidenceManifest {
  const item = readRecord(value, 'manifest');
  const corpusHash = readString(item.corpusHash, 'manifest.corpusHash');
  if (!/^sha256:[a-f0-9]{64}$/.test(corpusHash)) {
    throw new PublicJoleneContractError('manifest.corpusHash', 'must be a lowercase sha256 digest');
  }
  if (!Number.isInteger(item.evidenceCount) || (item.evidenceCount as number) < 0) {
    throw new PublicJoleneContractError('manifest.evidenceCount', 'must be a non-negative integer');
  }
  const revokedEvidenceIds = readStringArray(item.revokedEvidenceIds, 'manifest.revokedEvidenceIds');
  requireUnique(revokedEvidenceIds, 'manifest.revokedEvidenceIds');
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'manifest.schemaVersion'),
    corpusVersion: readString(item.corpusVersion, 'manifest.corpusVersion'),
    corpusHash: corpusHash as `sha256:${string}`,
    generatedAt: readIsoDate(item.generatedAt, 'manifest.generatedAt'),
    reviewedAt: readIsoDate(item.reviewedAt, 'manifest.reviewedAt'),
    evidenceCount: item.evidenceCount as number,
    revokedEvidenceIds,
  };
}

export function parsePortfolioAnswerRequest(value: unknown): PortfolioAnswerRequest {
  const item = readRecord(value, 'answerRequest');
  return {
    question: readString(item.question, 'answerRequest.question', PUBLIC_JOLENE_LIMITS.questionCharacters),
    sessionToken: readOptionalString(
      item.sessionToken,
      'answerRequest.sessionToken',
      PUBLIC_JOLENE_LIMITS.sessionTokenCharacters,
    ),
  };
}

export function parsePortfolioAnswerResponse(value: unknown): PortfolioAnswerResponse {
  const item = readRecord(value, 'answerResponse');
  const claims = readArray(item.claims, 'answerResponse.claims', parseClaim);
  const citations = readArray(item.citations, 'answerResponse.citations', parseCitation);
  requireUnique(claims.map((claim) => claim.claimId), 'answerResponse.claims');
  requireUnique(citations.map((citation) => citation.evidenceId), 'answerResponse.citations');
  validateEvidenceReferences(citations, claims, 'answerResponse.claims');
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'answerResponse.schemaVersion'),
    answer: readString(item.answer, 'answerResponse.answer'),
    claims,
    citations,
    limitations: readStringArray(item.limitations, 'answerResponse.limitations'),
    suggestedFollowUpQuestions: readStringArray(
      item.suggestedFollowUpQuestions,
      'answerResponse.suggestedFollowUpQuestions',
    ),
    corpusVersion: readString(item.corpusVersion, 'answerResponse.corpusVersion'),
    sessionToken: readOptionalString(
      item.sessionToken,
      'answerResponse.sessionToken',
      PUBLIC_JOLENE_LIMITS.sessionTokenCharacters,
    ),
  };
}

export function parseJobFitRequest(value: unknown): JobFitRequest {
  const item = readRecord(value, 'jobFitRequest');
  return {
    jobDescription: readString(
      item.jobDescription,
      'jobFitRequest.jobDescription',
      PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters,
    ),
    sessionToken: readOptionalString(
      item.sessionToken,
      'jobFitRequest.sessionToken',
      PUBLIC_JOLENE_LIMITS.sessionTokenCharacters,
    ),
  };
}

export function parseJobFitResponse(value: unknown): JobFitResponse {
  const item = readRecord(value, 'jobFitResponse');
  const requirements = readArray(item.requirements, 'jobFitResponse.requirements', parseRequirement);
  const citations = readArray(item.citations, 'jobFitResponse.citations', parseCitation);
  requireUnique(requirements.map((requirement) => requirement.requirementId), 'jobFitResponse.requirements');
  requireUnique(citations.map((citation) => citation.evidenceId), 'jobFitResponse.citations');
  validateEvidenceReferences(citations, requirements, 'jobFitResponse.requirements');
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'jobFitResponse.schemaVersion'),
    requirements,
    citations,
    caveats: readStringArray(item.caveats, 'jobFitResponse.caveats'),
    suggestedFollowUpQuestions: readStringArray(
      item.suggestedFollowUpQuestions,
      'jobFitResponse.suggestedFollowUpQuestions',
    ),
    corpusVersion: readString(item.corpusVersion, 'jobFitResponse.corpusVersion'),
    sessionToken: readOptionalString(
      item.sessionToken,
      'jobFitResponse.sessionToken',
      PUBLIC_JOLENE_LIMITS.sessionTokenCharacters,
    ),
  };
}

export function parseContactIntentRequest(value: unknown): ContactIntentRequest {
  const item = readRecord(value, 'contactIntentRequest');
  const email = readString(item.email, 'contactIntentRequest.email', PUBLIC_JOLENE_LIMITS.contactEmailCharacters);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PublicJoleneContractError('contactIntentRequest.email', 'must be a valid email address');
  }
  if (item.consent !== true) {
    throw new PublicJoleneContractError('contactIntentRequest.consent', 'must be explicitly true');
  }
  return {
    name: readString(item.name, 'contactIntentRequest.name', PUBLIC_JOLENE_LIMITS.contactNameCharacters),
    email,
    organization: readOptionalString(
      item.organization,
      'contactIntentRequest.organization',
      PUBLIC_JOLENE_LIMITS.contactOrganizationCharacters,
    ),
    message: readString(item.message, 'contactIntentRequest.message', PUBLIC_JOLENE_LIMITS.contactMessageCharacters),
    consent: true,
  };
}

export function parseContactIntentResponse(value: unknown): ContactIntentResponse {
  const item = readRecord(value, 'contactIntentResponse');
  if (item.status !== 'pending_review') {
    throw new PublicJoleneContractError('contactIntentResponse.status', 'must be pending_review');
  }
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'contactIntentResponse.schemaVersion'),
    intentId: readString(item.intentId, 'contactIntentResponse.intentId'),
    status: 'pending_review',
    submittedAt: readIsoDate(item.submittedAt, 'contactIntentResponse.submittedAt'),
    message: readString(item.message, 'contactIntentResponse.message'),
  };
}
