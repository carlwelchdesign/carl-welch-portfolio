import type { Metadata } from 'next';
import Link from 'next/link';
import { careerChapters, careerThesis, earlierPracticeGroups } from '../career-story-data';
import { LegacyArchiveGallery } from '../legacy-archive-gallery';
import { MotionRuntime, Reveal } from '../motion-elements';
import { CharacterSignals, PageFrame, PageIntro, SelectedArchive } from '../site-components';
import { buildPageMetadata } from '../site-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Selected Archive',
  description:
    'A selected archive tracing Carl Welch’s path from interactive and creative technology to senior product engineering.',
  path: '/archive',
});

export default function ArchivePage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content">
          <PageIntro
            eyebrow="Selected archive"
            title="The work behind the current work"
            summary="A career is more than its latest stack. This is the through-line from interactive systems and client work to product engineering, leadership, and independently built software."
          />

          <section className="archive-thesis" data-tone="red" aria-labelledby="archive-thesis-title">
            <p className="eyebrow">Career portrait</p>
            <Reveal>
              <h2 id="archive-thesis-title">A practice built across interaction, engineering, and product work.</h2>
            </Reveal>
            <p>{careerThesis}</p>
          </section>

          <ol className="career-chapter-list" aria-label="Career chapters">
            {careerChapters.map((chapter) => (
              <li key={chapter.number} id={`chapter-${chapter.number}`}>
                <Reveal className="career-chapter">
                  <span className="career-chapter-number">{chapter.number}</span>
                  <div className="career-chapter-copy">
                    <p className="eyebrow">{chapter.period}</p>
                    <h2>{chapter.title}</h2>
                    <p>{chapter.summary}</p>
                  </div>
                  <div className="career-chapter-proof">
                    <ul aria-label={`${chapter.title} evidence themes`}>
                      {chapter.proof.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <Link href={chapter.href}>{chapter.linkLabel} <span aria-hidden="true">→</span></Link>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <SelectedArchive showArchiveLink={false} />

          <LegacyArchiveGallery />

          <section className="earlier-practice-panel" data-tone="green" aria-labelledby="earlier-practice-title">
            <header>
              <p className="eyebrow">Earlier professional record</p>
              <h2 id="earlier-practice-title">Studios, agencies, client teams, and technical environments.</h2>
              <p>
                The public record spans studios, agencies, client teams, software organizations,
                and technical environments. The visual archive above presents the complete
                reviewed image record Carl selected to tell that story.
              </p>
            </header>
            <div className="earlier-practice-grid">
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
          </section>

          <CharacterSignals />

          <section className="archive-current-work" data-tone="orange" aria-labelledby="archive-current-title">
            <p className="eyebrow">Where it leads now</p>
            <h2 id="archive-current-title">The current case studies carry that experience forward.</h2>
            <p>
              The recent case studies show the current architecture and product judgment. The archive
              explains where the interaction instincts, visual range, and working style came from.
            </p>
            <div>
              <Link className="primary-action dark-action" href="/work">See current work <span aria-hidden="true">→</span></Link>
              <Link className="primary-action dark-action" href="/contact">Start a conversation <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
