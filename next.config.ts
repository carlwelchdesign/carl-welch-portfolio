import type { NextConfig } from 'next';
import { portfolioSecurityHeaders } from './app/security/response-policy.mjs';

const nextSecurityHeaders = Object.entries(portfolioSecurityHeaders).map(([key, value]) => ({
  key,
  value,
}));

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },
  async headers() {
    if (!process.env.VERCEL) return [];
    return [
      {
        source: '/:path*',
        headers: nextSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
