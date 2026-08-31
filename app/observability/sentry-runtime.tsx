'use client';

import { useEffect } from 'react';
import { scrubSentryBreadcrumb, scrubSentryEvent } from './sentry-policy.mjs';

type SentryRuntimeProps = {
  dsn?: string;
  enabled: boolean;
  environment: string;
  release?: string;
};

let initialized = false;

export function SentryRuntime({ dsn, enabled, environment, release }: SentryRuntimeProps) {
  useEffect(() => {
    if (initialized || !enabled || !dsn) return;

    let cancelled = false;
    void import('@sentry/browser').then((Sentry) => {
      if (cancelled || initialized) return;

      Sentry.init({
        dsn,
        enabled: true,
        environment,
        release,
        sendDefaultPii: false,
        maxBreadcrumbs: 25,
        tracesSampleRate: 0,
        beforeSend: scrubSentryEvent,
        beforeBreadcrumb: scrubSentryBreadcrumb,
        initialScope: {
          tags: {
            service: 'portfolio-browser',
            privacy_profile: 'public-technical-only-v1',
          },
        },
      });

      Sentry.setUser(null);
      initialized = true;
    });

    return () => {
      cancelled = true;
    };
  }, [dsn, enabled, environment, release]);

  return null;
}
