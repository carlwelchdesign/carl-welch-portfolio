'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { LegacyWorkImage } from './legacy-career-visuals';

type LegacyWorkingGalleryProps = {
  items: LegacyWorkImage[];
};

export function LegacyWorkingGallery({ items }: LegacyWorkingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];

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
      return (current + direction + items.length) % items.length;
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
    <>
      <ol className="legacy-working-grid">
        {items.map((item, index) => (
          <li
            key={item.id}
            id={item.id}
            className={item.display === 'wide' ? 'legacy-working-item-wide' : undefined}
          >
            <article>
              <figure>
                <button
                  type="button"
                  className="legacy-working-image legacy-working-inspect-trigger"
                  aria-label={`Inspect ${item.project}`}
                  onClick={(event) => openInspector(index, event.currentTarget)}
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    sizes={item.display === 'wide'
                      ? '(max-width: 760px) 100vw, 46vw'
                      : '(max-width: 760px) 100vw, 24vw'}
                    unoptimized={item.image.width <= 240}
                  />
                  <span className="legacy-working-inspect-label" aria-hidden="true">
                    Inspect project <span>↗</span>
                  </span>
                </button>
                <figcaption>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.context}</span>
                </figcaption>
              </figure>
              <div className="legacy-working-copy">
                <h3>{item.project}</h3>
                <p>{item.contribution}</p>
                <ul aria-label={`${item.project} technologies and disciplines`}>
                  {item.technology.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <dialog
        ref={dialogRef}
        className="legacy-inspector"
        aria-labelledby={activeItem ? `legacy-inspector-title-${activeItem.id}` : undefined}
        onClose={restoreOpener}
        onKeyDown={handleDialogKeyDown}
      >
        {activeItem && activeIndex !== null ? (
          <div className="legacy-inspector-shell">
            <header className="legacy-inspector-header">
              <p>Archive selection / {String(activeIndex + 1).padStart(2, '0')} of {items.length}</p>
              <button type="button" onClick={closeInspector} autoFocus>
                Close <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className="legacy-inspector-body">
              <figure data-display={activeItem.display ?? 'standard'}>
                <Image
                  src={activeItem.image.src}
                  alt={activeItem.image.alt}
                  width={activeItem.image.width}
                  height={activeItem.image.height}
                  sizes={activeItem.display === 'wide' ? '(max-width: 760px) 92vw, 56vw' : '240px'}
                  unoptimized={activeItem.image.width <= 240}
                />
              </figure>

              <div className="legacy-inspector-copy" aria-live="polite">
                <p className="eyebrow">{activeItem.context}</p>
                <h2 id={`legacy-inspector-title-${activeItem.id}`}>{activeItem.project}</h2>
                <p>{activeItem.contribution}</p>
                <ul aria-label={`${activeItem.project} technologies and disciplines`}>
                  {activeItem.technology.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
            </div>

            <footer className="legacy-inspector-nav">
              <button type="button" onClick={() => moveInspector(-1)}>
                <span aria-hidden="true">←</span> Previous
              </button>
              <p>Use left and right arrow keys to browse</p>
              <button type="button" onClick={() => moveInspector(1)}>
                Next <span aria-hidden="true">→</span>
              </button>
            </footer>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
