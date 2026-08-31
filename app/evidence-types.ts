export const evidenceStrengths = ['strong', 'moderate', 'limited'] as const;
export type EvidenceStrength = (typeof evidenceStrengths)[number];

export const projectMaturities = [
  'production',
  'deployed_demo',
  'pre_release',
  'prototype',
  'planned',
  'experiment',
] as const;
export type ProjectMaturity = (typeof projectMaturities)[number];

export const evidenceReviewStates = ['approved', 'review_required', 'rejected'] as const;
export type EvidenceReviewState = (typeof evidenceReviewStates)[number];

export type PublicEvidenceRecord = {
  id: `portfolio:${'claim' | 'capability'}:${string}`;
  sourceIds: `portfolio:source:${string}`[];
  text: string;
  strength: EvidenceStrength;
  maturity: ProjectMaturity;
  limitations: string[];
  reviewState: EvidenceReviewState;
  publicApproved: boolean;
};

export type PortfolioSourceRecord = {
  id: `portfolio:source:${string}`;
  kind: 'project' | 'repository' | 'experience' | 'recommendation';
  label: string;
  href: string;
  reviewState: EvidenceReviewState;
  publicApproved: boolean;
};

