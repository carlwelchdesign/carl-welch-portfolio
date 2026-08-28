import type { Metadata } from 'next';
import Link from 'next/link';
import { careerChapters, careerThesis, earlierPracticeGroups } from '../career-story-data';
import { legacyArchiveProjects } from '../legacy-archive-data';
import { legacyWorkImages } from '../legacy-career-visuals';
import { LegacyWorkingArchive } from '../legacy-career-sections';
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

const archiveMapItems = [
  { number: '01', title: 'Career portrait', detail: 'The through-line', count: 'One career thesis', href: '#archive-portrait' },
  { number: '02', title: 'Career chapters', detail: 'The work in four eras', count: `${careerChapters.length} chapters`, href: '#career-chapters' },
  { number: '03', title: 'Featured yU+co record', detail: 'One project in depth', count: '2006 to 2007', href: '#yuco' },
  { number: '04', title: 'Selected visual archive', detail: 'Larger surviving artifacts', count: `${legacyArchiveProjects.length - 1} projects`, href: '#visual-archive' },
  { number: '05', title: 'Working archive', detail: 'Searchable interface contact sheet', count: `${legacyWorkImages.length} images`, href: '#working-archive' },
  { number: '06', title: 'Professional range', detail: 'Studios, agencies, and client teams', count: 'Earlier work', href: '#professional-range' },
] as const;

function ArchiveMap() {
  return (
    <nav id="archive-map" className="archive-map" aria-labelledby="archive-map-title">
      <header>
        <p className="eyebrow">Read the archive</p>
        <h2 id="archive-map-title">Archive map</h2>
        <p>Career chapters, selected projects, and the wider working record.</p>
      </header>
      <ol>
        {archiveMapItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              <span>{item.number}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <small>{item.count}</small>
              <span aria-hidden="true">↓</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function ArchivePage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" tabIndex={-1}>
          <PageIntro
            eyebrow="Selected archive"
            title="The work behind the current work"
            summary="A career is more than its latest stack. This is the through-line from interactive systems and client work to product engineering, leadership, and independently built software."
          />
          <ArchiveMap />

          <section id="archive-portrait" className="archive-thesis" data-tone="red" aria-labelledby="archive-thesis-title">
            <p className="eyebrow">Career portrait</p>
            <Reveal>
              <h2 id="archive-thesis-title">A practice built across interaction, engineering, and product work.</h2>
            </Reveal>
            <p>{careerThesis}</p>
            <Link
              className="archive-map-return"
              href="#archive-map"
              aria-label="Return to Archive map from career portrait"
            >
              Archive map <span aria-hidden="true">↑</span>
            </Link>
          </section>

          <section id="career-chapters" className="career-chapter-section" aria-label="Career chapters">
            <ol className="career-chapter-list">
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
                      <ul aria-label={`${chapter.title} themes`}>
                        {chapter.proof.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                      <Link href={chapter.href}>{chapter.linkLabel} <span aria-hidden="true">→</span></Link>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
            <div className="archive-map-return-band">
              <Link
                className="archive-map-return"
                href="#archive-map"
                aria-label="Return to Archive map from career chapters"
              >
                Archive map <span aria-hidden="true">↑</span>
              </Link>
            </div>
          </section>

          <SelectedArchive showArchiveLink={false} archiveReturnHref="#archive-map" />

          <LegacyArchiveGallery />

          <LegacyWorkingArchive />

          <section id="professional-range" className="earlier-practice-panel" data-tone="green" aria-labelledby="earlier-practice-title">
            <header>
              <p className="eyebrow">Earlier professional work</p>
              <h2 id="earlier-practice-title">Studios, agencies, client teams, and technical environments.</h2>
              <p>
                The path spans studios, agencies, client teams, software organizations, and
                technical environments. The work above shows how that range became the practice
                Carl brings to products today.
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
            <Link
              className="archive-map-return"
              href="#archive-map"
              aria-label="Return to Archive map from earlier professional work"
            >
              Archive map <span aria-hidden="true">↑</span>
            </Link>
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
