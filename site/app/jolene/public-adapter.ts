import type {
  ContactIntentRequest,
  ContactIntentResponse,
  JobFitRequest,
  JobFitResponse,
  PortfolioAnswerRequest,
  PortfolioAnswerResponse,
  PublicEvidenceManifest,
  PublicJoleneErrorCode,
} from './public-contract.js';

export class PublicJoleneAdapterError extends Error {
  readonly code: PublicJoleneErrorCode;
  readonly retryAfterSeconds?: number;
  readonly requestId?: string;

  constructor(code: PublicJoleneErrorCode, message: string, retryAfterSeconds?: number, requestId?: string) {
    super(message);
    this.name = 'PublicJoleneAdapterError';
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.requestId = requestId;
  }
}

export interface PublicJoleneAdapter {
  getManifest(): Promise<PublicEvidenceManifest>;
  answer(request: PortfolioAnswerRequest): Promise<PortfolioAnswerResponse>;
  compareJob(request: JobFitRequest): Promise<JobFitResponse>;
  submitContactIntent(request: ContactIntentRequest): Promise<ContactIntentResponse>;
}
