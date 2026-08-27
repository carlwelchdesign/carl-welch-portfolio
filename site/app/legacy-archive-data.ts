export type LegacyArchiveProject = {
  id: string;
  project: string;
  period: string;
  role: string;
  contribution: string;
  technology: string[];
  image: {
    src: `/archive/${string}`;
    alt: string;
    width: number;
    height: number;
  };
  evidenceNote: string;
  display: 'feature' | 'standard' | 'thumbnail';
};

export const legacyArchiveProjects: LegacyArchiveProject[] = [
  {
    id: 'archive-yuco-2006',
    project: 'yU+co studio website',
    period: '2006–2007',
    role: 'Interactive developer',
    contribution:
      'Interactive development using ActionScript 2, video, XML, and multi-user technology. This was team work—not a claim of sole authorship.',
    technology: ['ActionScript 2', 'Flash video', 'XML', 'Multi-user server'],
    image: {
      src: '/archive/yuco-studio-site.png',
      alt: 'Minimal white yU+co website interface with branching navigation labeled Work, Clients, and News.',
      width: 620,
      height: 400,
    },
    evidenceNote:
      'Documented in Carl’s preserved portfolio and corroborated by historical correspondence. The site and team were a 2006 Webby Awards Honoree.',
    display: 'feature',
  },
  {
    id: 'archive-magento-go-2011',
    project: 'Magento Go homepage',
    period: '2011',
    role: 'Freelance senior designer',
    contribution:
      'Homepage design focused on explaining the hosted-commerce offer and moving visitors toward a free trial.',
    technology: ['Web design', 'Art direction', 'E-commerce'],
    image: {
      src: '/archive/magento-go-homepage.jpg',
      alt: 'Tall Magento Go homepage with a blue trial banner, merchant testimonial, product benefits, and repeated calls to action.',
      width: 420,
      height: 726,
    },
    evidenceNote:
      'The senior-design assignment is documented in Carl’s preserved portfolio and corroborated by historical correspondence.',
    display: 'feature',
  },
  {
    id: 'archive-fox-million-moments-2010',
    project: 'Fox: A Year of a Million Moments',
    period: '2010',
    role: 'Interactive developer',
    contribution:
      'Implementation work on a promotional experience combining movie matchups, voting, monthly winners, and social sharing.',
    technology: ['ActionScript 3', 'PHP', 'MySQL'],
    image: {
      src: '/archive/fox-million-moments.jpg',
      alt: 'Fox movie promotion with a bracket-style musical movie showdown, voting prompt, monthly winners, and sharing controls.',
      width: 647,
      height: 649,
    },
    evidenceNote:
      'The implementation assignment is documented in Carl’s preserved portfolio and corroborated by historical correspondence.',
    display: 'standard',
  },
  {
    id: 'archive-darksiders-ii-2011',
    project: 'Darksiders II promotional site',
    period: '2011–2012',
    role: 'Front-end contributor',
    contribution:
      'Front-end implementation and revision work for a promotional site. This is site work, not game-development credit.',
    technology: ['HTML', 'JavaScript', 'jQuery'],
    image: {
      src: '/archive/darksiders-ii.jpg',
      alt: 'Dark Darksiders II website thumbnail with a character portrait, video panel, navigation, and screenshot rail.',
      width: 240,
      height: 162,
    },
    evidenceNote:
      'The contribution is documented in Carl’s preserved portfolio and corroborated by historical correspondence.',
    display: 'thumbnail',
  },
  {
    id: 'archive-almost-alice-2010',
    project: 'Almost Alice music experience',
    period: '2010',
    role: 'Interactive team contributor',
    contribution:
      'ActionScript 3, animation, and interactive-design work created within the Oniracom team.',
    technology: ['ActionScript 3', 'Animation', 'Interactive design'],
    image: {
      src: '/archive/almost-alice.jpg',
      alt: 'Dark textured Almost Alice landing screen with Disney and Alice in Wonderland lettering and a Ship to Rise link.',
      width: 620,
      height: 569,
    },
    evidenceNote:
      'The team contribution is documented in Carl’s preserved portfolio and corroborated by historical correspondence.',
    display: 'standard',
  },
  {
    id: 'archive-dlf-music-2011',
    project: 'David Lynch Foundation Music',
    period: '2011',
    role: 'Art direction and design contributor',
    contribution:
      'Art direction and iterative design work across homepage and interior-page concepts for the music initiative.',
    technology: ['Art direction', 'Web design', 'Visual systems'],
    image: {
      src: '/archive/david-lynch-foundation-music.jpg',
      alt: 'Two blue, black, and white music-site concepts featuring artist stories, charitable messaging, news, and donation pathways.',
      width: 920,
      height: 528,
    },
    evidenceNote:
      'The design contribution is documented in Carl’s preserved portfolio and corroborated by historical correspondence.',
    display: 'feature',
  },
  {
    id: 'archive-beatnik-2011',
    project: 'Beatnik mobile UI concepts',
    period: '2011',
    role: 'Mobile UI designer',
    contribution:
      'A set of interface directions exploring social listening, conversation, and music playback on early smartphones.',
    technology: ['Mobile UI design', 'Interaction design', 'Visual design'],
    image: {
      src: '/archive/beatnik-mobile-ui.jpg',
      alt: 'Five early smartphone interface concepts combining music players, profile avatars, comment threads, and colorful themes.',
      width: 1072,
      height: 420,
    },
    evidenceNote:
      'These are design concepts, not claimed as shipped application screens. The work is documented in Carl’s preserved portfolio and corroborated by historical correspondence.',
    display: 'feature',
  },
  {
    id: 'archive-superman-75-2013',
    project: 'Superman 75th Anniversary DVD experience',
    period: '2013',
    role: 'Front-end contributor',
    contribution:
      'Front-end work using HTML, JavaScript, jQuery, Canvas, CSS, and social integration.',
    technology: ['HTML', 'JavaScript', 'Canvas', 'CSS'],
    image: {
      src: '/archive/superman-75.jpg',
      alt: 'Light gray Superman interface thumbnail with a central character figure and a vertical timeline.',
      width: 240,
      height: 162,
    },
    evidenceNote:
      'The technology record comes from Carl’s preserved portfolio. The archival image is shown as project context, not a claim of character-art ownership.',
    display: 'thumbnail',
  },
  {
    id: 'archive-bolthouse-frozen-2013',
    project: 'Bolthouse Frozen rebate experience',
    period: '2013',
    role: 'Web contributor',
    contribution:
      'Web implementation using CoffeeScript, Node.js, Jade, JavaScript, Canvas, CSS, and social integration.',
    technology: ['CoffeeScript', 'Node.js', 'Jade', 'Canvas'],
    image: {
      src: '/archive/bolthouse-frozen.jpg',
      alt: 'Bright blue promotional page with Frozen characters, a savings headline, product packaging, and a rebate-download button.',
      width: 240,
      height: 162,
    },
    evidenceNote:
      'The implementation record comes from Carl’s preserved portfolio. The image is shown as historical project context, not a claim of campaign strategy or character-art ownership.',
    display: 'thumbnail',
  },
  {
    id: 'archive-primaloft-downblends',
    project: 'PrimaLoft Down Blend experience',
    period: 'Date unverified',
    role: 'Web contributor',
    contribution:
      'A parallax product-storytelling experience using HTML, JavaScript, jQuery, Canvas, and CSS.',
    technology: ['HTML', 'JavaScript', 'Canvas', 'Parallax'],
    image: {
      src: '/archive/primaloft-downblend.jpg',
      alt: 'Dark PrimaLoft product page with a skier emerging from a cloud of down insulation and snow.',
      width: 240,
      height: 162,
    },
    evidenceNote:
      'The technology record comes from Carl’s preserved portfolio. The surviving source does not establish an exact date or sole authorship.',
    display: 'thumbnail',
  },
];
