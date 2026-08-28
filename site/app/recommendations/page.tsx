import type { Metadata } from 'next';
import Link from 'next/link';
import { MotionRuntime, Reveal } from '../motion-elements';
import { recommendations } from '../recommendations-data';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';
import { publicEvidenceAnchorId } from '../jolene/public-evidence-navigation-core';

const recommendationHighlightDefinitions = [
  {
    label: 'Product craft',
    recommendationId: 'portfolio:recommendation:sree-sankara-2026-06-02',
    excerpt: 'a rare combination of a keen eye for visualization and a deep commitment to high-performance user experience',
  },
  {
    label: 'Mentorship',
    recommendationId: 'portfolio:recommendation:jason-conover-2017-07-17',
    excerpt: 'Carl’s been a true mentor.',
  },
  {
    label: 'Calm under pressure',
    recommendationId: 'portfolio:recommendation:todd-rimes-2013-08-13',
    excerpt: "Carl's experience, persistence, and (most of all) calm always saved the day.",
  },
  {
    label: 'Creative and technical range',
    recommendationId: 'portfolio:recommendation:jacob-tell-2011-06-17',
    excerpt: 'Carl Welch is a rare breed of web expert.',
  },
] as const;

function displayRecommendationQuote(quote: string): string {
  return quote.replaceAll('_', '');
}

const recommendationHighlights = recommendationHighlightDefinitions.map((highlight) => {
  const recommendation = recommendations.find(({ id }) => id === highlight.recommendationId);
  if (!recommendation) throw new Error(`Missing recommendation highlight source: ${highlight.recommendationId}`);
  if (!displayRecommendationQuote(recommendation.quote).includes(highlight.excerpt)) {
    throw new Error(`Recommendation highlight is not a direct excerpt: ${highlight.recommendationId}`);
  }
  return { ...highlight, recommendation };
});

export const metadata: Metadata = buildPageMetadata({
  title: 'Recommendations',
  description: 'Professional recommendations for Carl Welch.',
  path: '/recommendations',
});

export default function RecommendationsPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" tabIndex={-1} data-tone="red">
          <PageIntro
            eyebrow="Recommendations"
            title="The people I worked with"
            summary="A dedicated place for recommendations from colleagues, managers, and clients."
          />
          <section className="recommendation-review" aria-labelledby="recommendation-collection-title">
            <p className="recommendation-count" aria-hidden="true">{recommendations.length}</p>
            <div>
              <p className="eyebrow">Across teams and years</p>
              <h2 id="recommendation-collection-title">What people say</h2>
              <p>Recommendations from managers, teammates, direct reports, and clients who worked with me.</p>
              <nav
                id="recommendation-highlights"
                className="recommendation-highlights"
                aria-label="Recommendation highlights"
              >
                <p className="eyebrow">Four qualities, in their words</p>
                <ul>
                  {recommendationHighlights.map(({ label, excerpt, recommendation }) => (
                    <li key={recommendation.id}>
                      <a href={`#${publicEvidenceAnchorId(recommendation.sourceId)}`}>
                        <span>{label}</span>
                        <q>{excerpt}</q>
                        <small>{recommendation.name} <span aria-hidden="true">↓</span></small>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </section>
          <ol className="recommendation-list" aria-label="Professional recommendations">
            {recommendations.map((recommendation, index) => (
              <li
                key={recommendation.id}
                id={publicEvidenceAnchorId(recommendation.sourceId)}
                data-review-state={recommendation.reviewState}
                data-evidence-target
                tabIndex={-1}
                aria-label={`${recommendation.name} recommendation`}
              >
                <Reveal className="recommendation-card">
                  <div className="recommendation-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <blockquote>
                    <p>“{displayRecommendationQuote(recommendation.quote)}”</p>
                  </blockquote>
                  <footer>
                    <strong>
                      <a href={recommendation.authorProfileUrl} target="_blank" rel="noreferrer">
                        {recommendation.name}
                      </a>
                    </strong>
                    {recommendation.headline ? <span>{recommendation.headline}</span> : null}
                    <span>{recommendation.relationship}</span>
                    <time>{recommendation.date}</time>
                    <a
                      className="recommendation-highlights-return"
                      href="#recommendation-highlights"
                      aria-label={`Return to recommendation highlights from ${recommendation.name}, ${recommendation.date}`}
                    >
                      Recommendation highlights <span aria-hidden="true">↑</span>
                    </a>
                  </footer>
                </Reveal>
              </li>
            ))}
          </ol>
          <section className="recommendation-closing" data-tone="green" aria-labelledby="recommendation-closing-title">
            <p className="eyebrow">Where to next</p>
            <div>
              <h2 id="recommendation-closing-title">See the work they’re talking about.</h2>
              <p>Move from the recommendations to the projects, roles, and career behind them.</p>
              <nav className="recommendation-closing-actions" aria-label="Continue from the recommendations">
                <Link className="primary-action dark-action" href="/work#work-index">
                  View selected work <span aria-hidden="true">→</span>
                </Link>
                <Link className="primary-action dark-action" href="/experience#career-index">
                  Trace the career <span aria-hidden="true">→</span>
                </Link>
                <Link className="primary-action dark-action" href="/contact">
                  Contact Carl <span aria-hidden="true">→</span>
                </Link>
              </nav>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
