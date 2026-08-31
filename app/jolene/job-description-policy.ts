import { type JobFitRequest } from './public-contract.js';
import { parseJobFitRequest } from './public-validation.js';

export type JobDescriptionRedaction = 'email' | 'phone' | 'private_path' | 'credential';

export type PreparedJobDescription = JobFitRequest & {
  redactions: Array<{ type: JobDescriptionRedaction; count: number }>;
};

const injectionIndicators = [
  /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions?/i,
  /(?:reveal|show|print|return|expose).{0,30}(?:system|developer)\s+(?:prompt|message|instructions?)/i,
  /(?:reveal|show|print|return|expose).{0,30}(?:secret|token|credential|private\s+memory)/i,
  /(?:obsidian:\/\/|file:\/\/|\/Users\/|private\s+jolene\s+api)/i,
];

const redactionPatterns: Array<{
  type: JobDescriptionRedaction;
  pattern: RegExp;
  replacement: string;
}> = [
  {
    type: 'credential',
    pattern: /(?:sk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{10,}/gi,
    replacement: '[credential removed]',
  },
  {
    type: 'private_path',
    pattern: /(?:obsidian|file):\/\/[^\s]+|\/(?:Users|home)\/[^\s]+/gi,
    replacement: '[private path removed]',
  },
  {
    type: 'email',
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    replacement: '[email removed]',
  },
  {
    type: 'phone',
    pattern: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    replacement: '[phone removed]',
  },
];

export class JobDescriptionPolicyError extends Error {
  constructor(readonly code: 'request_rejected') {
    super(code);
    this.name = 'JobDescriptionPolicyError';
  }
}

export function containsHighConfidenceDisclosureRequest(text: string): boolean {
  return injectionIndicators.some((indicator) => indicator.test(text));
}

export function prepareJobDescription(value: unknown): PreparedJobDescription {
  const parsed = parseJobFitRequest(value);
  const counts = new Map<JobDescriptionRedaction, number>();
  let jobDescription = parsed.jobDescription;
  for (const rule of redactionPatterns) {
    jobDescription = jobDescription.replace(rule.pattern, () => {
      counts.set(rule.type, (counts.get(rule.type) ?? 0) + 1);
      return rule.replacement;
    });
  }
  if (containsHighConfidenceDisclosureRequest(jobDescription)) {
    throw new JobDescriptionPolicyError('request_rejected');
  }

  const sanitized = parseJobFitRequest({ jobDescription });
  return {
    ...sanitized,
    redactions: redactionPatterns.flatMap(({ type }) => {
      const count = counts.get(type) ?? 0;
      return count > 0 ? [{ type, count }] : [];
    }),
  };
}
