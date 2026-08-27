import { randomUUID } from 'node:crypto';
import {
  BffPolicyError,
  InMemoryAdmissionController,
  clientAdmissionKey,
  operationPolicy,
  parseOperationRequest,
  readBffConfig,
  requireSameOrigin,
  assertSafePublicResponse,
  type BffConfig,
  type BffOperation,
} from './bff-policy.js';
import { validateResponseAgainstManifest } from './public-compatibility.js';
import { PublicJoleneContractError } from './public-contract-error.js';
import {
  parseContactIntentResponse,
  parseJobFitResponse,
  parsePortfolioAnswerResponse,
  parsePublicEvidenceManifest,
} from './public-validation.js';

type BffDependencies = {
  environment?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  admission?: InMemoryAdmissionController;
  now?: () => number;
  logger?: (event: Record<string, unknown>) => void;
};

let sharedAdmission: { signature: string; controller: InMemoryAdmissionController } | undefined;

export async function handlePublicJoleneBff(
  request: Request,
  operation: BffOperation,
  dependencies: BffDependencies = {},
): Promise<Response> {
  const startedAt = dependencies.now?.() ?? Date.now();
  const requestId = randomUUID();
  const logger = dependencies.logger ?? ((event) => console.info(JSON.stringify(event)));
  let outcome = 'internal_error';
  let status = 500;

  try {
    const config = readBffConfig(dependencies.environment ?? process.env);
    if (!config.enabled) return finish(disabledResponse(requestId), 'disabled');
    if (!config.features[operation]) return finish(disabledResponse(requestId), 'feature_disabled');
    const policy = operationPolicy[operation];
    if (request.method !== policy.method) {
      return finish(jsonResponse(405, requestId, 'method_not_allowed'), 'method_not_allowed');
    }
    if (policy.method === 'POST') requireSameOrigin(request);
    const runtimeSwitch = await readRuntimeSwitch(config, dependencies.fetchImpl ?? fetch);
    if (!runtimeSwitch.enabled) return finish(disabledResponse(requestId), 'runtime_disabled');
    if (runtimeSwitch.features[operation] === false) {
      return finish(disabledResponse(requestId), 'feature_disabled');
    }

    const admission = dependencies.admission ?? getSharedAdmission(config);
    const admissionResult = admission.admit(
      clientAdmissionKey(request, config.clientHashSalt as string),
      operation,
      startedAt,
    );
    if (!admissionResult.allowed) {
      return finish(
        jsonResponse(429, requestId, admissionResult.reason, { 'Retry-After': String(admissionResult.retryAfterSeconds) }),
        admissionResult.reason,
      );
    }

    try {
      const body = policy.method === 'POST' ? await readJsonBody(request, policy.maximumBodyBytes) : undefined;
      const parsedRequest = parseOperationRequest(operation, body);
      const payload = await callUpstream(operation, parsedRequest, config, dependencies.fetchImpl ?? fetch);
      return finish(jsonResponse(200, requestId, undefined, undefined, payload), 'success');
    } finally {
      admissionResult.release();
    }
  } catch (error) {
    if (error instanceof BffPolicyError) {
      const responseStatus = error.code === 'origin_rejected' ? 403 : error.code === 'request_rejected' ? 400 : 502;
      return finish(jsonResponse(responseStatus, requestId, error.code), error.code);
    }
    if (error instanceof PublicJoleneContractError || error instanceof SyntaxError || error instanceof BodyError) {
      return finish(jsonResponse(400, requestId, 'invalid_request'), 'invalid_request');
    }
    if (error instanceof UpstreamError) {
      const responseStatus = error.code === 'timeout' ? 504 : error.code === 'rate_limited' ? 429 : 503;
      const headers = error.retryAfterSeconds ? { 'Retry-After': String(error.retryAfterSeconds) } : undefined;
      return finish(jsonResponse(responseStatus, requestId, error.code, headers), error.code);
    }
    return finish(jsonResponse(503, requestId, 'unavailable'), 'unavailable');
  } finally {
    logger({
      event: 'public_jolene_bff_request',
      operation,
      outcome,
      status,
      durationMs: Math.max(0, (dependencies.now?.() ?? Date.now()) - startedAt),
    });
  }

  function finish(response: Response, nextOutcome: string): Response {
    outcome = nextOutcome;
    status = response.status;
    return response;
  }
}

async function callUpstream(
  operation: BffOperation,
  body: unknown,
  config: BffConfig,
  fetchImpl: typeof fetch,
): Promise<unknown> {
  const policy = operationPolicy[operation];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const response = await fetchWithSafeRetry(
      new URL(policy.endpoint, config.upstreamOrigin).href,
      {
        method: policy.method,
        headers: {
          Accept: 'application/json',
          ...(config.upstreamToken ? { Authorization: `Bearer ${config.upstreamToken}` } : {}),
          ...(policy.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        },
        body: policy.method === 'POST' ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
      },
      fetchImpl,
      operation === 'manifest',
    );
    if (!response.ok) {
      const retryAfter = boundedRetryAfter(response.headers.get('retry-after'));
      throw new UpstreamError(response.status === 429 ? 'rate_limited' : 'unavailable', retryAfter);
    }
    const payload = await readUpstreamJson(response, 256_000);
    if (operation === 'answer') {
      const parsed = parsePortfolioAnswerResponse(payload);
      assertSafePublicResponse(parsed);
      const manifestPayload = await fetchManifest(config, fetchImpl, controller.signal);
      validateResponseAgainstManifest(parsed, manifestPayload);
      return parsed;
    }
    if (operation === 'jobFit') {
      const parsed = parseJobFitResponse(payload);
      assertSafePublicResponse(parsed);
      const manifestPayload = await fetchManifest(config, fetchImpl, controller.signal);
      validateResponseAgainstManifest(parsed, manifestPayload);
      return parsed;
    }
    const parsed = operation === 'manifest'
      ? assertExpectedManifest(parsePublicEvidenceManifest(payload), config)
      : parseContactIntentResponse(payload);
    assertSafePublicResponse(parsed);
    return parsed;
  } catch (error) {
    if (error instanceof UpstreamError || error instanceof BffPolicyError) throw error;
    if (error instanceof PublicJoleneContractError || error instanceof SyntaxError || error instanceof BodyError) {
      throw new UpstreamError('unavailable');
    }
    if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw new UpstreamError('timeout');
    }
    throw new UpstreamError('unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

async function readRuntimeSwitch(
  config: BffConfig,
  fetchImpl: typeof fetch,
): Promise<{ enabled: boolean; features: Partial<Record<BffOperation, boolean>> }> {
  if (!config.controlUrl) return { enabled: true, features: {} };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(2_000, config.requestTimeoutMs));
  try {
    const response = await fetchImpl(config.controlUrl, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${config.controlToken}` },
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('control unavailable');
    const value = await readUpstreamJson(response, 2_048);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid control response');
    const record = value as Record<string, unknown>;
    if (Object.keys(record).some((key) => !['enabled', 'features'].includes(key))) {
      throw new Error('invalid control response');
    }
    if (typeof record.enabled !== 'boolean') throw new Error('invalid control response');
    const features: Partial<Record<BffOperation, boolean>> = {};
    if (record.features !== undefined) {
      if (!record.features || typeof record.features !== 'object' || Array.isArray(record.features)) {
        throw new Error('invalid control response');
      }
      for (const [key, featureEnabled] of Object.entries(record.features)) {
        if (!['manifest', 'answer', 'jobFit', 'contactIntent'].includes(key) || typeof featureEnabled !== 'boolean') {
          throw new Error('invalid control response');
        }
        features[key as BffOperation] = featureEnabled;
      }
    }
    return { enabled: record.enabled, features };
  } catch {
    throw new UpstreamError('unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchManifest(config: BffConfig, fetchImpl: typeof fetch, signal: AbortSignal) {
  const response = await fetchWithSafeRetry(
    new URL(operationPolicy.manifest.endpoint, config.upstreamOrigin).href,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(config.upstreamToken ? { Authorization: `Bearer ${config.upstreamToken}` } : {}),
      },
      cache: 'no-store',
      redirect: 'error',
      signal,
    },
    fetchImpl,
    true,
  );
  if (!response.ok) throw new UpstreamError(response.status === 429 ? 'rate_limited' : 'unavailable');
  const manifest = parsePublicEvidenceManifest(await readUpstreamJson(response, 64_000));
  assertSafePublicResponse(manifest);
  return assertExpectedManifest(manifest, config);
}

function assertExpectedManifest<T extends { corpusVersion: string }>(manifest: T, config: BffConfig): T {
  if (manifest.corpusVersion !== config.expectedCorpusVersion) {
    throw new UpstreamError('version_mismatch');
  }
  return manifest;
}

async function fetchWithSafeRetry(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
  retrySafeGet: boolean,
): Promise<Response> {
  const first = await fetchImpl(url, init);
  if (!retrySafeGet || ![502, 503].includes(first.status)) return first;
  return fetchImpl(url, init);
}

async function readJsonBody(request: Request, maximumBytes: number): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new BodyError();
  return JSON.parse(await readBoundedText(request, maximumBytes));
}

async function readUpstreamJson(response: Response, maximumBytes: number): Promise<unknown> {
  if (!response.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new BodyError();
  return JSON.parse(await readBoundedText(response, maximumBytes));
}

async function readBoundedText(source: Request | Response, maximumBytes: number): Promise<string> {
  const declaredLength = source.headers.get('content-length');
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > maximumBytes)) {
    throw new BodyError();
  }
  if (!source.body) return '';

  const reader = source.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        throw new BodyError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, totalBytes).toString('utf8');
}

function getSharedAdmission(config: BffConfig): InMemoryAdmissionController {
  const signature = [
    config.concurrency,
    config.dailyCostUnits,
    config.rateLimitRequests,
    config.rateLimitWindowMs,
    config.maximumTrackedClients,
  ].join(':');
  if (!sharedAdmission || sharedAdmission.signature !== signature) {
    sharedAdmission = { signature, controller: new InMemoryAdmissionController(config) };
  }
  return sharedAdmission.controller;
}

function disabledResponse(requestId: string): Response {
  return jsonResponse(503, requestId, 'service_disabled');
}

function jsonResponse(
  status: number,
  requestId: string,
  error?: string,
  additionalHeaders?: Record<string, string>,
  payload?: unknown,
): Response {
  return Response.json(payload ?? { error: error ?? 'unavailable' }, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Request-Id': requestId,
      ...additionalHeaders,
    },
  });
}

function boundedRetryAfter(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  return Math.min(300, Math.max(1, Number(value)));
}

class BodyError extends Error {}

class UpstreamError extends Error {
  constructor(
    readonly code: 'unavailable' | 'timeout' | 'rate_limited' | 'version_mismatch',
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
    this.name = 'UpstreamError';
  }
}
