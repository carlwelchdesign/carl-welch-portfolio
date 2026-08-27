# Portfolio release decision packet

Status: **awaiting Carl**

Machine-readable record: [`release-decisions.v1.json`](./release-decisions.v1.json)

The engineering foundation is not the remaining ambiguity. The portfolio has a reviewed content model, hardened container path, local public-Jolene contract integration, professional metadata implementation, accessibility automation, and explicit release gates. What remains is a finite set of public-facing choices and release-candidate evidence.

Recommendations below are defaults for review, not approvals. No decision changes code, indexing, deployment, or a production feature flag until Carl explicitly approves it and the owning ticket records the evidence.

## Recommended first-release path

Ship a **static portfolio first** with current work, experience, capabilities, approved recommendations, professional metadata, and a concise About route. Keep live Jolene, contact intent, the avatar, analytics, and unapproved historical work disabled. This makes a credible portfolio releasable without pretending unfinished operations or rejected avatar art are ready.

## Decisions Carl can make now

| ID | Decision | Recommended response | Why |
| --- | --- | --- | --- |
| `PORT-DEC-001` | First release profile | `static_portfolio_first` | Separates a portfolio launch from unfinished public-Jolene and avatar gates |
| `PORT-DEC-002` | Lead title | `senior_product_engineer` | Best-supported bridge across product, systems, interface, and engineering work |
| `PORT-DEC-003` | Primary opportunity | `employment_and_selected_collaboration` | Hiring remains primary without closing the door to unusually strong collaboration |
| `PORT-DEC-004` | About route | `add_about_route` | Gives the career narrative room without turning the homepage into a biography |
| `PORT-DEC-005` | Recommendations | `publish_all_13` | All 13 received records have been reconciled; publication still needs explicit approval |
| `PORT-DEC-006` | Recommendation indexing | `index_after_publication_approval` | Makes the professional evidence discoverable only after the exact set is approved |
| `PORT-DEC-007` | Historical work | `selected_archive_after_current_work` | Adds depth without making old technology the first impression |
| `PORT-DEC-008` | First archive item | `yuco_after_rights_review` | Strongest combined artifact, contribution evidence, and team recognition |
| `PORT-DEC-009` | Teaching evidence | `text_only_after_source_recheck` | Supports mentoring without publishing classroom photographs |
| `PORT-DEC-010` | Jolene/avatar in first release | `defer_both` | Avoids coupling launch to missing service operations and unapproved art |
| `PORT-DEC-011` | Production origin | `custom_domain_to_be_supplied` | Required to verify canonical metadata and professional share cards |

## Decision that comes after the release candidate

`PORT-DEC-012` is the actual deployment authorization. It stays pending until the selected production origin is configured, the chosen copy and visuals are running, physical-device QA passes, and rollback evidence exists. A green repository does not pre-approve deployment.

## Reply template

Carl can approve the recommended path in one sentence:

> Approve `PORT-DEC-001` through `PORT-DEC-010` as recommended. Production origin for `PORT-DEC-011`: **[origin]**. Hold `PORT-DEC-012` until I review the release candidate.

Or override only the decisions that differ:

> Approve all recommended decisions except `PORT-DEC-003`: **employment_first**, and `PORT-DEC-008`: **no_archive_yet**. Production origin: **[origin]**.

## Fixed boundaries

- Production analytics remains disabled.
- The portfolio never accesses private Jolene APIs, Obsidian, MCP tools, or durable memory.
- Job descriptions remain untrusted ephemeral input.
- Contact intent cannot autonomously email, apply, schedule, negotiate, or contact recruiters.
- TASER evidence imagery and Ignite classroom photographs remain private-only unless their separate gates are cleared.
- The yU+co site and team may be described as a **2006 Webby Awards Honoree**; Carl may not be described as a personal Webby winner.

## Evidence after approval

Approval unlocks copy drafting and implementation; it does not skip verification. The resulting release candidate must still prove:

- exact copy and visual approval on desktop and a physical iPhone;
- canonical, robots, sitemap, favicon, Open Graph, X, and provider-preview behavior at the selected origin;
- keyboard, focus, screen reader, contrast, reduced motion, zoom/reflow, touch targets, and mobile performance;
- recommendation correction and takedown behavior if recommendations are published; and
- deployment configuration plus rollback rehearsal.
