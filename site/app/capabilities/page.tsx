import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { capabilities } from '../capabilities-data';
import { ArchitectureFlow, MotionRuntime } from '../motion-elements';
import type { ProjectTone } from '../portfolio-data';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';
import { publicEvidenceAnchorId } from '../jolene/public-evidence-navigation-core';

export const metadata: Metadata = buildPageMetadata({
  title: 'Capabilities and Evidence',
  description: 'A source-grounded map connecting Carl Welch’s capabilities to specific projects, repositories, experience, and recommendations.',
  path: '/capabilities',
});

type ToneStyle = CSSProperties & { '--chapter-tone': string };

const toneColors: Record<ProjectTone, string> = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

export default function CapabilitiesPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content">
          <PageIntro
            eyebrow="Capabilities"
            title="What I do, and the work behind it"
            summary="Each area below links to a project, repository, role, or recommendation. You can follow every claim back to its source."
          />

          <ol className="capability-list">
            {capabilities.map((capability) => {
              const style = { '--chapter-tone': toneColors[capability.tone] } as ToneStyle;
              return (
                <li key={capability.id} id={capability.id} data-tone={capability.tone} style={style}>
                  <div className="capability-card">
                    <header>
                      <span className="capability-number">{capability.number}</span>
                      <div>
                        <p className="eyebrow">Capability</p>
                        <h2>{capability.name}</h2>
                        <p>{capability.summary}</p>
                      </div>
                    </header>

                    <ul className="capability-practices" aria-label={`${capability.name} practices`}>
                      {capability.practices.map((practice) => <li key={practice}>{practice}</li>)}
                    </ul>

                    <div className="capability-evidence">
                      <p className="eyebrow">Supporting evidence</p>
                      <ArchitectureFlow className="capability-evidence-links">
                        {capability.evidence.map((evidence) => {
                          const content = (
                            <>
                              <span>{evidence.source}</span>
                              <strong>{evidence.label}</strong>
                              <p>{evidence.detail}</p>
                              <span className="evidence-arrow" aria-hidden="true">↗</span>
                            </>
                          );
                          return evidence.href.startsWith('http') ? (
                            <a
                              key={evidence.id}
                              id={publicEvidenceAnchorId(evidence.id)}
                              href={evidence.href}
                              className="evidence-link"
                              data-evidence-target
                              aria-label={`${capability.name}: ${evidence.label}`}
                            >{content}</a>
                          ) : (
                            <Link
                              key={evidence.id}
                              id={publicEvidenceAnchorId(evidence.id)}
                              href={evidence.href}
                              className="evidence-link"
                              data-evidence-target
                              aria-label={`${capability.name}: ${evidence.label}`}
                            >{content}</Link>
                          );
                        })}
                      </ArchitectureFlow>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <section className="capability-method" data-tone="red">
            <p className="eyebrow">Evidence model</p>
            <h2>What the site can support today</h2>
            <p>
              Case studies carry the deepest technical context. Repository records show public implementation evidence. Experience records establish professional context. Recommendations remain attributed third-party statements and are never rewritten as Carl’s own claims.
            </p>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
