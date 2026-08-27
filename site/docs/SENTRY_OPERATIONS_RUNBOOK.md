# Sentry operations runbook

## Current state

The browser and Cloudflare Worker SDKs are installed and fail closed when their DSNs are absent. Local development and automated tests do not transmit events. Session Replay, visitor identity, tracing, and public Jolene content capture are disabled.

Production activation remains separate from code delivery. It requires a Carl-owned Sentry organization/project and approved hosting secrets.

## Required configuration

Browser build environment:

- `NEXT_PUBLIC_SENTRY_ENABLED=true`
- `NEXT_PUBLIC_SENTRY_DSN` — the intentionally public browser DSN
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`
- `NEXT_PUBLIC_SENTRY_RELEASE=<git-sha-or-deployment-id>`

Worker runtime secrets/variables:

- `SENTRY_DSN` — Worker project DSN, stored in the hosting secret store
- `SENTRY_ENVIRONMENT=production`
- `SENTRY_RELEASE=<git-sha-or-deployment-id>`

CI-only release variables:

- `SENTRY_RELEASE_UPLOAD_ENABLED=true`
- `SENTRY_AUTH_TOKEN` — org token limited to CI/release operations
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_RELEASE` — the exact Git commit deployed

Run `pnpm build:sentry` only in the authenticated release job. The build fails
closed when any required value is missing. Hidden source maps are uploaded by
the Sentry Vite plugin and deleted after a successful upload. Ordinary builds
produce no source maps; `pnpm check:no-public-sourcemaps` verifies the packaged
output contains neither `.map` files nor source-map URL directives.

Signed Sentry-to-Asana intake variables:

- `SENTRY_ASANA_INTAKE_ENABLED=true`
- `SENTRY_SERVICE_HOOK_SECRET` — the secret returned when the Sentry project hook is created
- `ASANA_ACCESS_TOKEN` — least-privilege, server-only token
- `ASANA_WORKSPACE_ID`
- `ASANA_PORTFOLIO_PROJECT_ID`
- `ASANA_IN_PROGRESS_SECTION_ID`

The endpoint is `/api/ops/sentry`. It is indistinguishable from a missing route
while disabled. When enabled it accepts JSON POSTs no larger than 64 KiB,
verifies the raw-body HMAC-SHA256 service-hook signature, retains only bounded
technical fields, and uses the Asana task itself as the durable issue-ID and
delivery-fingerprint ledger. Duplicate deliveries do not create duplicate
tasks. Regressions and resolutions update the same task; a Sentry resolution
never completes the Asana incident before a verified deployment.

Do not put auth tokens, organization tokens, cookies, contact details, prompts, job descriptions, transcripts, evidence bodies, or private Jolene data in public variables, Git, Asana, or logs.

## Privacy boundary

- `sendDefaultPii` is false.
- Session Replay and tracing are off.
- UI-click and console breadcrumbs are dropped.
- Query strings, fragments, request bodies, headers, users, email addresses, IP addresses, local paths, and professional-context payload fields are removed before transport.
- Sentry-side IP and data-scrubbing controls must also be enabled before production activation.

Run `pnpm check:sentry-privacy` whenever the scrubbing policy changes.
Run `pnpm check:sentry-asana` whenever intake normalization, signature handling,
or Asana mapping changes.

## Disable and rollback

1. Set `NEXT_PUBLIC_SENTRY_ENABLED=false` for the next browser build.
2. Remove or rotate `SENTRY_DSN` in the Worker secret store to stop server transmission.
3. Roll back the portfolio using `PRODUCTION_OPERATIONS_RUNBOOK.md` if monitoring changes affect runtime health.
4. Do not delete Sentry issues or suppress alerts until the incident record is preserved and Carl approves the action.

## Still required before activation

- Provision the Carl-owned Sentry project, quota, retention, and owner notification destination.
- Store DSNs and a least-privilege source-map token in the approved provider/CI secret stores.
- Add private source-map upload and verify de-minification without serving `.map` files publicly.
- Configure new/regressed issue alerts and activate the signed alert-to-Asana path.
- Run deliberate browser and Worker exceptions and inspect the resulting events for prohibited data.
