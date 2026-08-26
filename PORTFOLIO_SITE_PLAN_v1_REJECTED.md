# Carl Welch Portfolio Site — Product and Delivery Plan

> Superseded on August 25, 2026. This version contains a rejected visual direction and a deferred Jolene scope. See `PORTFOLIO_SITE_PLAN.md` for the canonical Motion-first plan.

Status: Draft for Carl's review. No implementation, deployment, or publication has been performed.

Evidence snapshot: August 25, 2026. The GitHub inventory and project status must be refreshed before launch.

## 1. Product thesis

Build a premium, evidence-backed portfolio that lets a recruiter, hiring manager, engineering leader, or collaborator answer three questions quickly:

1. What kind of product engineer is Carl?
2. What has he actually built, and how deep is the work?
3. Which evidence supports his fit for this role or project?

The portfolio must work completely without the AI assistant. “Jolene” is an optional guide that helps visitors find and interpret evidence; she is not the primary navigation and never substitutes persuasion for truth.

### Recommended positioning

> Product engineer building applied AI products, evidence-rich interactive systems, and creative software—from ambiguous product problem to working, testable system.

This is broad enough to cover Carl's frontend, platform, product, AI, creative-technology, visualization, and audio work without flattening those areas into one generic title.

### Primary audiences

- Recruiters doing a 60–90 second first scan.
- Hiring managers comparing Carl's experience to a specific role.
- Engineers evaluating architecture, implementation depth, and technical judgment.
- Product/design leaders evaluating end-to-end ownership and interaction quality.
- Potential collaborators looking for creative-technology or applied-AI capability.

### Success signals

- A first-time visitor reaches a relevant project or experience proof point within 60 seconds.
- Visitors can distinguish deployed products, active builds, prototypes, planning work, libraries, and legacy work.
- Every important claim can be traced to an approved source.
- Featured project outbound clicks, résumé downloads, contact clicks, and cited Jolene answers are measurable.
- Jolene increases exploration of project and experience pages without becoming the only path to information.

## 2. Current-state findings

- The target folder is empty and is not yet a Git repository. Treat it as a clean, new product.
- The existing `carl-welch-fit-console` already contains useful patterns: curated public-safe sources, project profiles, career Q&A, role context, redaction, event logging, rate limiting, and optional Slack notifications.
- The fit-console is narrower than this portfolio and currently leads with “Ask the resume.” Reuse its evidence and agent patterns selectively; do not clone or simply reskin the experience.
- Carl's live GitHub account currently exposes 24 public, non-fork, non-archived repositories. They range from current product work to libraries, legacy experiments, client-era code, and the profile README itself.
- The résumé source contains a complete work history, with recent experience at Yubico, Revenue.io, Bosch, Bridg, and Grindr plus earlier leadership, interactive-development, AXON, defense/VR, and Army experience.
- Existing projects have uneven image coverage. Several have polished screenshots or live deployments; others need a technical diagram, a carefully captured local screenshot, or a restrained repository cover.

## 3. Product decisions

### Decision A — New portfolio, selective reuse

Build the new site in this directory. Reuse proven content types and safety patterns from the fit-console, but give the portfolio its own information architecture, visual system, project model, and agent UI.

### Decision B — Featured work plus a complete archive

Do not render 24 equal cards. Use two layers:

- **Featured case studies:** 6–8 projects with strong evidence, visual material, and relevance to target roles.
- **All public repositories:** a searchable, filterable archive with honest status labels and compact technical summaries.

The profile README repository can appear under a “Meta” filter or be omitted from the visual project grid while still being acknowledged in the complete inventory count. This choice should be explicit in the content configuration.

### Decision C — Evidence before hype

Each claim must carry a source and a review state. The site must visibly distinguish:

- Deployed product
- Active build
- Pre-release tester build
- Working prototype
- Synthetic concept
- Planning/research repository
- Reusable library
- Legacy project

Do not infer production use, scale, customer impact, scientific validation, certification, or business outcomes from code volume, commit count, screenshots, or a deployed demo.

### Decision D — Original Jolene persona by default

Recommended direction: **Jolene is an original, fictional country-glam AI portfolio guide with her own face, wardrobe, voice, language, and visual identity.** Label her clearly as “Jolene — Carl's AI portfolio guide.”

Do not ship a Dolly Parton likeness, voice clone, signature style, quotations, lyrics, or implied endorsement without documented permission and legal review. California law protects a person's name, voice, photograph, and likeness in commercial contexts, and Tennessee specifically protects voice and likeness against AI-enabled misuse. This is a release gate, not a copy disclaimer problem.

Primary sources:

- [California Civil Code §3344](https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?article=3.&chapter=2.&division=4.&lawCode=CIV&part=1.&title=2.)
- [Tennessee ELVIS Act overview](https://www.tn.gov/governor/news/2024/3/21/photos--gov--lee-signs-elvis-act-into-law.html.html)
- [U.S. Copyright Office: AI and digital replicas](https://www.copyright.gov/AI/)

This plan is product guidance, not legal advice.

### Decision E — Positive, never fabricated

Replace “present Carl in a positive light no matter what” with this agent contract:

> Be a warm, confident, evidence-grounded advocate. Lead with the strongest relevant proof. Never invent a qualification, outcome, employer fact, project status, or endorsement. When evidence is absent, say so briefly, identify adjacent evidence if it exists, and suggest a useful interview question.

### Decision F — Public delegate, not private-Jolene access

The portfolio version of Jolene is a separate public hiring delegate. It may use
only the approved public portfolio evidence bundle and visitor-provided role
context. It must never query Carl's private Obsidian vault, private Jolene
memory, job-search records, correspondence, credentials, or unpublished local
files.

The two Jolene surfaces may share a versioned personality specification and
public evidence schema. They must not share unrestricted runtime memory. Any
visitor request that requires Carl's judgment or a personal commitment becomes
a minimized, reviewable handoff; it is never answered from private context or
acted on automatically.

## 4. Information architecture

### Global navigation

- Home
- Work
- Experience
- About
- Résumé
- Contact
- Persistent “Ask Jolene” control at bottom right

### Page and route inventory

#### `/` — Home

- Concise positioning statement and availability/contact action.
- Three capability pillars: applied AI, product/platform engineering, creative and interactive systems.
- 3–4 featured project stories with large images and specific outcomes or validation.
- Recent experience snapshot.
- “How I work” principles: evidence, human approval, product/engineering loop, honest release boundaries.
- Jolene invitation that does not block or obscure content.

#### `/work` — Project index

- Featured work first.
- Complete public-repository archive below.
- Search by project name, problem, stack, and domain.
- Filters: domain, status, year/era, language/stack, live demo available.
- Sort: featured, newest activity, oldest, alphabetical.
- Empty and no-result states with a one-click reset.

#### `/work/[slug]` — Project case study

Every project page uses a consistent evidence model:

1. One-sentence project outcome or purpose.
2. Status and claim-boundary label.
3. Hero image with meaningful alt text and source/rights record.
4. Problem and intended user.
5. Carl's role and contribution.
6. Architecture and technical stack.
7. Important product and engineering decisions.
8. Constraints, tradeoffs, and what remains unverified.
9. Validation: tests, build gates, deployment, research, or user evidence.
10. Image gallery or architecture diagram where available.
11. Relevant experience and role-fit links.
12. GitHub, live demo, documentation, and related-project links.

Short/legacy repositories may use a reduced case-study template, but they still need a technical summary and status.

#### `/experience` — Work history

- Narrative introduction connecting 20+ years of product and engineering work.
- Expanded recent roles: Yubico, Revenue.io, Bosch, Bridg, Grindr.
- Collapsible earlier experience: SapientNitro, Nezzoh Studios, Trailer Park Studios, BPG, Petrol, AXON/TASER, General Dynamics, and U.S. Army.
- Each role shows scope, selected responsibilities/outcomes, core technologies, and related public projects only where the connection is genuine.
- No confidential employer implementation details or invented metrics.

#### `/about`

- Short personal narrative, working style, creative/technical range, education, and location/work preference.
- Explain the through-line from interactive media and spatial systems to enterprise products, applied AI, visualization, and audio tools.

#### `/resume`

- One canonical public résumé download.
- A role-context explainer showing Carl's supported role families.
- Avoid displaying six competing résumé downloads on the main page. Keep alternate tailored versions private or available through specific recruiter links unless Carl chooses otherwise.

#### `/contact`

- LinkedIn, email/contact action, GitHub, and résumé.
- Optional short inquiry form only if the operational follow-up path is defined.
- Clear confirmation, failure, retry, privacy, and spam-protection states.

#### Jolene deep links

- `/ask` opens the full-page accessible chat experience.
- Query parameters may preselect a project or role context without placing sensitive text in the URL.
- Every cited answer links directly to the supporting project, experience section, or approved source excerpt.

## 5. Initial project taxonomy

The final taxonomy must be based on a fresh repository audit, but the current public inventory supports these working groups:

### Applied AI and decision support

- Earth Atlas AI / EchoAtlas
- Supraconscious Avatar AI / Inner Avatar
- Job Search OS
- Flight Tracker AI
- Wave Factory AI Production Assistant

### Creative software and ventures

- ProgressionLab AI
- Wave Factory Essentials
- Matchmaker AI / Argent
- Fruition Venture Studio

### Interactive systems and developer tools

- EMF Visualizer
- WebAuthn Core
- Netheria UI
- ReviewTrackers UI and server

### Legacy experiments and client-era repositories

- Space Invaders
- React Native Message Loader
- React Searchable List
- Cadillac
- Twitter Feed Module
- Group Actions CNI
- Primaloft
- Superman 75th Anniversary
- The Conjuring Sweepstakes

### Meta

- GitHub profile README repository

This grouping is navigation, not a claim of equal depth or current relevance.

## 6. Featured case-study recommendation

Start with these six because they provide a coherent story across AI, product systems, creative technology, and complex frontend work:

1. Job Search OS — agentic product workflows, evidence, human approvals, and operational tooling.
2. Inner Avatar — multi-app SaaS, governed retrieval, provenance, admin systems, and consent boundaries.
3. Flight Tracker AI — Rust/Next.js geospatial system, public data, explainable attention, and advisory limits.
4. ProgressionLab — deployed AI-assisted creative product with rich interaction and export workflows.
5. Wave Factory Essentials — C++ audio plug-ins, DSP/product UI, host formats, and release-gate discipline.
6. EMF Visualizer — technical 3D interaction and simulation-oriented product design.

Candidate seventh and eighth slots:

- EchoAtlas when its current workbench and evidence can be presented without overstating satellite-analysis validity.
- WebAuthn Core for a compact platform/library case study.
- Argent only when it is prominently labeled as a synthetic, human-led concept.

Carl approves the final featured list and ordering before implementation copy is considered final.

## 7. Project content model

Use a curated content layer rather than presenting raw GitHub metadata as portfolio truth.

```ts
type ProjectStatus =
  | "deployed"
  | "active-build"
  | "pre-release"
  | "prototype"
  | "synthetic-concept"
  | "planning"
  | "library"
  | "legacy";

interface ProjectRecord {
  slug: string;
  repo: string;
  title: string;
  shortDescription: string;
  technicalDescription: string;
  status: ProjectStatus;
  featured: boolean;
  domains: string[];
  stack: string[];
  carlContribution: string[];
  decisions: string[];
  constraints: string[];
  validation: string[];
  evidenceSourceIds: string[];
  links: { label: string; url: string }[];
  media: MediaRecord[];
  lastReviewedAt: string;
  publicReviewState: "draft" | "approved" | "hidden";
}

interface MediaRecord {
  kind: "screenshot" | "diagram" | "photo" | "generated-cover" | "gif";
  src: string;
  alt: string;
  caption?: string;
  source: string;
  rightsStatus: "owned" | "licensed" | "approved-repo-asset" | "review-required";
  isRepresentativeUI: boolean;
}
```

### Source precedence

1. Carl-approved résumé and employment content.
2. Current repository files, tests, documentation, release artifacts, and deployed product behavior.
3. GitHub API metadata.
4. Carl-confirmed context.
5. Generated editorial description, only after evidence review.

GitHub activity, primary language, topics, and links can sync automatically into a draft. Technical conclusions, project status, contributions, outcomes, and public copy require review.

## 8. Image and media plan

### Image hierarchy

1. Real product screenshot from a live, verified deployment.
2. Repository-owned screenshot or GIF that accurately represents the current project.
3. Screenshot captured locally from a verified build.
4. Original architecture diagram derived from verified code and documentation.
5. Restrained generated editorial cover, clearly marked as illustrative and never presented as product UI.
6. GitHub Open Graph image only as a temporary fallback.

### Current image opportunities

- Strong repository assets already exist for Flight Tracker, Wave Factory Essentials, Fruition, Job Search OS, Netheria UI, and ReviewTrackers.
- EMF Visualizer has a repository-hosted screenshot and a live deployment.
- ProgressionLab and Inner Avatar have live URLs suitable for controlled screenshot capture after verification.
- WebAuthn Core is better served by a small architecture/adapter diagram than a fake UI.
- Legacy client-era repositories need an ownership and trademark review before logos, movie artwork, or client assets are republished.

### Media production checklist

- Capture desktop and mobile views at consistent aspect ratios.
- Remove secrets, personal data, customer data, and unstable test content.
- Verify the screenshot still represents the current build.
- Record source, capture date, rights status, and alt text.
- Produce AVIF/WebP derivatives and preserve the approved original.
- Avoid decorative image generation where a real artifact or clear diagram is more credible.

## 9. Visual and interaction direction

### Experience thesis

The site should feel like a premium editorial product dossier: confident, technically serious, visually rich, and easy to scan. Use a restrained dark graphite foundation, warm ivory text, a controlled teal system accent, and a subtle warm country-inspired accent reserved for Jolene and high-value calls to action.

### Design principles

- Large project imagery and editorial typography instead of a wall of tiny cards.
- Strong grid, spacing, and hierarchy; very little non-functional ornament.
- No badge wall, contribution-stat theater, visitor counter, neon/cyberpunk styling, or generic “AI” visual effects.
- Tech tags remain secondary to problems, decisions, proof, and outcomes.
- Responsive layout works from 320px through wide desktop without hiding core evidence.
- Hover states always have keyboard/focus and touch equivalents.

### Motion grammar

- **Resting:** Jolene portrait is composed and still or uses an extremely subtle, nonessential presence cue.
- **Attentive:** clear focus ring and one short acknowledgment transition.
- **Thinking:** restrained progress indicator; never simulated typing designed to waste time.
- **Answer ready:** content enters once, with citations immediately visible.
- **Error/unavailable:** calm static state with retry and non-AI navigation alternatives.
- **Reduced motion:** all states remain understandable with no continuous animation.

Continuous animation pauses when hidden or offscreen and never tracks the cursor as if watching the visitor.

## 10. Jolene product specification

### Role and automation level

- Level: recommendation/explanation only.
- Can: answer questions, compare evidence to a pasted role, recommend projects, explain experience, suggest interview topics, and link to proof.
- Cannot: directly contact Carl or initiate outbound communication, apply to
  jobs, submit forms, make commitments, reveal private information, speculate
  about protected or sensitive traits, or invent facts.
- May: accept a visitor's optional contact request and create a minimized,
  reviewable lead for Carl when a privacy notice, retention rule, abuse controls,
  and an operator-owned follow-up path are in place.
- Must not: promise that Carl will respond, negotiate compensation, state work
  authorization or availability, schedule an interview, or send an outbound
  message on Carl's behalf.

### Entry points

- Bottom-right desktop button showing the original Jolene portrait and “Ask Jolene.”
- Mobile floating button that opens a full-height bottom sheet or `/ask` page.
- Contextual “Ask Jolene about this project” actions on case studies.
- Suggested questions on first open.

### Required UI states

- Collapsed, hover, keyboard focus, and notification-free resting state.
- First-open introduction and AI disclosure.
- Default, loading, streaming/answering, success, no-evidence, partial-evidence, error, rate-limited, offline, and abuse-blocked states.
- New conversation, clear conversation, copy answer, report a problem, and open source controls.
- Mobile keyboard handling, focus trap, close button, Escape behavior, and return-focus behavior.

### Grounding and answer shape

Every substantive answer returns structured data:

```ts
interface JoleneAnswer {
  answer: string;
  claims: {
    text: string;
    sourceIds: string[];
    evidenceStrength: "direct" | "adjacent" | "limited";
  }[];
  recommendedProjectSlugs: string[];
  suggestedFollowUps: string[];
  insufficientEvidence: string[];
}
```

Display human-readable citations such as “Flight Tracker — architecture” or “Yubico — approved résumé,” never local paths or internal IDs.

### Answer policy

- Lead with relevant strengths and direct evidence.
- Clearly label adjacent experience and unsupported requirements.
- Do not convert a prototype into production experience.
- Do not convert a plan into an implementation.
- Do not imply employer endorsement, customer impact, certification, or scientific validation without evidence.
- Never reveal private repository content, secrets, local paths, raw analytics, visitor transcripts, or confidential employer details.
- If asked an adversarial or negative question, answer calmly and factually, then point to the strongest relevant evidence or a useful interview question.

### Privacy default

- Do not persist raw questions, pasted job descriptions, IP addresses, or full transcripts by default.
- Log aggregate events and operational errors only.
- If transcript retention is later requested, add explicit consent, a retention period, deletion behavior, redaction, and an owner-access audit trail before enabling it.
- Keep Slack as an optional redacted notification transport, not the system of record.

### Evaluation set before launch

Build at least 40 fixture questions across:

- Supported qualifications.
- Adjacent-but-not-direct qualifications.
- Missing qualifications.
- Project status and deployment boundaries.
- Employer confidentiality.
- Attempts to obtain private data or system prompts.
- Attempts to make Jolene fabricate or exaggerate.
- Hostile, biased, or irrelevant prompts.
- Questions with conflicting or stale source material.
- Mobile and slow-network recovery.

Launch only when required claims cite valid public sources, unsupported claims are not introduced, private material is never returned, and the fallback experience remains useful when the model is unavailable.

## 11. Proposed technical architecture

### Frontend

- Next.js App Router and TypeScript.
- Server-rendered editorial pages for performance, SEO, and shareability.
- Component system with documented tokens and reusable content/status patterns.
- `next/image` or equivalent image pipeline with explicit dimensions and responsive sources.
- Accessible dialog/bottom-sheet primitives for Jolene.

The exact UI library should be chosen during implementation after assessing reuse from the MUI fit-console against bundle, styling, and visual-system needs.

### Content and ingestion

- MDX or typed content files for project case studies and experience.
- A build-time GitHub sync script reads public metadata and writes a reviewable draft snapshot.
- Runtime pages read approved content only; a GitHub API outage cannot break the portfolio.
- Schema validation rejects missing status, evidence, media rights, alt text, review date, or public approval.
- A content freshness report identifies changed repositories without auto-publishing copy.
- Register this directory as a watched project in private Jolene using a
  read-only adapter. The adapter may report branch/revision when Git exists,
  changed approved content, stale `lastReviewedAt` values, broken validation,
  and the latest verified build result. It may not edit, commit, deploy, or
  publish the portfolio.
- Do not schedule repository monitoring until Carl approves its cadence, cost
  ceiling, notification destination, and stop condition.

### AI service

- Server-only model calls; no API key reaches the browser.
- Retrieval over the approved public content corpus, with source IDs preserved through generation.
- Deterministic response validation and citation checks after model output.
- Rate limiting, input-size limits, timeout, retry policy, and a useful non-model fallback.
- Prompt and model versions logged without storing sensitive visitor content.
- Feature flag and kill switch to disable Jolene while leaving the portfolio intact.

### Deployment and operations

- Recommended initial target: Vercel or an equivalent Next.js-capable host.
- Preview deployments for content/design review.
- Production environment separates analytics, model, rate-limit, and optional contact/Slack credentials.
- Error monitoring covers page failures, broken links, image failures, model errors, and citation-validation failures.
- No public deployment until Carl approves the copy, featured work, images, résumé, Jolene identity, and privacy behavior.

## 12. Accessibility, SEO, and performance requirements

### Accessibility

- Target WCAG 2.2 AA.
- Complete keyboard operation, visible focus, logical headings, landmarks, skip link, and 44px touch targets.
- Meaningful alt text; decorative media is hidden from assistive technology.
- Jolene answers use a polite live region without repeatedly announcing streaming fragments.
- Color is never the only indicator of project status or evidence strength.
- `prefers-reduced-motion` receives a composed static experience.
- Test with VoiceOver on macOS/iOS plus automated accessibility checks.

### SEO and sharing

- Unique title, description, canonical URL, and Open Graph image per case study.
- Sitemap and robots policy.
- `Person`, `CreativeWork`, and appropriate software/project structured data where factually supported.
- Human-readable URLs and crawlable server-rendered project copy.
- No indexable chat transcripts or pasted job descriptions.

### Performance budgets

- Pass Core Web Vitals on representative mobile hardware.
- No chat/model code in the critical rendering path before the visitor opens Jolene.
- Reserve image dimensions to avoid layout shift.
- Lazy-load noncritical galleries and the Jolene portrait.
- Pause hidden motion and cap image, JavaScript, font, and third-party script budgets.

## 13. Analytics plan

Collect only what is needed to improve the portfolio:

- Landing view and navigation destination.
- Project search/filter usage and no-result rate.
- Project case-study open and external GitHub/live-demo click.
- Résumé download and contact click.
- Jolene open, suggested-question use, question submitted, answer with citations, source opened, helpful/not-helpful, error, and close.

Do not send raw questions, job descriptions, contact messages, or transcripts to general analytics. Define event names, allowed properties, retention, owner, and deletion behavior before launch.

## 14. Delivery phases

### Phase 0 — Decisions and evidence audit

- Approve the product thesis and primary audience.
- Decide the Jolene identity: original persona recommended; celebrity likeness blocked pending permission/legal review.
- Choose the six featured case studies.
- Select the canonical public résumé.
- Refresh all 24 public repositories and create the initial status/rights/evidence inventory.
- Audit legacy/client-era repositories for confidentiality, trademarks, asset ownership, and safe public copy.

Exit criteria: every public repository has an owner-approved visibility choice and draft status; every featured project has enough evidence for a real case study.

### Phase 1 — Foundation and content system

- Initialize the new application and design tokens.
- Implement typed project, experience, source, and media schemas.
- Build GitHub metadata sync into a draft snapshot.
- Import approved résumé/work-history content.
- Add content validation, link checking, and freshness reporting.

Exit criteria: the site can render all approved content from local sources with no AI or runtime GitHub dependency.

### Phase 2 — Core portfolio experience

- Build the home, work index, project detail, experience, about, résumé, and contact surfaces.
- Implement search/filter/sort and responsive states.
- Add SEO, structured data, sitemap, and share cards.
- Implement analytics events without sensitive payloads.

Exit criteria: a production-quality non-AI portfolio works end to end and passes responsive/accessibility checks.

### Phase 3 — Media and flagship case studies

- Capture or approve real project screenshots.
- Create verified architecture diagrams where screenshots are inappropriate.
- Produce image derivatives, alt text, captions, and rights records.
- Complete the six flagship stories and the compact archive entries.

Exit criteria: every visible project has an honest image strategy and technical description; every featured story has reviewed evidence and media.

### Phase 4 — Jolene

- Generate and review an original Jolene portrait and responsive variants.
- Implement the floating launcher, dialog/bottom sheet, and full-page `/ask` route.
- Build evidence retrieval, structured answers, citation validation, fallback behavior, and feature flag.
- Add privacy controls, rate limits, abuse handling, and evaluation fixtures.

Exit criteria: Jolene is useful, grounded, accessible, rights-safe, optional, and removable without harming the site.

### Phase 5 — Hardening and launch review

- Test critical flows across Chrome, Safari, Firefox, iOS Safari, and Android Chrome.
- Run unit, schema, integration, end-to-end, accessibility, visual-regression, broken-link, and performance checks.
- Conduct recruiter 60-second scan tests and hiring-manager evidence-finding tasks.
- Review all public copy, source links, media rights, privacy text, and AI disclosures.
- Deploy a private preview; publish only after Carl's explicit approval.

Exit criteria: all P0 defects are closed, launch gates are signed off, rollback/kill-switch behavior is verified, and the production URL is approved.

## 15. Prioritized backlog

### P0 — Required for first public release

- PORT-001: Initialize the portfolio app with verified framework guidance and quality scripts.
- PORT-002: Define typed project, source, experience, status, and media-rights schemas.
- PORT-003: Inventory all current public repositories and create reviewable records.
- PORT-004: Import and reconcile the canonical work-history source.
- PORT-005: Implement the home and global navigation.
- PORT-006: Implement work index search, filters, sorting, and no-result recovery.
- PORT-007: Implement short and full project-detail templates.
- PORT-008: Implement experience, about, résumé, and contact pages.
- PORT-009: Complete six evidence-reviewed featured case studies.
- PORT-010: Establish the screenshot/diagram pipeline and rights records.
- PORT-011: Implement responsive, accessibility, SEO, and performance foundations.
- PORT-012: Implement privacy-safe analytics.
- PORT-013: Add link, content-schema, accessibility, and end-to-end launch gates.

### P1 — Jolene release

- PORT-101: Approve original Jolene identity and art direction.
- PORT-102: Generate, edit, and export the original portrait and responsive assets.
- PORT-103: Implement accessible launcher, panel, bottom sheet, and `/ask` route.
- PORT-104: Build the approved public evidence corpus and retrieval layer.
- PORT-105: Implement structured, cited answer generation and validation.
- PORT-106: Add role-context paste with privacy notice and input limits.
- PORT-107: Add rate limiting, abuse handling, timeout, fallback, and kill switch.
- PORT-108: Build and pass the adversarial/grounding evaluation suite.
- PORT-109: Add source opening, helpfulness feedback, and privacy-safe events.
- PORT-110: Add a minimized, consented contact handoff with retention,
  redaction, abuse controls, and no response-time promise.

### P2 — Best-in-class enhancements after evidence

- PORT-201: Context-aware “Ask about this” entry points on project and experience pages.
- PORT-202: Compare a job description to direct, adjacent, and missing evidence.
- PORT-203: Add role-specific share links that preselect relevant projects without storing the job description.
- PORT-204: Add a lightweight admin/content review dashboard if file-based review becomes a bottleneck.
- PORT-205: Add optional, consented redacted conversation summaries to the operator workflow.
- PORT-206: Add new case-study storytelling formats only when usage research shows a need.
- PORT-207: Connect the project to private Jolene's read-only watched-project
  registry after monitoring cadence and operating limits are approved.

## 16. Validation and acceptance criteria

### Portfolio acceptance

- All approved public repositories appear in the archive or have a recorded reason for exclusion.
- Every visible project has an image strategy, technical description, status, evidence sources, and last-reviewed date.
- Featured projects explain problem, contribution, architecture, decisions, constraints, and validation.
- Work history is complete but progressively disclosed.
- Project and experience claims preserve professional/project/prototype/planning boundaries.
- The primary portfolio flow remains fully functional with JavaScript model calls disabled.

### Jolene acceptance

- The persona is clearly disclosed as AI and does not imply celebrity affiliation or endorsement.
- Every material qualification claim has one or more valid approved citations.
- Missing evidence is handled without fabrication or demeaning language.
- No local paths, private sources, secrets, raw analytics, or confidential employer detail can be returned.
- The launcher and panel pass keyboard, focus, screen-reader, reduced-motion, mobile keyboard, close/reopen, and error-recovery checks.
- The model can be disabled instantly without breaking the site.

### Launch acceptance

- Lint, type, unit, integration, end-to-end, accessibility, and production build checks pass.
- Key pages pass visual review at 320, 390, 768, 1024, 1440, and wide-desktop widths.
- Real-device Safari and Chrome checks pass.
- Core Web Vitals are within “good” ranges on representative mobile conditions.
- No broken internal, GitHub, demo, résumé, source, or contact links.
- Carl approves the final preview, media, copy, rights choices, privacy behavior, and production publish.

## 17. Risks and gates

| Risk | Impact | Likelihood | Mitigation | Owner | Release gate |
| --- | --- | --- | --- | --- | --- |
| Celebrity likeness or implied endorsement | High | High if Dolly likeness is used | Use original Jolene persona; require documented permission and legal review for any real-person likeness or voice | Carl | Rights approval before asset production/publication |
| Agent exaggerates qualifications | High | Medium | Approved corpus, structured claims, citation validator, red-team fixtures, no-evidence behavior | Engineering | AI eval suite and manual transcript review |
| Private/confidential information leaks | High | Medium | Public-safe corpus only, no local paths, redaction, adversarial tests, minimal logs | Engineering/Carl | Privacy and security review |
| Project archive becomes overwhelming | Medium | High | Featured layer, taxonomy, search/filter, progressive disclosure | Product/design | 60-second scan usability test |
| Stale project status or screenshots | Medium | High | `lastReviewedAt`, freshness report, launch refresh, periodic review | Carl | Freshness check before publish |
| Legacy/client assets lack rights clarity | High | Medium | Rights inventory; use neutral technical covers or hide media until cleared | Carl | Media rights state must be approved |
| AI latency or outage blocks exploration | High | Medium | Portfolio-first architecture, lazy-loaded chat, timeout, deterministic fallback, kill switch | Engineering | Failure-mode end-to-end test |
| Heavy imagery hurts mobile performance | Medium | Medium | Responsive formats, dimensions, lazy loading, budgets, real-device test | Frontend | Performance gate |
| Six résumé variants confuse visitors | Medium | Medium | Publish one canonical résumé; keep tailored variants off the main surface | Carl/product | Canonical résumé approval |

## 18. Explicit non-goals for the first release

- No celebrity impersonation, voice clone, or implied endorsement.
- No automatic publishing from GitHub, résumé files, or generated copy.
- No display of private repositories or local project paths.
- No autonomous outreach, job application, scheduling, or form submission by Jolene.
- No access from public Jolene to private Obsidian, private durable memory,
  private job-search records, correspondence, or unrestricted local files.
- No public chat transcript pages.
- No claim that commit counts, stars, or repository size prove quality or impact.
- No CMS until file-based review proves inadequate.
- No decorative 3D/particle system unless it materially improves comprehension and passes performance/accessibility review.

## 19. Decisions Carl should approve before implementation

Recommended defaults are included so implementation can begin with minimal ambiguity:

1. **Jolene identity:** approve an original fictional country-glam guide, not Dolly Parton's likeness or voice.
2. **Featured six:** approve Job Search OS, Inner Avatar, Flight Tracker AI, ProgressionLab, Wave Factory Essentials, and EMF Visualizer.
3. **Canonical résumé:** use the Senior Product Engineer version as the public general résumé unless a dedicated general résumé is created.
4. **Visual direction:** approve premium dark editorial with restrained teal and warm accents, large real project imagery, and minimal ornament.
5. **Archive scope:** show every approved public repository, with legacy/client-era media withheld until rights review.
6. **Analytics/privacy:** aggregate events only; no raw question, job-description, or transcript retention by default.

Once those six decisions are approved, Phase 0 can move directly into implementation planning and the first build sprint.
