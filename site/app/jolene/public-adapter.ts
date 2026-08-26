import type {
  ContactIntentRequest,
  ContactIntentResponse,
  JobFitRequest,
  JobFitResponse,
  PortfolioAnswerRequest,
  PortfolioAnswerResponse,
  PublicEvidenceManifest,
} from './public-contract.js';

export type PublicJoleneErrorCode =
  | 'invalid_request'
  | 'unavailable'
  | 'rate_limited'
  | 'budget_exhausted'
  | 'version_mismatch'
  | 'request_rejected';

export class PublicJoleneAdapterError extends Error {
  readonly code: PublicJoleneErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(code: PublicJoleneErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'PublicJoleneAdapterError';
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface PublicJoleneAdapter {
  getManifest(): Promise<PublicEvidenceManifest>;
  answer(request: PortfolioAnswerRequest): Promise<PortfolioAnswerResponse>;
  compareJob(request: JobFitRequest): Promise<JobFitResponse>;
  submitContactIntent(request: ContactIntentRequest): Promise<ContactIntentResponse>;
}
