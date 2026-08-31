ARG NODE_VERSION=22.22.0

FROM node:${NODE_VERSION}-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
RUN pnpm exec playwright install --with-deps chromium

COPY . .

ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_JOLENE_MODE=disabled
ARG NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO=success
ARG NEXT_PUBLIC_SENTRY_ENABLED=false
ARG NEXT_PUBLIC_SENTRY_DSN=
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
ARG NEXT_PUBLIC_SENTRY_RELEASE=
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_JOLENE_MODE=${NEXT_PUBLIC_JOLENE_MODE}
ENV NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO=${NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO}
ENV NEXT_PUBLIC_SENTRY_ENABLED=${NEXT_PUBLIC_SENTRY_ENABLED}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT}
ENV NEXT_PUBLIC_SENTRY_RELEASE=${NEXT_PUBLIC_SENTRY_RELEASE}

RUN pnpm check \
  && pnpm prune --prod

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

RUN apt-get update \
  && apt-get upgrade --yes --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    /usr/local/bin/pnpm /usr/local/bin/pnpx

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/').then((response)=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["node", "dist/standalone/server.js"]
