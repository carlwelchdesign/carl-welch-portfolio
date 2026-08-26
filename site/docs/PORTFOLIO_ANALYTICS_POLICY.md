# Portfolio analytics policy

Status: engineering and privacy-review baseline. Production analytics is disabled and is not a launch requirement. Carl has not approved a production provider or activation.

## Decision questions

The minimum useful measurement is intentionally narrow:

1. Do visitors navigate from the overview into work, capabilities, experience, recommendations, or contact?
2. Do visitors reveal professional evidence or follow a Jolene citation back to the portfolio?
3. Do visitors reach the résumé, professional profiles, email, or the Jolene launcher?
4. Do Jolene operations return a supported result, no evidence, an error, or an unavailable state?

The system cannot answer who a visitor is, what they typed, which job they are considering, or what a transcript contained.

## Approved event dictionary

| Event | Product area | Approved properties |
| --- | --- | --- |
| `portfolio_navigation` | Portfolio | `destination`: home, work, capabilities, experience, recommendations, contact, project |
| `evidence_reveal` | Portfolio | `surface`: portfolio |
| `resume_download` | Portfolio | `location`: home, contact, footer, other |
| `outbound_contact` | Portfolio | `channel`: email, LinkedIn, GitHub; `location`: header, contact, footer, other |
| `jolene_open` | Jolene | `source`: launcher |
| `jolene_response` | Jolene | `operation`: answer, job fit, contact intent; `state`: success, no evidence, error, unavailable |
| `jolene_citation_followthrough` | Jolene | `destination`: portfolio |

The runtime parser rejects unknown events, missing properties, extra properties, and values outside these enums. It never accepts URLs, query strings, referrers, evidence IDs, visitor/session identifiers, transcripts, pasted job descriptions, contact form content, credentials, or arbitrary text.

## Aggregate metrics and interpretation

Reports must keep Portfolio and Jolene event groups separate. Useful aggregates are event totals and coarse rates such as evidence reveals per work navigation, résumé/contact actions per visit, Jolene opens per visit, supported/no-evidence/error response proportions, and citation follow-through per supported Jolene response.

No event contains a visitor or session identifier, so this baseline cannot create per-person funnels or reliably deduplicate a visit across tabs. That limitation is preferable to quietly adding identity. Any future proposal for anonymous session measurement requires a separate privacy review and Carl's approval.

## Consent, privacy signals, and minimization

Production collection remains off until Carl approves a provider, final event list, disclosure/consent approach, and deployment. The client honors browser Do Not Track (`DNT: 1`) and Global Privacy Control by suppressing events. Analytics must not be used to infer sensitive traits or enrich visitor profiles.

## Retention, deletion, and access

The current development verifier is memory-only: it uses no network, cookies, local storage, or durable database and disappears on reload. Therefore there is no retained development dataset to access or delete.

Before production activation, the provider review must define a short aggregate retention window, named access roles, deletion procedure, export controls, and incident response. Raw event retention beyond the minimum reporting need is prohibited. Production and preview/development datasets must be isolated.

## Environment separation and verification

Default and production behavior is disabled. Developers may set `NEXT_PUBLIC_PORTFOLIO_ANALYTICS_MODE=development` to render an on-page aggregate verifier. Development events use an in-memory browser custom event only and cannot pollute a production provider.

Automated checks compile the contract, exercise every approved event, confirm Portfolio/Jolene category separation, honor privacy signals, and reject prohibited payload fields. Query strings and request payloads are never accepted by the contract rather than being collected and redacted later.

## Production activation gates

Production analytics requires a separate reviewed change covering:

- Carl's approval of the decision questions, event dictionary, and disclosure/consent approach;
- provider security, data-processing terms, region, retention, deletion, and role-based access;
- environment-specific credentials and dataset isolation;
- a production transport with failure isolation and no content-derived fields;
- browser verification of DNT/GPC and a documented kill switch;
- an owner-readable dashboard that visibly separates Portfolio and Jolene metrics.

Until those gates pass, this foundation remains disabled and analytics is not a launch blocker.
