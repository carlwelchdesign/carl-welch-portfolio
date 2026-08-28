'use client';

import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

type IndexReturnLinkProps = {
  accessibleName: string;
  children: ReactNode;
  className: string;
  href: `#${string}`;
};

export function IndexReturnLink({
  accessibleName,
  children,
  className,
  href,
}: IndexReturnLinkProps) {
  function focusDestination(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const destination = document.getElementById(href.slice(1));
    if (!destination) return;

    window.requestAnimationFrame(() => destination.focus({ preventScroll: true }));
  }

  return (
    <Link className={className} href={href} aria-label={accessibleName} onClick={focusDestination}>
      {children}
    </Link>
  );
}
