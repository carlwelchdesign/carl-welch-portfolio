export type GitHubProject = {
  name: string;
  description: string;
  language: string | null;
  url: string;
  homepage: string | null;
  updatedAt: string;
  topics: string[];
  stars: number;
  kind: 'application' | 'library' | 'legacy' | 'profile';
};

export const githubSnapshotDate = '2026-08-27';
export const githubSnapshotLabel = 'August 27, 2026';

export const githubSnapshotReview = {
  sourceObservedAt: '2026-08-27T02:20:04.000Z',
  reviewer: 'Codex release-readiness audit',
  appliedVersion: 2,
} as const;

// Carl explicitly removed these repositories from the portfolio archive on
// August 27, 2026. Stable IDs keep the content sync from treating them as new
// public-portfolio candidates on every GitHub refresh.
export const githubPortfolioExclusions = [
  { name: 'carlwelchdesign', repositoryId: 1345493582 },
  { name: 'netheria-ui', repositoryId: 523149970 },
  { name: 'spaceinvaders', repositoryId: 108296292 },
  { name: 'reviewtrackers-server', repositoryId: 515778090 },
  { name: 'reviewtrackers-ui', repositoryId: 515777498 },
  { name: 'react-native-message-loader', repositoryId: 111479518 },
  { name: 'React.js-searchable-list', repositoryId: 103580544 },
  { name: 'TwitterFeedModule', repositoryId: 43186204 },
  { name: 'group_actions_CNI', repositoryId: 27100843 },
  { name: 'Primaloft', repositoryId: 25988120 },
  { name: 'Superman75thAniv', repositoryId: 25984590 },
  { name: 'TheConjuringSweepstakes', repositoryId: 25985061 },
] as const;

// Stable GitHub repository IDs make renames detectable without treating a
// repository's mutable name or URL as identity. This registry is observed
// metadata only; it does not grant public-portfolio approval.
export const githubRepositoryIds: Record<string, number> = {
  'earth-atlas-ai': 1345152510,
  'jolene-ai': 1346778647,
  'supraconscious-avatar-ai': 1223852335,
  'matchmaker-ai': 1310426591,
  'flight-tracker-ai': 1306951252,
  'wave-factory-essentials': 1330027415,
  'wave-factory-ai-production-assistant': 1327469966,
  'fruition-venture-studio': 1316602822,
  'jobsearch-dashboard-ai': 1236009640,
  'progression-lab-ai': 1183648275,
  'emf-disturbance-sim': 1212889435,
  'webauthn-core': 1197826799,
  cadillac: 37469031,
};

export const githubProjects: GitHubProject[] = [
  {
    name: 'earth-atlas-ai',
    description: 'EchoAtlas is a planned civilian SAR intelligence workbench for deterministic infrastructure-change candidates, evidence, and human-reviewed assessments.',
    language: 'Python',
    url: 'https://github.com/carlwelchdesign/earth-atlas-ai',
    homepage: null,
    updatedAt: '2026-08-26T03:44:09Z',
    topics: ['FastAPI', 'React', 'TypeScript', 'SAR', 'geospatial'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'jolene-ai',
    description: 'A policy-gated personal chief-of-staff agent with Slack, governed memory, approvals, workflows, and read-only project awareness.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/jolene-ai',
    homepage: null,
    updatedAt: '2026-08-27T02:07:53Z',
    topics: ['AI agents', 'Slack', 'approvals', 'memory'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'supraconscious-avatar-ai',
    description: 'A full-stack AI reflection platform that turns journaling into structured patterns, contradictions, and behavioral insights over time.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/supraconscious-avatar-ai',
    homepage: 'https://supraconscious-avatar-ai.vercel.app',
    updatedAt: '2026-08-25T19:58:28Z',
    topics: ['Next.js', 'Flutter', 'GraphRAG', 'MCP', 'PostgreSQL'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'matchmaker-ai',
    description: 'Argent is a human-led matchmaking concept spanning public and staff web apps, mobile clients, an API, background work, and framework-light domain policy.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/matchmaker-ai',
    homepage: null,
    updatedAt: '2026-08-25T04:57:13Z',
    topics: ['Next.js', 'Flutter', 'Fastify', 'PostgreSQL', 'Redis'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'flight-tracker-ai',
    description: 'An aviation-intelligence demo for exploring regional aircraft, weather, trajectories, and explainable attention signals on one navigable map.',
    language: 'Rust',
    url: 'https://github.com/carlwelchdesign/flight-tracker-ai',
    homepage: 'https://flight-tracker-ai-one.vercel.app',
    updatedAt: '2026-08-11T19:57:33Z',
    topics: ['Axum', 'Next.js', 'PostGIS', 'Rust', 'TypeScript'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'wave-factory-essentials',
    description: 'Offline AU, VST3, and CLAP audio plug-ins for macOS and Windows, built with C++, DSP, and iPlug2.',
    language: 'C++',
    url: 'https://github.com/carlwelchdesign/wave-factory-essentials',
    homepage: null,
    updatedAt: '2026-08-11T19:52:38Z',
    topics: ['Audio Unit', 'VST3', 'CLAP', 'DSP', 'iPlug2'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'wave-factory-ai-production-assistant',
    description: 'A cross-DAW production assistant combining real-time audio analysis with guided mixing, sound design, and production workflows.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/wave-factory-ai-production-assistant',
    homepage: null,
    updatedAt: '2026-08-08T07:06:55Z',
    topics: ['Audio analysis', 'DAW', 'AI assistant'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'fruition-venture-studio',
    description: 'A venture-studio monorepo with a public founder-intake site and a separate owner-only idea-intelligence admin.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/fruition-venture-studio',
    homepage: 'https://fruition-venture-studio.vercel.app',
    updatedAt: '2026-07-31T20:31:43Z',
    topics: ['Next.js', 'Prisma', 'PostgreSQL', 'AI workflows'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'jobsearch-dashboard-ai',
    description: 'A local-first job-search system for role discovery, evidence management, truthful application materials, outcome tracking, and controlled workflows.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/jobsearch-dashboard-ai',
    homepage: null,
    updatedAt: '2026-07-17T11:07:48Z',
    topics: ['Next.js', 'LangGraph', 'MCP', 'PostgreSQL', 'Playwright'],
    stars: 3,
    kind: 'application',
  },
  {
    name: 'progression-lab-ai',
    description: 'An AI-assisted music-theory product for generating chord progressions, voicings, and arrangement ideas with playback, visualization, and sharing.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/progression-lab-ai',
    homepage: 'https://progressionlab.app',
    updatedAt: '2026-04-28T01:13:59Z',
    topics: ['Next.js', 'OpenAI', 'music theory', 'Tone.js', 'PostgreSQL'],
    stars: 2,
    kind: 'application',
  },
  {
    name: 'emf-disturbance-sim',
    description: 'An interactive 3D electromagnetic-field lab for simulating emitter behavior, interference patterns, and contested RF zones in real time.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/emf-disturbance-sim',
    homepage: 'https://emf-disturbance-sim.vercel.app/',
    updatedAt: '2026-04-17T18:16:13Z',
    topics: ['Next.js', 'React Three Fiber', '3D', 'simulation'],
    stars: 0,
    kind: 'application',
  },
  {
    name: 'webauthn-core',
    description: 'Reusable server-side WebAuthn orchestration with pluggable adapters for challenges, credentials, and MFA state.',
    language: 'TypeScript',
    url: 'https://github.com/carlwelchdesign/webauthn-core',
    homepage: null,
    updatedAt: '2026-04-01T18:43:58Z',
    topics: ['WebAuthn', 'MFA', 'authentication', 'adapters'],
    stars: 0,
    kind: 'library',
  },
  {
    name: 'cadillac',
    description: 'A legacy HTML repository. Its public metadata does not currently include a project description or README.',
    language: 'HTML',
    url: 'https://github.com/carlwelchdesign/cadillac',
    homepage: null,
    updatedAt: '2016-01-26T21:42:23Z',
    topics: ['HTML'],
    stars: 0,
    kind: 'legacy',
  },
];
