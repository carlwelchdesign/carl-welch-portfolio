import {
  PUBLIC_JOLENE_LIMITS,
  PUBLIC_JOLENE_SCHEMA_VERSION,
  evidenceStrengths,
  jobRequirementAssessments,
  projectMaturities,
  publicEvidenceSourceTypes,
  publicJoleneErrorCodes,
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
  type PublicJoleneErrorCode,
  type PublicJoleneErrorResponse,
} from './public-contract.js';

type JsonRecord = Record<string, unknown>;

export class PublicJoleneContractError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'PublicJoleneContractError';
    this.path = path;
  }
}

function readRecord(value: unknown, path: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new PublicJoleneContractError(path, 'must be an object');
  }
  return value as JsonRecord;
}

function requireOnlyKeys(item: JsonRecord, allowedKeys: readonly string[], path: string): void {
  const allowed = new Set(allowedKeys);
  const unexpected = Object.keys(item).filter((key) => !allowed.has(key));
  if (unexpected.length > 0) {
    throw new PublicJoleneContractError(path, `contains unsupported field ${unexpected[0]}`);
  }
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

function readStringArray(
  value: unknown,
  path: string,
  maximumItems?: number,
  maximumCharacters?: number,
): string[] {
  if (!Array.isArray(value)) throw new PublicJoleneContractError(path, 'must be an array');
  if (maximumItems !== undefined && value.length > maximumItems) {
    throw new PublicJoleneContractError(path, `must contain at most ${maximumItems} items`);
  }
  return value.map((item, index) => readString(item, `${path}[${index}]`, maximumCharacters));
}

function readArray<T>(
  value: unknown,
  path: string,
  parse: (item: unknown, path: string) => T,
  maximumItems?: number,
): T[] {
  if (!Array.isArray(value)) throw new PublicJoleneContractError(path, 'must be an array');
  if (maximumItems !== undefined && value.length > maximumItems) {
    throw new PublicJoleneContractError(path, `must contain at most ${maximumItems} items`);
  }
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

function readPattern(value: unknown, path: string, pattern: RegExp, label: string): string {
  const normalized = readString(value, path);
  if (!pattern.test(normalized)) throw new PublicJoleneContractError(path, `must be a ${label}`);
  return normalized;
}

function requireUnique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) {
    throw new PublicJoleneContractError(path, 'must not contain duplicate identifiers');
  }
}

function readSchemaVersion(value: unknown, path: string): typeof PUBLIC_JOLENE_SCHEMA_VERSION {
  if (value !== PUBLIC_JOLENE_SCHEMA_VERSION) {
    throw new PublicJoleneContractError(path, `requires schema version ${PUBLIC_JOLENE_SCHEMA_VERSION}`);
  }
  return PUBLIC_JOLENE_SCHEMA_VERSION;
}

function parseCitation(value: unknown, path: string): PublicEvidenceCitation {
  const item = readRecord(value, path);
  requireOnlyKeys(item, ['evidenceId', 'title', 'href', 'sourceType', 'strength', 'maturity', 'lastReviewedAt'], path);
  const href = readString(item.href, `${path}.href`, PUBLIC_JOLENE_LIMITS.citationHrefCharacters);
  if (!href.startsWith('/') || href.startsWith('//')) {
    throw new PublicJoleneContractError(`${path}.href`, 'must be a site-relative URL');
  }
  return {
    evidenceId: readPattern(
      item.evidenceId,
      `${path}.evidenceId`,
      /^career:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      'public career evidence ID',
    ),
    title: readString(item.title, `${path}.title`, PUBLIC_JOLENE_LIMITS.citationTitleCharacters),
    href,
    sourceType: readEnum(item.sourceType, publicEvidenceSourceTypes, `${path}.sourceType`) as PublicEvidenceSourceType,
    strength: readEnum(item.strength, evidenceStrengths, `${path}.strength`) as EvidenceStrength,
    maturity: readEnum(item.maturity, projectMaturities, `${path}.maturity`) as ProjectMaturity,
    lastReviewedAt: readIsoDate(item.lastReviewedAt, `${path}.lastReviewedAt`),
  };
}

function parseClaim(value: unknown, path: string): PublicClaim {
  const item = readRecord(value, path);
  requireOnlyKeys(item, ['claimId', 'text', 'evidenceIds', 'evidenceStrength', 'maturity', 'limitations'], path);
  const evidenceIds = readStringArray(
    item.evidenceIds,
    `${path}.evidenceIds`,
    PUBLIC_JOLENE_LIMITS.evidenceIdsPerClaim,
  );
  requireUnique(evidenceIds, `${path}.evidenceIds`);
  if (evidenceIds.length === 0) {
    throw new PublicJoleneContractError(`${path}.evidenceIds`, 'public claims require cited evidence');
  }
  return {
    claimId: readPattern(
      item.claimId,
      `${path}.claimId`,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      'public claim UUID',
    ),
    text: readString(item.text, `${path}.text`, PUBLIC_JOLENE_LIMITS.claimCharacters),
    evidenceIds,
    evidenceStrength: readEnum(item.evidenceStrength, evidenceStrengths, `${path}.evidenceStrength`) as EvidenceStrength,
    maturity: readEnum(item.maturity, projectMaturities, `${path}.maturity`) as ProjectMaturity,
    limitations: readStringArray(
      item.limitations,
      `${path}.limitations`,
      PUBLIC_JOLENE_LIMITS.claimLimitations,
      PUBLIC_JOLENE_LIMITS.limitationCharacters,
    ),
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

const maturityRank: Readonly<Partial<Record<ProjectMaturity, number>>> = {
  planning: 0,
  prototype: 1,
  development: 2,
  pre_release: 3,
  deployed_demo: 4,
  production: 5,
  released_product: 6,
};

function validateClaimMaturity(citations: readonly PublicEvidenceCitation[], claims: readonly PublicClaim[]): void {
  const citationById = new Map(citations.map((citation) => [citation.evidenceId, citation]));
  claims.forEach((claim, index) => {
    const citedMaturities = claim.evidenceIds
      .map((evidenceId) => citationById.get(evidenceId)?.maturity)
      .filter((maturity): maturity is ProjectMaturity => maturity !== undefined);
    const applicable = citedMaturities.filter((maturity) => maturity !== 'not_applicable');
    const expected = applicable.length === 0
      ? 'not_applicable'
      : applicable.reduce((least, maturity) =>
          (maturityRank[maturity] ?? Number.POSITIVE_INFINITY) < (maturityRank[least] ?? Number.POSITIVE_INFINITY)
            ? maturity
            : least,
        );
    if (claim.maturity !== expected) {
      throw new PublicJoleneContractError(
        `answerResponse.claims[${index}].maturity`,
        `must use the least mature applicable citation (${expected})`,
      );
    }
  });
}

function parseRequirement(value: unknown, path: string): JobRequirementResult {
  const item = readRecord(value, path);
  requireOnlyKeys(item, ['requirementId', 'requirement', 'assessment', 'explanation', 'evidenceIds', 'limitations'], path);
  const assessment = readEnum(
    item.assessment,
    jobRequirementAssessments,
    `${path}.assessment`,
  ) as JobRequirementAssessment;
  const evidenceIds = readStringArray(
    item.evidenceIds,
    `${path}.evidenceIds`,
    PUBLIC_JOLENE_LIMITS.evidenceIdsPerRequirement,
  );
  requireUnique(evidenceIds, `${path}.evidenceIds`);
  if ((assessment === 'direct' || assessment === 'adjacent') && evidenceIds.length === 0) {
    throw new PublicJoleneContractError(`${path}.evidenceIds`, `${assessment} assessments require cited evidence`);
  }
  if ((assessment === 'missing' || assessment === 'unknown') && evidenceIds.length > 0) {
    throw new PublicJoleneContractError(`${path}.evidenceIds`, `${assessment} assessments must not cite evidence`);
  }
  return {
    requirementId: readPattern(item.requirementId, `${path}.requirementId`, /^req:[a-f0-9]{16}$/, 'public requirement ID'),
    requirement: readString(
      item.requirement,
      `${path}.requirement`,
      PUBLIC_JOLENE_LIMITS.jobRequirementCharacters,
    ),
    assessment,
    explanation: readString(
      item.explanation,
      `${path}.explanation`,
      PUBLIC_JOLENE_LIMITS.jobRequirementExplanationCharacters,
    ),
    evidenceIds,
    limitations: readStringArray(
      item.limitations,
      `${path}.limitations`,
      PUBLIC_JOLENE_LIMITS.requirementLimitations,
      PUBLIC_JOLENE_LIMITS.limitationCharacters,
    ),
  };
}

export function parsePublicEvidenceManifest(value: unknown): PublicEvidenceManifest {
  const item = readRecord(value, 'manifest');
  requireOnlyKeys(
    item,
    ['schemaVersion', 'corpusVersion', 'corpusHash', 'generatedAt', 'reviewedAt', 'evidenceCount', 'revokedEvidenceIds'],
    'manifest',
  );
  const corpusHash = readString(item.corpusHash, 'manifest.corpusHash');
  if (!/^sha256:[a-f0-9]{64}$/.test(corpusHash)) {
    throw new PublicJoleneContractError('manifest.corpusHash', 'must be a lowercase sha256 digest');
  }
  if (!Number.isInteger(item.evidenceCount) || (item.evidenceCount as number) < 0) {
    throw new PublicJoleneContractError('manifest.evidenceCount', 'must be a non-negative integer');
  }
  const revokedEvidenceIds = readStringArray(
    item.revokedEvidenceIds,
    'manifest.revokedEvidenceIds',
    PUBLIC_JOLENE_LIMITS.revokedEvidenceIds,
  );
  revokedEvidenceIds.forEach((evidenceId, index) => {
    readPattern(
      evidenceId,
      `manifest.revokedEvidenceIds[${index}]`,
      /^career:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      'public career evidence ID',
    );
  });
  requireUnique(revokedEvidenceIds, 'manifest.revokedEvidenceIds');
  const evidenceCount = item.evidenceCount as number;
  const reviewedAt = item.reviewedAt === null ? null : readIsoDate(item.reviewedAt, 'manifest.reviewedAt');
  if (evidenceCount > 0 && reviewedAt === null) {
    throw new PublicJoleneContractError('manifest.reviewedAt', 'may be null only for an empty corpus');
  }
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'manifest.schemaVersion'),
    corpusVersion: readPattern(item.corpusVersion, 'manifest.corpusVersion', /^career:[a-f0-9]{64}$/, 'corpus version'),
    corpusHash: corpusHash as `sha256:${string}`,
    generatedAt: readIsoDate(item.generatedAt, 'manifest.generatedAt'),
    reviewedAt,
    evidenceCount,
    revokedEvidenceIds,
  };
}

export function parsePortfolioAnswerRequest(value: unknown): PortfolioAnswerRequest {
  const item = readRecord(value, 'answerRequest');
  requireOnlyKeys(item, ['question'], 'answerRequest');
  return {
    question: readString(item.question, 'answerRequest.question', PUBLIC_JOLENE_LIMITS.questionCharacters),
  };
}

export function parsePortfolioAnswerResponse(value: unknown): PortfolioAnswerResponse {
  const item = readRecord(value, 'answerResponse');
  requireOnlyKeys(
    item,
    ['schemaVersion', 'answer', 'claims', 'citations', 'limitations', 'suggestedFollowUpQuestions', 'corpusVersion'],
    'answerResponse',
  );
  const claims = readArray(item.claims, 'answerResponse.claims', parseClaim, PUBLIC_JOLENE_LIMITS.answerClaims);
  const citations = readArray(
    item.citations,
    'answerResponse.citations',
    parseCitation,
    PUBLIC_JOLENE_LIMITS.answerCitations,
  );
  requireUnique(claims.map((claim) => claim.claimId), 'answerResponse.claims');
  requireUnique(citations.map((citation) => citation.evidenceId), 'answerResponse.citations');
  validateEvidenceReferences(citations, claims, 'answerResponse.claims');
  validateClaimMaturity(citations, claims);
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'answerResponse.schemaVersion'),
    answer: readString(item.answer, 'answerResponse.answer', PUBLIC_JOLENE_LIMITS.answerCharacters),
    claims,
    citations,
    limitations: readStringArray(
      item.limitations,
      'answerResponse.limitations',
      PUBLIC_JOLENE_LIMITS.responseLimitations,
      PUBLIC_JOLENE_LIMITS.limitationCharacters,
    ),
    suggestedFollowUpQuestions: readStringArray(
      item.suggestedFollowUpQuestions,
      'answerResponse.suggestedFollowUpQuestions',
      PUBLIC_JOLENE_LIMITS.followUpQuestions,
      PUBLIC_JOLENE_LIMITS.followUpQuestionCharacters,
    ),
    corpusVersion: readPattern(
      item.corpusVersion,
      'answerResponse.corpusVersion',
      /^career:[a-f0-9]{64}$/,
      'corpus version',
    ),
  };
}

export function parseJobFitRequest(value: unknown): JobFitRequest {
  const item = readRecord(value, 'jobFitRequest');
  requireOnlyKeys(item, ['jobDescription'], 'jobFitRequest');
  return {
    jobDescription: readString(
      item.jobDescription,
      'jobFitRequest.jobDescription',
      PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters,
    ),
  };
}

export function parseJobFitResponse(value: unknown): JobFitResponse {
  const item = readRecord(value, 'jobFitResponse');
  requireOnlyKeys(
    item,
    ['schemaVersion', 'requirements', 'citations', 'caveats', 'suggestedFollowUpQuestions', 'corpusVersion'],
    'jobFitResponse',
  );
  const requirements = readArray(
    item.requirements,
    'jobFitResponse.requirements',
    parseRequirement,
    PUBLIC_JOLENE_LIMITS.jobRequirements,
  );
  if (requirements.length === 0) {
    throw new PublicJoleneContractError('jobFitResponse.requirements', 'must contain at least one item');
  }
  const citations = readArray(item.citations, 'jobFitResponse.citations', parseCitation, PUBLIC_JOLENE_LIMITS.jobCitations);
  requireUnique(requirements.map((requirement) => requirement.requirementId), 'jobFitResponse.requirements');
  requireUnique(citations.map((citation) => citation.evidenceId), 'jobFitResponse.citations');
  validateEvidenceReferences(citations, requirements, 'jobFitResponse.requirements');
  const caveats = readStringArray(
    item.caveats,
    'jobFitResponse.caveats',
    PUBLIC_JOLENE_LIMITS.jobCaveats,
    PUBLIC_JOLENE_LIMITS.limitationCharacters,
  );
  if (caveats.length === 0) {
    throw new PublicJoleneContractError('jobFitResponse.caveats', 'must contain at least one item');
  }
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'jobFitResponse.schemaVersion'),
    requirements,
    citations,
    caveats,
    suggestedFollowUpQuestions: readStringArray(
      item.suggestedFollowUpQuestions,
      'jobFitResponse.suggestedFollowUpQuestions',
      PUBLIC_JOLENE_LIMITS.followUpQuestions,
      PUBLIC_JOLENE_LIMITS.followUpQuestionCharacters,
    ),
    corpusVersion: readPattern(
      item.corpusVersion,
      'jobFitResponse.corpusVersion',
      /^career:[a-f0-9]{64}$/,
      'corpus version',
    ),
  };
}

export function parseContactIntentRequest(value: unknown): ContactIntentRequest {
  const item = readRecord(value, 'contactIntentRequest');
  requireOnlyKeys(item, ['name', 'email', 'organization', 'message', 'consent'], 'contactIntentRequest');
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
  requireOnlyKeys(item, ['schemaVersion', 'intentId', 'status', 'submittedAt', 'message'], 'contactIntentResponse');
  if (item.status !== 'pending_review') {
    throw new PublicJoleneContractError('contactIntentResponse.status', 'must be pending_review');
  }
  return {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'contactIntentResponse.schemaVersion'),
    intentId: readPattern(
      item.intentId,
      'contactIntentResponse.intentId',
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      'public contact intent ID',
    ),
    status: 'pending_review',
    submittedAt: readIsoDate(item.submittedAt, 'contactIntentResponse.submittedAt'),
    message: readString(
      item.message,
      'contactIntentResponse.message',
      PUBLIC_JOLENE_LIMITS.contactResponseMessageCharacters,
    ),
  };
}

export function parsePublicJoleneErrorResponse(value: unknown): PublicJoleneErrorResponse {
  const item = readRecord(value, 'errorResponse');
  requireOnlyKeys(
    item,
    ['schemaVersion', 'code', 'message', 'requestId', 'retryAfterSeconds', 'supportedSchemaVersions'],
    'errorResponse',
  );
  const retryAfterSeconds = item.retryAfterSeconds;
  if (retryAfterSeconds !== undefined && (!Number.isInteger(retryAfterSeconds) || (retryAfterSeconds as number) < 1)) {
    throw new PublicJoleneContractError('errorResponse.retryAfterSeconds', 'must be a positive integer');
  }
  const supportedSchemaVersions = item.supportedSchemaVersions === undefined
    ? undefined
    : readStringArray(
        item.supportedSchemaVersions,
        'errorResponse.supportedSchemaVersions',
        PUBLIC_JOLENE_LIMITS.supportedSchemaVersions,
      );
  const code = readEnum(item.code, publicJoleneErrorCodes, 'errorResponse.code') as PublicJoleneErrorCode;
  if (code === 'version_mismatch' && !supportedSchemaVersions?.includes(PUBLIC_JOLENE_SCHEMA_VERSION)) {
    throw new PublicJoleneContractError(
      'errorResponse.supportedSchemaVersions',
      `version mismatch errors must advertise ${PUBLIC_JOLENE_SCHEMA_VERSION}`,
    );
  }
  const response: PublicJoleneErrorResponse = {
    schemaVersion: readSchemaVersion(item.schemaVersion, 'errorResponse.schemaVersion'),
    code,
    message: readString(item.message, 'errorResponse.message', PUBLIC_JOLENE_LIMITS.errorMessageCharacters),
    requestId: readPattern(item.requestId, 'errorResponse.requestId', /^req:[a-f0-9]{32}$/, 'public request ID') as `req:${string}`,
  };
  if (retryAfterSeconds !== undefined) response.retryAfterSeconds = retryAfterSeconds as number;
  if (supportedSchemaVersions !== undefined) response.supportedSchemaVersions = supportedSchemaVersions;
  return response;
}
