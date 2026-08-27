import type { Metadata } from 'next';

export const siteName = 'Carl Welch Portfolio';
export const defaultTitle = 'Carl Welch — Senior Product Engineer';
export const defaultDescription =
  'Senior product engineer Carl Welch: current systems, professional experience, and a selected archive tracing two decades of interactive and product work.';

function resolveSiteUrl() {
  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (vercelProductionHost ? `https://${vercelProductionHost}` : 'http://localhost:3000');
  const url = new URL(configuredUrl);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https.');
  }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an origin without credentials, path, query, or fragment.');
  }

  return url;
}

export const siteUrl = resolveSiteUrl();

type PageImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: '/' | `/${string}`;
  image?: PageImage;
  robots?: Metadata['robots'];
};

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  robots,
}: PageMetadataInput): Metadata {
  const socialTitle = title === defaultTitle ? title : `${title} | Carl Welch`;
  const socialImage: PageImage = image || {
    url: '/opengraph-image',
    width: 1200,
    height: 630,
    alt: defaultTitle,
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName,
      title: socialTitle,
      description,
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [socialImage.url],
    },
    robots,
  };
}
