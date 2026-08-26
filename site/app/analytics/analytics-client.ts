'use client';

import { parseAnalyticsEvent, type AnalyticsEvent, type AnalyticsMode } from './analytics-contract.js';

export const ANALYTICS_DEVELOPMENT_EVENT = 'portfolio:analytics-development-event';

let analyticsMode: AnalyticsMode = 'disabled';

export function configureAnalytics(mode: AnalyticsMode) {
  analyticsMode = mode;
}

export function privacySignalEnabled(environment: Pick<Navigator, 'doNotTrack'> & { globalPrivacyControl?: boolean }): boolean {
  return environment.doNotTrack === '1' || environment.globalPrivacyControl === true;
}

export function trackAnalytics(name: string, properties: unknown): AnalyticsEvent | null {
  const event = parseAnalyticsEvent(name, properties);
  if (analyticsMode !== 'development' || typeof window === 'undefined' || privacySignalEnabled(navigator)) return null;

  window.dispatchEvent(new CustomEvent<AnalyticsEvent>(ANALYTICS_DEVELOPMENT_EVENT, { detail: event }));
  return event;
}
