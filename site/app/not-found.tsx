import type { Metadata } from 'next';
import Link from 'next/link';
import { PageFrame } from './site-components';

export const metadata: Metadata = {
  title: 'Page not found | Carl Welch',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageFrame>
      <main id="main-content" data-tone="orange">
        <section className="page-intro recovery-intro" aria-labelledby="not-found-title">
          <p className="eyebrow">404 / Page not found</p>
          <h1 id="not-found-title">That route isn’t part of the portfolio.</h1>
          <p>The link may be old, incomplete, or mistyped. The work and contact routes are still available.</p>
          <nav className="recovery-actions" aria-label="Page recovery">
            <Link className="primary-action" href="/">
              Return home <span aria-hidden="true">→</span>
            </Link>
            <Link className="primary-action" href="/work">
              View selected work <span aria-hidden="true">→</span>
            </Link>
            <Link className="primary-action" href="/contact">
              Contact Carl <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </section>
      </main>
    </PageFrame>
  );
}
