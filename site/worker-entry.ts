import * as Sentry from '@sentry/cloudflare';
import app from 'vinext/server/app-router-entry';
import { scrubSentryBreadcrumb, scrubSentryEvent } from './app/observability/sentry-policy.mjs';
import { applyPortfolioSecurityHeaders } from './app/security/response-policy.mjs';

type PortfolioWorkerEnv = {
  ASSETS?: { fetch(request: Request): Promise<Response> | Response };
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
};

const hardenedApp = {
  async fetch(
    request: Request,
    env?: PortfolioWorkerEnv,
    context?: Parameters<typeof app.fetch>[2],
  ): Promise<Response> {
    return applyPortfolioSecurityHeaders(await app.fetch(request, env, context));
  },
};

export default Sentry.withSentry<PortfolioWorkerEnv>(
  (env) => {
    if (!env.SENTRY_DSN) return undefined;

    return {
      dsn: env.SENTRY_DSN,
      enabled: true,
      environment: env.SENTRY_ENVIRONMENT ?? 'production',
      release: env.SENTRY_RELEASE,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend: scrubSentryEvent,
      beforeBreadcrumb: scrubSentryBreadcrumb,
      initialScope: {
        tags: {
          service: 'portfolio-worker',
          privacy_profile: 'public-technical-only-v1',
        },
      },
    };
  },
  hardenedApp,
);
