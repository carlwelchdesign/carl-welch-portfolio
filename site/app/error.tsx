'use client';

import * as Sentry from '@sentry/browser';
import Link from 'next/link';
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
      <section className="page-intro recovery-intro" aria-labelledby="error-title">
        <p className="eyebrow">Temporary interruption</p>
        <h1 id="error-title">This page hit an unexpected problem.</h1>
        <p>Try the page again, or use one of these links to keep exploring.</p>
        <div className="recovery-actions">
          <button className="primary-action" type="button" onClick={reset}>
            Try again <span aria-hidden="true">↻</span>
          </button>
          <Link className="primary-action" href="/">
            Return home <span aria-hidden="true">→</span>
          </Link>
          <Link className="primary-action" href="/contact">
            Contact Carl <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
