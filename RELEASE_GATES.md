# Portfolio release gates

This register is the release-readiness source of truth for the portfolio. A green build, merged pull request, local preview, or completed implementation ticket does not make the portfolio ready to publish. Public release remains blocked while any **hard** gate below is not `passed`.

Last reviewed: 2026-08-27

## Status model

- `passed` — the required evidence exists, is linked from the owning ticket, and remains current.
- `in progress` — the owner is actively producing or reviewing the required evidence.
- `blocked` — an exact prerequisite outside this ticket is not yet satisfied.
- `not started` — the gate is understood but work has not begun.
- `approval required` — implementation may be complete, but Carl has not approved the public-facing decision.
- `not applicable` — the release excludes the gated capability and its code path is demonstrably disabled.

## Hard-gate register

| Gate | Owner | Status | Evidence required to pass | Exact dependency or next decision |
| --- | --- | --- | --- | --- |
| Visual direction and visible copy | Carl | approval required | Carl's recorded approval of the running desktop and mobile experience, including typography, motion, images, project emphasis, and final copy | Complete `PORT-CONTENT-001`; unresolved copy or visual feedback keeps this gate open |
| LinkedIn recommendation provenance and publication | Carl + content | approval required | Source reconciliation, exact-text and attribution review, publication approval, and takedown path for every public record | Authenticated LinkedIn reconciliation is merged in portfolio PR #28 for all 13 received records; exact wording, context, author links, visibility, stable IDs, and correction/removal addressing are present. Carl's separate portfolio-publication approval remains open under `PORT-REC-001` |
| Production origin and professional share previews | Carl + engineering | blocked | Approved production origin plus verified canonical URLs, robots, sitemap, favicon, Open Graph/X metadata, social images, and provider previews | Carl selects the production origin; then complete `PORT-META-001` against that public origin |
| Public-approved career evidence | Carl + Jolene evidence reviewer | passed | A versioned, reviewed, content-minimized export containing only active `public_approved` evidence, with manifest version/hash and revocation behavior verified | Approved artifact: schema `1.0.0`, corpus `career:3d3b0d7361be5cfae3c634013bc48b73983388d3207d8f9b7bb1aaf50fa5c5de`, 41 public claims, zero revocations; upstream PR #31 is merged and the portfolio manifest/contract checks pass |
| Public Jolene delegate availability | Jolene engineering | blocked | A deployed, isolated public service that implements the frozen contract and consumes only the approved export | The isolated Docker delegate is implemented and verified on loopback through merged upstream PRs #29–#33; select and approve the production service route, authentication, edge controls, and deployment before this gate can pass |
| Portfolio live-Jolene integration | Portfolio engineering | passed | Adapter compatibility tests, public-service integration, safe degraded mode, and verified absence of private API, Obsidian, MCP, and durable-memory access | Merged portfolio PRs #24–#26 validate the exact reviewed loopback service, focusable citations, safe failures, and 9/9 deterministic end-to-end blockers; production remains disabled |
| Jolene security and privacy | Portfolio + Jolene engineering | in progress | Input and output limits, rate limits, cost ceilings, redaction, abuse controls, kill switch, minimized retention, and privacy review | Local BFF/delegate controls and persistent model budget are implemented and tested; production edge enforcement, secrets, telemetry, retention decisions, and privacy approval remain open |
| Jolene grounding and misuse evaluation | Portfolio + Jolene evaluation owners | in progress | Passing grounding, citation, job-fit classification, prompt-injection, privacy, abuse, and cost evaluations with explicit release thresholds | Upstream offline suite passes 41/41 cases and 24/24 blocker metrics; portfolio local suite passes 9/9. A separately authorized model run, adaptive red team, representative human review, and production evidence remain open |
| Contact-intent handoff | Carl + portfolio engineering | in progress | Consent copy, minimized payload, review-only handoff, retention behavior, abuse controls, and proof that no autonomous outbound action is possible | Local consent/review-only flow and inert staging exist, but production retention, deletion, spam handling, distributed controls, and operational approval remain open; keep disabled for release until resolved |
| Avatar taste and master-art approval | Carl | approval required | Carl approves one professional waist-up master design at the intended pixel density and mobile size | Complete `PORT-AVATAR-001` and `PORT-AVATAR-002`; previous generated concepts are rejected |
| Avatar production and accessibility | Portfolio engineering + accessibility | blocked | Approved sprite sheet/state contract, chat-state integration, keyboard and screen-reader behavior, reduced-motion alternative, mobile performance, and asset provenance review | Requires the avatar master-art approval, then `PORT-AVATAR-003` through `PORT-AVATAR-005` |
| Accessibility | Portfolio engineering + accessibility | in progress | Keyboard, focus, screen-reader, contrast, reduced-motion, zoom/reflow, touch-target, and representative physical-mobile results | Complete `PORT-QA-001`; component-level checks do not substitute for release-candidate validation |
| Performance and resilience | Portfolio engineering | in progress | Production-origin Core Web Vitals/performance results, animation and diagram budgets, degraded-state behavior, and representative mobile traces | Complete `PORT-QA-001` against the release candidate |
| Analytics and visitor privacy | Carl + portfolio engineering | not applicable | Approved event taxonomy, data minimization, consent behavior where required, retention limits, provider configuration, and proof that sensitive chat or job-description content is excluded | Privacy-safe local analytics contract is implemented, but production analytics remains disabled and is excluded from the current release profile |
| Security and container boundary | Portfolio engineering | passed | Green container build/scan, non-root read-only runtime, secret-boundary checks, dependency review, and public-surface threat review | Current `main` commit `a6d33c244912799d6141689c7d69f3b1d280c47c` run `33036961072` passed browser regression plus hardened image build, HIGH/CRITICAL scan, health, and runtime-boundary checks; rerun on any later release commit |
| Deployment configuration | Carl + portfolio engineering | approval required | Carl's explicit deployment approval, reviewed hosted configuration, production environment values, and successful release-candidate deployment | Complete `PORT-RELEASE-001`; repository maintenance never authorizes deployment |
| Rollback and kill-switch rehearsal | Portfolio engineering + Jolene engineering | not started | Tested portfolio rollback, public-Jolene kill switch, evidence revocation propagation, owner runbook, and recovery verification | Complete `PORT-LAUNCH-001` before enabling public Jolene or announcing launch |

## Release profiles

The portfolio has two distinct release profiles. Their gates must not be conflated.

### Static portfolio release

Live Jolene, contact intent, and the avatar may be `not applicable` only when their production code paths are disabled and the public site makes no claim that they are available. The static release still requires visual/copy approval, recommendation approval or omission, production metadata, accessibility, performance, security, deployment approval, and rollback evidence.

### Public Jolene release

Every gate in the register applies. Fixture responses, private local APIs, private Obsidian retrieval, private durable memory, and review-required evidence cannot satisfy a public-Jolene gate.

## Decision log

| Decision | Status | Owner | Evidence or consequence |
| --- | --- | --- | --- |
| Source repository remains private | approved | Carl | A visibility change requires separate explicit approval |
| Pull requests and the container workflow gate every merge | approved | Carl + engineering | See `DELIVERY_POLICY.md`; a passing local build is not a merge substitute |
| Deployment is separate from repository maintenance | approved | Carl | `PORT-RELEASE-001` remains approval-gated |
| First release may exclude live Jolene and the avatar | approved plan boundary | Carl + product | Excluded capabilities must be disabled and treated as `not applicable`, not described as ready |
| Portfolio never accesses private Jolene or Obsidian boundaries | approved architecture | Carl + engineering | Only the future reviewed public export and isolated public delegate may cross the adapter |
| Job descriptions are untrusted ephemeral input | approved architecture | Carl + engineering | No default retention; requirement assessments must be `direct`, `adjacent`, `missing`, or `unknown` with citations |
| Contact is a consented review-only handoff | approved architecture | Carl | No applying, emailing, scheduling, negotiation, or recruiter messaging on Carl's behalf |
| Dolly/Jolene avatar production waits for Carl's art approval | approved gate | Carl | No sprite implementation may convert an unapproved concept into production direction |

## Operating rules

1. The owning Asana ticket holds the detailed evidence and review history; this file records the release-level state.
2. A status change requires a dated update to this register and a link or identifier in the owning ticket.
3. Revoked, stale, superseded, or failed evidence reopens its gate.
4. A blocked ticket must name the exact dependency shown here rather than saying only that it is waiting.
5. No release note, project status, or UI copy may imply launch readiness while a required hard gate is open.
