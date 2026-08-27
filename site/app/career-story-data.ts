export type CareerChapter = {
  number: string;
  period: string;
  title: string;
  summary: string;
  proof: string[];
  href: string;
  linkLabel: string;
};

export type EarlierPracticeGroup = {
  title: string;
  organizations: string[];
  summary: string;
};

export type CharacterSignal = {
  label: string;
  quote: string;
  attribution: string;
  recommendationId: `portfolio:recommendation:${string}`;
};

export const careerThesis =
  'My path into product engineering started with interactive systems, motion, games, client work, and software that had to communicate visually. The tools changed. The work kept asking for the same combination: understand the problem, make the interaction clear, and stay with the difficult parts until they work.';

export const careerChapters: CareerChapter[] = [
  {
    number: '01',
    period: 'Early interactive practice',
    title: 'Interactive systems came first.',
    summary:
      'Studio sites, animation, multimedia, and front-end work taught me to treat motion, feedback, and visual hierarchy as parts of the system—not decoration added at the end.',
    proof: ['yU+co studio website', 'Interactive production', 'Motion + multimedia'],
    href: '/archive#yuco',
    linkLabel: 'See the selected archive',
  },
  {
    number: '02',
    period: 'Studios, clients, and technical teams',
    title: 'The range widened.',
    summary:
      'The professional record spans studios, agencies, client teams, General Dynamics, and the U.S. Army. Those different environments broadened the work and made collaboration and calm execution part of the craft.',
    proof: ['Design + development', 'Client delivery', 'Technical environments'],
    href: '/experience#earlier-practice',
    linkLabel: 'Review earlier experience',
  },
  {
    number: '03',
    period: 'Product engineering and leadership',
    title: 'The work became larger product systems.',
    summary:
      'At Grindr, Bridg, Bosch, Revenue.io, and Yubico, the focus moved toward operational interfaces, analytics, design systems, frontend modernization, team leadership, and software built to be maintained.',
    proof: ['Product interfaces', 'React + TypeScript', 'Mentoring + leadership'],
    href: '/experience',
    linkLabel: 'See professional history',
  },
  {
    number: '04',
    period: 'Current independent work',
    title: 'The threads now meet in the same products.',
    summary:
      'Current work combines product engineering with applied AI, geospatial systems, audio software, evidence design, and explicit operating boundaries. The visual and technical decisions happen together.',
    proof: ['Applied AI', 'Geospatial systems', 'Audio software + DSP'],
    href: '/work',
    linkLabel: 'Inspect current work',
  },
];

export const earlierPracticeGroups: EarlierPracticeGroup[] = [
  {
    title: 'Studios, agencies, and client work',
    organizations: ['SapientNitro', 'Nezzoh', 'Trailer Park', 'BPG', 'Petrol'],
    summary:
      'Earlier professional work crossed interactive production, web design, animation, and front-end development for studios, agencies, and client teams.',
  },
  {
    title: 'Technical foundations',
    organizations: ['TASER / AXON', 'General Dynamics', 'U.S. Army'],
    summary:
      'Work with TASER / AXON, General Dynamics, and the U.S. Army brought experience with demanding technical environments, operational workflows, and complex teams.',
  },
];

export const characterSignals: CharacterSignal[] = [
  {
    label: 'Under pressure',
    quote: "Carl's experience, persistence, and (most of all) calm always saved the day.",
    attribution: 'Todd Rimes, teammate',
    recommendationId: 'portfolio:recommendation:todd-rimes-2013-08-13',
  },
  {
    label: 'With a team',
    quote: 'Carl’s been a true mentor.',
    attribution: 'Jason Conover, direct report',
    recommendationId: 'portfolio:recommendation:jason-conover-2017-07-17',
  },
  {
    label: 'Across disciplines',
    quote: 'Carl Welch is a rare breed of web expert. He has his left and right brain working in sync to deliver stellar web designs and functionalities.',
    attribution: 'Jacob Tell, client',
    recommendationId: 'portfolio:recommendation:jacob-tell-2011-06-17',
  },
];
