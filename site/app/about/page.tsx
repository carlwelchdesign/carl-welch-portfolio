import type { Metadata } from 'next';
import Link from 'next/link';
import { MotionRuntime, Reveal } from '../motion-elements';
import { PageFrame, PageIntro } from '../site-components';
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
            title="Senior product engineer with a long creative-technology practice"
            summary="I build interfaces and product systems for complicated workflows, keeping the user experience, technical boundaries, and delivery reality in view at the same time."
          />

          <section className="about-story" aria-labelledby="about-story-title">
            <Reveal className="about-story-heading">
              <p className="eyebrow">How I work</p>
              <h2 id="about-story-title">From an unclear problem to a system people can use and maintain.</h2>
            </Reveal>
            <div className="about-story-copy">
              <p>
                My recent work centers on React and TypeScript product engineering: enterprise
                administration at Yubico, analytics at Revenue.io, mobility products at Bosch,
                and independently developed software spanning applied AI, aviation, and audio.
              </p>
              <p>
                Earlier interactive and creative-technology work shaped how I approach motion,
                hierarchy, feedback, and the details that make complex software feel legible.
                I bring that judgment into engineering without confusing visual polish with a
                complete product.
              </p>
            </div>
          </section>

          <section className="about-opportunity" data-tone="green" aria-labelledby="about-opportunity-title">
            <p className="eyebrow">What I’m looking for</p>
            <h2 id="about-opportunity-title">A senior product engineering role—and selected collaborations worth doing well.</h2>
            <p>
              I’m most useful where product, interface, and engineering decisions have to be made
              together: complex workflows, design systems, applied AI with clear limits, or products
              that need both technical rigor and strong interaction judgment.
            </p>
            <div className="about-actions">
              <Link className="primary-action dark-action" href="/work">See the work <span aria-hidden="true">→</span></Link>
              <Link className="primary-action dark-action" href="/contact">Get in touch <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
