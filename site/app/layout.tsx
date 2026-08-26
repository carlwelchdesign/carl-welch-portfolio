import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { JoleneShell } from './jolene/jolene-shell';
import { EvidenceTargetObserver } from './jolene/evidence-target-observer';
import {
  buildPageMetadata,
  defaultDescription,
  defaultTitle,
  siteName,
  siteUrl,
} from './site-metadata';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: defaultTitle,
    description: defaultDescription,
    path: '/',
  }),
  metadataBase: siteUrl,
  title: {
    default: defaultTitle,
    template: '%s | Carl Welch',
  },
  applicationName: siteName,
  authors: [{ name: 'Carl Welch' }],
  creator: 'Carl Welch',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090c09',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <EvidenceTargetObserver />
        {children}
        <JoleneShell />
      </body>
    </html>
  );
}
