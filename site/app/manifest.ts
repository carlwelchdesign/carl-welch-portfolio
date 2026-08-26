import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Carl Welch Portfolio',
    short_name: 'Carl Welch',
    description: 'Selected work, architecture, and experience from product engineer Carl Welch.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090c09',
    theme_color: '#090c09',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
