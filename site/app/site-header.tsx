'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const primaryLinks = [
  { href: '/work', label: 'Work' },
  { href: '/archive', label: 'Archive' },
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/recommendations', label: 'Recommendations' },
] as const;

const mobileLinks = [
  ...primaryLinks.slice(0, 3),
  { href: '/capabilities', label: 'Capabilities' },
  ...primaryLinks.slice(3),
  { href: '/contact', label: 'Contact' },
] as const;

function isCurrentRoute(pathname: string, href: string) {
  if (href === '/work') return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

function currentSection(pathname: string) {
  if (pathname === '/') return 'Home';
  return mobileLinks.find(({ href }) => isCurrentRoute(pathname, href))?.label ?? 'Menu';
}

function CurrentLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  return (
    <Link href={href} aria-current={isCurrentRoute(pathname, href) ? 'page' : undefined}>
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const section = currentSection(pathname);
  const mobileNavigationRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const navigation = mobileNavigationRef.current;
    if (navigation) navigation.dataset.dismissalReady = 'true';

    const dismissWithKeyboard = (event: KeyboardEvent) => {
      const currentNavigation = mobileNavigationRef.current;
      if (event.key !== 'Escape' || !currentNavigation?.open) return;

      event.preventDefault();
      currentNavigation.open = false;
      currentNavigation.querySelector('summary')?.focus();
    };

    const dismissFromOutside = (event: PointerEvent) => {
      const navigation = mobileNavigationRef.current;
      if (!navigation?.open || !(event.target instanceof Node) || navigation.contains(event.target)) return;
      navigation.open = false;
    };

    document.addEventListener('keydown', dismissWithKeyboard);
    document.addEventListener('pointerdown', dismissFromOutside);
    return () => {
      if (navigation) delete navigation.dataset.dismissalReady;
      document.removeEventListener('keydown', dismissWithKeyboard);
      document.removeEventListener('pointerdown', dismissFromOutside);
    };
  }, []);

  return (
    <header className="site-header">
      <Link
        className="wordmark"
        href="/"
        aria-label="Carl Welch home"
        aria-current={pathname === '/' ? 'page' : undefined}
      >
        <span className="wordmark-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Carl Welch</span>
      </Link>

      <nav aria-label="Primary navigation">
        {primaryLinks.map((link) => <CurrentLink key={link.href} {...link} />)}
      </nav>

      <details ref={mobileNavigationRef} className="mobile-navigation">
        <summary aria-label={`Menu, current section: ${section}`}>
          <span className="mobile-navigation-location">{section}</span>
        </summary>
        <nav aria-label="Mobile navigation">
          {mobileLinks.map((link) => <CurrentLink key={link.href} {...link} />)}
        </nav>
      </details>

      <Link
        className="build-label"
        href="/contact"
        aria-current={pathname === '/contact' ? 'page' : undefined}
      >
        Contact →
      </Link>
    </header>
  );
}
