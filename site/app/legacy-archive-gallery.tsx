import Image from 'next/image';
import Link from 'next/link';
import { legacyArchiveProjects } from './legacy-archive-data';
import { Reveal } from './motion-elements';

export function LegacyArchiveGallery() {
  return (
    <section id="visual-archive" className="legacy-gallery" data-tone="paper" aria-labelledby="legacy-gallery-title">
      <header className="legacy-gallery-heading">
        <div>
          <p className="eyebrow">Selected professional archive</p>
          <Reveal>
            <h2 id="legacy-gallery-title">More visual work across the years.</h2>
          </Reveal>
        </div>
        <p>
          These surviving artifacts show the range behind the current practice: interactive
          development, visual systems, mobile UI, campaigns, and product storytelling. Together,
          they trace the visual and technical instincts that still shape Carl’s work.
        </p>
      </header>

      <ol className="legacy-gallery-grid">
        {legacyArchiveProjects.slice(1).map((project, index) => (
          <li
            key={project.id}
            id={project.id}
            className={`legacy-gallery-item legacy-gallery-item-${project.display}`}
          >
            <Reveal className="legacy-gallery-card">
              <figure className="legacy-gallery-figure">
                <div className={`legacy-gallery-image${project.additionalImages ? ' legacy-gallery-image-collection' : ''}`}>
                  {[project.image, ...(project.additionalImages ?? [])].map((image) => (
                    <Image
                      key={image.src}
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes={project.additionalImages
                        ? '(max-width: 760px) 50vw, 16vw'
                        : project.display === 'feature'
                          ? '(max-width: 760px) 100vw, 66vw'
                          : '(max-width: 760px) 100vw, 50vw'}
                      unoptimized={project.display === 'thumbnail' || Boolean(project.additionalImages)}
                    />
                  ))}
                </div>
                <figcaption>
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span>{project.period}</span>
                  <span>Historical work</span>
                </figcaption>
              </figure>
              <div className="legacy-gallery-copy">
                <p className="eyebrow">{project.role}</p>
                <h3>{project.project}</h3>
                <p>{project.contribution}</p>
                <ul aria-label={`${project.project} technologies and disciplines`}>
                  {project.technology.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
      <Link
        className="archive-map-return"
        href="#archive-map"
        aria-label="Return to archive map from selected professional archive"
      >
        Archive map <span aria-hidden="true">↑</span>
      </Link>
    </section>
  );
}
