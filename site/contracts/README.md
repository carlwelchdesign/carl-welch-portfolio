# Public Jolene contracts

`public-jolene-v1.openapi.json` is the frozen portfolio consumer contract for schema version `1.0.0`.

The portfolio remains in fixture mode. The contract does not claim that a publicly reachable Jolene service exists, authorize deployment, or permit access to private Jolene, Obsidian, private SQLite data, Slack context, durable memory, private MCP tools, or unrestricted repositories.

Version 1 deliberately omits session tokens. Questions, pasted job descriptions, and full transcripts are untrusted ephemeral inputs and are not retained by default. If continuity is added later, its token lifetime, rotation, revocation, storage, transcript policy, and personal-data behavior require a new reviewed contract version.

Public `claimId` values identify stable exported claims. Public `evidenceId` values identify the independently reviewable exported evidence records supporting those claims. Neither may encode a private database key, vault path, repository path, or private source URI.

For a claim supported by mixed project maturities, the response reports the least mature applicable citation. `not_applicable` is ignored when applicable maturity evidence exists and is returned only when every cited record is not applicable.

Citation links are site-relative in v1. The portfolio adapter resolves them against its own approved origin, which prevents a delegate response from introducing an unreviewed external destination.

`direct` and `adjacent` job-fit assessments require public evidence. `missing` and `unknown` carry no evidence IDs: absence of public evidence is never presented as evidence that Carl lacks a qualification.

Errors use a bounded, non-disclosing schema. `version_mismatch` advertises supported schema versions; retryable errors may include `retryAfterSeconds`, which the BFF maps to the HTTP `Retry-After` header. Error messages must not include submitted content, private identifiers, provider details, stack traces, or evidence excerpts.
