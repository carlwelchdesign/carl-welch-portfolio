'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { FragmentFocusLink } from './fragment-focus-link';
import { legacyArchiveProjects } from './legacy-archive-data';
import { Reveal } from './motion-elements';

const archiveImages = legacyArchiveProjects.slice(1).flatMap((project) => {
  const images = [project.image, ...(project.additionalImages ?? [])];
  return images.map((image, imageIndex) => ({
    project,
    image,
    imageIndex,
    imageCount: images.length,
  }));
});

export function LegacyArchiveGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const activeItem = activeIndex === null ? null : archiveImages[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeIndex !== null && dialog && !dialog.open) dialog.showModal();
  }, [activeIndex]);

  function openInspector(index: number, opener: HTMLButtonElement) {
    openerRef.current = opener;
    setActiveIndex(index);
  }

  function closeInspector() {
    dialogRef.current?.close();
  }

  function restoreOpener() {
    setActiveIndex(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }

  function moveInspector(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + direction + archiveImages.length) % archiveImages.length;
    });
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveInspector(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveInspector(1);
    }
  }

  return (
    <section
      id="visual-archive"
      className="legacy-gallery"
      data-tone="paper"
      aria-labelledby="legacy-gallery-title"
      tabIndex={-1}
    >
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
                  {[project.image, ...(project.additionalImages ?? [])].map((image, imageIndex, images) => {
                    const inspectorIndex = archiveImages.findIndex((item) => item.image.src === image.src);
                    return (
                      <button
                        key={image.src}
                        type="button"
                        className="legacy-gallery-inspect-trigger"
                        aria-label={`Inspect ${project.project}, image ${imageIndex + 1} of ${images.length}`}
                        onClick={(event) => openInspector(inspectorIndex, event.currentTarget)}
                      >
                        <Image
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
                        <span aria-hidden="true">Inspect ↗</span>
                      </button>
                    );
                  })}
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
      <FragmentFocusLink
        className="archive-map-return"
        href="#archive-map"
        accessibleName="Return to Archive map from selected professional archive"
      >
        Archive map <span aria-hidden="true">↑</span>
      </FragmentFocusLink>

      <dialog
        ref={dialogRef}
        className="legacy-inspector legacy-gallery-inspector"
        aria-label="Selected archive image viewer"
        onClose={restoreOpener}
        onKeyDown={handleDialogKeyDown}
      >
        {activeItem && activeIndex !== null ? (
          <div className="legacy-inspector-shell">
            <header className="legacy-inspector-header">
              <p>
                Selected archive / {String(activeIndex + 1).padStart(2, '0')} of {archiveImages.length}
              </p>
              <button type="button" onClick={closeInspector} autoFocus aria-label="Close selected archive image viewer">
                Close <span aria-hidden="true">×</span>
              </button>
            </header>
            <div className="legacy-inspector-body">
              <figure data-display={activeItem.project.display}>
                <Image
                  src={activeItem.image.src}
                  alt={activeItem.image.alt}
                  width={activeItem.image.width}
                  height={activeItem.image.height}
                  sizes="(max-width: 760px) 92vw, 64vw"
                  unoptimized={activeItem.image.width <= 240}
                />
              </figure>
              <div className="legacy-inspector-copy" aria-live="polite">
                <p className="eyebrow">{activeItem.project.period} / {activeItem.project.role}</p>
                <h2>{activeItem.project.project}</h2>
                <p>{activeItem.project.contribution}</p>
                {activeItem.imageCount > 1 ? (
                  <p className="legacy-inspector-image-count">
                    Image {activeItem.imageIndex + 1} of {activeItem.imageCount} from this project
                  </p>
                ) : null}
                <ul aria-label={`${activeItem.project.project} technologies and disciplines`}>
                  {activeItem.project.technology.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
            </div>
            <footer className="legacy-inspector-nav">
              <button type="button" onClick={() => moveInspector(-1)} aria-label="Previous image">
                <span aria-hidden="true">←</span> Previous
              </button>
              <p>Use left and right arrow keys to browse</p>
              <button type="button" onClick={() => moveInspector(1)} aria-label="Next image">
                Next <span aria-hidden="true">→</span>
              </button>
            </footer>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
