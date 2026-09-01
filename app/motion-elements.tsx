'use client';

import { LazyMotion, MotionConfig, domAnimation, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type SectionTone = 'red' | 'orange' | 'green';

const toneColors: Record<SectionTone, string> = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

export function MotionRuntime({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <SectionToneBackdrop />
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

function SectionToneBackdrop() {
  const [tone, setTone] = useState<SectionTone>('red');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'));
    const visible = new Map<Element, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target, entry);
          else visible.delete(entry.target);
        }

        const active = [...visible.values()].sort((left, right) => {
          const viewportCenter = window.innerHeight / 2;
          const leftCenter = left.boundingClientRect.top + left.boundingClientRect.height / 2;
          const rightCenter = right.boundingClientRect.top + right.boundingClientRect.height / 2;
          return Math.abs(leftCenter - viewportCenter) - Math.abs(rightCenter - viewportCenter);
        })[0];

        const nextTone = active?.target.getAttribute('data-tone');
        if (nextTone === 'red' || nextTone === 'orange' || nextTone === 'green') setTone(nextTone);
      },
      { rootMargin: '-18% 0px -18% 0px', threshold: [0, 0.2, 0.5, 0.8] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <m.div
      className="section-tone-backdrop"
      aria-hidden="true"
      animate={{ backgroundColor: toneColors[tone] }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial={{ y: 36 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

export function ImageDrift({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="project-image-motion"
      initial={{ opacity: 0, scale: 0.94, y: 54 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { scale: 1.012 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

export function ArchitectureFlow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useInView(ref, { once: true, amount: 0.12 });
  const inView = useInView(ref, { amount: 0.08 });
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const flowActive = inView && documentVisible && !reduceMotion;

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReduceMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateDocumentVisibility = () => setDocumentVisible(document.visibilityState === 'visible');
    updateDocumentVisibility();
    document.addEventListener('visibilitychange', updateDocumentVisibility);
    return () => document.removeEventListener('visibilitychange', updateDocumentVisibility);
  }, []);

  useEffect(() => {
    const connectors = ref.current?.querySelector<SVGSVGElement>('.architecture-connectors');
    if (
      !connectors
      || typeof connectors.pauseAnimations !== 'function'
      || typeof connectors.unpauseAnimations !== 'function'
    ) return;

    if (flowActive) connectors.unpauseAnimations();
    else connectors.pauseAnimations();

    return () => connectors.pauseAnimations();
  }, [flowActive]);

  return (
    <m.div
      ref={ref}
      className={className}
      data-in-view={revealed || reduceMotion ? 'true' : 'false'}
      data-flow-active={flowActive ? 'true' : 'false'}
      data-reduced-motion={reduceMotion ? 'true' : 'false'}
    >
      {children}
    </m.div>
  );
}

export function Orbit({ variant }: { variant: 'one' | 'two' }) {
  const reduceMotion = useReducedMotion();
  const isFirst = variant === 'one';

  return (
    <m.div
      className={`signal-orbit signal-orbit-${variant}`}
      animate={
        reduceMotion
          ? undefined
          : {
              rotate: isFirst ? [0, 12, 0] : [0, -10, 0],
              scale: isFirst ? [1, 1.04, 1] : [1, 0.96, 1],
            }
      }
      transition={{ duration: isFirst ? 9 : 11, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function NodePulse({ delay }: { delay: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.span
      className="node-pulse"
      animate={
        reduceMotion
          ? undefined
          : { opacity: [0.18, 0.52, 0.18], scale: [0.88, 1.08, 0.88] }
      }
      transition={{ duration: 3.6, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
