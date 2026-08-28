'use client';

import * as Sentry from '@sentry/browser';
import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { scrubSentryBreadcrumb, scrubSentryEvent } from './observability/sentry-policy.mjs';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const capturedErrors = new WeakSet<Error>();

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  background: '#f2f2eb',
  color: '#090c09',
  fontFamily: 'Arial, Helvetica, sans-serif',
};

const mainStyle: CSSProperties = {
  boxSizing: 'border-box',
  minHeight: '100vh',
  padding: 'clamp(32px, 8vw, 112px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '72px',
};

const buttonStyle: CSSProperties = {
  minHeight: '48px',
  padding: '12px 18px',
  border: '1px solid currentColor',
  borderRadius: 0,
  background: 'transparent',
  color: 'inherit',
  font: '600 12px/1 Arial, Helvetica, sans-serif',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

function initializeSentryForGlobalError() {
  const enabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!enabled || !dsn || Sentry.getClient()) return;

  Sentry.init({
    dsn,
    enabled: true,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'production',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
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
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (capturedErrors.has(error)) return;
    capturedErrors.add(error);
    initializeSentryForGlobalError();
    Sentry.withScope((scope) => {
      scope.setTag('service', 'portfolio-browser');
      scope.setTag('surface', 'global-error-boundary');
      scope.setTag('route', 'root-layout');
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Portfolio interruption | Carl Welch</title>
      </head>
      <body style={pageStyle}>
        <main id="main-content" style={mainStyle}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Carl Welch / Portfolio
          </p>
          <section aria-labelledby="global-error-title">
            <p style={{ margin: '0 0 20px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Temporary interruption
            </p>
            <h1
              id="global-error-title"
              style={{ maxWidth: 980, margin: 0, fontSize: 'clamp(52px, 10vw, 132px)', lineHeight: 0.9, letterSpacing: '-0.055em' }}
            >
              The portfolio hit an unexpected problem.
            </h1>
            <p style={{ maxWidth: 680, margin: '36px 0', fontSize: 'clamp(18px, 2vw, 26px)', lineHeight: 1.45 }}>
              Try loading it again. If the problem continues, return home or contact Carl directly.
            </p>
            <nav aria-label="Error recovery" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" onClick={reset} style={buttonStyle}>
                Try again
              </button>
              {/* Root recovery must not depend on the failed layout router. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" style={{ ...buttonStyle, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                Return home
              </a>
              <a href="/contact" style={{ ...buttonStyle, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                Contact Carl
              </a>
            </nav>
          </section>
        </main>
      </body>
    </html>
  );
}
