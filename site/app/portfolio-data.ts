import type { ProjectMaturity, PublicEvidenceRecord } from './evidence-types';

export type ProjectTone = 'red' | 'orange' | 'green';

export type ArchitectureNodeKind = 'surface' | 'service' | 'data' | 'ai' | 'integration' | 'control' | 'runtime';

export type ArchitectureNode = {
  id: string;
  label: string;
  detail: string;
  technology: string;
  kind: ArchitectureNodeKind;
  x: number;
  y: number;
  width?: number;
};

export type ArchitectureGroup = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ArchitectureEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  bidirectional?: boolean;
};

export type ProjectArchitecture = {
  title: string;
  summary: string;
  groups: ArchitectureGroup[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
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
  architecture: ProjectArchitecture;
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
    architecture: {
      title: 'Human-reviewed career operations',
      summary: 'Four product surfaces share one evidence and orchestration layer; every consequential external action stops at an approval boundary.',
      groups: [
        { id: 'surfaces', label: 'Product surfaces', detail: 'Ways Carl enters and reviews work', x: 20, y: 35, width: 205, height: 550 },
        { id: 'core', label: 'Application + orchestration', detail: 'Server-owned workflow boundary', x: 250, y: 35, width: 410, height: 550 },
        { id: 'state', label: 'Durable state', detail: 'Shared operational record', x: 685, y: 35, width: 295, height: 250 },
        { id: 'gates', label: 'Controlled exits', detail: 'No autonomous submission', x: 685, y: 310, width: 295, height: 275 },
      ],
      nodes: [
        { id: 'dashboard', label: 'Daily cockpit', detail: 'Search, fit, materials, review', technology: 'Next.js · React', kind: 'surface', x: 42, y: 105, width: 160 },
        { id: 'chrome', label: 'Browser capture', detail: 'Role and source intake', technology: 'Chrome extension', kind: 'surface', x: 42, y: 225, width: 160 },
        { id: 'slack', label: 'Jolene command', detail: 'Private operator channel', technology: 'Slack', kind: 'surface', x: 42, y: 345, width: 160 },
        { id: 'mcp', label: 'Local tool access', detail: 'Tracking and preparation tools', technology: 'MCP · stdio', kind: 'surface', x: 42, y: 465, width: 160 },
        { id: 'api', label: 'Workflow API', detail: 'Typed routes and policy checks', technology: 'Next.js App Router', kind: 'service', x: 275, y: 105, width: 160 },
        { id: 'agents', label: 'Specialist agents', detail: 'Structured outputs + fallbacks', technology: 'OpenAI', kind: 'ai', x: 470, y: 105, width: 165 },
        { id: 'rag', label: 'Evidence RAG', detail: 'Approved career evidence only', technology: 'pgvector', kind: 'ai', x: 275, y: 265, width: 160 },
        { id: 'graph', label: 'Durable workflows', detail: 'Runs, checkpoints, review state', technology: 'LangGraph', kind: 'service', x: 470, y: 265, width: 165 },
        { id: 'worker', label: 'Background worker', detail: 'Embeddings and queued work', technology: 'Node.js · Redis', kind: 'runtime', x: 372, y: 440, width: 170 },
        { id: 'postgres', label: 'System of record', detail: 'Roles, claims, runs, materials', technology: 'PostgreSQL', kind: 'data', x: 710, y: 105, width: 150 },
        { id: 'vector', label: 'Semantic index', detail: 'Career evidence embeddings', technology: 'pgvector', kind: 'data', x: 805, y: 195, width: 150 },
        { id: 'approval', label: 'Owner approval', detail: 'Review before consequence', technology: 'Policy gate', kind: 'control', x: 710, y: 385, width: 155 },
        { id: 'external', label: 'External channels', detail: 'ATS, email, LinkedIn', technology: 'Manual / approved', kind: 'integration', x: 805, y: 485, width: 150 },
      ],
      edges: [
        { from: 'dashboard', to: 'api' }, { from: 'chrome', to: 'api', label: 'capture' },
        { from: 'slack', to: 'agents' }, { from: 'mcp', to: 'api' },
        { from: 'api', to: 'agents', label: 'plan' }, { from: 'api', to: 'rag' },
        { from: 'agents', to: 'graph' }, { from: 'rag', to: 'vector' },
        { from: 'graph', to: 'postgres' }, { from: 'graph', to: 'worker', dashed: true },
        { from: 'worker', to: 'postgres' }, { from: 'agents', to: 'approval', label: 'propose' },
        { from: 'approval', to: 'external', label: 'approved only' },
      ],
    },
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
    architecture: {
      title: 'Regional aviation intelligence',
      summary: 'Live providers and deterministic fixtures enter one Rust domain service; the browser receives a sanitized, read-only air picture.',
      groups: [
        { id: 'providers', label: 'External observations', detail: 'Best-effort public data', x: 20, y: 35, width: 235, height: 550 },
        { id: 'domain', label: 'Domain service', detail: 'Rust owns aviation policy', x: 280, y: 35, width: 390, height: 550 },
        { id: 'platform', label: 'Hosted platform', detail: 'Read-only public deployment', x: 695, y: 35, width: 285, height: 550 },
      ],
      nodes: [
        { id: 'adsb', label: 'Aircraft positions', detail: 'Primary + fallback feeds', technology: 'ADSB.lol · Airplanes.live', kind: 'integration', x: 45, y: 100, width: 185 },
        { id: 'weather', label: 'Aviation weather', detail: 'METAR, TAF, PIREP, SIGMET', technology: 'NOAA AWC', kind: 'integration', x: 45, y: 225, width: 185 },
        { id: 'radar', label: 'Weather imagery', detail: 'Radar and forecast layers', technology: 'nowCOAST · GFS/HRRR', kind: 'integration', x: 45, y: 350, width: 185 },
        { id: 'maps', label: 'Base map', detail: 'Vector tiles and geography', technology: 'OpenFreeMap · OSM', kind: 'integration', x: 45, y: 475, width: 185 },
        { id: 'ingest', label: 'Ingestion + normalize', detail: 'Provider fallback and typed records', technology: 'Rust · Axum', kind: 'service', x: 310, y: 105, width: 170 },
        { id: 'geometry', label: 'Spatial engine', detail: 'Trails, regions, route geometry', technology: 'Rust · PostGIS', kind: 'service', x: 475, y: 235, width: 165 },
        { id: 'attention', label: 'Attention policy', detail: 'Explainable rules and factors', technology: 'Deterministic Rust', kind: 'control', x: 310, y: 365, width: 170 },
        { id: 'drafting', label: 'Constrained wording', detail: 'Synthetic recommendation phrasing only', technology: 'OpenAI + fallback', kind: 'ai', x: 475, y: 475, width: 165 },
        { id: 'postgis', label: 'Spatial record', detail: 'Aircraft, observations, scenarios', technology: 'Neon · PostgreSQL/PostGIS', kind: 'data', x: 720, y: 105, width: 225 },
        { id: 'fixtures', label: 'Replay fixtures', detail: 'Repeatable review scenarios', technology: 'Deterministic JSON', kind: 'data', x: 720, y: 235, width: 225 },
        { id: 'api', label: 'Public read API', detail: 'Sanitized, no-store responses', technology: 'Render · Axum', kind: 'service', x: 720, y: 365, width: 225 },
        { id: 'map-ui', label: 'Interactive airspace', detail: 'Traffic, weather, replay, comparison', technology: 'Vercel · Next.js · MapLibre', kind: 'surface', x: 720, y: 495, width: 225 },
      ],
      edges: [
        { from: 'adsb', to: 'ingest' }, { from: 'weather', to: 'ingest' },
        { from: 'radar', to: 'map-ui', dashed: true }, { from: 'maps', to: 'map-ui', dashed: true },
        { from: 'ingest', to: 'postgis' }, { from: 'ingest', to: 'geometry' },
        { from: 'postgis', to: 'geometry', bidirectional: true }, { from: 'fixtures', to: 'geometry', label: 'replay' },
        { from: 'geometry', to: 'attention' }, { from: 'attention', to: 'drafting', dashed: true },
        { from: 'attention', to: 'api' }, { from: 'drafting', to: 'api' }, { from: 'api', to: 'map-ui' },
      ],
    },
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
    architecture: {
      title: 'Host-loadable real-time audio system',
      summary: 'The DAW, plug-in adapter, real-time DSP, interface, and optional camera controller remain deliberately separated by thread and process boundaries.',
      groups: [
        { id: 'host', label: 'Audio host', detail: 'Musician-owned runtime', x: 20, y: 35, width: 210, height: 550 },
        { id: 'plugin', label: 'Plug-in process', detail: 'Hard real-time boundary', x: 255, y: 35, width: 425, height: 550 },
        { id: 'gesture', label: 'Optional local control', detail: 'Never required for audio', x: 705, y: 35, width: 275, height: 345 },
        { id: 'release', label: 'Release gates', detail: 'Separate evidence, not one checkbox', x: 705, y: 405, width: 275, height: 180 },
      ],
      nodes: [
        { id: 'daw', label: 'DAW session', detail: 'Audio, automation, saved state', technology: 'Logic · host DAW', kind: 'surface', x: 45, y: 115, width: 160 },
        { id: 'formats', label: 'Format adapters', detail: 'Host lifecycle and parameter bridge', technology: 'AU · VST3 · CLAP', kind: 'runtime', x: 45, y: 285, width: 160 },
        { id: 'automation', label: 'Host automation', detail: 'Stable IDs and normalized values', technology: 'iPlug2 parameters', kind: 'control', x: 45, y: 455, width: 160 },
        { id: 'adapter', label: 'iPlug2 adapter', detail: 'Host events into product code', technology: 'C++ · iPlug2', kind: 'runtime', x: 285, y: 105, width: 170 },
        { id: 'dsp', label: 'Shared DSP core', detail: 'No allocation, locks, file or network I/O', technology: 'wave_factory_dsp', kind: 'service', x: 475, y: 105, width: 175 },
        { id: 'signal', label: 'Product signal path', detail: 'Split, shape, delay, diffuse, mix', technology: 'C++ real-time audio', kind: 'service', x: 380, y: 270, width: 175 },
        { id: 'meters', label: 'Meter bridge', detail: 'Relaxed atomics leave audio thread clean', technology: 'Lock-free state', kind: 'runtime', x: 285, y: 455, width: 170 },
        { id: 'ui', label: 'Custom interface', detail: 'Controls, help, metering, art direction', technology: 'iPlug2 UI', kind: 'surface', x: 475, y: 455, width: 175 },
        { id: 'camera', label: 'Camera helper', detail: 'Local capture outside plug-in process', technology: 'macOS helper', kind: 'surface', x: 730, y: 100, width: 220 },
        { id: 'vision', label: 'Hand pose model', detail: 'Two 21-point hand skeletons', technology: 'Apple Vision', kind: 'ai', x: 730, y: 205, width: 220 },
        { id: 'midi', label: 'Gesture bridge', detail: 'Six signals over local bridge or MIDI', technology: 'CC 20–25 · local IPC', kind: 'integration', x: 730, y: 310, width: 220 },
        { id: 'gates', label: 'Validation pipeline', detail: 'Host · listening · signing · packaging', technology: 'auval · CI · notarization', kind: 'control', x: 730, y: 475, width: 220 },
      ],
      edges: [
        { from: 'daw', to: 'formats' }, { from: 'formats', to: 'adapter' },
        { from: 'automation', to: 'adapter' }, { from: 'adapter', to: 'dsp' },
        { from: 'dsp', to: 'signal', bidirectional: true }, { from: 'signal', to: 'meters' },
        { from: 'meters', to: 'ui' }, { from: 'ui', to: 'adapter', bidirectional: true },
        { from: 'camera', to: 'vision' }, { from: 'vision', to: 'midi' },
        { from: 'midi', to: 'automation', label: 'optional', dashed: true },
        { from: 'adapter', to: 'gates', label: 'build artifacts', dashed: true },
      ],
    },
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
      src: '/projects/supraconscious-avatar-ai/current-landing.png',
      alt: 'Current Supraconscious landing experience with a dark mineral background, editorial typography, and private reflection entry points',
      width: 1440,
      height: 1096,
    },
    galleryTitle: 'The redesigned public product experience',
    gallerySummary:
      'The current public experience explains the reflection model, keeps authorship with the user, presents the plan structure without pressure, and carries the same editorial system onto a phone.',
    gallery: [
      {
        src: '/projects/supraconscious-avatar-ai/reflection-method.png',
        alt: 'Supraconscious reflection method explaining user words, a tentative generated perspective, and a user-authored action',
        width: 1440,
        height: 884,
        label: 'Reflection method',
        caption: 'The public explanation makes the authorship boundary visible: the user brings the words, the Guide offers a tentative perspective, and the user chooses what to carry forward.',
        layout: 'wide',
      },
      {
        src: '/projects/supraconscious-avatar-ai/plans-and-access.png',
        alt: 'Supraconscious plan comparison showing free, starter, and pro reflection options',
        width: 1440,
        height: 809,
        label: 'Plans and access',
        caption: 'The plan section presents a free starting point and two paid continuity options in the same restrained product language.',
        layout: 'wide',
      },
      {
        src: '/projects/supraconscious-avatar-ai/mobile-landing.png',
        alt: 'Current Supraconscious mobile landing experience with language selection and reflection entry controls',
        width: 390,
        height: 844,
        label: 'Mobile entry',
        caption: 'The phone layout preserves the editorial hierarchy, language control, and primary reflection action without reducing the experience to a generic app shell.',
        layout: 'portrait',
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
    architecture: {
      title: 'Governed reflection platform',
      summary: 'Customer surfaces share a policy-first AI package and database, while a separately deployed admin plane controls prompts, sources, safety, and feature state.',
      groups: [
        { id: 'experiences', label: 'Experience surfaces', detail: 'User and compatible AI clients', x: 20, y: 35, width: 225, height: 550 },
        { id: 'ai', label: 'Shared AI runtime', detail: 'Policy before generation', x: 270, y: 35, width: 400, height: 550 },
        { id: 'state', label: 'Durable knowledge + state', detail: 'Server-only persistence', x: 695, y: 35, width: 285, height: 285 },
        { id: 'ops', label: 'Operator control plane', detail: 'Separately deployed admin', x: 695, y: 345, width: 285, height: 240 },
      ],
      nodes: [
        { id: 'web', label: 'Journal web', detail: 'Writing, reflection, privacy controls', technology: 'Next.js', kind: 'surface', x: 45, y: 105, width: 175 },
        { id: 'mcp', label: 'ChatGPT surface', detail: 'Authenticated tools + widget', technology: 'Express · MCP', kind: 'surface', x: 45, y: 250, width: 175 },
        { id: 'mobile', label: 'Mobile client', detail: 'Scaffolded product surface', technology: 'Flutter · scaffold', kind: 'surface', x: 45, y: 430, width: 175 },
        { id: 'routes', label: 'Server routes', detail: 'Auth, journal, voice, billing', technology: 'Next.js route handlers', kind: 'service', x: 300, y: 105, width: 165 },
        { id: 'safety', label: 'Safety classifier', detail: 'Intensity and response boundaries', technology: 'OpenAI · Zod', kind: 'control', x: 480, y: 105, width: 165 },
        { id: 'guide', label: 'Reflection guide', detail: 'One active voice + structured output', technology: 'Shared AI package', kind: 'ai', x: 300, y: 270, width: 165 },
        { id: 'retrieval', label: 'Governed retrieval', detail: 'Eligible reviewed sources + citations', technology: 'Policy-first keyword RAG', kind: 'ai', x: 480, y: 270, width: 165 },
        { id: 'graph', label: 'Ontology context', detail: 'Approved neighborhoods only', technology: 'GraphRAG · feature-flagged', kind: 'ai', x: 300, y: 455, width: 165 },
        { id: 'memory', label: 'Pattern memory', detail: 'Traces and reusable reflection state', technology: 'Shared AI package', kind: 'service', x: 480, y: 455, width: 165 },
        { id: 'postgres', label: 'Application record', detail: 'Journal, sources, prompts, traces', technology: 'PostgreSQL · Prisma', kind: 'data', x: 720, y: 105, width: 235 },
        { id: 'ontology', label: 'Reviewed knowledge', detail: 'Chunks, provenance, ontology state', technology: 'PostgreSQL', kind: 'data', x: 720, y: 225, width: 235 },
        { id: 'admin', label: 'Admin console', detail: 'Prompts, sources, safety, quality', technology: 'Separate Next.js app', kind: 'control', x: 720, y: 405, width: 235 },
        { id: 'stripe', label: 'Subscription boundary', detail: 'Plans and billing operations', technology: 'Stripe', kind: 'integration', x: 720, y: 505, width: 235 },
      ],
      edges: [
        { from: 'web', to: 'routes' }, { from: 'mcp', to: 'guide' },
        { from: 'mobile', to: 'routes', dashed: true, label: 'scaffold' }, { from: 'routes', to: 'safety' },
        { from: 'safety', to: 'guide' }, { from: 'guide', to: 'retrieval', bidirectional: true },
        { from: 'retrieval', to: 'ontology' }, { from: 'graph', to: 'ontology', dashed: true, label: 'flagged' },
        { from: 'guide', to: 'memory' }, { from: 'memory', to: 'postgres' },
        { from: 'routes', to: 'postgres' }, { from: 'admin', to: 'postgres', bidirectional: true },
        { from: 'admin', to: 'ontology', bidirectional: true }, { from: 'routes', to: 'stripe' },
      ],
    },
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
    architecture: {
      title: 'Private-service product foundation',
      summary: 'The current synthetic concept is split into public, staff, mobile, API, worker, contract, and server-only policy boundaries without implying a live matching service.',
      groups: [
        { id: 'clients', label: 'Cross-platform surfaces', detail: 'Synthetic experience layer', x: 20, y: 35, width: 225, height: 550 },
        { id: 'boundary', label: 'Service + contract boundary', detail: 'Versioned and generated', x: 270, y: 35, width: 390, height: 550 },
        { id: 'infra', label: 'Server-only foundation', detail: 'No real profiles or matching', x: 685, y: 35, width: 295, height: 550 },
      ],
      nodes: [
        { id: 'public', label: 'Public experience', detail: 'Editorial concept and application story', technology: 'Next.js', kind: 'surface', x: 45, y: 105, width: 175 },
        { id: 'staff', label: 'Staff workspace', detail: 'Separate matchmaker review surface', technology: 'Next.js · separate app', kind: 'surface', x: 45, y: 260, width: 175 },
        { id: 'mobile', label: 'Member mobile', detail: 'Cross-platform introduction concept', technology: 'Flutter', kind: 'surface', x: 45, y: 430, width: 175 },
        { id: 'clients', label: 'Generated clients', detail: 'One contract for web and mobile', technology: 'OpenAPI · TypeScript · Dart', kind: 'integration', x: 300, y: 105, width: 170 },
        { id: 'api', label: 'HTTP service', detail: 'Versioned workflow boundary', technology: 'Fastify', kind: 'service', x: 465, y: 260, width: 170 },
        { id: 'design', label: 'Nocturne system', detail: 'Shared semantic tokens and adapters', technology: 'Web + Flutter tokens', kind: 'surface', x: 300, y: 430, width: 170 },
        { id: 'domain', label: 'Domain policy', detail: 'Server-only rules and calculations', technology: 'Framework-light TypeScript', kind: 'control', x: 465, y: 105, width: 170 },
        { id: 'worker', label: 'Background worker', detail: 'Process and delivery foundation', technology: 'Node.js worker', kind: 'runtime', x: 465, y: 430, width: 170 },
        { id: 'postgres', label: 'Data foundation', detail: 'Migrations and synthetic fixtures', technology: 'PostgreSQL 18', kind: 'data', x: 715, y: 120, width: 235 },
        { id: 'redis', label: 'Queue foundation', detail: 'Local background coordination', technology: 'Redis 8', kind: 'data', x: 715, y: 260, width: 235 },
        { id: 'docker', label: 'Isolated runtime', detail: 'Five-service smoke verification', technology: 'Docker Compose', kind: 'runtime', x: 715, y: 400, width: 235 },
        { id: 'ci', label: 'Supply-chain gates', detail: 'Secrets, scanning, SBOM, containers', technology: 'GitHub Actions', kind: 'control', x: 715, y: 505, width: 235 },
      ],
      edges: [
        { from: 'public', to: 'clients' }, { from: 'staff', to: 'clients' }, { from: 'mobile', to: 'clients' },
        { from: 'design', to: 'public', dashed: true }, { from: 'design', to: 'staff', dashed: true }, { from: 'design', to: 'mobile', dashed: true },
        { from: 'clients', to: 'api' }, { from: 'api', to: 'domain' },
        { from: 'api', to: 'postgres' }, { from: 'api', to: 'redis' },
        { from: 'redis', to: 'worker', bidirectional: true }, { from: 'worker', to: 'postgres' },
        { from: 'docker', to: 'api', dashed: true }, { from: 'docker', to: 'worker', dashed: true },
        { from: 'docker', to: 'postgres', dashed: true }, { from: 'ci', to: 'docker', label: 'verify' },
      ],
    },
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
    dates: 'Jul 2022 to Mar 2026',
    summary:
      'Built enterprise administration interfaces, shared components, Storybook documentation, and test infrastructure for security-product workflows.',
    stack: ['React', 'TypeScript', 'Storybook', 'Testing'],
  },
  {
    id: 'revenue-io',
    sourceId: 'portfolio:source:experience:revenue-io',
    company: 'Revenue.io',
    role: 'Senior Software Engineer',
    dates: 'Mar 2020 to Jul 2022',
    summary:
      'Developed analytics dashboards and helped move a mature application from Backbone toward React and TypeScript.',
    stack: ['React', 'TypeScript', 'Analytics', 'Backbone'],
  },
  {
    id: 'bosch',
    sourceId: 'portfolio:source:experience:bosch',
    company: 'Bosch',
    role: 'Lead Frontend Developer',
    dates: 'Jul 2018 to Mar 2020',
    summary:
      'Led frontend delivery for B2B ridesharing products spanning maps, scheduling, responsive interfaces, and coordinated releases.',
    stack: ['React', 'TypeScript', 'Maps', 'Mobile web'],
  },
  {
    id: 'bridg',
    sourceId: 'portfolio:source:experience:bridg',
    company: 'Bridg',
    role: 'Senior Frontend Engineer',
    dates: 'Dec 2017 to Aug 2018',
    summary:
      'Built data-rich product interfaces for analytics, audience segmentation, and customer intelligence workflows.',
    stack: ['React', 'Data visualization', 'Analytics'],
  },
  {
    id: 'grindr',
    sourceId: 'portfolio:source:experience:grindr',
    company: 'Grindr',
    role: 'Senior Web Developer / Manager',
    dates: 'Apr 2016 to Aug 2017',
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
