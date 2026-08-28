import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { capabilities } from '../capabilities-data';
import { ArchitectureFlow, MotionRuntime } from '../motion-elements';
import type { ProjectTone } from '../portfolio-data';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';
import { publicEvidenceAnchorId } from '../jolene/public-evidence-navigation-core';
import { FragmentFocusLink } from '../fragment-focus-link';

export const metadata: Metadata = buildPageMetadata({
  title: 'Capabilities',
  description: 'Explore Carl Welch’s capabilities through specific projects, professional experience, and recommendations.',
  path: '/capabilities',
});

type ToneStyle = CSSProperties & { '--chapter-tone': string };

const toneColors: Record<ProjectTone, string> = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

function CapabilityIndex() {
  return (
    <nav id="capability-index" className="capability-index" aria-labelledby="capability-index-title" tabIndex={-1}>
      <header>
        <p className="eyebrow">Jump through the strengths</p>
        <h2 id="capability-index-title">Capability index</h2>
        <p>Five capabilities, with practices and supporting work.</p>
      </header>
      <ol>
        {capabilities.map((capability) => {
          const style = { '--chapter-tone': toneColors[capability.tone] } as ToneStyle;
          return (
            <li key={capability.id} style={style}>
              <FragmentFocusLink href={`#${capability.id}`}>
                <span>{capability.number}</span>
                <strong>{capability.name}</strong>
                <p>{capability.summary}</p>
                <small>{capability.evidence.length} examples</small>
                <span aria-hidden="true">↓</span>
              </FragmentFocusLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function CapabilitiesPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main
          id="main-content"
          data-evidence-target
          tabIndex={-1}
          aria-label="Capabilities and supporting evidence"
        >
          <PageIntro
            eyebrow="Capabilities"
            title="What I bring to the work"
            summary="Explore each strength through the projects, roles, and recommendations that shaped it."
          />
          <CapabilityIndex />

          <ol className="capability-list">
            {capabilities.map((capability) => {
              const style = { '--chapter-tone': toneColors[capability.tone] } as ToneStyle;
              return (
                <li
                  key={capability.id}
                  id={capability.id}
                  data-tone={capability.tone}
                  style={style}
                  tabIndex={-1}
                >
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
                      <p className="eyebrow">See it in the work</p>
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
                    <FragmentFocusLink
                      className="capability-index-return"
                      href="#capability-index"
                      accessibleName={`Return to Capability index from ${capability.name}`}
                    >
                      Capability index <span aria-hidden="true">↑</span>
                    </FragmentFocusLink>
                  </div>
                </li>
              );
            })}
          </ol>

          <section className="capability-method" data-tone="red">
            <p className="eyebrow">Go deeper</p>
            <h2>See the work behind each strength</h2>
            <p>
              Open a case study for the full technical story, visit a repository to inspect the code, or read what managers, teammates, and clients have said about working with Carl.
            </p>
            <nav className="capability-next-steps" aria-label="Explore proof behind the capabilities">
              <ul>
                <li>
                  <Link href="/work#work-index">
                    <span>Detailed product stories</span>
                    <strong>Case studies</strong>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/work#public-repositories">
                    <span>Selected public code</span>
                    <strong>Repositories</strong>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/recommendations#recommendation-highlights">
                    <span>Managers, peers, and clients</span>
                    <strong>Recommendations</strong>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
