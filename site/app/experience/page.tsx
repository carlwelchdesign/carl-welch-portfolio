import type { Metadata } from 'next';
import Link from 'next/link';
import { careerFoundations, earlierPracticeGroups } from '../career-story-data';
import { LegacyClientField } from '../legacy-career-sections';
import { MotionRuntime, Reveal } from '../motion-elements';
import { experience } from '../portfolio-data';
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
            title="A practice built across different kinds of work"
            summary="Product engineering, interface systems, technical leadership, client delivery, and an earlier foundation in interactive and creative technology."
          />
          <ol className="experience-list">
            {experience.map((item, index) => (
              <li
                key={item.company}
                id={item.id}
                data-evidence-target
                tabIndex={-1}
                aria-label={`${item.company}, ${item.role}`}
              >
                <div
                  id={publicEvidenceAnchorId(item.sourceId)}
                  data-evidence-target
                  tabIndex={-1}
                  aria-label={`${item.company}, ${item.role}`}
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
          <section id="career-foundations" className="earlier-experience" aria-labelledby="earlier-experience-title">
            <header>
              <p className="eyebrow">1989 to 2012</p>
              <h2 id="earlier-experience-title">Before frontend became a job title, I was already designing and building the whole thing.</h2>
              <p>
                These roles explain the combination I bring to product work now: visual judgment,
                systems thinking, hands-on engineering, team leadership, client fluency, and a
                comfort with unfamiliar problems that has been tested in very different rooms.
              </p>
            </header>
            <ol className="career-foundation-list" aria-label="Earlier career foundations">
              {careerFoundations.map((foundation, index) => (
                <li key={`${foundation.period}-${foundation.title}`}>
                  <article>
                    <div className="career-foundation-meta">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <p className="eyebrow">{foundation.period}</p>
                    </div>
                    <p className="career-foundation-context">{foundation.context}</p>
                    <h3>{foundation.title}</h3>
                    <p>{foundation.summary}</p>
                    <ul className="career-foundation-highlights" aria-label={`${foundation.title} highlights`}>
                      {foundation.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                    </ul>
                    <ul className="inline-tags" aria-label={`${foundation.title} tools and disciplines`}>
                      {foundation.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
            <LegacyClientField />
            <div className="earlier-experience-groups">
              {earlierPracticeGroups.map((group) => (
                <article key={group.title}>
                  <h3>{group.title}</h3>
                  <p>{group.summary}</p>
                  <ul aria-label={`${group.title} organizations`}>
                    {group.organizations.map((organization) => <li key={organization}>{organization}</li>)}
                  </ul>
                </article>
              ))}
            </div>
            <Link className="primary-action dark-action" href="/archive">
              Explore the selected archive <span aria-hidden="true">→</span>
            </Link>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
