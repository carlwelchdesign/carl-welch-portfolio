import type { ProjectMaturity, PublicEvidenceRecord } from './evidence-types';

export type ProjectTone = 'red' | 'orange' | 'green';

export type ArchitectureNode = {
  id: string;
  label: string;
  detail: string;
};

export type ProjectMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  caption: string;
  layout?: 'wide' | 'standard' | 'portrait';
};

export type ProjectStory = {
  heading: string;
  problem: string;
  contribution: string;
  decisions: Array<{
    title: string;
    detail: string;
  }>;
};

export type PortfolioProject = {
  slug: string;
  name: string;
  category: string;
  status: string;
  tone: ProjectTone;
  number: string;
  summary: string;
  role: string;
  scope: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  galleryTitle: string;
  gallerySummary: string;
  gallery: ProjectMedia[];
  story: ProjectStory;
  stack: string[];
  architecture: ArchitectureNode[];
  maturity: ProjectMaturity;
  sourceId: `portfolio:source:project:${string}`;
  evidence: PublicEvidenceRecord[];
  boundaries: string[];
  repositoryUrl: string;
  liveUrl?: string;
};

export const projects: PortfolioProject[] = [
  {
    slug: 'job-search-os',
    name: 'Job Search OS',
    category: 'Applied AI / Product systems',
    status: 'Protected single-user production app',
    tone: 'red',
    number: '01',
    summary:
      'A private operating system for discovering roles, reviewing fit, assembling evidence-backed application materials, and tracking the work around a job search.',
    role: 'Independent product engineer',
    scope: 'Product strategy, interface design, and full-stack implementation',
    image: {
      src: '/projects/job-search-os-dashboard.png',
      alt: 'Job Search OS dashboard showing the daily review cockpit and application pipeline',
      width: 1440,
      height: 1120,
    },
    galleryTitle: 'A working product, end to end',
    gallerySummary:
      'The system spans the daily cockpit, guarded application execution, live search diagnostics, human review, resume operations, and reusable search strategy.',
    gallery: [
      {
        src: '/projects/job-search-os/application-assistant.png',
        alt: 'Job Search OS Apply Sprint interface showing readiness, blocked claims, and the next application workflow',
        width: 1440,
        height: 1120,
        label: 'Application assistant',
        caption: 'A review-led sprint surface that prepares application work while keeping final submission with the user.',
        layout: 'wide',
      },
      {
        src: '/projects/job-search-os/search-operations.png',
        alt: 'Job Search OS Search Operations interface with live run metrics and diagnostic charts',
        width: 1440,
        height: 1120,
        label: 'Search operations',
        caption: 'Live discovery telemetry makes yield, filtering, blockers, and handoff state visible while a search is running.',
      },
      {
        src: '/projects/job-search-os/agent-review-board.png',
        alt: 'Job Search OS Agent Review Board showing material warnings, agent activity, and prioritized recommendations',
        width: 1440,
        height: 1120,
        label: 'Agent review board',
        caption: 'Recommendations, warnings, and material checks meet in one place before they become decisions.',
      },
      {
        src: '/projects/job-search-os/resume-workspace.png',
        alt: 'Job Search OS Resume Workspace with paths for uploading source material, reviewing a parsed profile, and managing generated resumes',
        width: 1440,
        height: 860,
        label: 'Resume workspace',
        caption: 'Resume source material, parsed career details, and role-specific documents live in one connected workspace.',
        layout: 'wide',
      },
      {
        src: '/projects/job-search-os/search-profiles.png',
        alt: 'Job Search OS Search Profiles interface with strategy analysis, profile health, and recruiting-board controls',
        width: 1440,
        height: 860,
        label: 'Search profiles',
        caption: 'Reusable search strategies make target roles, filters, profile health, and expansion opportunities visible before a run begins.',
      },
      {
        src: '/projects/job-search-os/company-sources.png',
        alt: 'Job Search OS Company Sources interface showing discovery controls and a curated source roadmap',
        width: 1440,
        height: 860,
        label: 'Company sources',
        caption: 'A curated source registry keeps direct company pages, ATS feeds, marketplaces, and search adapters legible and controllable.',
      },
    ],
    story: {
      heading: 'Turning a fragmented search into one operating system.',
      problem:
        'A serious job search splinters across browser tabs, spreadsheets, drafts, inboxes, and repeated research. The difficult part is not producing more material. It is knowing what is credible, what needs review, and what can move forward.',
      contribution:
        'I designed and built a single-user product that joins role discovery, fit review, career evidence, application materials, tracking, email operations, and LinkedIn planning. Each workflow has visible state, and consequential actions stay in my hands.',
      decisions: [
        {
          title: 'Review before action',
          detail: 'The system can prepare work, but submissions and other external actions stop at an explicit approval gate.',
        },
        {
          title: 'Evidence over invention',
          detail: 'Career claims stay tied to source material, with structured outputs and deterministic fallbacks when model output is incomplete.',
        },
        {
          title: 'Operations are part of the product',
          detail: 'Search yield, filters, blockers, and agent handoffs stay visible so a failed run can be understood instead of blindly repeated.',
        },
      ],
    },
    stack: ['Next.js', 'TypeScript', 'PostgreSQL + pgvector', 'OpenAI', 'LangGraph', 'MCP'],
    architecture: [
      { id: 'sources', label: 'Job sources', detail: 'Direct ATS, company, and discovery channels' },
      { id: 'evidence', label: 'Evidence store', detail: 'Career facts, project records, and embeddings' },
      { id: 'agents', label: 'Agent workflows', detail: 'Structured outputs with deterministic fallbacks' },
      { id: 'review', label: 'Review workspace', detail: 'Fit, materials, blockers, and approval state' },
      { id: 'actions', label: 'External actions', detail: 'Manual or approved by the user' },
    ],
    maturity: 'production',
    sourceId: 'portfolio:source:project:job-search-os',
    evidence: [
      {
        id: 'portfolio:claim:job-search-os:integrated-workflow',
        sourceIds: ['portfolio:source:project:job-search-os'],
        text: 'Combines job discovery, fit review, application materials, tracking, email operations, and LinkedIn content workflows in one product.',
        strength: 'strong', maturity: 'production', limitations: ['Protected single-user scope.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:job-search-os:evidence-fallbacks',
        sourceIds: ['portfolio:source:project:job-search-os'],
        text: 'Uses structured model outputs, source-backed career evidence, and deterministic fallbacks where model output is not sufficient.',
        strength: 'strong', maturity: 'production', limitations: ['Model-assisted recommendations remain review inputs.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:job-search-os:approval-boundary',
        sourceIds: ['portfolio:source:project:job-search-os'],
        text: 'Keeps submissions and other consequential external actions behind explicit human approval.',
        strength: 'strong', maturity: 'production', limitations: ['Approval controls do not authorize autonomous submission.'], reviewState: 'approved', publicApproved: true,
      },
    ],
    boundaries: [
      'This is a production application built for one person rather than a public applicant service.',
      'Automated recommendations support review; they do not replace the owner’s judgment or approval.',
    ],
    repositoryUrl: 'https://github.com/carlwelchdesign/jobsearch-dashboard-ai',
  },
  {
    slug: 'flight-tracker-ai',
    name: 'Flight Tracker AI',
    category: 'Geospatial / Aviation intelligence',
    status: 'Deployed read-only portfolio demo',
    tone: 'orange',
    number: '02',
    summary:
      'A browser-based aviation intelligence system that brings live or replayed traffic, weather, hazards, trajectories, and explainable attention cues into one map-led interface.',
    role: 'Independent product engineer',
    scope: 'Product design, frontend engineering, and Rust service integration',
    image: {
      src: '/projects/flight-tracker-ai/live-traffic-weather.png',
      alt: 'Flight Tracker AI live San Francisco traffic workspace showing 158 aircraft, weather layers, a selected aircraft, and the regional flight list',
      width: 1440,
      height: 1000,
    },
    galleryTitle: 'Live traffic, replay, and route context',
    gallerySummary:
      'The map-led workspace brings regional traffic and weather together, deterministic replay makes the same interface reviewable on demand, and focused comparisons explain route tradeoffs without leaving the product.',
    gallery: [
      {
        src: '/projects/flight-tracker-desktop.png',
        alt: 'Flight Tracker AI deterministic replay workspace showing scenario controls, telemetry, weather evidence, and aircraft attention scoring',
        width: 1440,
        height: 1000,
        label: 'Deterministic replay workspace',
        caption: 'A repeatable scenario combines the replay clock, telemetry, weather evidence, route context, and explainable attention scoring in one reviewable state.',
        layout: 'wide',
      },
      {
        src: '/projects/flight-tracker-ai/route-comparison.png',
        alt: 'Flight Tracker AI route comparison explaining the distance and hazard-clearance tradeoff for a sample route option',
        width: 1412,
        height: 334,
        label: 'Route comparison',
        caption: 'A focused comparison translates modeled hazard clearance and added distance into a concise, readable tradeoff.',
        layout: 'wide',
      },
      {
        src: '/projects/flight-tracker-ai/mobile-replay.png',
        alt: 'Flight Tracker AI mobile replay interface showing replay controls and aircraft telemetry charts',
        width: 390,
        height: 844,
        label: 'Mobile replay',
        caption: 'A compact replay view preserves the scenario clock, tracked-aircraft state, and core telemetry on a phone-sized canvas.',
        layout: 'portrait',
      },
    ],
    story: {
      heading: 'Making a dense air picture understandable and reviewable.',
      problem:
        'Aircraft positions become useful only when traffic, weather, hazards, trajectories, and time are understood together. Live data also makes interface behavior difficult to review consistently from one session to the next.',
      contribution:
        'I built a map-led portfolio demo with live and replay traffic, regional weather context, selected-aircraft detail, route comparison, and explainable attention cues. A typed browser interface connects to a Rust service and spatial data layer.',
      decisions: [
        {
          title: 'Live when available, repeatable when needed',
          detail: 'The same workspace supports current regional traffic and deterministic scenarios that can be replayed during design and engineering review.',
        },
        {
          title: 'Keep the primary question spatial',
          detail: 'Traffic, weather, trails, and route context stay anchored to the map while supporting detail remains close enough to inspect without losing place.',
        },
        {
          title: 'Explain why something needs attention',
          detail: 'Priority cues expose the contributing conditions and rule result instead of presenting an unexplained score or model judgment.',
        },
      ],
    },
    stack: ['Next.js', 'TypeScript', 'Rust + Axum', 'PostgreSQL + PostGIS', 'NOAA data', 'Vercel'],
    architecture: [
      { id: 'traffic', label: 'Traffic + weather', detail: 'Live or replay data with NOAA weather and hazard sources' },
      { id: 'frontend', label: 'Map interface', detail: 'Next.js and TypeScript presentation layer' },
      { id: 'api', label: 'Rust API', detail: 'Axum service for domain logic and data access' },
      { id: 'spatial', label: 'Spatial store', detail: 'PostgreSQL and PostGIS for geospatial queries' },
      { id: 'explain', label: 'Attention layer', detail: 'Explainable cues and constrained draft assistance' },
    ],
    maturity: 'deployed_demo',
    sourceId: 'portfolio:source:project:flight-tracker-ai',
    evidence: [
      {
        id: 'portfolio:claim:flight-tracker-ai:live-replay', sourceIds: ['portfolio:source:project:flight-tracker-ai'],
        text: 'Supports both live and deterministic replay modes so product behavior can be reviewed without depending on current air traffic.',
        strength: 'strong', maturity: 'deployed_demo', limitations: ['Replay mode is a review aid, not live operational evidence.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:flight-tracker-ai:geospatial-context', sourceIds: ['portfolio:source:project:flight-tracker-ai'],
        text: 'Connects aircraft, trajectory, weather, and hazard context in a single geospatial product surface.',
        strength: 'strong', maturity: 'deployed_demo', limitations: ['Not certified for aviation operations.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:flight-tracker-ai:typed-system', sourceIds: ['portfolio:source:project:flight-tracker-ai'],
        text: 'Uses a typed browser-to-service architecture with a Rust API and a spatial database.',
        strength: 'strong', maturity: 'deployed_demo', limitations: ['Portfolio deployment does not establish production traffic scale.'], reviewState: 'approved', publicApproved: true,
      },
    ],
    boundaries: [
      'The product is a portfolio demonstration, not a certified aviation system.',
      'It is not intended for flight planning, dispatch, aircraft control, or operational decision-making.',
    ],
    repositoryUrl: 'https://github.com/carlwelchdesign/flight-tracker-ai',
    liveUrl: 'https://flight-tracker-ai-one.vercel.app',
  },
  {
    slug: 'wave-factory-essentials',
    name: 'Wave Factory Essentials',
    category: 'Audio software / DSP',
    status: 'Pre-release tester builds',
    tone: 'green',
    number: '03',
    summary:
      'A family of focused audio plug-ins designed as real AU, VST3, and CLAP products, with custom interfaces, local signal processing, and host-level validation gates.',
    role: 'Creator and plug-in engineer',
    scope: 'DSP, plug-in architecture, interface design, and product direction',
    image: {
      src: '/projects/wave-factory-threefold-palm.png',
      alt: 'Threefold Palm audio plug-in interface from the Wave Factory Essentials collection',
      width: 724,
      height: 567,
    },
    galleryTitle: 'A plug-in family with its own visual world',
    gallerySummary:
      'The collection pairs purpose-built controls with a distinct art direction for each instrument. These are product interfaces and source art from the plug-ins themselves.',
    gallery: [
      {
        src: '/projects/wave-factory-essentials/valley-spirit-interface.png',
        alt: 'Valley Spirit audio plug-in interface running inside a plug-in host',
        width: 764,
        height: 587,
        label: 'Valley Spirit',
        caption: 'A five-control pitch-shifting echo presented as a moonlit, playable instrument rather than a generic utility panel.',
        layout: 'wide',
      },
      {
        src: '/projects/wave-factory-essentials/threefold-palm-gesture-surface.png',
        alt: 'Threefold Palm visual surface with a martial-arts figure and animated energy treatment',
        width: 724,
        height: 460,
        label: 'Threefold Palm / gesture state',
        caption: 'The alternate gesture surface leaves room for controls while the character and energy treatment communicate an active performance state.',
      },
      {
        src: '/projects/wave-factory-essentials/valley-spirit-gesture-surface.png',
        alt: 'Valley Spirit visual surface with moonlit mountains and an animated energy gesture',
        width: 764,
        height: 460,
        label: 'Valley Spirit / gesture state',
        caption: 'A second performance state extends the same nocturnal visual language used by the finished plug-in interface.',
      },
      {
        src: '/projects/wave-factory-essentials/threefold-palm-temple-of-mastery.png',
        alt: 'Threefold Palm Temple of Mastery source art with a martial-arts master inside a dark mountain temple',
        width: 1440,
        height: 880,
        label: 'Threefold Palm / Temple of Mastery',
        caption: 'The high-resolution Temple of Mastery scene provides the atmosphere and negative space that the plug-in controls occupy.',
        layout: 'wide',
      },
      {
        src: '/projects/wave-factory-essentials/spirit-mirror-scene.png',
        alt: 'Spirit Mirror source art showing a spectral hand reflected in an ornate moonlit mirror',
        width: 760,
        height: 460,
        label: 'Spirit Mirror / visual foundation',
        caption: 'The source scene for Spirit Mirror establishes the spectral, camera-conducted member of the product family.',
        layout: 'wide',
      },
    ],
    story: {
      heading: 'Treating every plug-in as a product, not a demo.',
      problem:
        'An audio effect can sound interesting and still feel unfinished if it lives in a standalone prototype or a generic control panel. The signal path, host behavior, automation, interface, and release process all shape the instrument musicians actually use.',
      contribution:
        'I am building a family of host-loadable AU, VST3, and CLAP effects in C++ and iPlug2, pairing local signal processing with custom interfaces and distinct visual identities. The current builds are for testing while the remaining host and release gates are worked through.',
      decisions: [
        {
          title: 'Build for the host from the start',
          detail: 'The products use real plug-in formats, stable parameters, saved state, and automation boundaries rather than postponing host integration.',
        },
        {
          title: 'Keep the signal path local',
          detail: 'DSP runs deterministically on the machine with no account, upload, telemetry, or network service required to process audio.',
        },
        {
          title: 'One family, distinct instruments',
          detail: 'Shared engineering discipline supports interfaces with their own control language, atmosphere, help, metering, and performance states.',
        },
      ],
    },
    stack: ['C++', 'iPlug2', 'AU', 'VST3', 'CLAP', 'DSP'],
    architecture: [
      { id: 'host', label: 'DAW host', detail: 'Audio Unit, VST3, or CLAP plug-in host' },
      { id: 'params', label: 'Parameters', detail: 'Stable automation and state boundaries' },
      { id: 'dsp', label: 'Local DSP', detail: 'Deterministic audio processing without network dependencies' },
      { id: 'interface', label: 'Custom UI', detail: 'Purpose-built controls, metering, and help surfaces' },
      { id: 'validation', label: 'Release gates', detail: 'Host, listening, automation, signing, and packaging checks' },
    ],
    maturity: 'pre_release',
    sourceId: 'portfolio:source:project:wave-factory-essentials',
    evidence: [
      {
        id: 'portfolio:claim:wave-factory-essentials:plugin-formats', sourceIds: ['portfolio:source:project:wave-factory-essentials'],
        text: 'Targets AU, VST3, and CLAP rather than substituting a standalone demonstration for a host-loadable product.',
        strength: 'strong', maturity: 'pre_release', limitations: ['Host-loadable builds are not equivalent to public release.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:wave-factory-essentials:local-dsp', sourceIds: ['portfolio:source:project:wave-factory-essentials'],
        text: 'Keeps signal processing offline and local, with no accounts, uploads, telemetry, or model service dependency.',
        strength: 'strong', maturity: 'pre_release', limitations: ['Applies to the current plug-in architecture.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:wave-factory-essentials:release-gates', sourceIds: ['portfolio:source:project:wave-factory-essentials'],
        text: 'Treats build output, host validation, listening tests, signing, and packaging as separate release gates.',
        strength: 'strong', maturity: 'pre_release', limitations: ['Several release gates remain open.'], reviewState: 'approved', publicApproved: true,
      },
    ],
    boundaries: [
      'Current artifacts are pre-release tester builds. The products have not been publicly released.',
      'Release still depends on host, platform, signing, notarization, and packaging checks.',
    ],
    repositoryUrl: 'https://github.com/carlwelchdesign/wave-factory-essentials',
  },
  {
    slug: 'supraconscious-avatar-ai',
    name: 'Supraconscious Avatar AI',
    category: 'AI product / Reflection systems',
    status: 'Deployed web application / mobile scaffold',
    tone: 'red',
    number: '04',
    summary:
      'A multi-surface reflection product that turns journal entries into guided questions while giving the operator a separate place to govern prompts, sources, safety, and review.',
    role: 'Independent product engineer',
    scope: 'Product strategy, AI system design, and full-stack implementation',
    image: {
      src: '/projects/supraconscious-avatar-ai/landing-page.png',
      alt: 'Supraconscious Avatar AI landing page introducing the Mirror reflection experience',
      width: 760,
      height: 720,
    },
    galleryTitle: 'The product and its control boundaries',
    gallerySummary:
      'The public entry point, guided journal, privacy controls, and plan surface show a product designed around one coherent reflection experience rather than a loose collection of AI features.',
    gallery: [
      {
        src: '/projects/supraconscious-avatar-ai/journal-workspace.png',
        alt: 'Supraconscious Avatar AI journal workspace with guided reflection scenarios and a daily writing frame',
        width: 760,
        height: 720,
        label: 'Journal workspace',
        caption: 'Guided scenarios and a focused writing surface give each reflection a clear place to begin.',
      },
      {
        src: '/projects/supraconscious-avatar-ai/privacy-settings.png',
        alt: 'Supraconscious Avatar AI settings for language, passkeys, safety, memory, and account preferences',
        width: 760,
        height: 720,
        label: 'Privacy and preferences',
        caption: 'Passkeys, safety, memory, and account controls are treated as part of the product experience, not buried operational details.',
      },
      {
        src: '/projects/supraconscious-avatar-ai/pricing-page.png',
        alt: 'Supraconscious Avatar AI pricing page comparing product plans and billing availability',
        width: 760,
        height: 720,
        label: 'Plan comparison',
        caption: 'A CMS-backed plan surface connects the customer-facing offer to the product’s operational control plane.',
      },
    ],
    story: {
      heading: 'Building a reflection product that can be governed.',
      problem:
        'A journaling product can generate polished language and still fail its user if safety, source selection, memory, and prompt changes are hidden inside an opaque model call. Sensitive reflection needs a clear experience for the person writing and a disciplined operating surface behind it.',
      contribution:
        'I designed and built a multi-app system with a Next.js journal product, a separate admin and content-governance console, an MCP-compatible service, shared AI packages, and PostgreSQL persistence. The active flow uses one consistent guide while source eligibility, safety, prompts, and review remain visible to the operator.',
      decisions: [
        {
          title: 'One guide, one product voice',
          detail: 'The active reflection flow uses one consistent guide instead of exposing internal role orchestration as a cast of competing personas.',
        },
        {
          title: 'Govern retrieval before expanding it',
          detail: 'Source review, rights, quote rules, safety intensity, and traceability are enforced before future vector search or broader graph retrieval is introduced.',
        },
        {
          title: 'Separate the experience from the control plane',
          detail: 'The journal stays focused on reflection while a distinct admin application owns prompts, sources, feature flags, quality review, and operational state.',
        },
      ],
    },
    stack: ['Next.js', 'TypeScript', 'PostgreSQL + Prisma', 'OpenAI', 'MCP', 'Flutter'],
    architecture: [
      { id: 'clients', label: 'Web + MCP clients', detail: 'Journal experience and compatible external AI entry points' },
      { id: 'guide', label: 'Guide service', detail: 'Safety checks, structured analysis, and one active reflection voice' },
      { id: 'retrieval', label: 'Governed retrieval', detail: 'Reviewed sources, rights rules, provenance, and optional ontology context' },
      { id: 'store', label: 'PostgreSQL', detail: 'Journal state, source records, traces, feedback, and review metadata' },
      { id: 'admin', label: 'Admin control plane', detail: 'Prompt, source, safety, quality, feature, and subscription operations' },
    ],
    maturity: 'pre_release',
    sourceId: 'portfolio:source:project:supraconscious-avatar-ai',
    evidence: [
      {
        id: 'portfolio:claim:supraconscious-avatar-ai:multi-app-system',
        sourceIds: ['portfolio:source:project:supraconscious-avatar-ai'],
        text: 'Combines a user-facing journal, a separate admin and content-governance application, an MCP-compatible service, shared AI packages, and PostgreSQL persistence.',
        strength: 'strong', maturity: 'pre_release', limitations: ['The Flutter mobile client remains scaffolded.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:supraconscious-avatar-ai:policy-first-retrieval',
        sourceIds: ['portfolio:source:project:supraconscious-avatar-ai'],
        text: 'Gates retrieval by source review, rights metadata, quote permissions, safety intensity, feature state, and citation traceability.',
        strength: 'strong', maturity: 'pre_release', limitations: ['Current retrieval is policy-first and keyword based; vector search is future work.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:supraconscious-avatar-ai:separate-control-plane',
        sourceIds: ['portfolio:source:project:supraconscious-avatar-ai'],
        text: 'Keeps prompt, source, safety, feature, quality, and subscription operations in a separate admin control plane.',
        strength: 'strong', maturity: 'pre_release', limitations: ['Graph-assisted runtime context remains feature-flagged and disabled by default.'], reviewState: 'approved', publicApproved: true,
      },
    ],
    boundaries: [
      'The web product is deployed, while the Flutter mobile client remains a scaffold rather than a released mobile application.',
      'Retrieval is currently policy-first and keyword based; vector search is planned, and graph-assisted runtime context is disabled by default.',
    ],
    repositoryUrl: 'https://github.com/carlwelchdesign/supraconscious-avatar-ai',
  },
  {
    slug: 'argent-matchmaking',
    name: 'Argent Matchmaking',
    category: 'Product strategy / Private services',
    status: 'Synthetic concept prototype',
    tone: 'orange',
    number: '05',
    summary:
      'A human-led matchmaking concept spanning a discreet public experience, member mobile surface, matchmaker workspace, shared design system, and the beginnings of a production-minded platform.',
    role: 'Product engineer and system designer',
    scope: 'Product strategy, interface art direction, platform architecture, and implementation',
    image: {
      src: '/projects/argent-matchmaking/product-system.png',
      alt: 'Argent Matchmaking product system showing design tokens, public web, mobile introduction, and matchmaker review workspace',
      width: 1536,
      height: 1024,
    },
    galleryTitle: 'A private-service world across every surface',
    gallerySummary:
      'The concept pairs a restrained Nocturne interface system with campaign imagery designed for discretion, intimacy, and a high-touch service rather than mass-market dating mechanics.',
    gallery: [
      {
        src: '/projects/argent-matchmaking/couple-direction.png',
        alt: 'Argent campaign image of a couple overlooking the coast at sunset',
        width: 1280,
        height: 853,
        label: 'Relationship direction',
        caption: 'The selected campaign direction presents mature chemistry and privacy without drifting into generic dating-app imagery.',
        layout: 'wide',
      },
      {
        src: '/projects/argent-matchmaking/coastal-residence.png',
        alt: 'Argent coastal residence image used for the private-service concept',
        width: 1672,
        height: 941,
        label: 'Service environment',
        caption: 'A quiet coastal residence establishes the restrained, place-specific atmosphere behind the public introduction experience.',
        layout: 'wide',
      },
      {
        src: '/projects/argent-matchmaking/gallery-environment.png',
        alt: 'Argent gallery interior image with sea view and a sculptural branch arrangement',
        width: 1681,
        height: 935,
        label: 'Nocturne image system',
        caption: 'Architectural imagery gives the brand room to feel considered and editorial while the interface remains disciplined and legible.',
        layout: 'wide',
      },
    ],
    story: {
      heading: 'Designing for judgment, discretion, and human review.',
      problem:
        'A private matchmaking service cannot borrow the mechanics or tone of a swipe-based marketplace. Applicants, members, matchmakers, consent decisions, and introductions each need a different surface, while sensitive policy and data must stay out of public and mobile bundles.',
      contribution:
        'I shaped the product strategy and built the current synthetic concept alongside a multi-app foundation: public and staff web surfaces, a Flutter mobile client, Fastify API, worker, generated contracts, server-only domain and database packages, Docker verification, and a shared cross-platform design system.',
      decisions: [
        {
          title: 'Human-led by design',
          detail: 'The interface centers matchmaker judgment, consent, provenance, and review state instead of presenting an autonomous matching score as the product.',
        },
        {
          title: 'Separate public and staff surfaces',
          detail: 'The operational workspace is a distinct application boundary rather than an admin route hidden inside the public experience.',
        },
        {
          title: 'Share contracts and tokens, not sensitive policy',
          detail: 'Generated clients and semantic design tokens can cross web and mobile, while authorization rules, matchmaking policy, and provider credentials remain server-only.',
        },
      ],
    },
    stack: ['Next.js', 'TypeScript', 'Fastify', 'Flutter', 'PostgreSQL', 'Docker'],
    architecture: [
      { id: 'surfaces', label: 'Public + mobile', detail: 'Synthetic applicant, member, and introduction experiences' },
      { id: 'contracts', label: 'Generated contracts', detail: 'OpenAPI source with TypeScript and Dart clients' },
      { id: 'api', label: 'Fastify API', detail: 'Versioned service boundary for future application workflows' },
      { id: 'domain', label: 'Domain + database', detail: 'Server-only policy, migrations, and synthetic fixture controls' },
      { id: 'operations', label: 'Staff + worker', detail: 'Separate review workspace and background process foundation' },
    ],
    maturity: 'prototype',
    sourceId: 'portfolio:source:project:argent-matchmaking',
    evidence: [
      {
        id: 'portfolio:claim:argent-matchmaking:multi-app-foundation',
        sourceIds: ['portfolio:source:project:argent-matchmaking'],
        text: 'Organizes public web, separate staff web, Flutter mobile, API, worker, domain policy, database, generated contracts, and design-system packages in one monorepo.',
        strength: 'strong', maturity: 'prototype', limitations: ['The visible experience remains a synthetic concept prototype.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:argent-matchmaking:contract-boundaries',
        sourceIds: ['portfolio:source:project:argent-matchmaking'],
        text: 'Keeps generated client contracts and design tokens cross-platform while reserving authorization rules, sensitive policy, and provider credentials for server-only packages.',
        strength: 'strong', maturity: 'prototype', limitations: ['Production identity and provider decisions remain future work.'], reviewState: 'approved', publicApproved: true,
      },
      {
        id: 'portfolio:claim:argent-matchmaking:docker-ci-foundation',
        sourceIds: ['portfolio:source:project:argent-matchmaking'],
        text: 'Includes Docker smoke verification across five local services plus quality, secret, dependency, code-scanning, container-security, and SBOM checks in CI.',
        strength: 'strong', maturity: 'prototype', limitations: ['Local and CI verification do not establish a production service.'], reviewState: 'approved', publicApproved: true,
      },
    ],
    boundaries: [
      'The current screen uses synthetic content and has no accounts, submissions, stored profiles, real matching, or production workflow.',
      'The broader architecture is a reviewed direction and implementation foundation; provider selection, production identity, real data, and launch remain separate work.',
    ],
    repositoryUrl: 'https://github.com/carlwelchdesign/matchmaker-ai',
  },
];

export type ExperienceRole = {
  id: string;
  sourceId: `portfolio:source:experience:${string}`;
  company: string;
  role: string;
  dates: string;
  summary: string;
  stack: string[];
};

export const experience: ExperienceRole[] = [
  {
    id: 'yubico',
    sourceId: 'portfolio:source:experience:yubico',
    company: 'Yubico',
    role: 'Senior Software Engineer',
    dates: 'Jul 2022 — Mar 2026',
    summary:
      'Built enterprise administration interfaces, shared components, Storybook documentation, and test infrastructure for security-product workflows.',
    stack: ['React', 'TypeScript', 'Storybook', 'Testing'],
  },
  {
    id: 'revenue-io',
    sourceId: 'portfolio:source:experience:revenue-io',
    company: 'Revenue.io',
    role: 'Senior Software Engineer',
    dates: 'Mar 2020 — Jul 2022',
    summary:
      'Developed analytics dashboards and helped move a mature application from Backbone toward React and TypeScript.',
    stack: ['React', 'TypeScript', 'Analytics', 'Backbone'],
  },
  {
    id: 'bosch',
    sourceId: 'portfolio:source:experience:bosch',
    company: 'Bosch',
    role: 'Lead Frontend Developer',
    dates: 'Jul 2018 — Mar 2020',
    summary:
      'Led frontend delivery for B2B ridesharing products spanning maps, scheduling, responsive interfaces, and coordinated releases.',
    stack: ['React', 'TypeScript', 'Maps', 'Mobile web'],
  },
  {
    id: 'bridg',
    sourceId: 'portfolio:source:experience:bridg',
    company: 'Bridg',
    role: 'Senior Frontend Engineer',
    dates: 'Dec 2017 — Aug 2018',
    summary:
      'Built data-rich product interfaces for analytics, audience segmentation, and customer intelligence workflows.',
    stack: ['React', 'Data visualization', 'Analytics'],
  },
  {
    id: 'grindr',
    sourceId: 'portfolio:source:experience:grindr',
    company: 'Grindr',
    role: 'Senior Web Developer / Manager',
    dates: 'Apr 2016 — Aug 2017',
    summary:
      'Delivered in-app campaign and content-management tooling while managing web engineering work and cross-functional delivery.',
    stack: ['JavaScript', 'Campaign tooling', 'CMS', 'Engineering management'],
  },
];

export const earlierExperience = [
  'SapientNitro',
  'Nezzoh',
  'Trailer Park',
  'BPG',
  'Petrol',
  'TASER / AXON',
  'General Dynamics',
  'U.S. Army',
];

export const recommendationReview = {
  candidateCount: 13,
  sourceObservedAt: '2026-08-27T02:40:37Z',
  sourceUrl: 'https://www.linkedin.com/in/carlwelch/details/recommendations/',
  reconciliationState: 'source_verified_publication_approved',
};

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
