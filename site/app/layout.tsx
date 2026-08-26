import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

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
  metadataBase: siteUrl,
  title: {
    default: 'Carl Welch — Product Engineer',
    template: '%s | Carl Welch',
  },
  description:
    'Selected work, architecture, and experience from product engineer Carl Welch.',
  applicationName: 'Carl Welch Portfolio',
  authors: [{ name: 'Carl Welch' }],
  creator: 'Carl Welch',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Carl Welch Portfolio',
    title: 'Carl Welch — Product Engineer',
    description:
      'Selected work, architecture, and experience from product engineer Carl Welch.',
    url: '/',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Carl Welch — Product Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carl Welch — Product Engineer',
    description:
      'Selected work, architecture, and experience from product engineer Carl Welch.',
    images: ['/opengraph-image'],
  },
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
      <body>{children}</body>
    </html>
  );
}
