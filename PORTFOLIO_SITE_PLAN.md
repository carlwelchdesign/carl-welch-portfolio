# Carl Welch Portfolio — Motion-First Product and Delivery Plan

Status: Local release candidate complete; public release remains pending Carl's review and approval.

Canonical workspace: `/Users/carl.welch/Documents/Github Projects/carl-welch-portfolio`

Evidence snapshot: August 25, 2026. Planning began before an application existed; the local application is now initialized, while deployment and publication remain open.

Implementation update, August 25, 2026:

- The real application is initialized under `site/` using the Next.js App Router-compatible Sites/Vinext runtime, React, TypeScript, Tailwind CSS, and Motion 13.1.1.
- The server-rendered homepage now contains three repository-grounded project chapters: Job Search OS, Flight Tracker AI, and Wave Factory Essentials. Each uses a real project screenshot, typed content, a technical stack, an animated architecture sequence, status, evidence, and explicit boundaries.
- Section-dominant red, orange, and green backgrounds crossfade through Motion using a center-weighted intersection observer. Reveals, image entry, architecture sequencing, and reduced-motion behavior remain isolated to narrow client components; readable content stays server-rendered.
- Dedicated routes now exist for the work index, each selected project, professional experience, and recommendations. The recommendations route exposes the working state without publishing unapproved quotations and is excluded from search indexing until reconciliation is complete.
- The work route also includes a snapshot of all 25 currently public GitHub repositories with locally stored GitHub preview imagery, technical descriptions grounded in repository metadata or README evidence, search, current/earlier/library filters, language filtering, sorting, and animated reflow. Repositories without sufficient public evidence are labeled instead of receiving invented descriptions.
- All 13 recommendation candidates in the working LinkedIn fixture are rendered as a reviewable, non-carousel collection. The route remains excluded from search indexing until the fixture is reconciled with an official export and Carl approves public publication.
- Repository maintenance checks now compare the curated archive with the live public GitHub repository list and report additions, removals, language, URL, or update-date drift without overwriting hand-reviewed descriptions or live links.
- Deterministic content and route checks now verify case-study, archive-image, recommendation-count, résumé, page-structure, metadata, indexing, sitemap, 404, and asset-response invariants.
- A dedicated capabilities route now maps five qualification areas to supporting case studies, public repositories, professional roles, and attributed recommendations. The homepage exposes a concise entry point, and content checks reject broken project, repository, or company references. This evidence model is the retrieval boundary for a later Jolene experience rather than allowing an agent to improvise claims.
- A dedicated contact route now provides the résumé-verified email, LinkedIn, GitHub, and résumé without collecting visitor messages or introducing a form backend. Contact is a persistent desktop and mobile header action, appears in the homepage hero, and remains available in the footer.
- Mobile navigation now uses a native, keyboard-accessible disclosure menu; every route fits without horizontal overflow down to 320 pixels.
- Browser verification covers all nine rendered pages, archive search/filter/sort behavior, metadata and indexing gates, desktop and mobile layouts, reduced-motion hydration, and automated WCAG A/AA checks. The final automated accessibility run reports zero violations on every route.
- The workspace now has a local Git repository on `main`. Publication, remote creation, and deployment remain intentionally unperformed.
- Root and route metadata, canonical handling, an Open Graph preview image, X card fields, sitemap, robots rules, web manifest, favicon, corrected LinkedIn destination, and a local résumé download are implemented. The production base URL remains environment-configured because a public domain has not been approved.
- Lint, the production build, every application route, all metadata routes, and the running local preview pass.
- Copy remains provisional. Official LinkedIn recommendation reconciliation, final copy review, interactive browser/accessibility QA, Jolene, a reviewed archive-update operation, source-control initialization, and deployment remain open.
- No public deployment has been created; publication remains approval-gated.

## 1. Decision reset

The earlier visual direction is rejected. It must not be treated as an approved design system or used as a starting point.

The following decisions now govern the work:

1. The portfolio will lean heavily on [Motion for React](https://motion.dev/docs/react), but motion must explain, connect, compare, orient, or confirm. Decorative movement alone is not sufficient.
2. The [Motion.dev landing page](https://motion.dev/) is the primary approved reference for visual grammar, interaction attitude, and motion pacing. It is a reference to adapt, not a template to copy.
3. Yellow is rejected. Vermilion red, safety orange, and electric green form a section-aware signal system rather than competing as one global brand color.
4. Jolene, Dolly, AI chat, character rigging, Canvas, and WebGL are deferred outside the first portfolio release.
5. Static image mockups are not the primary approval artifact for a motion-led site. Carl will review functioning browser prototypes using real portfolio content.
6. The first release will feature 3–4 evidence-rich case studies, not six uniform flagship stories.
7. All approved public repositories remain available through a compact archive, but they do not receive equal visual emphasis.
8. Content, navigation, and evidence must work before Motion loads, when JavaScript fails, and when reduced motion is enabled.

## 2. Product thesis

Build a portfolio where Motion makes Carl's product and engineering reasoning inspectable.

The experience should let a hiring manager answer four questions in under two minutes:

1. What is Carl unusually good at?
2. Which project proves it?
3. What did Carl specifically contribute or decide?
4. Is there enough depth and relevance to start a conversation?

### Positioning hypothesis

> Product engineer building applied AI products, evidence-rich interactive systems, and creative software—from ambiguous problem to working, testable system.

This remains a hypothesis until the text-first prototype and audience testing confirm that visitors understand it.

### Primary audience

The primary audience is a hiring manager evaluating Carl's technical depth and product judgment.

Secondary audiences:

- Recruiters who need a fast scan layer.
- Engineers who want architecture and implementation evidence.
- Product and design leaders evaluating end-to-end ownership.
- Creative-technology collaborators evaluating interactive and media work.

### Primary first-visit flow

```text
10-second orientation
→ 3–4 capability claims
→ selected work with visible proof
→ one relevant case study
→ professional-experience credibility
→ résumé or contact
```

## 3. What “Motion-first” means

Motion is part of the information architecture. It should preserve relationships and clarify how information changes.

### Required semantic roles

| Role | Meaning | Portfolio use |
| --- | --- | --- |
| Orient | Show where the visitor is and what changed | Active navigation, chapter state, project selection |
| Reveal | Expose evidence in a useful sequence | Problem → decision → system → validation |
| Compare | Make alternatives and tradeoffs legible | Before/after, constraint/approach/result, architecture states |
| Connect | Preserve identity across states | Project card → preview, filter → selected work, role → related project |
| Confirm | Acknowledge an action immediately | Press, filter, copy, download, outbound link |
| Reflow | Explain reordering or filtering | Search, status filters, sort changes, role expansion |
| Resolve | Settle loading, completion, or error states | Media load, form response, restored layout |

### Motion rules

- Use springs for direct manipulation, selection, and responsive layout behavior.
- Use restrained tweens for editorial reveals and state changes.
- One dominant motion event may command attention at a time.
- Routine content travel is limited to approximately 6–16px.
- Large movement is reserved for a genuine context change.
- Staggers should generally stay between 30–60ms and stop after 4–6 items.
- Do not cascade all 24 repositories into view.
- Motion never delays navigation, focus, readable text, or a primary action.
- Motion never changes semantic DOM order.
- Hover, keyboard focus, and touch receive equivalent feedback.
- No scroll interception or scroll hijacking.
- No important information is available only through animation.

### Banned patterns

- Cursor followers.
- Particle backgrounds.
- Perpetual marquees.
- Fake terminal typing.
- Letter-by-letter body-copy animation.
- Large parallax on reading surfaces.
- Every-section fade-and-rise templates.
- Bouncing résumé/contact controls.
- Drag-only navigation.
- Long pinned sequences that force a visitor to “watch” the résumé.
- Animation whose primary purpose is to demonstrate that animation exists.

## 4. Motion-direction prototypes

The next design deliverables are working prototypes, not polished page mockups.

Each prototype uses real project names, real images where available, and the same Motion.dev-informed high-contrast shell so their behavior can be compared fairly. The shell uses stable near-black working surfaces, section-aware signal colors, strong sans-serif display type, compact mono metadata, and visible structural rules.

### Direction A — Motion.dev-informed Proof in Motion (recommended hypothesis)

The portfolio behaves like an evidence dossier assembling itself around the visitor's intent.

- Projects begin as concise evidence objects.
- Selection expands a project without losing spatial context.
- Filters reorganize the archive fluidly.
- A project's image, title, and status preserve identity into richer detail.
- Technical decisions and validation appear in the order required to understand them.

This direction makes Motion demonstrate product judgment while the work remains the hero.

### Direction B — Directed Case-Study Reel

The home page contains one tightly choreographed sequence of 3–4 flagship projects.

- Each short chapter performs one meaningful transformation.
- Native scrolling remains in control.
- The work archive and case studies remain freely navigable documents.
- Visitors are never forced to finish the reel.

This direction creates a strong first impression but carries a higher risk of cinematic delay.

### Direction C — Systems Atlas (exploratory)

Projects and experience reorganize around capability, stack, status, and role relevance.

- Selecting a topic expands related evidence and quiets unrelated context.
- Capability threads connect professional experience with public work.
- The atlas is an optional exploration layer, never the only navigation.

This direction may unify Carl's breadth, but it must avoid becoming a generic constellation interface.

### Prototype set

1. **Static 60-second baseline** — text-first high-contrast home and selected-work flow with all movement disabled.
2. **Project continuity experiment** — selected project expands through shared layout.
3. **Evidence sequence experiment** — one technical story connects problem, decision, architecture, and validation.
4. **Archive transformation experiment** — search/filter/sort reorganizes projects without losing orientation.
5. **Responsive/reduced-motion experiment** — the same story at 320, 390, 768, and 1440px with a deliberately composed reduced-motion version.

An experiment is promoted only when its evidence-finding task performs at least as well as the static baseline.

## 5. Taste calibration before art direction

Motion.dev is the anchor reference, so discovery should begin by deconstructing what Carl likes about that page rather than presenting another unrelated visual direction.

### Primary reference contract — Motion.dev landing page

Adapt these qualities:

- High-contrast chromatic and near-black fields used in large, decisive blocks.
- Oversized, blunt sans-serif headlines paired with compact monospaced labels and metadata.
- Numbered editorial chapters with generous vertical pacing.
- Fine rules, visible grids, and squared controls that make the page feel engineered.
- Dense demonstration surfaces embedded into the narrative instead of detached decoration.
- Clear alternation between expansive fields and contained technical panels.
- Motion that proves a feature, responds to input, preserves continuity, or advances a chapter.
- A confident tone with minimal ornamental language.

Do not copy these elements:

- Motion's logo, name, copy, proprietary illustrations, or product examples.
- Its exact navigation, product taxonomy, or documentation structure.
- Its precise component arrangements or an indistinguishable reproduction of its brand system.

Translate the reference into Carl's subject matter:

- The hero demonstrates Carl's range or working method, not an animation-library API.
- Interactive panels reveal project evidence, architecture, decisions, and validation.
- Numbered chapters organize selected work and experience.
- The signal color directs attention to claims that have visible proof.
- Project imagery supplies the visual variety that Motion's product demos provide on its own site.

The remaining taste review is narrow and attribute-level. It resolves which parts of the reference should be kept, adapted, or avoided at different intensities.

Create a compact board led by Motion.dev and only 4–6 supplementary references for gaps it does not answer:

- Editorial density.
- Typography.
- Image treatment.
- Navigation behavior.
- Project storytelling.
- Technical visualization.
- Motion pacing.
- Interaction attitude.
- Responsive composition.
- Treatment of evidence and status.

Carl marks each attribute Keep, Reject, or Interesting with changes.

The output is a one-page taste contract containing:

- “This portfolio is…” statements.
- “This portfolio is not…” statements.
- Explicit banned patterns.
- Approved motion behaviors.
- Unapproved or unresolved visual decisions.

Motion.dev is approved as the anchor. Approval of the anchor does not authorize cloning; each adapted attribute still needs to serve Carl's content, audiences, and evidence.

### Section-aware signal-color system

Color is an orientation layer tied to the subject of a section:

| Section identity | Signal color | Initial token |
| --- | --- | --- |
| Applied AI | Vermilion red | `#ff4338` |
| Product systems | Safety orange | `#ff6800` |
| Creative software | Electric green | `#62e879` |

- Near-black content surfaces and off-white typography remain stable while the environmental background changes.
- Only one signal color is dominant at a time.
- The next color crossfades in when its section becomes the clear viewport-dominant section; it does not scrub continuously with every scroll pixel.
- Intersection hysteresis or a closest-to-center rule prevents flicker when two sections share the viewport.
- The active navigation state and small evidence accents inherit the current section color.
- Experience, About, Contact, and long reading passages may return to a neutral near-black/off-white environment when chromatic identity would not improve orientation.
- Reduced-motion mode changes color immediately without a full-screen fade.
- Color never becomes the only indication of section, status, or meaning.

### Copy and voice contract

The first visual mock's copy is placeholder-level and unapproved. Public copy must sound like Carl, name recognizable work, and survive evidence review; polished abstraction is not an acceptable substitute.

Working voice:

- A senior builder explaining the work at a whiteboard: specific, candid, technically literate, opinionated, and occasionally wry.
- First person by default. Confidence comes from nouns, decisions, and boundaries rather than superlatives.
- Name the project, component, safeguard, constraint, tradeoff, or result whenever the evidence permits it.
- Keep professional work, deployed portfolio work, active builds, pre-release products, prototypes, and planning repositories visibly distinct.
- Third-party praise remains exact, attributed, and separate from Carl's own claims.

Every page follows a multi-pass copy workflow:

1. An evidence researcher prepares a source packet and identifies uncertainty.
2. A positioning writer produces materially different treatments from the approved claim set and Carl's reviewed language bank.
3. A human-voice editor removes generic portfolio language, abstract noun piles, canned cadence, and synthetic polish.
4. A hostile hiring-manager editor asks what each sentence means, where its proof is, and what Carl specifically did.
5. A claims red-team verifies every factual sentence and restores any lost ownership or status boundary.
6. Carl reads the copy in context, revises it in his own words, and approves it before publication.

Editorial rejection rules:

- A sentence that could appear unchanged on hundreds of engineering portfolios fails.
- A line Carl would feel ridiculous saying aloud to another engineer fails.
- “Trustworthy,” “innovative,” or similar virtues fail when the copy could name the behavior or safeguard instead.
- Ownership verbs are not interchangeable: designed, implemented, led, contributed, and collaborated retain their supported meaning.
- Empty phrases including “leveraging,” “unlocking,” “seamless,” “at the intersection of,” “passionate about,” “impactful,” “cutting-edge,” “agentic,” and “end-to-end” are removed unless a deliberate, specific use survives review.
- Agent consensus never constitutes publication approval.

The reviewable voice territories and working examples live in `COPY_DIRECTION_REVIEW.md`.

## 6. Information architecture

### Primary navigation

- Selected Work
- Experience
- About
- Contact
- Résumé as a direct action/download

### Secondary navigation

- All Projects
- Recommendations
- GitHub
- LinkedIn
- Case-study chapters on long pages

Jolene does not appear in launch navigation.

### `/` — Home

- Positioning and availability are readable immediately.
- 3–4 capability claims connect directly to supporting projects or experience.
- Selected work uses large, meaningful project media and compact evidence labels.
- One bounded flagship sequence may use scroll-linked explanation.
- Experience credibility appears before the final résumé/contact actions.
- A concise “What colleagues and clients say” section previews 3–4 approved LinkedIn recommendations and links to the complete recommendation archive.
- The page resolves quietly; there is no animated finale.

### `/work` — Selected work and archive

- Selected work controls the opening hierarchy.
- Search, filters, and sort reveal the approved public repository archive.
- Filtered projects reflow coherently using layout animation.
- Status, role relevance, and result count remain readable during movement.
- Search does not animate every keystroke beyond meaningful result reflow.
- Mobile navigates directly rather than depending on hover previews.

### `/work/[slug]` — Adaptive case study

Every case study shares an evidence core:

1. Project purpose and intended user.
2. Status and claim boundary.
3. Carl's contribution.
4. Problem and constraints.
5. Important product or engineering decisions.
6. Architecture or system explanation.
7. Validation and evidence.
8. Tradeoffs, limits, and what remains unverified.
9. GitHub, demo, documentation, and related work.

The presentation adapts to the domain:

- AI products emphasize data flow, provenance, human approval, evaluation, and failure handling.
- Audio plug-ins emphasize signal flow, interaction, host formats, validation gates, and release state.
- Geospatial products emphasize data sources, layering, backend/frontend boundaries, and advisory limits.
- Libraries emphasize contracts, adapters, integration boundaries, package output, and tests.
- Interactive visualization emphasizes the model, rendering path, controls, accessibility, and performance.

Desktop may pair a sticky media/evidence stage with narrative chapters. Mobile becomes a normal linear document with media placed immediately after the claim it proves.

### `/experience`

- Recent work is expanded; earlier history is progressively disclosed.
- Role expansion uses layout continuity.
- Related public projects may connect to experience only when the relationship is genuine.
- Approved recommendations may appear beside the role or period they directly support.
- The chronology is complete and readable without animation.

### `/recommendations`

- Display every recommendation approved for public use, with a clear total count and last-reviewed date.
- Preserve the recommender's name, recommendation text, publication date, relationship to Carl, and role or company context when verified.
- Group or filter by working relationship and career period without hiding the complete chronological list.
- Feature a small number of representative quotes on the homepage; “featured” affects placement, never whether an approved recommendation remains discoverable.
- Use a server-rendered stacked list or editorial grid. Do not use an autoplay carousel, horizontal swipe trap, or motion-dependent quote rotation.
- Link to Carl's LinkedIn profile as the source context without implying that LinkedIn endorses the portfolio.

### `/about`

- A quieter visual and motion surface.
- Personal narrative, working style, education, creative/technical range, and location.
- No fragmented animated prose.

### Résumé and contact

- One canonical public résumé.
- Direct download from primary navigation and closing calls to action.
- Contact behavior uses only focused validation, sending, success, and recovery motion.
- No résumé carousel, confetti, or forced role-persona selector.

## 7. Project-evidence scope

The live GitHub account exposed 24 public, non-fork, non-archived repositories at the August 25 snapshot.

All approved public repositories may appear in the archive, but launch storytelling is limited to 3–4 projects selected through an evidence matrix.

For each candidate project, document:

- Target-role capability proved.
- Strongest public artifact.
- Carl's specific contribution.
- Project status and claim boundary.
- Technical decision worth explaining.
- Visual or interactive evidence available.
- Confidentiality or rights constraint.
- Likely hiring-manager follow-up question.
- Content freshness and last review date.

### Initial candidates—not approved ordering

- Job Search OS.
- Inner Avatar.
- Flight Tracker AI.
- ProgressionLab.
- Wave Factory Essentials.
- EMF Visualizer.
- EchoAtlas.
- WebAuthn Core.

Launch projects are chosen by proof strength and audience relevance, not by category coverage.

## 8. Page choreography

### Global shell

- Active-navigation indicator moves between destinations as a shared element.
- The shell remains stable while page content enters.
- Navigation happens immediately; the app never waits for an exit animation.
- Focus, browser history, and scroll restoration outrank visual continuity.

### Home

- Initial headline and actions exist in their final readable state.
- One short opening sequence establishes hierarchy.
- Featured media may transition into a preview on focus or selection.
- Capability relationships move as one system, not as independently bouncing cards.
- Only one flagship explanation may be scroll-linked at a time.

### Work archive

- Filter, sort, insertion, and removal use coordinated layout reflow.
- Removed results exit briefly while retained results occupy their new positions.
- Focus is preserved or intentionally restored after filtering.
- No 24-item entrance cascade.

### Case studies

- A project image may preserve identity from in-page preview to expanded state.
- Chapter state connects Problem, Role, System, Decisions, Validation, and Limits.
- Every featured project includes a compact animated system-architecture diagram when the available evidence supports one.
- Architecture diagrams reveal discrete layers as the project enters view and as the corresponding decision is read.
- Drag-enhanced galleries retain buttons, keyboard navigation, and native scrolling.
- GitHub and demo links remain static and immediately usable.

### Signature reveal — animated system architecture

The diagrams should feel like Mermaid charts art-directed through the Motion.dev visual system, not like documentation screenshots.

For each of the 3–4 featured projects:

1. The project section enters the viewport with the complete diagram space already reserved.
2. The structural frame and system boundary establish context.
3. Primary actors, services, data stores, and external systems appear in dependency order.
4. Directional paths draw from source to destination using SVG `pathLength` animation.
5. The most important transformation or decision receives the signal color.
6. A concise evidence callout settles beside the component it supports.

The sequence should complete in roughly 1.2–2 seconds, play once by default, and never block reading or navigation. A visible Replay control may be offered on full case-study pages. Hover, focus, or tap may emphasize one route through the system, but no diagram loops continuously.

The diagram is explanatory evidence, so every animated component must map to a real repository component, service, integration, process, or verified design decision. Do not invent system complexity for visual effect.

### Diagram rendering decision

- Preferred for featured projects: a typed `nodes`/`edges` content schema rendered by a custom responsive SVG React component.
- Optional authoring path: Mermaid source stored with project content and rendered or converted at build time.
- Secondary projects may use pre-rendered Mermaid SVG when a bespoke animated diagram is not justified.
- Do not ship the Mermaid client runtime in the home-page critical path.
- Do not depend on Mermaid's generated DOM structure as a permanent animation API; generated SVG selectors can change across library versions.
- Mermaid remains in strict security mode if any graph definition is not fully trusted.

### Experience

- Roles enter as a stable chronology.
- Expanding a role moves surrounding history coherently.
- The active era may use one shared indicator.
- The timeline does not draw itself across the entire page.

## 9. Motion technology baseline

Use the stable Motion for React APIs documented by the official library.

### Stable baseline

- [`m` and `LazyMotion`](https://motion.dev/docs/react-reduce-bundle-size)
- `domMax` loaded asynchronously because selected interactions require layout animation
- [`MotionConfig`](https://motion.dev/docs/react-motion-config) with `reducedMotion="user"`
- `layout`, `layoutId`, and [`LayoutGroup`](https://motion.dev/docs/react-layout-animations)
- [`AnimatePresence`](https://motion.dev/docs/react-animate-presence) for local exiting UI
- `whileInView` and `useInView` for bounded viewport triggers
- [`useScroll`](https://motion.dev/docs/react-use-scroll), `useTransform`, and `useSpring` for local scroll-linked explanation
- `whileHover`, `whileTap`, and `whileFocus` for semantic feedback
- `useAnimate` for deliberate local sequences
- `useMotionValueEvent` for discrete reactions without frame-by-frame React state
- `useReducedMotion` for bespoke alternative compositions

### API mapping

| Experience | Motion API |
| --- | --- |
| Semantic component states | `m`, variants, `initial`, `animate` |
| Hover/press/focus | `whileHover`, `whileTap`, `whileFocus` |
| One-time meaningful reveal | `whileInView` or `useInView` |
| Architecture-diagram entrance | `useInView` + `useAnimate` + SVG `pathLength` |
| Local scroll progress | `useScroll` + `useTransform` |
| Filter and accordion reflow | `layout` + `LayoutGroup` |
| In-route shared identity | `layoutId` |
| Result removal and overlays | `AnimatePresence` |
| Local choreography | `useAnimate` |
| Reduced-motion policy | `MotionConfig` + `useReducedMotion` |

### Experimental and deferred

- Motion+ `AnimateView` is early access and is not the production route-transition foundation.
- JavaScript `animateView` and native View Transitions require a Next.js integration spike before use.
- Cross-route shared-element transitions are an experiment, not a launch promise.
- Motion+ Cursor, Typewriter, ScrambleText, Ticker, Carousel, and Curtains are excluded unless a later approved design explicitly requires them.
- React canary or early-access dependencies are not introduced into the production baseline.
- Canvas/WebGL belongs to the deferred Jolene track and is not part of the portfolio runtime.

## 10. Frontend architecture

Use Next.js App Router with Server Components as the default.

### Server-rendered by default

- Pages and layouts.
- MDX or typed content.
- Project records.
- SEO and structured data.
- Images and media metadata.
- Work history and résumé content.

### Narrow client motion islands

- `MotionRuntime`
- `RouteEntrance`
- `WorkGridMotion`
- `ProjectPreview`
- `CaseStudyStory`
- `ArchitectureDiagram`
- `ExperienceTimeline`
- Local menus, filters, overlays, and gesture controls

Pass serializable content and stable IDs into these islands. Do not convert complete pages into client components solely to animate them.

### Proposed runtime shell

```tsx
"use client"

import { LazyMotion, MotionConfig } from "motion/react"

const loadFeatures = () =>
  import("./motion-features").then((module) => module.default)

export function MotionRuntime({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
```

Components beneath this boundary import `m` from `motion/react-m`, not the full `motion` component. The lazily imported `motion-features` module exports `domMax`.

### Route-transition baseline

- Use an App Router `template.tsx` boundary around a small client `RouteEntrance`.
- Animate incoming content only.
- Never delay `router.push()` to finish an outgoing animation.
- Use `AnimatePresence` for drawers, previews, menus, and filter results—not as an assumed solution for App Router route exits.
- Cross-route continuity remains behind an experimental flag until back/forward navigation, focus, deep links, and scroll restoration are proven.

### Content architecture

- Runtime pages read approved local content, not live GitHub responses.
- A build-time GitHub sync writes a reviewable draft snapshot.
- Schema validation requires status, evidence sources, media rights, alt text, public approval, and `lastReviewedAt`.
- Featured-project schema includes diagram nodes, directed edges, component roles, source evidence, a short text summary, and a numbered static legend.
- Every publicly shareable record includes reviewed metadata fields: `seoTitle`, `seoDescription`, `shareTitle`, `shareDescription`, `canonicalPath`, `shareImageAlt`, `indexable`, and an optional approved image override.
- GitHub changes trigger review; they never auto-publish portfolio claims.

Claims and copy blocks are first-class reviewable content objects:

- A claim records its proposition, scope, evidence references, status boundary, supported outcome, unsupported inferences, confidence, approval state, and review date.
- A copy block records its route, audience task, intended takeaway, text, claim references, voice-source references, editorial state, approver, and review date.
- Copywriters may change language, rhythm, and emphasis; they may not create facts, metrics, ownership, production status, or outcomes.
- Build validation rejects public copy blocks with missing claim references, unapproved states, altered quotations, placeholders, or expired review dates.

### LinkedIn recommendation evidence pipeline

LinkedIn recommendations are third-party evidence with their own source, review, freshness, and publication-rights state.

- Acquire the canonical source through LinkedIn's official [**Recommendations Received** account-data export](https://www.linkedin.com/help/linkedin/answer/a1339364/downloading-your-account-data). Do not scrape the profile; LinkedIn's [User Agreement](https://www.linkedin.com/legal/user-agreement) prohibits automated scraping, and its ordinary member Profile API is restricted and does not provide a dependable launch-content pipeline for this collection.
- Reuse the stable hashing, duplicate detection, preview-before-import, and `needs_review` patterns already implemented in `jobseach-dashboard-ai`; add a dedicated parser for LinkedIn's export CSV rather than treating pasted profile text as the only format.
- The existing local fixture contains 13 recommendation candidates dated from February 2008 through June 2026. Treat it as a reconciliation input, not proof that the set is complete or current.
- Import creates or updates a reviewable local snapshot. It never publishes directly.
- A later export is diffed by stable source identity so new, edited, removed, and duplicate entries are visible before approval.

Each recommendation record includes:

- `id`, `sourceRef`, `sourceType`, and source-file checksum.
- `recommenderName`, verified display attribution, and optional approved profile URL.
- `recommenderHeadlineAtCapture`, `companyContext`, and `relationship` when supported by the source.
- `recommendationDate`, exact `body`, optional approved excerpt, and editorial themes.
- `featured`, `displayOrder`, and links to supported experience or capability records.
- `approvalState`, `publicationRightsState`, `lastVerifiedAt`, `lastReviewedAt`, and `publicNotes`.

Publication rules:

- Carl reviews every imported record before it becomes public.
- Full quotations preserve the original wording except for clearly marked truncation; paraphrases are labeled as summaries and never placed inside quotation marks.
- Do not copy recommender profile photographs. Use text attribution or a neutral initial treatment unless a separate image permission and source are recorded.
- Because recommendations contain another person's words and personal details, verbatim off-LinkedIn publication receives an explicit rights/consent review and a documented takedown path.
- Removed or disputed recommendations leave the public site on the next content build while their audit record remains private.

### Metadata and professional link-preview contract

Link previews are a launch feature. The implementation uses the current [Next.js App Router metadata APIs](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) in Server Components, including a root `metadataBase`, static metadata where possible, route-level [`generateMetadata()`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) for project content, and file-based or generated [`opengraph-image` and `twitter-image`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) assets.

#### Site-level metadata

- A concise default title plus a route title template.
- A plain-language professional description grounded in the approved positioning statement.
- Canonical absolute URLs using the production domain.
- [Open Graph](https://ogp.me/) `website` metadata with title, description, URL, site name, locale, image, dimensions, MIME type, and image alt text.
- X/Twitter `summary_large_image` metadata with corresponding title, description, and image.
- Favicon, scalable icon, Apple touch icon, web manifest, theme color, robots policy, and sitemap.
- `Person` and `WebSite` JSON-LD using only verified public facts and approved profile URLs.

#### Route-level metadata

- `/` uses the definitive Carl Welch portfolio preview.
- Every featured `/work/[slug]` case study receives a unique title, description, canonical URL, and project-specific preview image.
- Experience and About receive deliberate previews rather than inheriting an unrelated project image.
- Archive filters, transient UI state, and tracking parameters never create competing canonical URLs.
- Draft, private, or rights-restricted projects are `noindex` and never receive a publicly shareable generated asset.

#### Preview-image system

- Use a 1200×630 design canvas for the primary Open Graph composition and verify the crop on each target surface.
- Reuse the Motion.dev-informed near-black, off-white, grid, mono-label, and section-aware red/orange/green visual grammar without imitating Motion's branding.
- Homepage card: Carl's name, approved positioning line, and one restrained system-diagram or selected-work motif.
- Project card: project name, one evidence-backed capability line, truthful project status, and a project-specific architectural or product visual.
- Keep critical text inside a generous safe area and readable at small feed sizes.
- Generate static preview images; social crawlers must not depend on Motion, JavaScript animation, authentication, cookies, or client hydration.
- Include descriptive image alt text. Never embed secrets, private repository details, client-confidential material, temporary URLs, or unsupported claims.
- Version generated images from approved content so stale previews can be detected and refreshed.

#### Share-preview acceptance criteria

- Every indexable public route emits one canonical URL, a unique title, and a useful description in server-delivered metadata.
- Open Graph and X/Twitter image URLs are absolute HTTPS URLs, return `200`, use the declared content type and dimensions, and remain below provider and framework size limits.
- The homepage and every featured case study display the expected image, title, and description when shared.
- No featured case study falls back to the homepage image unless explicitly approved.
- Preview copy matches the visible page and its reviewed claim/status boundaries.
- Production checks cover LinkedIn, Slack, Discord, Messages/iMessage, Facebook, and X; screenshots of the resulting cards become release evidence.
- Cache-refresh behavior is tested after changing a title or image.
- `robots.txt`, sitemap, canonical tags, JSON-LD, and preview assets are validated from an unauthenticated production-like URL.
- A protected private preview does not count as social-crawler validation. Real provider checks require a crawler-accessible URL that Carl has explicitly approved for this purpose.

## 11. Reduced-motion and responsive contract

Reduced motion is a separate composed experience, not the same motion slowed down.

| Full motion | Reduced/static equivalent |
| --- | --- |
| Shared-element travel | Immediate destination with focus preserved |
| Scroll-linked displacement | Fixed media and static active-chapter state |
| Staggered reveal | Content present; optional short opacity fade |
| Animated architecture flow | Complete diagram with numbered legend |
| Layout reflow | Immediate reflow with explicit selected/filter state |
| Drag gallery | Previous/next buttons and native horizontal scroll |
| Route entrance | Immediate navigation or brief opacity-only change |

### Responsive requirements

- Desktop may use paired copy/media and a bounded sticky evidence panel.
- Tablet preserves relationships without depending on sticky behavior.
- Mobile becomes a linear reading sequence.
- No hover-only information.
- No drag-only action.
- DOM and focus order remain logical during visual reordering.
- Anchored navigation accounts for sticky headers.
- Screen readers receive final content, not animated intermediate state.
- Touch targets are at least 44px.
- Continuous work pauses offscreen and when `document.hidden`.

## 12. Performance budgets

- Motion shell target: no more than 6KB gzip on initial render.
- Deferred Motion feature chunk target: no more than 30KB gzip.
- Home critical path contains no gallery, assistant, WebGL, or heavy-media runtime.
- LCP target: 2.5 seconds or better at the 75th percentile.
- INP target: 200ms or better at the 75th percentile.
- CLS target: 0.1 or better at the 75th percentile.
- No animation-triggered layout shift.
- No main-thread task over 50ms during representative motion sequences.
- At most one high-attention scroll-linked sequence per viewport.
- No more than four large animated elements simultaneously.
- Only the active featured-project diagram animates; diagrams below the fold remain static and unhydrated until near the viewport.
- Mermaid source, if used, is compiled ahead of time or loaded outside the home-page critical path.
- Continuous animation budget on ordinary pages: zero.
- Images reserve dimensions before load.
- Per-frame values remain in Motion values, not React state.
- Prefer `transform` and `opacity`; large filters, masks, clip paths, and fixed layers require profiling.
- Pause or cancel work offscreen, on hidden documents, on route exit, and under reduced motion.

Motion's official performance guidance recommends compositor-friendly properties such as transform and opacity and warns that paint-heavy properties and excess promoted layers must be tested on low-powered devices: [Motion performance](https://motion.dev/docs/performance).

## 13. Accessibility requirements

- Target WCAG 2.2 AA.
- Semantic links and buttons remain the interaction baseline.
- Hover states have focus and touch equivalents.
- Every architecture diagram is a semantic `figure` with a visible caption, an SVG title/description, and an equivalent numbered text explanation.
- Screen readers receive the completed architecture and summary, not a stream of animation-step announcements.
- Skip link, landmarks, heading order, and visible focus are required.
- No content begins hidden in a way that fails when Motion does not load.
- Animated text retains a complete accessible label and is used sparingly.
- Motion never changes the semantic reading order.
- Overlays close with Escape and restore focus.
- Reduced motion removes large translations, parallax, autoplay, and shared-element travel.
- VoiceOver testing covers navigation, filters, project previews, expanded roles, galleries, and contact behavior.
- The main visual-regression suite runs with reduced motion forced for deterministic captures.

## 14. Usability and success metrics

When practical, test with two recruiters, three hiring managers or engineering leads, and one keyboard/screen-reader user.

### Tasks

- After 10 seconds, describe what Carl does.
- Within 60 seconds, select the most relevant project for an AI/platform role.
- Find direct proof of Carl's contribution.
- Identify whether the work is deployed, active, prototype, or planning.
- Explain one technical decision and its tradeoff.
- Find the most relevant professional experience.
- Find third-party evidence supporting Carl's working style or leadership.
- Download the résumé and find contact.
- Repeat the core task on mobile.
- Repeat with reduced motion enabled.

### Targets

- 80% correctly describe Carl's positioning after the first scan.
- 90% reach a relevant project within 60 seconds.
- 80% identify Carl's contribution without confusing it with total product or team output.
- 100% identify project status correctly in tested flagship stories.
- 90% find résumé/contact without assistance.
- 90% find the complete recommendations archive from either Home or Experience without assistance.
- 100% of public recommendations have reviewed attribution, source provenance, publication state, and a static readable presentation.
- No task failure is caused by motion, hover dependence, focus loss, or reduced-motion omissions.
- Motion usefulness averages at least 4/5.
- Any behavior called distracting by two participants is revised or removed.

Do not treat dwell time alone as engagement; animation can inflate it.

## 15. Delivery sequence

### Phase 0 — Reset and discovery

- Record this decision reset.
- Mark Jolene and all character work deferred.
- Deconstruct the Motion.dev landing page into an approved reference contract.
- Use only a small supplementary reference set for typography, project imagery, and case-study gaps.
- Define the primary audience task model.
- Build the project evidence matrix.
- Capture Carl's working voice through a focused interview and create a reviewed language bank.
- Build the homepage and flagship-project claim ledger before drafting public copy.
- Request the official LinkedIn Recommendations Received export and reconcile it against the 13-entry local snapshot.
- Select 3–4 launch case studies.
- Produce the static high-contrast IA baseline with the Motion.dev-informed shell and motion disabled.

Exit gate: Carl approves the taste contract, first-visit narrative, navigation, and prototype inputs.

### Phase 1 — Motion architecture lab

- Initialize a minimal Next.js application after checking the installed Next.js documentation.
- Add stable Motion for React dependencies.
- Implement `MotionRuntime`, async `domMax`, strict `LazyMotion`, tokens, and reduced-motion policy.
- Prototype typography entrance, project reflow, project preview, evidence sequence, route entrance, and static equivalents.
- Record bundle sizes and representative mobile performance.

Exit gate: the stable API baseline, runtime architecture, and experiment boundaries are recorded in an ADR.

### Phase 2 — Live direction prototypes

- Build at least two materially different motion directions using the same real content.
- Run plainspoken and editorial copy passes from the same approved page brief, then test both inside the running prototype.
- Test the five prototype experiments against the static baseline.
- Review desktop, mobile, keyboard, touch, and reduced-motion behavior.
- Carl selects, combines, or rejects the interaction grammar.

Exit gate: approved behavior and banned-pattern decisions are documented. Visual styling remains limited until this gate passes.

### Phase 3 — Design system and vertical slice

- Define typography, color, spacing, grid, media, focus, and motion tokens from approved discovery.
- Build one complete vertical slice: home → selected project → full case study → résumé/contact.
- Implement the root metadata contract and one project-specific generated share image in the vertical slice.
- Build one server-rendered recommendation preview using approved real content and its static/reduced-motion behavior.
- Use real project content and media.
- Validate comprehension, accessibility, responsive behavior, and performance.
- Complete human-voice, hostile hiring-manager, and claims-red-team review for the vertical-slice copy.

Exit gate: Carl approves the running vertical slice, not a screenshot of it.

### Phase 4 — Portfolio scale-out

- Build selected work, archive, adaptive case studies, experience, about, résumé, and contact.
- Build the complete Recommendations route, homepage preview, and genuine experience-to-recommendation links.
- Integrate only validated Motion choreography.
- Complete approved media, alt text, rights state, and content evidence.
- Complete reviewed route metadata and unique preview assets for every featured case study.

Exit gate: every route works fully without animation and passes content/schema checks.

### Phase 5 — Hardening and private preview

- Run recruiter and hiring-manager usability tasks.
- Run keyboard, VoiceOver, responsive, browser, visual-regression, link, SEO, and performance checks.
- Inspect server-delivered metadata and capture real link previews from the supported sharing surfaces.
- Reconcile the final public recommendation set against the latest official export and complete attribution/rights review.
- Verify interrupted animation, rapid filter input, resize during layout changes, and hidden-tab cleanup.
- Deploy a private preview.
- After Carl approves a crawler-accessible preview or public release, run provider cache refreshes and capture the final preview evidence before broad sharing.
- Publish only after Carl explicitly approves the implemented experience.

## 16. Prioritized backlog

### P0 — Reset and discovery

- **PORT-001 — Reset portfolio decision record**
- **PORT-002 — Conduct attribute-level taste calibration**
- **PORT-003 — Build project evidence matrix**
- **PORT-004 — Define audience task model**
- **PORT-005 — Produce static high-contrast IA baseline**
- **PORT-006 — Validate the IA baseline**

### P0 — Copy and narrative

- **PORT-COPY-001 — Capture Carl's working voice and reviewed language bank**
- **PORT-COPY-002 — Build the claim-and-evidence ledger**
- **PORT-COPY-003 — Author page-level narrative briefs**
- **PORT-COPY-004 — Run divergent plainspoken and editorial copywriting passes**
- **PORT-COPY-005 — Conduct human-voice and AI-cadence editing**
- **PORT-COPY-006 — Run hostile hiring-manager and claims-red-team review**
- **PORT-COPY-007 — Curate recommendation excerpts without laundering third-party praise**
- **PORT-COPY-008 — Add editorial approval and regression checks**

Copy launch acceptance criteria:

- Every factual sentence has at least one reviewed evidence reference.
- Every major headline contains a concrete action, object, tension, or point of view.
- Each major section contains a detail unique to Carl's work.
- Project and experience ownership is explicit and accurate.
- Public copy distinguishes live, deployed, active, pre-release, prototype, and planning states correctly.
- A recruiter understands the point without decoding a metaphor, and an engineer can reach the underlying evidence.
- Carl reads the final copy aloud and approves that it sounds like something he would actually say.

### P0 — Motion discovery and architecture

- **PORT-MOT-001 — Motion architecture spike**
- **PORT-MOT-002 — Motion runtime and semantic tokens**
- **PORT-MOT-003 — Interaction prototype gallery**
- **PORT-MOT-004 — Animated work-index experiment**
- **PORT-MOT-005 — Case-study storytelling experiment**
- **PORT-MOT-006 — Route-transition baseline**
- **PORT-MOT-007 — Gesture and overlay primitives**
- **PORT-MOT-008 — Reduced-motion compositions**
- **PORT-MOT-009 — Motion performance and lifecycle gate**
- **PORT-MOT-010 — Experimental transition spike**
- **PORT-MOT-011 — Animated architecture-diagram system**
- **PORT-MOT-012 — Section-aware background color transitions**

### P0 — Product build

- **PORT-040 — Define the approved design system**
- **PORT-041 — Build the static accessible application shell**
- **PORT-042 — Build the selected-work home narrative**
- **PORT-043 — Build the adaptive case-study framework**
- **PORT-044 — Build the approved repository archive**
- **PORT-045 — Build experience, about, résumé, and contact**
- **PORT-046 — Integrate validated Motion choreography**
- **PORT-047 — Implement the content sync and review pipeline**
- **PORT-048 — Add privacy-safe analytics**
- **PORT-049 — Author and verify featured-project architecture diagrams**

### P0 — Recommendations and third-party evidence

- **PORT-REC-001 — Export and reconcile LinkedIn Recommendations Received**
- **PORT-REC-002 — Define recommendation schema, provenance, lifecycle, and publication-rights states**
- **PORT-REC-003 — Adapt the existing recommendation importer for LinkedIn export CSV**
- **PORT-REC-004 — Review attribution, exact wording, context, and public-display approval**
- **PORT-REC-005 — Build homepage recommendation preview and complete Recommendations route**
- **PORT-REC-006 — Link approved recommendations to relevant experience and capability evidence**
- **PORT-REC-007 — Add recommendation accessibility, snapshot-diff, and regression checks**

Recommendation launch acceptance criteria:

- Import reports source row count, parsed count, duplicates, skipped rows, and changed records; silent loss is a failure.
- The official export is reconciled against the current 13-entry local candidate snapshot, and any count or wording difference is reviewed.
- No imported recommendation becomes public without Carl's explicit record-level or bounded batch approval.
- Every approved recommendation is discoverable on `/recommendations`; featured status changes homepage placement only.
- Quote text, attribution, dates, relationships, and linked experience context match the reviewed source record.
- The complete archive works with JavaScript disabled, keyboard-only input, screen readers, reduced motion, and narrow mobile layouts.
- A removed, disputed, or approval-revoked record disappears from public output on the next content build.

### P0 — Metadata and sharing

- **PORT-META-001 — Define route metadata and canonical-URL schema**
- **PORT-META-002 — Build homepage Open Graph and X preview image**
- **PORT-META-003 — Build project-specific preview-image generator**
- **PORT-META-004 — Add icons, manifest, robots, sitemap, and JSON-LD**
- **PORT-META-005 — Add automated metadata and asset assertions**
- **PORT-META-006 — Verify production previews across sharing surfaces**

### P0 — Validation and launch

- **PORT-060 — Run audience usability study**
- **PORT-061 — Complete accessibility validation**
- **PORT-062 — Complete responsive and browser validation**
- **PORT-063 — Complete content and claim review**
- **PORT-064 — Complete performance and lifecycle verification**
- **PORT-065 — Produce private launch preview**

## 17. Risks and gates

| Risk | Impact | Likelihood | Mitigation | Release gate |
| --- | --- | --- | --- | --- |
| Taste mismatch repeats | High | High | Attribute-level discovery and running prototypes before visual commitment | Carl approves taste contract and live prototype |
| Motion becomes portfolio theater | High | Medium | Every animation needs a semantic purpose and static baseline comparison | Motion concept test passes |
| Evidence is delayed by choreography | High | Medium | Content is immediately readable and motion is never a gate | Audience tasks meet targets |
| Mobile becomes a compressed desktop | High | Medium | Author a linear mobile narrative | Mobile task test passes |
| Reduced motion is second-class | High | Medium | Compose and test deliberate alternatives in the same tickets | Task parity passes |
| Performance damages credibility | High | Medium | Lazy features, server-first pages, concrete budgets, real-device traces | Performance gate passes |
| Archive weakens positioning | Medium | High | Selected work controls the first impression; archive remains secondary | 60-second scan test passes |
| Uniform stories flatten the work | Medium | Medium | Shared evidence core plus domain-specific modules | Case-study review passes |
| Experimental APIs create lock-in | Medium | Medium | Stable baseline; early access isolated behind removable spikes | ADR approval |
| Stale claims or screenshots | Medium | High | Review state, freshness report, `lastReviewedAt` | Content review passes |
| Copy sounds generic, synthetic, over-polished, or unlike Carl | High | High | Voice interview, divergent agents, human-voice edit, specificity test, read-aloud approval, and claim traceability | Carl approves copy in the running prototype |
| A recommendation is missing, stale, misattributed, edited, or republished without adequate rights review | High | Medium | Official export, checksum-backed snapshot diff, exact attribution review, publication-rights state, and takedown path | Recommendation reconciliation and public-content approval pass |
| Shared links look generic, stale, or misleading | High | Medium | Route-specific reviewed metadata, versioned preview assets, and real provider inspection | Share-preview acceptance criteria pass |
| Multi-color system becomes noisy or harms orientation | Medium | Medium | One dominant color, stable black surfaces, clear section mapping, and neutral reading zones | Color-flow prototype and accessibility review pass |

## 18. MVP non-goals

- Jolene or any AI assistant.
- Dolly assets or character rigging.
- Canvas, WebGL, particles, or ambient generative systems.
- Final visual design before taste calibration.
- Full editorial case studies for all repositories.
- Motion+ early-access dependencies in production.
- Cross-route shared-element transitions as a launch promise.
- CMS or admin dashboard.
- Automatic GitHub-to-public-copy publishing.
- Public chat or role-specific job comparison.
- Audio, autoplay video, custom cursor, or scroll interception.

## 19. Review record

This revision incorporates independent reviews from:

- Motion Interaction Director / Creative Technologist.
- Senior Frontend Architect specializing in Next.js, React, Motion, accessibility, and performance.
- Staff Product Designer / Portfolio UX Strategist / TPM.

### Agreed findings

- Revoke the earlier visual prescription.
- Use Motion.dev as the anchor reference for visual grammar and motion pacing without cloning its brand.
- Defer Jolene completely.
- Use live motion prototypes as the main approval artifact.
- Make Motion semantic and foundational.
- Keep pages server-rendered and motion behavior in narrow client islands.
- Validate content hierarchy before animation.
- Use 3–4 launch case studies and retain a secondary repository archive.
- Treat reduced motion, mobile, accessibility, performance, and lifecycle as design inputs.
- Separate stable Motion APIs from Motion+ and View Transition experiments.

## 20. Decision log and ownership

| Decision | Status | Owner |
| --- | --- | --- |
| Motion is foundational to portfolio interaction | Approved by user direction | Carl |
| Earlier generated visual directions | Rejected | Carl |
| Motion.dev as the anchor for visual grammar and motion pacing | Approved by user direction | Carl |
| Yellow signal color | Rejected | Carl |
| Red/orange/green section-aware signal system | Approved for live prototype | Carl + design |
| Multi-agent copy workflow with Carl as final voice and publication approver | Approved by user direction | Carl + content |
| LinkedIn recommendations as launch evidence with a complete dedicated archive | Approved by user direction | Carl + content |
| Final typography and image system | Unapproved pending the live prototypes | Carl + design |
| Jolene/Dolly/AI assistant | Deferred | Carl |
| 3–4 launch case studies | Proposed pending evidence matrix | Carl + product |
| Stable Motion APIs form production baseline | Proposed | Engineering |
| Motion+ and cross-route shared transitions | Prototype-only | Engineering + Carl |
| Public deployment | Approval-gated | Carl |

### RACI

| Work | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Taste calibration | Design | Carl | Product, engineering | Review team |
| Evidence matrix and claims | Product/content | Carl | Engineering | Review team |
| Voice capture, copy options, human-voice edit, and claims red-team | Content/copy team | Carl | Product, engineering, trust/rights | Review team |
| Recommendation acquisition, attribution, and publication review | Product/content | Carl | Trust/rights, engineering | Review team |
| Motion prototypes | Frontend/creative technology | Carl | Design, accessibility | Review team |
| Architecture and performance | Frontend engineering | Carl | Design, QA | Review team |
| Accessibility and reduced motion | Frontend + accessibility | Carl | Design, QA | Review team |
| Launch approval | Carl | Carl | Product, engineering, design | Review team |

## 21. Review and publication handoff

The local release candidate is ready for Carl's review at `http://localhost:3000`.

Review should focus on voice, project emphasis, typography, motion timing, image choices, recommendation publication, and the final production domain. The evidence model, route structure, repository archive, contact routes, metadata system, responsive behavior, and accessibility baseline are implemented and verified.

Before public release:

1. Carl approves or revises the visible copy in the running site.
2. The recommendation candidates are reconciled with an official LinkedIn export and approved for publication; until then the route remains excluded from indexing and the sitemap.
3. The production origin is set through `NEXT_PUBLIC_SITE_URL` and social previews are inspected on the intended providers.
4. Carl explicitly approves deployment. No remote repository, hosting deployment, domain change, or public publication is authorized by this plan alone.

Jolene, Dolly assets, character rigging, Canvas, and WebGL remain deferred to a separate phase after the portfolio itself is approved.
