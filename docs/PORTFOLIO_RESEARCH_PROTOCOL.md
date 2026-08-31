# Portfolio and Jolene research protocol

Status: review-ready draft. This document does not authorize recruiting participants, recording sessions, retaining visitor content, or launching public Jolene.

## Research question

Can a hiring manager quickly understand Carl's current positioning, locate credible proof, distinguish evidence from interpretation, and reach an appropriate next action without being distracted by the archive, motion, or Jolene?

The portfolio is evaluated first. Jolene is evaluated only against deterministic fixtures or an explicitly approved private preview. A passing session is not launch authorization.

## Participants and rounds

- Round A: three to five hiring managers for senior product-engineering, applied-AI, creative-technology, or technical-leadership roles.
- Round B: two to three recruiters or senior engineering/product/design peers, used to confirm fixes rather than replace hiring-manager evidence.
- Do not recruit current interviewers, people who report to Carl, or anyone whose participation could create employment pressure.
- Use participant IDs such as `HM-01`; do not put names, employers, email addresses, recordings, or profile URLs in the repository or findings.

## Consent script

Read before the session:

> I am testing the portfolio, not you. The session should take about 25 minutes. Please think aloud and skip any question you do not want to answer. I will record only task outcomes and de-identified notes. I will not record audio, video, screen content, contact details, pasted job descriptions, or full transcripts. You may stop at any time. May I continue under those conditions?

Record only `consent: yes` or stop. A requested recording requires a separate written policy and approval; it is not covered by this protocol.

## Session setup

- Use the production portfolio or a version-pinned private preview and record the exact version and corpus version.
- Start in a fresh browser profile at the homepage. Do not preload a route or explain the navigation.
- Allow desktop or the participant's normal mobile device; record only the viewport class.
- Use one representative synthetic job description from the fixture set. A participant-provided job description is untrusted ephemeral input and must not be copied into notes, analytics, Asana, Sentry, Slack, or transcripts.
- Do not expose private Jolene, Obsidian, SQLite, private memory, internal evidence, or local paths.

## Task script

1. First impression, 120 seconds: explain what Carl does now, the level at which he works, and one thing that differentiates him.
2. Proof: find evidence supporting one current capability and identify Carl's contribution, the project's maturity, and one limitation or unknown.
3. Career arc: explain how one earlier project or role strengthens the current profile without treating the archive as the main product.
4. Evidence boundary: identify which statements are direct evidence, adjacent evidence, interpretation, or unknown.
5. Jolene fixture: ask one professional question and inspect its cited claim, evidence strength, maturity, limitation, and follow-up question.
6. Job fit fixture: compare the synthetic job description and explain at least one `direct`, `adjacent`, `missing`, and `unknown` requirement where present.
7. Next action: find the resume and contact path, then describe what would make reaching out feel appropriate or inappropriate.

The facilitator does not rescue navigation, explain terminology, or defend the design. If a participant is blocked for 30 seconds, record the block, reveal the smallest next step, and mark the task unsuccessful.

## Measures and release thresholds

The confirmation round must meet all blocking thresholds:

| Measure | Threshold | Blocking failure |
| --- | ---: | --- |
| Current positioning | At least 80% state a defensible current role/level within 120 seconds | Carl is framed primarily as a historical designer, generalist, or unsupported AI expert |
| Evidence discovery | At least 90% locate one relevant evidence item without facilitator help | Evidence cannot be found or Carl's contribution is misattributed |
| Evidence interpretation | At least 80% distinguish direct, adjacent, missing, and unknown | Inference is repeated as fact or limitations disappear |
| Career arc | At least 80% connect earlier work to current character/capability | Archive overwhelms current work or feels like an unrelated gallery |
| Jolene citation use | 100% of tested answers expose a working citation and limitation | Unsupported claim, broken citation, private content, or blanket fit conclusion |
| Job-fit boundary | 100% preserve requirement-level classifications | Any fabricated qualification or unsupported overall recommendation |
| Resume/contact | At least 90% reach both without confusion | Contact implies Jolene can apply, negotiate, schedule, or message on Carl's behalf |
| Accessibility and motion | No participant is blocked by keyboard, zoom, reduced motion, contrast, or animation | Content or control becomes unavailable |

Any privacy, security, private-data, fabricated-claim, broken-citation, or autonomous-contact failure is P0 and blocks launch regardless of averages. A repeated navigation/content failure is P1. Cosmetic preference is P2 unless it prevents comprehension or action.

## Observation record

Create one local, temporary record per participant from `research-session-record.v1.json`. Permitted fields are participant ID, audience class, round, viewport class, version identifiers, consent boolean, task outcome enums, timings rounded to whole seconds, issue category/severity, short de-identified observation, and ticket IDs.

Do not store names, employers, handles, contact data, IP addresses, user agents, audio/video, screenshots containing personal data, raw prompts, job-description text, full transcripts, private URLs, or Sentry event payloads. Delete working notes after the de-identified finding and reproducible ticket are accepted, and no later than seven days after the session.

## Finding taxonomy

- `content`: positioning, terminology, unsupported or unclear claims.
- `ia`: navigation, hierarchy, wayfinding, evidence discovery.
- `visual-motion`: legibility, hierarchy, animation, responsive behavior.
- `evidence`: citation, maturity, contribution, limitation, provenance.
- `jolene`: answer structure, classification, refusal, follow-up, degraded state.
- `privacy-security`: collection, leakage, injection, retention, contact boundaries.

Material findings become reproducible Asana tickets with the version, route, task number, expected behavior, observed behavior, category, severity, and de-identified evidence. Never paste participant content into the ticket.

## Decision boundary

Carl reviews the round summary and approves, rejects, or requests changes. The facilitator may recommend a decision but cannot approve the research protocol, rights, public Jolene enablement, or portfolio launch. Passing automated checks proves only that the protocol remains internally consistent and privacy-minimized.
