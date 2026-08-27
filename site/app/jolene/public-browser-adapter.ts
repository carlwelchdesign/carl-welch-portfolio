import { PublicJoleneAdapterError, type PublicJoleneAdapter } from './public-adapter.js';
import type { PublicJoleneErrorCode } from './public-contract.js';
import {
  parseContactIntentRequest,
  parseContactIntentResponse,
  parseJobFitRequest,
  parseJobFitResponse,
  parsePortfolioAnswerRequest,
  parsePortfolioAnswerResponse,
  parsePublicEvidenceManifest,
  parsePublicJoleneErrorResponse,
} from './public-validation.js';

const knownErrorCodes = new Set<PublicJoleneErrorCode>([
  'invalid_request',
  'unavailable',
  'rate_limited',
  'budget_exhausted',
  'version_mismatch',
  'request_rejected',
]);

export function createBrowserPublicJoleneAdapter(
  fetchImpl: typeof fetch = fetch,
  basePath = '/api/jolene',
): PublicJoleneAdapter {
  return {
    getManifest: () => request('manifest', 'GET', undefined, parsePublicEvidenceManifest),
    answer: (value) => request('answer', 'POST', parsePortfolioAnswerRequest(value), parsePortfolioAnswerResponse),
    compareJob: (value) => request('jobFit', 'POST', parseJobFitRequest(value), parseJobFitResponse),
    submitContactIntent: (value) => request(
      'contactIntent',
      'POST',
      parseContactIntentRequest(value),
      parseContactIntentResponse,
    ),
  };

  async function request<T>(
    operation: string,
    method: 'GET' | 'POST',
    body: unknown,
    parse: (value: unknown) => T,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetchImpl(`${basePath}/${operation}`, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        credentials: 'same-origin',
        redirect: 'error',
      });
    } catch {
      throw new PublicJoleneAdapterError('unavailable', 'Public Jolene is temporarily unavailable.');
    }

    const requestId = response.headers.get('x-request-id') ?? undefined;
    const retryAfterSeconds = readRetryAfter(response.headers.get('retry-after'));
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new PublicJoleneAdapterError('unavailable', 'Public Jolene returned an invalid response.', undefined, requestId);
    }

    if (!response.ok) {
      let code: PublicJoleneErrorCode = response.status === 429 ? 'rate_limited' : 'unavailable';
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const bffCode = (payload as Record<string, unknown>).error;
        if (typeof bffCode === 'string' && knownErrorCodes.has(bffCode as PublicJoleneErrorCode)) {
          code = bffCode as PublicJoleneErrorCode;
        } else if (bffCode === 'concurrency_limited') {
          code = 'rate_limited';
        }
      }
      try {
        const parsed = parsePublicJoleneErrorResponse(payload);
        code = parsed.code;
      } catch {
        // Keep the status-derived, public-safe error classification.
      }
      throw new PublicJoleneAdapterError(code, 'Public Jolene could not complete the request.', retryAfterSeconds, requestId);
    }

    return parse(payload);
  }
}

function readRetryAfter(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  return Math.min(300, Math.max(1, Number(value)));
}
