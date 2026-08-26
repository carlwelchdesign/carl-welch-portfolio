import { createHash } from 'node:crypto';
import {
  PUBLIC_JOLENE_ENDPOINTS,
  type ContactIntentRequest,
  type JobFitRequest,
  type PortfolioAnswerRequest,
} from './public-contract.js';
import {
  parseContactIntentRequest,
  parseJobFitRequest,
  parsePortfolioAnswerRequest,
} from './public-validation.js';

export const bffOperations = ['manifest', 'answer', 'jobFit', 'contactIntent'] as const;
export type BffOperation = (typeof bffOperations)[number];

export type BffConfig = {
  enabled: boolean;
  features: Record<BffOperation, boolean>;
  upstreamOrigin?: string;
  upstreamToken?: string;
  clientHashSalt?: string;
  controlUrl?: string;
  controlToken?: string;
  requestTimeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitRequests: number;
  dailyCostUnits: number;
  concurrency: number;
  maximumTrackedClients: number;
};

export type AdmissionDenial = 'rate_limited' | 'budget_exhausted' | 'concurrency_limited';
export type AdmissionResult =
  | { allowed: false; reason: AdmissionDenial; retryAfterSeconds: number }
  | { allowed: true; release: () => void };

export const operationPolicy: Record<BffOperation, {
  method: 'GET' | 'POST';
  endpoint: string;
  costUnits: number;
  maximumBodyBytes: number;
}> = {
  manifest: { method: 'GET', endpoint: PUBLIC_JOLENE_ENDPOINTS.manifest, costUnits: 1, maximumBodyBytes: 0 },
  answer: { method: 'POST', endpoint: PUBLIC_JOLENE_ENDPOINTS.answer, costUnits: 4, maximumBodyBytes: 2_048 },
  jobFit: { method: 'POST', endpoint: PUBLIC_JOLENE_ENDPOINTS.jobFit, costUnits: 12, maximumBodyBytes: 14_000 },
  contactIntent: { method: 'POST', endpoint: PUBLIC_JOLENE_ENDPOINTS.contactIntent, costUnits: 2, maximumBodyBytes: 3_500 },
};

const injectionIndicators = [
  /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions?/i,
  /(?:reveal|show|print|return|expose).{0,30}(?:system|developer)\s+(?:prompt|message|instructions?)/i,
  /(?:reveal|show|print|return|expose).{0,30}(?:secret|token|credential|private\s+memory)/i,
  /(?:obsidian:\/\/|file:\/\/|\/Users\/|private\s+jolene\s+api)/i,
];

const unsafeEgressIndicators = [
  /(?:obsidian:\/\/|file:\/\/|\/Users\/|\/home\/[^/\s]+\/)/i,
  /(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?|\.local\b)/i,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  /(?:sk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{10,}/,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
];

export function readBffConfig(environment: NodeJS.ProcessEnv): BffConfig {
  const enabled = environment.JOLENE_PUBLIC_BFF_ENABLED === 'true';
  const config: BffConfig = {
    enabled,
    features: {
      manifest: enabled && environment.JOLENE_PUBLIC_MANIFEST_ENABLED !== 'false',
      answer: enabled && environment.JOLENE_PUBLIC_ANSWER_ENABLED === 'true',
      jobFit: enabled && environment.JOLENE_PUBLIC_JOB_FIT_ENABLED === 'true',
      contactIntent: enabled && environment.JOLENE_PUBLIC_CONTACT_INTENT_ENABLED === 'true',
    },
    upstreamOrigin: environment.JOLENE_PUBLIC_API_ORIGIN,
    upstreamToken: environment.JOLENE_PUBLIC_API_TOKEN,
    clientHashSalt: environment.JOLENE_BFF_CLIENT_HASH_SALT,
    controlUrl: environment.JOLENE_BFF_CONTROL_URL,
    controlToken: environment.JOLENE_BFF_CONTROL_TOKEN,
    requestTimeoutMs: readBoundedInteger(environment.JOLENE_BFF_TIMEOUT_MS, 12_000, 1_000, 30_000),
    rateLimitWindowMs: readBoundedInteger(environment.JOLENE_BFF_RATE_WINDOW_MS, 60_000, 10_000, 3_600_000),
    rateLimitRequests: readBoundedInteger(environment.JOLENE_BFF_RATE_REQUESTS, 12, 1, 1_000),
    dailyCostUnits: readBoundedInteger(environment.JOLENE_BFF_DAILY_COST_UNITS, 1_000, 1, 1_000_000),
    concurrency: readBoundedInteger(environment.JOLENE_BFF_CONCURRENCY, 4, 1, 100),
    maximumTrackedClients: readBoundedInteger(environment.JOLENE_BFF_TRACKED_CLIENTS, 10_000, 100, 100_000),
  };

  if (enabled) {
    if (!config.upstreamOrigin || !config.upstreamToken || !config.clientHashSalt) {
      throw new Error('Enabled public Jolene BFF requires server-only origin, token, and client-hash salt configuration.');
    }
    assertSafeUpstreamOrigin(config.upstreamOrigin);
    if (config.controlUrl || config.controlToken) {
      if (!config.controlUrl || !config.controlToken) {
        throw new Error('Dynamic BFF control requires both a server-only URL and token.');
      }
      assertSafeControlUrl(config.controlUrl);
    }
  }
  return config;
}

export function assertSafeControlUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Dynamic BFF control URL must be valid.');
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(hostname) ||
    /^172\.(?:1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname === '::1'
  ) {
    throw new Error('Dynamic BFF control URL must use a public HTTPS endpoint without credentials.');
  }
}

export function assertSafeUpstreamOrigin(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Public Jolene API origin must be a valid URL.');
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(hostname) ||
    /^172\.(?:1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname === '::1'
  ) {
    throw new Error('Public Jolene API origin must be an HTTPS public origin without credentials or a path.');
  }
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) throw new BffPolicyError('origin_rejected');
}

export function parseOperationRequest(
  operation: BffOperation,
  value: unknown,
): PortfolioAnswerRequest | JobFitRequest | ContactIntentRequest | undefined {
  if (operation === 'manifest') return undefined;
  const parsed = operation === 'answer'
    ? parsePortfolioAnswerRequest(value)
    : operation === 'jobFit'
      ? parseJobFitRequest(value)
      : parseContactIntentRequest(value);
  assertUntrustedInputSafe(parsed);
  return parsed;
}

export function assertUntrustedInputSafe(value: unknown): void {
  for (const text of stringValues(value)) {
    if (injectionIndicators.some((indicator) => indicator.test(text))) {
      throw new BffPolicyError('request_rejected');
    }
  }
}

export function assertSafePublicResponse(value: unknown): void {
  for (const text of stringValues(value)) {
    if (unsafeEgressIndicators.some((indicator) => indicator.test(text))) {
      throw new BffPolicyError('unsafe_upstream_response');
    }
  }
}

export function clientAdmissionKey(request: Request, salt: string): string {
  const forwarded = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'anonymous';
  return createHash('sha256').update(salt).update('\0').update(forwarded).digest('hex');
}

export class InMemoryAdmissionController {
  private active = 0;
  private daily = { day: '', used: 0 };
  private readonly clients = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(private readonly config: Pick<
    BffConfig,
    'concurrency' | 'dailyCostUnits' | 'rateLimitRequests' | 'rateLimitWindowMs' | 'maximumTrackedClients'
  >) {}

  admit(clientKey: string, operation: BffOperation, now = Date.now()): AdmissionResult {
    const retryAfterSeconds = Math.max(1, Math.ceil(this.config.rateLimitWindowMs / 1_000));
    if (this.active >= this.config.concurrency) {
      return { allowed: false, reason: 'concurrency_limited', retryAfterSeconds: 1 };
    }

    const threshold = now - this.config.rateLimitWindowMs;
    if (now - this.lastSweep >= this.config.rateLimitWindowMs) {
      for (const [key, timestamps] of this.clients) {
        if (!timestamps.some((timestamp) => timestamp > threshold)) this.clients.delete(key);
      }
      this.lastSweep = now;
    }
    const boundedClientKey = this.clients.has(clientKey) || this.clients.size < this.config.maximumTrackedClients
      ? clientKey
      : '__overflow__';
    const recent = (this.clients.get(boundedClientKey) ?? []).filter((timestamp) => timestamp > threshold);
    if (recent.length >= this.config.rateLimitRequests) {
      const retryAt = recent[0] + this.config.rateLimitWindowMs;
      return { allowed: false, reason: 'rate_limited', retryAfterSeconds: Math.max(1, Math.ceil((retryAt - now) / 1_000)) };
    }

    const day = new Date(now).toISOString().slice(0, 10);
    if (this.daily.day !== day) this.daily = { day, used: 0 };
    const cost = operationPolicy[operation].costUnits;
    if (this.daily.used + cost > this.config.dailyCostUnits) {
      return { allowed: false, reason: 'budget_exhausted', retryAfterSeconds };
    }

    recent.push(now);
    this.clients.set(boundedClientKey, recent);
    this.daily.used += cost;
    this.active += 1;
    let released = false;
    return {
      allowed: true,
      release: () => {
        if (released) return;
        released = true;
        this.active = Math.max(0, this.active - 1);
      },
    };
  }
}

export class BffPolicyError extends Error {
  constructor(readonly code: 'origin_rejected' | 'request_rejected' | 'unsafe_upstream_response') {
    super(code);
    this.name = 'BffPolicyError';
  }
}

function readBoundedInteger(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`Public Jolene BFF numeric configuration must be an integer from ${minimum} to ${maximum}.`);
  }
  return parsed;
}

function* stringValues(value: unknown): Generator<string> {
  if (typeof value === 'string') {
    yield value;
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) yield* stringValues(item);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) yield* stringValues(item);
  }
}
