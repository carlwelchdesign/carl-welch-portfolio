'use client';

import Image from 'next/image';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectMedia } from './portfolio-data';

type ProjectMediaViewerProps = {
  projectName: string;
  media: ProjectMedia[];
};

export function ProjectMediaViewer({ projectName, media }: ProjectMediaViewerProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isOpen = activeIndex !== null;

  const closeViewer = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setActiveIndex(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => current === null ? null : (current - 1 + media.length) % media.length);
  }, [media.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => current === null ? null : (current + 1) % media.length);
  }, [media.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog || dialog.open) return;

    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrevious();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, showNext, showPrevious]);

  const activeItem = activeIndex === null ? null : media[activeIndex];

  return (
    <>
      <div className="project-gallery-grid">
        {media.map((item, index) => (
          <div
            key={item.src}
            className={`project-gallery-item project-gallery-item-${item.layout ?? 'standard'} ${index === 0 ? 'project-gallery-item-first' : ''}`}
          >
            <figure>
              <button
                type="button"
                className="project-gallery-trigger"
                aria-label={`Open full-size view of ${item.label}`}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveIndex(index);
                }}
              >
                <span className="project-gallery-image">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes={item.layout === 'portrait' ? '(max-width: 720px) 84vw, 38vw' : '(max-width: 900px) 100vw, 88vw'}
                  />
                  <span className="project-gallery-expand" aria-hidden="true">View full size ↗</span>
                </span>
              </button>
              <figcaption>
                <span>{String(index + 2).padStart(2, '0')}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.caption}</p>
                </div>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="project-media-dialog"
        aria-label={`${projectName} full-size image viewer`}
        onCancel={(event) => {
          event.preventDefault();
          closeViewer();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeViewer();
        }}
      >
        {activeItem ? (
          <div className="project-media-viewer">
            <header className="project-media-viewer-header">
              <div>
                <p className="eyebrow">{projectName} / project view</p>
                <p className="project-media-position" aria-live="polite">
                  {String((activeIndex ?? 0) + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
                </p>
              </div>
              <button type="button" className="project-media-close" onClick={closeViewer}>Close</button>
            </header>

            <div className="project-media-stage">
              <button type="button" className="project-media-nav project-media-nav-previous" onClick={showPrevious} aria-label="View previous image">
                <span aria-hidden="true">←</span>
              </button>
              <AnimatePresence initial={false} mode="wait">
                <m.figure
                  key={activeItem.src}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -22 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="project-media-full-image">
                    <Image
                      src={activeItem.src}
                      alt={activeItem.alt}
                      width={activeItem.width}
                      height={activeItem.height}
                      sizes="100vw"
                      priority
                    />
                  </div>
                  <figcaption>
                    <strong>{activeItem.label}</strong>
                    <p>{activeItem.caption}</p>
                  </figcaption>
                </m.figure>
              </AnimatePresence>
              <button type="button" className="project-media-nav project-media-nav-next" onClick={showNext} aria-label="View next image">
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
