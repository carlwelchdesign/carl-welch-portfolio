'use client';

import { useEffect, useState } from 'react';
import { ANALYTICS_DEVELOPMENT_EVENT, configureAnalytics, trackAnalytics } from './analytics-client';
import type { AnalyticsCategory, AnalyticsEvent, AnalyticsMode } from './analytics-contract';

type Counts = Record<AnalyticsCategory, Record<string, number>>;
const emptyCounts = (): Counts => ({ portfolio: {}, jolene: {} });

function linkLocation(anchor: HTMLAnchorElement): 'header' | 'contact' | 'footer' | 'other' {
  if (anchor.closest('.site-header')) return 'header';
  if (anchor.closest('.contact-panel')) return 'contact';
  if (anchor.closest('.site-footer')) return 'footer';
  return 'other';
}

function navigationDestination(href: string) {
  const path = href.split('#')[0].split('?')[0];
  if (path === '/' || path === '') return 'home';
  if (path === '/work') return 'work';
  if (path.startsWith('/work/')) return 'project';
  if (path === '/capabilities') return 'capabilities';
  if (path === '/experience') return 'experience';
  if (path === '/recommendations') return 'recommendations';
  if (path === '/contact') return 'contact';
  return null;
}

export function AnalyticsRuntime({ mode }: { mode: AnalyticsMode }) {
  const [counts, setCounts] = useState<Counts>(emptyCounts);

  useEffect(() => {
    configureAnalytics(mode);
    if (mode !== 'development') return () => configureAnalytics('disabled');

    const record = (event: Event) => {
      const analyticsEvent = (event as CustomEvent<AnalyticsEvent>).detail;
      setCounts((current) => ({
        ...current,
        [analyticsEvent.category]: {
          ...current[analyticsEvent.category],
          [analyticsEvent.name]: (current[analyticsEvent.category][analyticsEvent.name] ?? 0) + 1,
        },
      }));
    };

    const captureClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute('href') ?? '';

      if (anchor.classList.contains('jolene-citation')) {
        trackAnalytics('jolene_citation_followthrough', { destination: 'portfolio' });
        return;
      }
      if (href.endsWith('.pdf') || anchor.hasAttribute('download')) {
        const location = anchor.closest('.hero') ? 'home' : linkLocation(anchor);
        trackAnalytics('resume_download', { location });
        return;
      }
      if (href.startsWith('mailto:')) {
        trackAnalytics('outbound_contact', { channel: 'email', location: linkLocation(anchor) });
        return;
      }
      if (href.includes('linkedin.com')) {
        trackAnalytics('outbound_contact', { channel: 'linkedin', location: linkLocation(anchor) });
        return;
      }
      if (href.includes('github.com')) {
        trackAnalytics('outbound_contact', { channel: 'github', location: linkLocation(anchor) });
        return;
      }
      if (anchor.hasAttribute('data-evidence-target')) {
        trackAnalytics('evidence_reveal', { surface: 'portfolio' });
        return;
      }
      const destination = navigationDestination(href);
      if (destination) trackAnalytics('portfolio_navigation', { destination });
    };

    window.addEventListener(ANALYTICS_DEVELOPMENT_EVENT, record);
    document.addEventListener('click', captureClick, true);
    return () => {
      window.removeEventListener(ANALYTICS_DEVELOPMENT_EVENT, record);
      document.removeEventListener('click', captureClick, true);
      configureAnalytics('disabled');
    };
  }, [mode]);

  if (mode !== 'development') return null;

  return (
    <details className="analytics-verifier">
      <summary>Analytics verification</summary>
      <p>Development memory only · no network or storage</p>
      {(['portfolio', 'jolene'] as const).map((category) => (
        <section key={category}>
          <h2>{category}</h2>
          {Object.keys(counts[category]).length ? (
            <dl>{Object.entries(counts[category]).map(([name, count]) => <div key={name}><dt>{name}</dt><dd>{count}</dd></div>)}</dl>
          ) : <p>No events</p>}
        </section>
      ))}
      <button type="button" onClick={() => setCounts(emptyCounts())}>Clear</button>
    </details>
  );
}
