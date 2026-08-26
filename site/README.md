# Carl Welch Portfolio

Motion-led portfolio site for Carl Welch. The application is intentionally kept local until content, recommendation publication, domain, and deployment are approved.

## Development

- `pnpm dev` starts the local site.
- `pnpm check` runs lint, content-integrity checks, the public Jolene contract checks, and the production build.
- `pnpm check:jolene-contract` compiles and exercises the proposed public Jolene v1 contract, deterministic fixtures, runtime validation, citation integrity, and failure states.
- `pnpm check:jolene-bff` exercises the disabled-by-default same-origin BFF, request/response gates, admission budgets, kill switches, safe retries, and sanitized observability.
- `pnpm check:analytics` verifies the closed analytics event dictionary, prohibited-field rejection, privacy signals, product-area separation, and disabled default.
- `pnpm check:github` compares the checked-in public-repository snapshot with Carl's current public GitHub repositories.
- `pnpm check:github-sync` tests deterministic GitHub drift review, stable rename detection, stale-source rejection, protected editorial fields, media failures, and explicit decisions.
- `pnpm sync:github` prints a read-only Markdown review of current GitHub drift. It never changes portfolio content by default.
- `pnpm check:routes` checks the running local site's page structure, metadata, indexing gates, sitemap, archive images, and résumé response.

The application requires Node.js 22.13 or newer.

Repository changes follow the pull-request, verification, secret-boundary, and deployment-approval rules in [`DELIVERY_POLICY.md`](../DELIVERY_POLICY.md).

## Docker development and CI

`docker compose up --build` creates a reproducible production-mode container at `http://localhost:3000`. The image builds with Node 22, runs as the unprivileged `node` user, exposes a health check, and contains only the standalone Vinext output. Compose additionally uses a read-only root filesystem, a bounded temporary filesystem, no Linux capabilities, and no-new-privileges.

The Docker build context excludes local environments, dependencies, generated output, Git history, and deployment state. Public build-time values such as `NEXT_PUBLIC_SITE_URL` may be supplied to Compose; secrets must never use a `NEXT_PUBLIC_` variable or Docker build argument. After the container is healthy, `pnpm check:container` verifies the home page, manifest, résumé, and the default-disabled Jolene gate.

Docker is a reproducibility and CI path. Sites/Cloudflare remains the intended publication path, and running Compose does not deploy or publish the portfolio.

## Content boundaries

- `app/portfolio-data.ts` contains the detailed case studies and verified experience summaries.
- `app/capabilities-data.ts` maps capability claims to case studies, repositories, experience, and attributed recommendations. Content checks prevent broken evidence references.
- `app/contact-data.ts` contains the résumé-verified public contact routes used by the header, footer, and contact page.
- `app/github-projects.ts` contains the curated public GitHub archive snapshot. Repository descriptions and verified live links remain hand-reviewed; a live check reports repository-list, language, URL, and update-date drift but does not overwrite copy.
- `app/recommendations-data.ts` contains recommendation candidates from the working LinkedIn fixture. The route remains excluded from search until it is reconciled with an official export and approved.
- `public/github/` contains local copies of GitHub preview imagery so the archive does not depend on GitHub's image rate limits at runtime.

### Reviewed GitHub content sync

The GitHub sync has a deliberately narrow trust boundary. GitHub may propose changes only to observed repository identity, name, language, URL, update timestamp, and local archive-image health. It cannot propose or alter descriptions, live product links, topics, project maturity, ownership, evidence strength, or public approval.

1. Run `pnpm sync:github` for a deterministic, readable dry run.
2. Freeze the exact review with `pnpm sync:github -- --write-review <new-review.json>`. The output path must not already exist.
3. Create a decision document with `schemaVersion: 1`, the review's exact `reviewHash`, a named `reviewer`, and one `accept` or `reject` decision for every `changeId`. Missing, duplicate, stale, or unknown decisions fail closed.
4. Apply only reviewed metadata with `pnpm sync:github -- --review <review.json> --apply <decisions.json>`.
5. Run `pnpm check`, `pnpm check:routes`, and review the resulting source diff before merging.

Accepted additions, removals, renames, and broken assets are reported as requiring editorial review; they are not automatically published, unpublished, renamed, or replaced. An apply records the source timestamp, named reviewer, and incremented applied version only when a safe metadata field actually changes. Publication remains a separate approval gate.

## Public Jolene development boundary

The files under `app/jolene/` define a proposed public v1 contract, runtime validation, a narrow portfolio-side adapter, and deterministic development fixtures. They do not call a live Jolene service and do not imply that the proposed public endpoints exist.

The machine-readable consumer contract lives at `contracts/public-jolene-v1.openapi.json`. Its path surface is checked against the TypeScript adapter contract in CI. The portfolio accepts additive changes within schema major version 1, rejects incompatible major versions and missing required fields, and fails closed when a response uses a stale corpus version or cites evidence revoked by the reviewed manifest. The OpenAPI document is a proposal and compatibility artifact, not evidence of a deployed service.

The portfolio must never call Jolene's private API, mount or read Obsidian, access private durable memory, or invoke private MCP tools. A future live adapter may consume only the reviewed, content-minimized public evidence export and public delegate created by `JOL-CAREER-004` and `JOL-CAREER-005`. Until those dependencies pass their own security and evaluation gates, UI work must remain in fixture mode.

The same-origin route at `/api/jolene/[operation]` is the future browser-to-service boundary and is disabled by default. It requires server-only credentials, exact request and response validation, manifest/corpus checks, disclosure rejection, timeouts, admission limits, and global plus feature-level switches. An optional authenticated runtime control document can disable enabled features without a portfolio code release and fails closed when unavailable. The complete abuse analysis and remaining distributed/platform gates are recorded in [`docs/JOLENE_BFF_THREAT_MODEL.md`](docs/JOLENE_BFF_THREAT_MODEL.md). Implemented controls do not authorize live activation.

The bottom-right development shell is disabled by default. Set `NEXT_PUBLIC_JOLENE_MODE=fixture` locally to enable it and choose a deterministic state with `NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO`: `success`, `partial_evidence`, `no_evidence`, `unavailable`, `rate_limited`, or `version_mismatch`. Do not enable fixture mode for the first public portfolio release.

The fixture shell includes an ephemeral role-comparison view. It removes common contact, private-path, and credential-like values before comparison; rejects high-confidence disclosure instructions; clears its draft and results when the view unmounts; and renders direct, adjacent, missing, or unknown assessments without a fit score or blanket recommendation. Run `pnpm check:jolene-job-fit` for the deterministic policy and state checks.

The fixture contact-intent flow collects only name, email, optional organization, and a short message. It requires a separate review step and explicit consent before calling the fixture adapter, clears the personal fields after a successful fixture receipt, and has no persistence or outbound capability. Closing the panel also discards the in-memory draft. Production retention, deletion, distributed abuse prevention, monitoring, and live transport remain release gates; the fixture UI must not be represented as a live contact channel.

## Privacy-safe analytics boundary

Analytics is disabled by default and is not a launch requirement. `NEXT_PUBLIC_PORTFOLIO_ANALYTICS_MODE=development` enables an in-memory on-page verifier with no network or durable storage. Its closed event dictionary accepts only coarse enum values, separates Portfolio and Jolene aggregates, honors DNT/GPC, and rejects transcripts, pasted job descriptions, contact content, URLs, query strings, evidence IDs, identifiers, credentials, and arbitrary text. Production provider selection and activation require Carl's separate approval and the gates documented in [`docs/PORTFOLIO_ANALYTICS_POLICY.md`](docs/PORTFOLIO_ANALYTICS_POLICY.md).

Set `NEXT_PUBLIC_SITE_URL` to the approved production origin before publication.
