import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { JoleneShell } from './jolene/jolene-shell';
import { EvidenceTargetObserver } from './jolene/evidence-target-observer';
import { AnalyticsRuntime } from './analytics/analytics-runtime';
import { SentryRuntime } from './observability/sentry-runtime';
import { analyticsModes, type AnalyticsMode } from './analytics/analytics-contract';
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
  const requestedAnalyticsMode = process.env.NEXT_PUBLIC_PORTFOLIO_ANALYTICS_MODE;
  const analyticsMode: AnalyticsMode = analyticsModes.includes(requestedAnalyticsMode as AnalyticsMode)
    ? requestedAnalyticsMode as AnalyticsMode
    : 'disabled';
  const sentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SentryRuntime
          dsn={process.env.NEXT_PUBLIC_SENTRY_DSN}
          enabled={sentryEnabled}
          environment={process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'production'}
          release={process.env.NEXT_PUBLIC_SENTRY_RELEASE}
        />
        <AnalyticsRuntime mode={analyticsMode} />
        <EvidenceTargetObserver />
        {children}
        <JoleneShell />
      </body>
    </html>
  );
}
