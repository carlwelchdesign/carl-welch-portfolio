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

export type CareerFoundation = {
  id: string;
  period: string;
  title: string;
  context: string;
  summary: string;
  highlights: string[];
  technologies: string[];
};

export type CharacterSignal = {
  label: string;
  quote: string;
  attribution: string;
  recommendationId: `portfolio:recommendation:${string}`;
};

export const careerThesis =
  'My path into product engineering started with military service, art school, art direction, immersive 3D systems, full-stack web development, motion, client work, and software that had to communicate visually. The tools changed. The work kept asking for the same combination: understand the problem, make the interaction clear, and stay with the difficult parts until they work.';

export const careerChapters: CareerChapter[] = [
  {
    number: '01',
    period: 'Early interactive practice',
    title: 'Interactive systems came first.',
    summary:
      'Art direction, studio sites, animation, PHP and MySQL applications, and front-end work taught me to treat visuals, behavior, data, and delivery as parts of the same system.',
    proof: ['Art direction', 'Full-stack web systems', 'Motion + multimedia'],
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
    href: '/experience#career-foundations',
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
      'Current work combines product engineering with applied AI, geospatial systems, and audio software. The same attention to interaction, clarity, and craft now operates across full product systems.',
    proof: ['Applied AI', 'Geospatial systems', 'Audio software + DSP'],
    href: '/work',
    linkLabel: 'Inspect current work',
  },
];

export const earlierPracticeGroups: EarlierPracticeGroup[] = [
  {
    title: 'Studios, agencies, and client work',
    organizations: ['SapientNitro', 'Nezzoh', 'Trailer Park', 'BPG', 'Petrol', 'Oniracom', 'AvatarLabs', 'Prologue'],
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

export const careerFoundations: CareerFoundation[] = [
  {
    id: 'army-art-school-gwar',
    period: '1989 to 1995',
    title: 'The Army, art school, and GWAR',
    context: 'Service, education, and the first professional work',
    summary:
      'I served as a U.S. Army forward observer, earned a BFA in Communication Arts and Design from VCU, and started taking on professional design work. One early assignment was a poster and T-shirt for GWAR through Slave Pit. It was an unforgettable lesson in making work for a very specific audience.',
    highlights: ['U.S. Army forward observer', 'VCU Communication Arts and Design', 'Graphic art for GWAR'],
    technologies: ['Print', 'Identity', 'Illustration'],
  },
  {
    id: 'early-full-stack-web',
    period: '1994 to 2001',
    title: 'Learning the web by building all of it',
    context: 'Art direction, multimedia, teams, and early web systems',
    summary:
      'At Marketing Resource Group, SPi, University OnLine, SAIC, OneSoft, and 9th Insight, the job moved freely between art direction, code, identity, video, animation, information architecture, and client delivery. I hired and managed designers and programmers while remaining hands-on with the work.',
    highlights: ['Managed creative and development teams', 'Built distance-learning and corporate systems', 'Worked across design, code, motion, and video'],
    technologies: ['HTML', 'JavaScript', 'Shockwave', 'Flash', 'Video'],
  },
  {
    id: 'immersive-systems',
    period: '2001 to 2004',
    title: 'Immersive systems before AR was a product category',
    context: 'General Dynamics Land Systems',
    summary:
      'My role combined art direction and development for virtual and augmented reality research, training, and maintenance applications. The work joined immersive 3D software, positional tracking hardware, engineering-data conversion, embedded-training interfaces, proposals, and operational stakeholders.',
    highlights: ['VR and AR training R&D', 'LAV-25 and Stryker training systems', 'Creative, technical, and project leadership'],
    technologies: ['Director 3D', 'Positional tracking', 'Pro/ENGINEER', 'UX/UI'],
  },
  {
    id: 'gtd-evidence-com',
    period: '2005 to 2010',
    title: 'Brand systems, GTD, and Evidence.com',
    context: 'David Allen Company and TASER International',
    summary:
      'At David Allen Company, I handled online art direction and development across UX/UI, wireframes, brand systems, media production, Flash, PHP, and MySQL. At TASER, I worked with the UX/UI team on finished Evidence.com interfaces for reviewing, organizing, editing, collaborating on, and sharing digital evidence.',
    highlights: ['Online product and brand systems', 'Full-stack multimedia delivery', 'Finished Evidence.com workflow interfaces'],
    technologies: ['PHP', 'MySQL', 'ActionScript 3', 'JavaScript', 'Video'],
  },
  {
    id: 'agency-creative-technology',
    period: '2008 to 2012',
    title: 'Agency range without losing the engineering',
    context: 'Independent art direction and development',
    summary:
      'Independent studio and agency work covered entertainment, commerce, campaigns, nonprofit initiatives, and brand systems. Through those engagements, I contributed to projects involving organizations and properties including Disney, Fox, THQ, Magento, the David Lynch Foundation, Jack Johnson, and others.',
    highlights: ['Art direction and implementation', 'Entertainment and brand experiences', 'Scope, estimation, and client delivery'],
    technologies: ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'XML', 'CSS'],
  },
  {
    id: 'teaching-code',
    period: '2012',
    title: 'Teaching code made the work legible',
    context: 'Ignite Creative Learning',
    summary:
      'Weekend instruction included Scratch sessions and a hands-on JavaScript, HTML5 Canvas, and CSS workshop. Teaching young people to turn an idea into a working interactive project sharpened a skill I still use with product teams: make technical complexity understandable without flattening it.',
    highlights: ['Scratch programming instruction', 'JavaScript workshop for ages 11 and older', 'HTML5 Canvas and CSS'],
    technologies: ['Scratch', 'JavaScript', 'HTML5 Canvas', 'CSS'],
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
