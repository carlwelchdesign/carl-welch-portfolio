import type { Metadata } from 'next';
import Link from 'next/link';
import { careerChapters } from '../career-story-data';
import { MotionRuntime, Reveal } from '../motion-elements';
import { CharacterSignals, PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'About',
  description: 'About Carl Welch, a senior product engineer working across product interfaces, applied AI, and creative software.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" data-tone="orange">
          <PageIntro
            eyebrow="About"
            title="The engineer I am now was built over time"
            summary="I came to product engineering through interactive design, motion, client work, technical systems, teaching, and team leadership. That history is not a side note. It explains how I work."
          />

          <section className="about-story" aria-labelledby="about-story-title">
            <Reveal className="about-story-heading">
              <p className="eyebrow">The through-line</p>
              <h2 id="about-story-title">Make the problem understandable. Then make the software hold up.</h2>
            </Reveal>
            <div className="about-story-copy">
              <p>
                Early interactive work taught me to pay attention to motion, hierarchy, timing,
                and the moment a person realizes what an interface is asking them to do. Client
                delivery taught me to make decisions under real constraints and keep moving when
                the work became messy.
              </p>
              <p>
                Product teams added a different responsibility: shared systems, maintainable code,
                testing, documentation, leadership, and the long life of a decision after launch.
                My current work brings both sides together in applied AI, aviation, audio software,
                and products where behavior, limits, and consequences have to be clear.
              </p>
            </div>
          </section>

          <section className="about-chapters" aria-labelledby="about-chapters-title">
            <header>
              <p className="eyebrow">Four chapters</p>
              <h2 id="about-chapters-title">Different work. A recognizable pattern.</h2>
            </header>
            <ol>
              {careerChapters.map((chapter) => (
                <li key={chapter.number}>
                  <span>{chapter.number}</span>
                  <div>
                    <p className="eyebrow">{chapter.period}</p>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.summary}</p>
                    <Link href={chapter.href}>{chapter.linkLabel} <span aria-hidden="true">→</span></Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <CharacterSignals />

          <section className="about-opportunity" data-tone="green" aria-labelledby="about-opportunity-title">
            <p className="eyebrow">What I’m looking for</p>
            <h2 id="about-opportunity-title">I’m most useful where product, interface, and engineering decisions meet.</h2>
            <p>
              I’m looking for senior product engineering work where interface, product, and technical
              decisions cannot be separated: complex workflows, design systems, applied AI with clear
              limits, or software that has to earn a user’s trust.
            </p>
            <div className="about-actions">
              <Link className="primary-action dark-action" href="/work">See the work <span aria-hidden="true">→</span></Link>
              <Link className="primary-action dark-action" href="/archive">See the career arc <span aria-hidden="true">→</span></Link>
              <Link className="primary-action dark-action" href="/contact">Get in touch <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
