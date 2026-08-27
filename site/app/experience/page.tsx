import type { Metadata } from 'next';
import { MotionRuntime, Reveal } from '../motion-elements';
import { earlierExperience, experience } from '../portfolio-data';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';
import { publicEvidenceAnchorId } from '../jolene/public-evidence-navigation-core';

export const metadata: Metadata = buildPageMetadata({
  title: 'Experience',
  description: 'Professional product engineering experience for Carl Welch.',
  path: '/experience',
});

export default function ExperiencePage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" data-tone="green">
          <PageIntro
            eyebrow="Experience"
            title="Professional history"
            summary="Frontend and product engineering work across security, analytics, mobility, media, and consumer software."
          />
          <ol className="experience-list">
            {experience.map((item, index) => (
              <li
                key={item.company}
                id={item.id}
                data-evidence-target
                tabIndex={-1}
                aria-label={`${item.company} — ${item.role}`}
              >
                <div
                  id={publicEvidenceAnchorId(item.sourceId)}
                  data-evidence-target
                  tabIndex={-1}
                  aria-label={`${item.company} — ${item.role}`}
                >
                  <Reveal className="experience-card">
                    <span className="experience-number">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="eyebrow">{item.dates}</p>
                      <h2>{item.company}</h2>
                      <h3>{item.role}</h3>
                    </div>
                    <div>
                      <p>{item.summary}</p>
                      <ul className="inline-tags" aria-label={`${item.company} skills`}>
                        {item.stack.map((skill) => <li key={skill}>{skill}</li>)}
                      </ul>
                    </div>
                  </Reveal>
                </div>
              </li>
            ))}
          </ol>
          <section className="earlier-experience">
            <p className="eyebrow">Earlier experience</p>
            <p>{earlierExperience.join(' · ')}</p>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
