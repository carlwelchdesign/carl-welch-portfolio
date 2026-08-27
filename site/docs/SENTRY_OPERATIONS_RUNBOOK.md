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

Do not put auth tokens, organization tokens, cookies, contact details, prompts, job descriptions, transcripts, evidence bodies, or private Jolene data in public variables, Git, Asana, or logs.

## Privacy boundary

- `sendDefaultPii` is false.
- Session Replay and tracing are off.
- UI-click and console breadcrumbs are dropped.
- Query strings, fragments, request bodies, headers, users, email addresses, IP addresses, local paths, and professional-context payload fields are removed before transport.
- Sentry-side IP and data-scrubbing controls must also be enabled before production activation.

Run `pnpm check:sentry-privacy` whenever the scrubbing policy changes.

## Disable and rollback

1. Set `NEXT_PUBLIC_SENTRY_ENABLED=false` for the next browser build.
2. Remove or rotate `SENTRY_DSN` in the Worker secret store to stop server transmission.
3. Roll back the portfolio using `PRODUCTION_OPERATIONS_RUNBOOK.md` if monitoring changes affect runtime health.
4. Do not delete Sentry issues or suppress alerts until the incident record is preserved and Carl approves the action.

## Still required before activation

- Provision the Carl-owned Sentry project, quota, retention, and owner notification destination.
- Store DSNs and a least-privilege source-map token in the approved provider/CI secret stores.
- Add private source-map upload and verify de-minification without serving `.map` files publicly.
- Configure new/regressed issue alerts and test the sanitized alert-to-Asana path.
- Run deliberate browser and Worker exceptions and inspect the resulting events for prohibited data.

