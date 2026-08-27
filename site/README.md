# Carl Welch Portfolio

Motion-led portfolio site for Carl Welch. The application is intentionally kept local until content, recommendation publication, domain, and deployment are approved.

## Development

- `pnpm dev` starts the local site.
- `pnpm check` runs lint, content-integrity checks, the public Jolene contract checks, and the production build.
- `pnpm check:jolene-contract` compiles and exercises the frozen public Jolene v1 contract, deterministic fixtures, runtime validation, citation integrity, and failure states.
- `pnpm check:jolene-bff` exercises the disabled-by-default same-origin BFF, request/response gates, admission budgets, kill switches, safe retries, and sanitized observability.
- `pnpm check:analytics` verifies the closed analytics event dictionary, prohibited-field rejection, privacy signals, product-area separation, and disabled default.
- `pnpm check:editorial` verifies that the internal messaging brief retains its claim states and privacy boundary, rejected slogans remain absent from public application copy, and recommendation publication is not overstated.
- `pnpm check:release-readiness` verifies that the recorded public-corpus manifest, architecture status, release-gate register, and local-only/public-disabled boundaries remain internally consistent.
- `pnpm check:github` compares the checked-in public-repository snapshot with Carl's current public GitHub repositories.
- `pnpm check:github-sync` tests deterministic GitHub drift review, stable rename detection, stale-source rejection, protected editorial fields, media failures, and explicit decisions.
- `pnpm sync:github` prints a read-only Markdown review of current GitHub drift. It never changes portfolio content by default.
- `pnpm check:routes` checks the running local site's page structure, metadata, indexing gates, sitemap, archive images, and résumé response.

The application requires Node.js 22.13 or newer.

Repository changes follow the pull-request, verification, secret-boundary, and deployment-approval rules in [`DELIVERY_POLICY.md`](../DELIVERY_POLICY.md).

The Jolene topology, trust boundaries, observability policy, failure ownership, and MCP/RAG/graph decisions are documented in [`PUBLIC_JOLENE_DEPLOYMENT_ARCHITECTURE.md`](../PUBLIC_JOLENE_DEPLOYMENT_ARCHITECTURE.md). The local integration is implemented and verified; deployment and public enablement remain approval-gated.

## Docker development and CI

`docker compose up --build` creates a reproducible production-mode container at `http://localhost:3000`. The image builds with Node 22, runs as the unprivileged `node` user, exposes a health check, and contains only the standalone Vinext output. Compose additionally uses a read-only root filesystem, a bounded temporary filesystem, no Linux capabilities, and no-new-privileges.

The Docker build context excludes local environments, dependencies, generated output, Git history, and deployment state. Public build-time values such as `NEXT_PUBLIC_SITE_URL` may be supplied to Compose; secrets must never use a `NEXT_PUBLIC_` variable or Docker build argument. After the container is healthy, `pnpm check:container` verifies the home page, manifest, résumé, and the default-disabled Jolene gate.

## Error monitoring

Sentry browser and Cloudflare Worker SDKs are installed but disabled unless explicitly configured. The browser DSN is the only Sentry value permitted in a `NEXT_PUBLIC_` build argument; Worker DSNs and release/source-map credentials belong only in provider or CI secret stores. Session Replay, tracing, visitor identity, and professional-context capture are off, and the shared pre-transport scrubber is covered by `pnpm check:sentry-privacy`. Provisioning, source maps, alerts, and production activation remain separate provider gates documented in [`docs/SENTRY_OPERATIONS_RUNBOOK.md`](docs/SENTRY_OPERATIONS_RUNBOOK.md).

Docker is a reproducibility and CI path. Sites/Cloudflare remains the intended publication path, and running Compose does not deploy or publish the portfolio.

## Content boundaries

The internal [`PORTFOLIO_MESSAGING_BRIEF.md`](docs/PORTFOLIO_MESSAGING_BRIEF.md) records the audience hierarchy, evidence-backed positioning, proof order, tone rules, historical-claim matrix, and page-level messaging decisions awaiting Carl's review. It is an editorial planning artifact, not approved public copy.

The [`PORTFOLIO_ARCHIVE_INVENTORY.md`](docs/PORTFOLIO_ARCHIVE_INVENTORY.md) and machine-readable [`archive-candidates.v1.json`](docs/archive-candidates.v1.json) manifest record the complete reviewed archive Carl approved for display on August 27, 2026: twelve historical project records and nineteen selected images, with exact asset fingerprints, bounded contribution wording, captions, and prohibited inferences. Run `pnpm check:archive` to verify every record and public asset hash.

The internal [`PORTFOLIO_LEGACY_ASSET_RECOVERY.md`](docs/PORTFOLIO_LEGACY_ASSET_RECOVERY.md) and [`legacy-asset-recovery.v1.json`](docs/legacy-asset-recovery.v1.json) record stronger-source searches, unresolved resolution gaps, and a do-not-execute boundary for legacy SWF/FLV material. Run `pnpm check:archive-recovery` to verify the recovery and quarantine decisions.

The internal [`PORTFOLIO_RELEASE_DECISION_PACKET.md`](docs/PORTFOLIO_RELEASE_DECISION_PACKET.md) and [`release-decisions.v1.json`](docs/release-decisions.v1.json) consolidate the remaining Carl-owned choices and later release-candidate authorization into one response format. Run `pnpm check:release-decisions` to verify that recommendations remain pending, every owning gate is represented, and fixed privacy boundaries cannot be presented as choices.

- `app/portfolio-data.ts` contains the detailed case studies and verified experience summaries.
- `app/capabilities-data.ts` maps capability claims to case studies, repositories, experience, and attributed recommendations. Content checks prevent broken evidence references.
- `app/contact-data.ts` contains the résumé-verified public contact routes used by the header, footer, and contact page.
- `app/github-projects.ts` contains the curated public GitHub archive snapshot. Repository descriptions and verified live links remain hand-reviewed; a live check reports repository-list, language, URL, and update-date drift but does not overwrite copy.
- `app/recommendations-data.ts` contains all 13 received recommendations reconciled against Carl’s authenticated LinkedIn profile on August 26, 2026. Stable source IDs, author links, observed visibility, and the reconciliation timestamp are retained. The route remains excluded from search until Carl separately approves portfolio publication.
- `public/github/` contains local copies of GitHub preview imagery so the archive does not depend on GitHub's image rate limits at runtime.
- `public/archive/` contains the nineteen approved historical-work images or derivatives used by the twelve archive records; unrelated legacy files remain outside the site.

### Reviewed GitHub content sync

The GitHub sync has a deliberately narrow trust boundary. GitHub may propose changes only to observed repository identity, name, language, URL, update timestamp, and local archive-image health. It cannot propose or alter descriptions, live product links, topics, project maturity, ownership, evidence strength, or public approval.

1. Run `pnpm sync:github` for a deterministic, readable dry run.
2. Freeze the exact review with `pnpm sync:github -- --write-review <new-review.json>`. The output path must not already exist.
3. Create a decision document with `schemaVersion: 1`, the review's exact `reviewHash`, a named `reviewer`, and one `accept` or `reject` decision for every `changeId`. Missing, duplicate, stale, or unknown decisions fail closed.
4. Apply only reviewed metadata with `pnpm sync:github -- --review <review.json> --apply <decisions.json>`.
5. Run `pnpm check`, `pnpm check:routes`, and review the resulting source diff before merging.

Accepted additions, removals, renames, and broken assets are reported as requiring editorial review; they are not automatically published, unpublished, renamed, or replaced. An apply records the source timestamp, named reviewer, and incremented applied version only when a safe metadata field actually changes. Publication remains a separate approval gate.

## Public Jolene development boundary

The files under `app/jolene/` define the frozen public v1 contract, runtime validation, a narrow portfolio-side adapter, deterministic development fixtures, and a disabled-by-default same-origin BFF. Explicit local integration can call the isolated public Jolene delegate on `127.0.0.1:8431`; the browser never receives that origin or an upstream credential. No public delegate URL is deployed or implied.

The frozen portfolio-consumer wire contract and privacy/identifier semantics are reviewable in [`contracts/public-jolene-v1.openapi.json`](contracts/public-jolene-v1.openapi.json) and [`contracts/README.md`](contracts/README.md). Schema version `1.0.0` deliberately omits session continuity and restricts citations to portfolio-relative links.

The locally validated reviewed manifest contains 41 public claims and zero revocations at corpus `career:3d3b0d7361be5cfae3c634013bc48b73983388d3207d8f9b7bb1aaf50fa5c5de`. This pins compatibility evidence; it is not a public service URL or deployment record.

The portfolio must never call Jolene's private API, mount or read Obsidian, access private durable memory, or invoke private MCP tools. The live adapter may consume only the reviewed, content-minimized public evidence export and isolated public delegate created by `JOL-CAREER-004` and `JOL-CAREER-005`. Those dependencies are merged and verified for local integration; production configuration remains disabled until the deployment, operations, human-review, and launch gates pass.

The contract path surface and bounds are checked against the TypeScript adapter contract in CI. The portfolio accepts additive changes within schema major version 1, rejects incompatible major versions and missing required fields, and fails closed when a response uses a stale corpus version or cites evidence revoked by the reviewed manifest. The OpenAPI document is a compatibility artifact, not evidence of a deployed service.

The same-origin route at `/api/jolene/[operation]` is the browser-to-service boundary and is disabled by default. It requires exact request and response validation, a configured reviewed corpus version, disclosure rejection, timeouts, admission limits, and global plus feature-level switches. Public environments require a server-only upstream token. Explicit local contract testing may instead opt into the exact IP loopback boundary with `JOLENE_PUBLIC_ALLOW_LOOPBACK=true`; localhost names, private-network targets, and loopback use without that flag remain rejected. The BFF fails closed when the live manifest differs from `JOLENE_PUBLIC_EXPECTED_CORPUS_VERSION`. An optional authenticated runtime control document can disable enabled features without a portfolio code release and fails closed when unavailable. The complete abuse analysis and remaining distributed/platform gates are recorded in [`docs/JOLENE_BFF_THREAT_MODEL.md`](docs/JOLENE_BFF_THREAT_MODEL.md). Implemented controls do not authorize public activation.

The bottom-right shell is disabled by default. Set `NEXT_PUBLIC_JOLENE_MODE=fixture` locally to use deterministic states selected by `NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO`: `success`, `partial_evidence`, `no_evidence`, `empty_corpus`, `unavailable`, `rate_limited`, or `version_mismatch`. Set `NEXT_PUBLIC_JOLENE_MODE=live` only with the server-side BFF switches configured; the browser then calls same-origin `/api/jolene/*` routes and receives no upstream origin or credential. Production enablement remains approval-gated.

With the isolated Jolene Compose service already running on loopback, validate the real frozen contract without staging a contact intent:

```bash
pnpm check:jolene-live
```

With a live-mode portfolio preview running, execute the precommitted end-to-end evaluation thresholds and write a privacy-safe local report:

```bash
JOLENE_EVAL_PORTFOLIO_URL=http://127.0.0.1:4182 pnpm evaluate:jolene
```

The versioned policy is in `evaluations/public-jolene-portfolio-v1.json`. Reports are written under ignored `outputs/` with owner-only permissions and retain only stable case IDs, aggregate pass/timing metrics, the public corpus version, and known limitations. The harness never creates a contact intent.

The fixture shell includes an ephemeral role-comparison view. It removes common contact, private-path, and credential-like values before comparison; rejects high-confidence disclosure instructions; clears its draft and results when the view unmounts; and renders direct, adjacent, missing, or unknown assessments without a fit score or blanket recommendation. Run `pnpm check:jolene-job-fit` for the deterministic policy and state checks.

The fixture contact-intent flow collects only name, email, optional organization, and a short message. It requires a separate review step and explicit consent before calling the fixture adapter, clears the personal fields after a successful fixture receipt, and has no persistence or outbound capability. Closing the panel also discards the in-memory draft. Production retention, deletion, distributed abuse prevention, monitoring, and live transport remain release gates; the fixture UI must not be represented as a live contact channel.

## Privacy-safe analytics boundary

Analytics is disabled by default and is not a launch requirement. `NEXT_PUBLIC_PORTFOLIO_ANALYTICS_MODE=development` enables an in-memory on-page verifier with no network or durable storage. Its closed event dictionary accepts only coarse enum values, separates Portfolio and Jolene aggregates, honors DNT/GPC, and rejects transcripts, pasted job descriptions, contact content, URLs, query strings, evidence IDs, identifiers, credentials, and arbitrary text. Production provider selection and activation require Carl's separate approval and the gates documented in [`docs/PORTFOLIO_ANALYTICS_POLICY.md`](docs/PORTFOLIO_ANALYTICS_POLICY.md).

Set `NEXT_PUBLIC_SITE_URL` to the approved production origin before publication.
