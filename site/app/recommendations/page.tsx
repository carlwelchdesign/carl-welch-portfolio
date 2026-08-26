import type { Metadata } from 'next';
import { MotionRuntime, Reveal } from '../motion-elements';
import { recommendationReview } from '../portfolio-data';
import { recommendations } from '../recommendations-data';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';
import { publicEvidenceAnchorId } from '../jolene/public-evidence-navigation-core';

export const metadata: Metadata = buildPageMetadata({
  title: 'Recommendations',
  description: 'Professional recommendations for Carl Welch.',
  path: '/recommendations',
  robots: { index: false, follow: true },
});

export default function RecommendationsPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" data-tone="red">
          <PageIntro
            eyebrow="Recommendations"
            title="The people I worked with"
            summary="A dedicated place for recommendations from colleagues, managers, and clients."
          />
          <section className="recommendation-review" aria-labelledby="review-state-title">
            <p className="recommendation-count" aria-hidden="true">{recommendationReview.candidateCount}</p>
            <div>
              <p className="eyebrow">Working collection</p>
              <h2 id="review-state-title">Candidate recommendations found</h2>
              <p>{recommendationReview.description}</p>
              <p className="review-note">This page is excluded from search indexing until that review is complete.</p>
            </div>
          </section>
          <ol className="recommendation-list" aria-label="LinkedIn recommendation candidates">
            {recommendations.map((recommendation, index) => (
              <li
                key={recommendation.id}
                id={publicEvidenceAnchorId(recommendation.sourceId)}
                data-review-state={recommendation.reviewState}
                data-evidence-target
                tabIndex={-1}
                aria-label={`${recommendation.name} recommendation candidate`}
              >
                <Reveal className="recommendation-card">
                  <div className="recommendation-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <blockquote>
                    <p>“{recommendation.quote}”</p>
                  </blockquote>
                  <footer>
                    <strong>{recommendation.name}</strong>
                    {recommendation.headline ? <span>{recommendation.headline}</span> : null}
                    <span>{recommendation.relationship}</span>
                    <time>{recommendation.date}</time>
                  </footer>
                </Reveal>
              </li>
            ))}
          </ol>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
