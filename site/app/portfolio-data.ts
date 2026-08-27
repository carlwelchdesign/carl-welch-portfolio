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

export type PortfolioProject = {
  slug: string;
  name: string;
  category: string;
  status: string;
  tone: ProjectTone;
  number: string;
  summary: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  galleryTitle: string;
  gallerySummary: string;
  gallery: ProjectMedia[];
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
    image: {
      src: '/projects/job-search-os-dashboard.png',
      alt: 'Job Search OS dashboard showing the daily review cockpit and application pipeline',
      width: 1440,
      height: 1120,
    },
    galleryTitle: 'A working product, end to end',
    gallerySummary:
      'The system spans the daily cockpit, guarded application execution, live search diagnostics, human review, and the architecture connecting those surfaces.',
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
        src: '/projects/job-search-os/system-topology.png',
        alt: 'Job Search OS system topology diagram connecting the interface, control plane, agent teams, memory, and approval gates',
        width: 1600,
        height: 953,
        label: 'System topology',
        caption: 'The product surface sits above a typed control plane, specialist agent teams, durable state, and explicit approval gates.',
        layout: 'wide',
      },
    ],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL + pgvector', 'OpenAI', 'LangGraph', 'MCP'],
    architecture: [
      { id: 'sources', label: 'Job sources', detail: 'Direct ATS, company, and review-only lead channels' },
      { id: 'evidence', label: 'Evidence store', detail: 'Approved career facts, project records, and embeddings' },
      { id: 'agents', label: 'Agent workflows', detail: 'Structured outputs with deterministic fallbacks' },
      { id: 'review', label: 'Review workspace', detail: 'Fit, materials, blockers, and approval state' },
      { id: 'actions', label: 'External actions', detail: 'Manual or explicitly approval-gated' },
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
      'This is a protected single-user application, not a public applicant-submission service.',
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
    image: {
      src: '/projects/flight-tracker-desktop.png',
      alt: 'Flight Tracker AI desktop interface showing aircraft, weather, and airspace data on a dark map',
      width: 1440,
      height: 1000,
    },
    galleryTitle: 'One system, two viewing modes',
    gallerySummary:
      'The map-led desktop workspace carries the full operational picture; the mobile view distills replay status and aircraft telemetry into a focused vertical surface.',
    gallery: [
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
        src: '/projects/wave-factory-essentials/spirit-mirror-scene.png',
        alt: 'Spirit Mirror source art showing a spectral hand reflected in an ornate moonlit mirror',
        width: 760,
        height: 460,
        label: 'Spirit Mirror / visual foundation',
        caption: 'The source scene for Spirit Mirror establishes the spectral, camera-conducted member of the product family.',
        layout: 'wide',
      },
    ],
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
      'Current artifacts are pre-release tester builds and are not represented as publicly released products.',
      'Remaining host, platform, signing, notarization, and packaging checks are tracked separately from successful builds.',
    ],
    repositoryUrl: 'https://github.com/carlwelchdesign/wave-factory-essentials',
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
