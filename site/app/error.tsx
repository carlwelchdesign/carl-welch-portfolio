'use client';

import * as Sentry from '@sentry/browser';
import { useEffect } from 'react';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag('service', 'portfolio-browser');
      scope.setTag('surface', 'app-error-boundary');
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <main className="page-shell" id="main-content">
      <section className="page-intro" aria-labelledby="error-title">
        <p className="eyebrow">Temporary interruption</p>
        <h1 id="error-title">This page hit an unexpected problem.</h1>
        <p>The error has been prepared for review. You can retry without losing any portfolio data.</p>
        <button className="button button-primary" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}

