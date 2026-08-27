'use client';

import { useEffect, useState } from 'react';

function currentEvidenceTarget(): HTMLElement | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const target = document.getElementById(decodeURIComponent(hash));
  return target instanceof HTMLElement && target.hasAttribute('data-evidence-target') ? target : null;
}
export function EvidenceTargetObserver() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const focusTarget = () => {
      const target = currentEvidenceTarget();
      if (!target) return;
      target.focus({ preventScroll: true });
      setAnnouncement(`Supporting evidence: ${target.getAttribute('aria-label') || 'selected evidence'}`);
    };

    focusTarget();
    window.addEventListener('hashchange', focusTarget);
    return () => window.removeEventListener('hashchange', focusTarget);
  }, []);

  return <p className="evidence-navigation-status" role="status" aria-live="polite">{announcement}</p>;
}
