# Public Jolene portfolio BFF threat model

Status: implemented but disabled by default. This document does not authorize deployment or imply that a public Jolene service is live.

## Assets and trust boundaries

- The browser is untrusted. Questions, job descriptions, contact fields, headers, and session tokens are attacker-controlled ephemeral input.
- The portfolio BFF is the only browser-facing boundary allowed to hold the future public-service credential. Credentials use server-only runtime variables and must never use `NEXT_PUBLIC_`, build arguments, client bundles, responses, or logs.
- The upstream may only be the isolated public Jolene service. Its configured origin must be a public HTTPS origin. Fixed v1 paths prevent visitor-controlled SSRF destinations. In bearer mode, Jolene verifies the server-only credential on every `/v1/` route while leaving `/health` available to the load balancer.
- The BFF must never call Jolene's private local API, mount or query Obsidian, read private durable memory, invoke private MCP tools, or accept private filesystem/Obsidian URLs.
- The reviewed public-evidence manifest is the response truth boundary. Answer and job-fit responses must match its corpus version and cannot cite revoked evidence.

## Abuse cases and controls

| Abuse case | Portfolio control | Residual / operational requirement |
| --- | --- | --- |
| Cross-site request abuse | POST operations require an exact same-origin `Origin`; no CORS permission is emitted. | The production proxy must preserve the public request origin correctly. |
| Oversized or malformed input | Content type, declared and actual byte size, and the frozen request schema are checked before egress. | Platform request-size limits should be equal or stricter. |
| Prompt injection requesting internal instructions, credentials, private memory, filesystem paths, or Obsidian | High-confidence disclosure patterns are rejected before egress; all remaining text stays untrusted. | Pattern checks are defense-in-depth, not a claim that prompt injection is solved. Jolene's public service must maintain its own policy boundary. |
| Credential theft / SSRF | Server-only bearer credentials, upstream bearer verification, fixed endpoint paths, HTTPS public-origin validation, redirects disabled. Upstream `401` responses collapse to the BFF's non-disclosing `503 unavailable` envelope. | Provision and rotate the managed secret at both services, restrict it to the public delegate, and enforce outbound allowlisting at the deployment layer. |
| Schema drift or fabricated evidence | Strict runtime parsing, same-major schema compatibility, manifest corpus checks, revoked-evidence rejection. | Keep consumer-contract CI synchronized once the public service repository exposes its contract artifact. |
| Upstream disclosure | Responses are parsed, bounded, and rejected if they contain private paths/hosts, file or Obsidian links, likely secrets, email addresses, or phone numbers. | Provider-specific redaction and production monitoring must remain active upstream and at the platform edge. |
| Request flooding / cost exhaustion | Per-client rolling limits, a bounded client tracker with a shared overflow bucket, a process-wide daily weighted request budget, concurrency cap, timeout, and global/feature switches. | In-memory controls are per instance. A distributed rate/budget store and platform WAF are mandatory before multi-instance live activation. |
| Duplicate consequential action | POST requests are never automatically retried. Only the idempotent manifest GET retries once for transient 502/503 responses. | A future retry requires an explicit idempotency contract. |
| Sensitive logs | Structured events contain only operation, outcome, status, and duration. Raw IPs are hashed with a server-only salt for admission and never logged. Request/response bodies, tokens, session identifiers, and PII are excluded. | Production log access, retention, deletion, and alerting need owner approval. |
| Emergency shutdown | Global and per-feature runtime flags fail closed. An optional authenticated HTTPS control document can narrow or disable features immediately; malformed/unavailable control fails closed. Shutting down the upstream also makes the BFF unavailable without a portfolio code release. | Production must configure and rehearse an approved control provider. Remote control can only disable environment-enabled features, never broaden them. |

## Default and failure behavior

- `JOLENE_PUBLIC_BFF_ENABLED` defaults to disabled. Each consequential feature additionally requires its own explicit server-side enable flag.
- Missing credentials, client-hash salt, invalid origins, invalid numeric bounds, or partial remote-control configuration fail startup/request configuration closed.
- Disabled features return a generic `503 service_disabled`. Invalid client input is not forwarded. Invalid or unsafe upstream data is not partially rendered.
- The BFF returns generic error codes and a random request ID. It never returns internal exception messages or upstream payloads.

## Release gates

The code-level controls are testable before deployment, but live activation remains blocked on public HTTPS hosting, distributed rate/cost enforcement, edge/WAF configuration, managed secret provisioning and rotation, monitoring/alerts, retention/deletion approval, private-preview rehearsal, and a kill-switch rehearsal. Green local or container checks do not close those operational gates.
