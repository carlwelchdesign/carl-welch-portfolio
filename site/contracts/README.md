# Public Jolene contracts

`public-jolene-v1.openapi.json` is the frozen portfolio consumer contract for schema version `1.0.0`.

The portfolio remains in fixture mode. The contract does not claim that a publicly reachable Jolene service exists, authorize deployment, or permit access to private Jolene, Obsidian, private SQLite data, Slack context, durable memory, private MCP tools, or unrestricted repositories.

Version 1 deliberately omits session tokens. Questions, pasted job descriptions, and full transcripts are untrusted ephemeral inputs and are not retained by default. If continuity is added later, its token lifetime, rotation, revocation, storage, transcript policy, and personal-data behavior require a new reviewed contract version.

Public `claimId` values identify stable exported claims. Public `evidenceId` values identify the independently reviewable exported evidence records supporting those claims. Neither may encode a private database key, vault path, repository path, or private source URI.

For a claim supported by mixed project maturities, the response reports the least mature applicable citation. `not_applicable` is ignored when applicable maturity evidence exists and is returned only when every cited record is not applicable.

Citation links are site-relative in v1. The portfolio adapter resolves them against its own approved origin, which prevents a delegate response from introducing an unreviewed external destination.

`direct` and `adjacent` job-fit assessments require public evidence. `missing` and `unknown` carry no evidence IDs: absence of public evidence is never presented as evidence that Carl lacks a qualification.

Errors use a bounded, non-disclosing schema. `version_mismatch` advertises supported schema versions; retryable errors may include `retryAfterSeconds`, which the BFF maps to the HTTP `Retry-After` header. Error messages must not include submitted content, private identifiers, provider details, stack traces, or evidence excerpts.

## Provider compatibility and authentication evidence

The Jolene provider alignment began in [`jolene-ai` PR #29](https://github.com/carlwelchdesign/jolene-ai/pull/29). Its compatibility tests cover this contract's safe error envelope, bounds, site-relative citations, evidence-free `missing` and `unknown` assessments, omitted session continuity, and empty-corpus semantics.

[`jolene-ai` PR #63](https://github.com/carlwelchdesign/jolene-ai/pull/63) adds the matching upstream bearer verifier. When the isolated delegate uses `JOLENE_PUBLIC_AUTH_MODE=bearer`, every `/v1/` route requires the server-only bearer token already emitted by the portfolio BFF. Missing or invalid credentials receive a bounded `401`; `/health` remains unauthenticated for load-balancer checks. This is contract compatibility evidence, not proof of a deployed public service or authorization to activate live mode.

Carl approved the reviewed evidence set on 2026-08-26. The resulting public-safe manifest is pinned in [`validated-public-evidence-manifest.json`](validated-public-evidence-manifest.json): schema `1.0.0`, 41 public evidence records, zero revocations, and zero unresolved public conflicts at generation time. CI parses that manifest through the portfolio's runtime validator.

The portfolio does not copy or read Jolene's local export at runtime. The current source artifact remains an ignored, permission-restricted development artifact inside the Jolene workspace; a live portfolio integration still requires a public HTTPS delegate origin, managed secret provisioning and rotation, distributed admission controls, telemetry and alerts, retention approval, a private-preview rehearsal, and explicit activation.
