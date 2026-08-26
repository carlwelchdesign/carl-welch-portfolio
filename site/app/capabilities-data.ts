import type { ProjectTone } from './portfolio-data';

export type CapabilityEvidence = {
  label: string;
  detail: string;
  href: string;
  source: 'Case study' | 'Repository' | 'Experience' | 'Recommendation';
  reference:
    | { kind: 'project'; id: string }
    | { kind: 'repository'; id: string }
    | { kind: 'company'; id: string }
    | { kind: 'recommendations'; id: 'review-collection' };
};

export type Capability = {
  id: string;
  number: string;
  name: string;
  summary: string;
  tone: ProjectTone;
  practices: string[];
  evidence: CapabilityEvidence[];
};

export const capabilities: Capability[] = [
  {
    id: 'product-interface-systems',
    number: '01',
    name: 'Product interface systems',
    summary: 'Design and implementation for data-dense products, reusable interface foundations, and workflows that need to remain understandable as their scope grows.',
    tone: 'orange',
    practices: ['Information architecture', 'React + TypeScript', 'Design systems', 'Data visualization', 'Responsive interaction'],
    evidence: [
      {
        label: 'Yubico',
        detail: 'Enterprise administration interfaces, shared components, Storybook documentation, and test infrastructure.',
        href: '/experience#yubico',
        source: 'Experience',
        reference: { kind: 'company', id: 'Yubico' },
      },
      {
        label: 'Revenue.io',
        detail: 'Analytics dashboards and modernization from Backbone toward React and TypeScript.',
        href: '/experience#revenue-io',
        source: 'Experience',
        reference: { kind: 'company', id: 'Revenue.io' },
      },
      {
        label: 'Flight Tracker AI',
        detail: 'A map-led interface connecting aircraft, trajectory, weather, and hazard context.',
        href: '/work/flight-tracker-ai',
        source: 'Case study',
        reference: { kind: 'project', id: 'flight-tracker-ai' },
      },
    ],
  },
  {
    id: 'bounded-ai-workflows',
    number: '02',
    name: 'Bounded AI workflows',
    summary: 'AI-assisted products that keep source evidence, review state, uncertainty, and consequential actions visible instead of hiding them behind a single generated answer.',
    tone: 'red',
    practices: ['Structured outputs', 'Retrieval + provenance', 'Human approval', 'Deterministic fallback', 'Agent permissions'],
    evidence: [
      {
        label: 'Job Search OS',
        detail: 'Evidence-backed career workflows with structured outputs and explicit approval gates for external actions.',
        href: '/work/job-search-os',
        source: 'Case study',
        reference: { kind: 'project', id: 'job-search-os' },
      },
      {
        label: 'Supraconscious Avatar AI',
        detail: 'A multi-application reflection platform with policy-first retrieval, source provenance, GraphRAG foundations, and mobile work.',
        href: 'https://github.com/carlwelchdesign/supraconscious-avatar-ai',
        source: 'Repository',
        reference: { kind: 'repository', id: 'supraconscious-avatar-ai' },
      },
      {
        label: 'Fruition Venture Studio',
        detail: 'A separated public intake and owner-only research system with evidence status and human override boundaries.',
        href: 'https://github.com/carlwelchdesign/fruition-venture-studio',
        source: 'Repository',
        reference: { kind: 'repository', id: 'fruition-venture-studio' },
      },
    ],
  },
  {
    id: 'security-and-platform-boundaries',
    number: '03',
    name: 'Security and platform boundaries',
    summary: 'Authentication, permission, data-access, and system-state boundaries designed as product behavior rather than left as implementation detail.',
    tone: 'green',
    practices: ['WebAuthn', 'Permission boundaries', 'Data minimization', 'Approval state', 'Testable contracts'],
    evidence: [
      {
        label: 'Yubico',
        detail: 'Enterprise security-product workflows expressed through administration interfaces and reusable components.',
        href: '/experience#yubico',
        source: 'Experience',
        reference: { kind: 'company', id: 'Yubico' },
      },
      {
        label: 'WebAuthn Core',
        detail: 'Reusable server-side orchestration with pluggable challenge, credential, and MFA-state adapters.',
        href: 'https://github.com/carlwelchdesign/webauthn-core',
        source: 'Repository',
        reference: { kind: 'repository', id: 'webauthn-core' },
      },
      {
        label: 'Job Search OS',
        detail: 'Protected single-user operation with manual or explicitly approval-gated external actions.',
        href: '/work/job-search-os',
        source: 'Case study',
        reference: { kind: 'project', id: 'job-search-os' },
      },
    ],
  },
  {
    id: 'creative-technology',
    number: '04',
    name: 'Creative technology',
    summary: 'Software where audio, music, simulation, spatial information, and custom interaction are part of the product’s core behavior.',
    tone: 'green',
    practices: ['C++ DSP', 'Audio plug-ins', 'Music systems', 'Realtime 3D', 'Geospatial interaction'],
    evidence: [
      {
        label: 'Wave Factory Essentials',
        detail: 'Host-loadable AU, VST3, and CLAP products with local DSP, custom interfaces, and separate release gates.',
        href: '/work/wave-factory-essentials',
        source: 'Case study',
        reference: { kind: 'project', id: 'wave-factory-essentials' },
      },
      {
        label: 'ProgressionLab',
        detail: 'Chord, voicing, and arrangement generation with playback, visualization, MIDI, and PDF export.',
        href: 'https://github.com/carlwelchdesign/progression-lab-ai',
        source: 'Repository',
        reference: { kind: 'repository', id: 'progression-lab-ai' },
      },
      {
        label: 'EMF Disturbance Sim',
        detail: 'A realtime 3D electromagnetic-field lab built around emitter and interference behavior.',
        href: 'https://github.com/carlwelchdesign/emf-disturbance-sim',
        source: 'Repository',
        reference: { kind: 'repository', id: 'emf-disturbance-sim' },
      },
    ],
  },
  {
    id: 'technical-leadership',
    number: '05',
    name: 'Technical leadership',
    summary: 'Leading frontend delivery, modernizing working systems, mentoring engineers, and making cross-functional product work easier to execute.',
    tone: 'orange',
    practices: ['Frontend leadership', 'Mentoring', 'System modernization', 'Release coordination', 'Cross-functional delivery'],
    evidence: [
      {
        label: 'Bosch',
        detail: 'Frontend leadership across maps, scheduling, responsive products, and coordinated releases.',
        href: '/experience#bosch',
        source: 'Experience',
        reference: { kind: 'company', id: 'Bosch' },
      },
      {
        label: 'Grindr',
        detail: 'Engineering management alongside delivery of campaign and content-management tooling.',
        href: '/experience#grindr',
        source: 'Experience',
        reference: { kind: 'company', id: 'Grindr' },
      },
      {
        label: 'Direct reports and senior peers',
        detail: 'Recommendations describe mentoring, technical advocacy, component-system work, and calm delivery under pressure.',
        href: '/recommendations',
        source: 'Recommendation',
        reference: { kind: 'recommendations', id: 'review-collection' },
      },
    ],
  },
];
