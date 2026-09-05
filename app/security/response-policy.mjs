export const portfolioSecurityHeaders = Object.freeze({
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "manifest-src 'self'",
    "media-src 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
  ].join('; '),
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
});

function headersForProtocol(protocol) {
  if (protocol !== 'http:') return portfolioSecurityHeaders;

  const headers = { ...portfolioSecurityHeaders };
  headers['Content-Security-Policy'] = headers['Content-Security-Policy']
    .split(';')
    .map((directive) => directive.trim())
    .filter((directive) => directive && directive !== 'upgrade-insecure-requests')
    .join('; ');
  delete headers['Cross-Origin-Opener-Policy'];
  delete headers['Strict-Transport-Security'];
  return headers;
}

export function portfolioSecurityHeadersForUrl(requestUrl) {
  if (!requestUrl) return portfolioSecurityHeaders;

  let protocol;
  try {
    protocol = new URL(requestUrl).protocol;
  } catch {
    return portfolioSecurityHeaders;
  }
  return headersForProtocol(protocol);
}

export function applyPortfolioSecurityHeaders(response, requestUrl) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(portfolioSecurityHeadersForUrl(requestUrl))) {
    headers.set(name, value);
  }

  // Each build fingerprints its CSS and JavaScript filenames. Revalidate HTML
  // so a cached document cannot keep pointing at assets from an older build.
  // Fingerprinted static assets retain the immutable cache policy set by the
  // runtime.
  if (headers.get('content-type')?.toLowerCase().includes('text/html')) {
    headers.set('Cache-Control', 'no-cache');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
