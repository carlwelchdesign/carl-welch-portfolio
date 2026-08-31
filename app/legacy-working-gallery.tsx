'use client';

import Image from 'next/image';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { LegacyWorkImage } from './legacy-career-visuals';

type LegacyWorkingGalleryProps = {
  items: LegacyWorkImage[];
};

function matchesWorkingArchiveQuery(item: LegacyWorkImage, query: string) {
  if (!query) return true;

  const searchable = [item.project, item.context, item.contribution, ...item.technology]
    .join(' ')
    .toLocaleLowerCase();

  return searchable.includes(query.toLocaleLowerCase());
}

export function LegacyWorkingGallery({ items }: LegacyWorkingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const gridRef = useRef<HTMLOListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const visibleItems = useMemo(
    () => items.filter((item) => matchesWorkingArchiveQuery(item, deferredQuery)),
    [deferredQuery, items],
  );
  const activeItem = activeIndex === null ? null : visibleItems[activeIndex];

  useEffect(() => {
    gridRef.current?.setAttribute('data-inspector-ready', 'true');
  }, []);

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
      if (current === null || visibleItems.length === 0) return null;
      return (current + direction + visibleItems.length) % visibleItems.length;
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
      <div className="legacy-working-controls" role="search" aria-label="Search the visual working archive">
        <label>
          <span>Find work by project, organization, or technology</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try General Dynamics, fashion, PHP, or animation"
          />
        </label>
        <div className="legacy-working-results">
          <p aria-live="polite">{visibleItems.length} of {items.length} projects</p>
          {query ? (
            <button type="button" onClick={() => setQuery('')}>
              Clear search
            </button>
          ) : null}
        </div>
      </div>

      <ol ref={gridRef} className="legacy-working-grid" data-inspector-ready="false">
        {visibleItems.map((item, index) => (
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

      {visibleItems.length === 0 ? (
        <div className="legacy-working-empty">
          <p className="eyebrow">Nothing matched that search</p>
          <h3>Try a project, organization, discipline, or technology.</h3>
          <button type="button" onClick={() => setQuery('')}>Show all {items.length} projects</button>
        </div>
      ) : null}

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
              <p>Archive selection / {String(activeIndex + 1).padStart(2, '0')} of {visibleItems.length}</p>
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
