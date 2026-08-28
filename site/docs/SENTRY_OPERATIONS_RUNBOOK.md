# Sentry operations runbook

## Current state

The browser and Cloudflare Worker SDKs are installed and fail closed when their DSNs are absent. Local development and automated tests do not transmit events. Session Replay, visitor identity, tracing, and public Jolene content capture are disabled.

Production activation remains separate from code delivery. It requires a Carl-owned Sentry organization/project and approved hosting secrets.

## Provisioned provider boundary

Provider state reviewed on August 27, 2026:

- Organization: `carlwelchdesign`, owned through Carl's existing Sentry account.
- Browser project: `carl-welch-portfolio-browser`, React platform, assigned to `#carlwelchdesign`.
- Plan: Developer, with no billing details or payment method on file and 5,000 errors included in the current usage period.
- Cost protection: project spike protection is enabled. The account showed no additional spend and no ingested errors when provisioned.
- Alerting: the project has one error monitor with one high-priority email alert. Provider activation and a deliberate test event remain separate gates.
- Privacy: server-side scrubbing and default scrubbers are enabled, storage of IP addresses is disabled, JavaScript source fetching is disabled, and TLS verification is enabled.
- Ingestion boundary: the browser project accepts events only from `https://carl-welch-portfolio.vercel.app`.
- Retention: the Developer-plan interface did not expose a project-level retention selector. Treat retention as provider-managed and require an owner review of the then-current Sentry policy before production activation; do not assume or document an unsupported duration.
- Service separation: this project is for the public portfolio browser only. Do not reuse it for the isolated public Jolene delegate, any future Worker/server runtime, or private Jolene. Provision a distinct project only after that runtime topology is approved.

The project DSN exists in Sentry but has not been copied into Git, Asana, chat, logs, Vercel, or CI. No release/source-map token has been created. Creating or transmitting either credential is a separate approval-gated step.

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

### Scheduled reconciliation safety net

`GET /api/cron/sentry-reconcile` is a disabled-by-default recovery path for
missed service-hook deliveries. It requires Vercel's
`Authorization: Bearer <CRON_SECRET>` convention, a read-only Sentry issues API
token, the Sentry organization and project slugs, and the same Asana delivery
configuration as the webhook. Each run reads one bounded page of unresolved
issues for the configured environment, normalizes the same technical metadata,
and sends it through the existing issue-ID deduplication path.

The route returns aggregate counts only and fails closed when its credentials,
configuration, provider response, or Asana delivery is invalid. It does not
retain a Sentry response or place exception messages, visitor content, request
bodies, credentials, or private Jolene data in Asana.

No `vercel.json` schedule is committed yet. A production cron would create
recurring provider invocations, so Carl must approve the schedule and cost
before activation. Start with one off-peak daily production run; preview cron
jobs do not execute automatically.

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
Run `pnpm check:sentry-reconciliation` whenever the Sentry issues query,
cron authorization, missed-delivery mapping, or reconciliation limits change.

## Trust and data flow

```text
portfolio browser ──technical exception──▶ Sentry browser project
portfolio Worker  ──technical exception──▶ Sentry Worker project
                                              │
                                   sanitized alert transition
                                              ▼
Sentry service hook ──HMAC POST──▶ /api/ops/sentry ──least privilege──▶ Asana PORT-INC
                                                                          │
                                                            paused Codex heartbeat
                                                                          ▼
                                                              branch + test + PR
Sentry issues API ──bounded read──▶ /api/cron/sentry-reconcile ────────────┘
```

The intake has no route to Obsidian, private Jolene, private SQLite, durable
memory, Slack, contact submissions, job descriptions, or portfolio evidence
bodies. Asana is the durable issue-ID and transition ledger. The deployed site
does not retain raw webhook bodies or full Sentry events.

## Severity and response expectations

| Severity | Condition | Owner action | Automation boundary |
| --- | --- | --- | --- |
| P0 | Confirmed private-data exposure, active credential compromise, destructive behavior, or broad production outage | Notify Carl immediately; disable affected intake or feature; preserve minimal evidence; begin rollback | Create/update a sanitized ticket and stop. Never investigate private data or rotate credentials autonomously. |
| P1 | New or regressed production exception affecting a route, Worker boundary, contact flow, or public Jolene control | Notify Carl promptly; reproduce; prepare rollback recommendation and scoped fix | May prepare a branch, regression test, and PR. Never merge or deploy. |
| P2 | Low-frequency technical error without privacy, security, or broad availability impact | Queue for bounded review; group duplicate evidence | May prepare a plan and PR when reproducible. Respect cooldown and concurrency limits. |

Provider alert rules should target `production` only, distinguish browser from
Worker service tags, alert on new/regressed issues, and add a sustained-rate
rule after a real traffic baseline exists. No guessed user count or fabricated
impact estimate belongs in notifications. After-hours P0 notification requires
an owner-approved destination; P1/P2 can wait for the next bounded review.

## Alert-to-ticket transition rules

| Sentry transition | Asana behavior |
| --- | --- |
| First open event | Create one incomplete `PORT-INC` task in In progress. |
| Identical delivery | Return success without a second task or comment. |
| Changed frequency, route, release, or severity | Replace only the machine-managed intake block and preserve human remediation notes. |
| Regression or reopen | Reopen the same task, move it to In progress, and add a sanitized transition comment. |
| Sentry resolution | Record the state, but do not complete the task before an approved release is verified. |
| Missed open or regression hook | A bounded reconciliation run creates or updates the same issue-ID task without duplicating it. |
| Asana outage or timeout | Return a retryable failure; do not acknowledge a delivery that was not durably recorded. |

Task names never include exception messages. Task notes allow only issue ID and
provider URL, severity, state, service, environment, release, route path,
frequency, and first/last-seen timestamps. Query strings and URL fragments are
removed. A normalized delivery fingerprint makes replays idempotent.

## Agent remediation playbook

The installed `Portfolio Sentry incident triage` heartbeat remains paused until
provider intake is validated. When Carl activates it, one run must:

1. Select at most one incomplete `PORT-INC` task that is not already claimed.
2. Record severity, scope, reproduction status, privacy/security implications,
   rollback need, dedicated worktree, and branch before changing code.
3. Stop and notify Carl for P0, uncertain ownership, destructive changes,
   credential work, private-data access, or repeated reproduction failure.
4. Reproduce against sanitized technical evidence. Never copy a raw Sentry
   payload, visitor content, private Jolene context, or credentials locally.
5. Add a regression test, implement the smallest scoped correction, and run
   checks proportional to the affected boundary.
6. Open a PR linked to the Asana incident and Sentry issue. Record verification
   and remaining risk in Asana.
7. Stop. The agent cannot merge, deploy, suppress alerts, resolve Sentry, or
   complete the incident.
8. After Carl approves deployment, verify the exact release in production and
   Sentry before the incident is completed.

Concurrency is one incident, one worktree, and one PR per heartbeat. Repeated
failure, missing evidence, or exhausted time/cost limits ends the run safely and
leaves a human-readable blocker. Pausing the heartbeat is the automation kill
switch; disabling the signed intake is the ticket-creation kill switch.

## Evidence matrix

Evidence date: 2026-08-27.

| Scenario | Automated evidence available | Provider evidence still required |
| --- | --- | --- |
| Browser exception | SDK initialization and fail-closed browser network test | Deliberate production event reaches the browser project and is scrubbed. |
| Worker exception | Cloudflare SDK wrapper and build/runtime tests | Deliberate Worker event reaches the correct project and release. |
| Duplicate delivery | Deterministic intake test creates one task and deduplicates replay | Real Sentry retry produces one Asana task. |
| Missed webhook | Deterministic reconciliation reads a bounded unresolved-issue page and reuses the existing task deduplication path | An approved production cron finds a deliberately missed issue without creating a duplicate task. |
| Regression | Deterministic intake test reopens/updates the same task | A resolved Sentry issue regresses and reaches the approved destination. |
| Resolution | Deterministic test records resolution without premature completion | Provider transition arrives and remains incomplete until deployed verification. |
| Sensitive synthetic payload | Scrubbing and intake tests exclude every seeded secret | Inspect an actual Sentry event, notification, and Asana task. |
| Missing source map | Ordinary public build rejects maps and upload config fails closed | Authenticated build uploads maps and a minified error de-minifies. |
| Bad signature, replay, oversize body | HMAC, idempotency, media-type, method, body-size, and timeout tests | Real service-hook signature and retry semantics match the configured project. |
| Asana outage | Fake upstream failure returns a retryable 502 | Controlled provider retry after a temporary Asana failure. |
| Sentry outage or quota exhaustion | Telemetry fails open for the visitor; application behavior remains intact | Provider notification/usage controls and owner response are exercised. |
| Agent reproduction failure | Guardrail and escalation procedure documented | Activated heartbeat demonstrates bounded stop and human escalation. |

Automated fixtures are not substitutes for real provider evidence. Attach the
Sentry issue/event URL, exact release, sanitized Asana task, and dated result to
PORT-OBS-008 for every provider scenario. Never attach screenshots containing
credentials, visitor data, messages, stack-frame local paths, or raw payloads.

## Activation sequence

1. Carl confirms the Sentry organization, billing owner, retention, quota, and
   owner-only notification destination.
2. Create separate browser and Worker projects unless a reviewed provider plan
   proves one project preserves ownership and alert clarity.
3. Store DSNs in Sites and the CI token only in the approved release secret
   store. Store the service-hook secret and least-privilege Asana token only in
   server runtime secrets.
4. Enable provider-side IP removal and data scrubbing before the first test.
5. Run `pnpm build:sentry` for the exact release and confirm no source map is
   retrievable from a public URL.
6. Enable exception transmission for a private verification release and inspect
   deliberate browser and Worker events.
7. Create new/regressed and sustained-rate alert rules, then test P0, P1,
   resolution, regression, duplicate, and retry transitions.
8. Verify sanitized Asana intake.
9. If Carl approves the recurring schedule and cost, store a read-only Sentry
   issues token and `CRON_SECRET`, enable reconciliation, and observe one bounded
   production run before committing a schedule.
10. Only after intake and reconciliation evidence are reviewed, enable and
   observe one heartbeat run.
11. Carl reviews the complete evidence packet and explicitly approves production
   activation. Monitoring readiness does not activate public Jolene.

## Monthly review

Carl or the designated owner reviews alert volume/noise, unresolved and stale
incidents, quota and spend, retention/deletion, access membership, token age,
provider-side scrubbing, false deduplication, missed deliveries, heartbeat cost,
and whether any incident exposed a new prohibited-data category. Record the
dated review in PORT-OBS-000. Rotate or disable credentials through provider
secret stores; never paste values into Asana, GitHub, Slack, or logs.

## Disable and rollback

1. Set `NEXT_PUBLIC_SENTRY_ENABLED=false` for the next browser build.
2. Remove or rotate `SENTRY_DSN` in the Worker secret store to stop server transmission.
3. Roll back the portfolio using `PRODUCTION_OPERATIONS_RUNBOOK.md` if monitoring changes affect runtime health.
4. Do not delete Sentry issues or suppress alerts until the incident record is preserved and Carl approves the action.
5. Set `SENTRY_ASANA_INTAKE_ENABLED=false` to make intake return 404 without
   affecting the public portfolio.
6. Pause `Portfolio Sentry incident triage` to stop agent remediation. This does
   not disable Sentry alert collection or alter existing incidents.

## Still required before activation

- Provision the Carl-owned Sentry project, quota, retention, and owner notification destination.
- Store DSNs and a least-privilege source-map token in the approved provider/CI secret stores.
- Add private source-map upload and verify de-minification without serving `.map` files publicly.
- Configure new/regressed issue alerts and activate the signed alert-to-Asana path.
- Run deliberate browser and Worker exceptions and inspect the resulting events for prohibited data.
