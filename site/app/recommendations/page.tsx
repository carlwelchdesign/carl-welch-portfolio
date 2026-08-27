import type { Metadata } from 'next';
import { MotionRuntime, Reveal } from '../motion-elements';
import { recommendations } from '../recommendations-data';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';
import { publicEvidenceAnchorId } from '../jolene/public-evidence-navigation-core';

export const metadata: Metadata = buildPageMetadata({
  title: 'Recommendations',
  description: 'Professional recommendations for Carl Welch.',
  path: '/recommendations',
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
          <section className="recommendation-review" aria-labelledby="recommendation-collection-title">
            <p className="recommendation-count" aria-hidden="true">{recommendations.length}</p>
            <div>
              <p className="eyebrow">Across teams and years</p>
              <h2 id="recommendation-collection-title">What people say</h2>
              <p>Recommendations from managers, teammates, direct reports, and clients who worked with me.</p>
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
                    <p>“{recommendation.quote}”</p>
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
