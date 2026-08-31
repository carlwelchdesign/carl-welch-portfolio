export type LegacyWorkImage = {
  id: string;
  project: string;
  context: string;
  contribution: string;
  technology: string[];
  image: {
    src: `/archive/working/${string}`;
    alt: string;
    width: number;
    height: number;
  };
  display?: 'wide' | 'standard';
};

export type LegacyClientMark = {
  name: string;
  src: `/archive/client-marks/${string}`;
  archiveHref?: `/archive#legacy-${string}`;
};

export const legacyWorkImages: LegacyWorkImage[] = [
  {
    id: 'legacy-gm-defense',
    project: 'GM Defense immersive training',
    context: 'General Dynamics / GM Defense',
    contribution: 'Virtual and augmented reality research for training and maintenance applications.',
    technology: ['VR and AR', 'Computer vision', 'Training systems'],
    image: {
      src: '/archive/working/gm-defense-immersive-training.jpg',
      alt: 'Immersive vehicle-maintenance interface showing a military vehicle component and overlaid technical guidance.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-gtd-iq',
    project: 'GTD IQ application',
    context: 'David Allen Company',
    contribution: 'Online art direction and application design and development for the GTD product ecosystem.',
    technology: ['Product design', 'Web application', 'Brand system'],
    image: {
      src: '/archive/working/gtd-iq.jpg',
      alt: 'GTD IQ web application screens with a questionnaire, score summary, and summit promotion.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-interacta',
    project: 'Interacta land visualizer',
    context: '3D application work',
    contribution: 'Interface work for a three-dimensional land-development visualization application.',
    technology: ['3D visualization', 'Interface design', 'Interactive systems'],
    image: {
      src: '/archive/working/interacta-land-visualizer.jpg',
      alt: 'Land-development visualizer with a three-dimensional terrain model and property controls.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-coca-cola',
    project: 'Coca-Cola interactive kiosk',
    context: 'Interactive media production',
    contribution: 'Interactive kiosk work combining branded animation, physical-product selection, and interface logic.',
    technology: ['Macromedia Director', 'Kiosk UI', 'Animation'],
    image: {
      src: '/archive/working/coca-cola-kiosk.jpg',
      alt: 'Coca-Cola kiosk interface with a mechanical selection device and rows of beverage bottles.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-dkny',
    project: 'DKNY e-commerce',
    context: 'OneSoft / DKNY',
    contribution: 'Art direction and interface design contribution for an early fashion e-commerce experience.',
    technology: ['Art direction', 'E-commerce', 'Interface design'],
    image: {
      src: '/archive/working/dkny-commerce.jpg',
      alt: 'Minimal DKNY e-commerce page with fashion photography, product navigation, and shopping controls.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-metal-gear-solid',
    project: 'Metal Gear Solid promotion',
    context: 'PETROL Advertising',
    contribution: 'Front-end implementation for a game-marketing experience created through the agency team.',
    technology: ['HTML', 'JavaScript', 'jQuery'],
    image: {
      src: '/archive/working/metal-gear-solid.jpg',
      alt: 'Metal Gear Solid promotional site with a character portrait, red navigation, and game information.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-ufc-japan',
    project: 'UFC Japan social takeover',
    context: 'PETROL Advertising',
    contribution: 'Campaign implementation spanning Flash, web code, data, and social-platform integration.',
    technology: ['Flash', 'JavaScript', 'PHP and MySQL', 'Social APIs'],
    image: {
      src: '/archive/working/ufc-japan.jpg',
      alt: 'UFC Japan promotional takeover with fighter photography, event details, and social controls.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-300',
    project: '300 movie experience',
    context: 'Trailer Park Interactive',
    contribution: 'Front-end implementation for a Warner Bros. movie-marketing experience.',
    technology: ['HTML', 'JavaScript', 'jQuery', 'CSS'],
    image: {
      src: '/archive/working/300-movie.jpg',
      alt: 'Graphic 300 movie site with illustrated character art, synopsis text, and a dark red interface.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-conjuring',
    project: 'The Conjuring sweepstakes',
    context: 'Trailer Park Interactive',
    contribution: 'Full-stack implementation for a haunted-story submission and sweepstakes experience.',
    technology: ['PHP', 'MySQL', 'JavaScript', 'CSS'],
    image: {
      src: '/archive/working/conjuring-sweepstakes.jpg',
      alt: 'Dark Conjuring sweepstakes site with a haunted-story form, house photography, and film branding.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-political-animals',
    project: 'Political Animals campaign',
    context: 'BPG Advertising',
    contribution: 'ActionScript animation work for a USA Network entertainment campaign.',
    technology: ['ActionScript 3', 'Animation', 'Rich media'],
    image: {
      src: '/archive/working/political-animals.jpg',
      alt: 'Political Animals television advertisement with a cast portrait and USA Network branding.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-magento-social',
    project: 'Magento social campaign system',
    context: 'Magento',
    contribution: 'Art direction for a social campaign that translated commerce data into a visual story.',
    technology: ['Art direction', 'Campaign design', 'Information design'],
    image: {
      src: '/archive/working/magento-social-campaign.jpg',
      alt: 'Wide Magento social campaign design with an Imagine Commerce graphic and campaign content columns.',
      width: 600,
      height: 493,
    },
    display: 'wide',
  },
  {
    id: 'legacy-magento-newsletter',
    project: 'Magento newsletter system',
    context: 'Magento',
    contribution: 'Art direction and modular design across commerce-focused email and newsletter layouts.',
    technology: ['Art direction', 'Email design', 'Modular content'],
    image: {
      src: '/archive/working/magento-newsletter-system.jpg',
      alt: 'Wide collection of Magento newsletter layouts with product stories, merchant news, and promotional modules.',
      width: 921,
      height: 420,
    },
    display: 'wide',
  },
  {
    id: 'legacy-kokua',
    project: 'Kokua Festival video widget',
    context: 'Oniracom',
    contribution: 'Interactive video-widget contribution created within the agency team.',
    technology: ['Interactive video', 'Widget design', 'Music experience'],
    image: {
      src: '/archive/working/kokua-festival.jpg',
      alt: 'Colorful Kokua Festival video widget with performance imagery, navigation, and sponsor branding.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-who-what-wear',
    project: 'Who What Wear commerce',
    context: 'Fashion publishing and commerce',
    contribution: 'Full-stack web development across editorial, promotion, and shopping interactions.',
    technology: ['PHP', 'MySQL', 'JavaScript', 'jQuery'],
    image: {
      src: '/archive/working/who-what-wear.jpg',
      alt: 'Who What Wear fashion page combining editorial photography, navigation, and a shopping promotion.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-jointjam',
    project: 'JointJam music collaboration',
    context: 'Independent product',
    contribution: 'Product creation for a musician collaboration network with profiles, search, and social features.',
    technology: ['ActionScript 3', 'PHP', 'MySQL', 'Social APIs'],
    image: {
      src: '/archive/working/jointjam.jpg',
      alt: 'Black and white JointJam musician-network site with profiles, search, and collaboration prompts.',
      width: 240,
      height: 162,
    },
  },
  {
    id: 'legacy-lustre',
    project: 'Lustre LA studio site',
    context: 'Lustre LA',
    contribution: 'ActionScript website contribution for a production studio and its body of commercial work.',
    technology: ['ActionScript 3', 'Studio website', 'Interactive portfolio'],
    image: {
      src: '/archive/working/lustre-la.jpg',
      alt: 'Minimal Lustre studio website with a pale interface, project categories, and production-work navigation.',
      width: 240,
      height: 162,
    },
  },
];

const homepageLegacyWorkIds = [
  'legacy-dkny',
  'legacy-gm-defense',
  'legacy-gtd-iq',
  'legacy-ufc-japan',
] as const;

export const homepageLegacyWork = homepageLegacyWorkIds.map((id) => {
  const item = legacyWorkImages.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing approved homepage legacy-work record: ${id}`);
  return item;
});

export const legacyClientMarks: LegacyClientMark[] = [
  { name: 'ABC', src: '/archive/client-marks/abc.jpg' },
  { name: 'Boeing', src: '/archive/client-marks/boeing.jpg' },
  { name: 'CBS', src: '/archive/client-marks/cbs.jpg' },
  { name: 'CNBC', src: '/archive/client-marks/cnbc.jpg' },
  { name: 'Coca-Cola', src: '/archive/client-marks/cocacola.jpg', archiveHref: '/archive#legacy-coca-cola' },
  { name: 'David Lynch Foundation', src: '/archive/client-marks/davidlynch.jpg' },
  { name: 'DC Comics', src: '/archive/client-marks/dc.jpg' },
  { name: 'DKNY', src: '/archive/client-marks/dkny.jpg', archiveHref: '/archive#legacy-dkny' },
  { name: 'E! Entertainment', src: '/archive/client-marks/eent.jpg' },
  { name: 'Fernet-Branca', src: '/archive/client-marks/fernet.jpg' },
  { name: 'Fox Entertainment', src: '/archive/client-marks/foxent.jpg' },
  { name: 'General Dynamics', src: '/archive/client-marks/gd.jpg', archiveHref: '/archive#legacy-gm-defense' },
  { name: 'Getting Things Done', src: '/archive/client-marks/gtd.jpg', archiveHref: '/archive#legacy-gtd-iq' },
  { name: 'GWAR', src: '/archive/client-marks/gwar.jpg' },
  { name: 'HGTV', src: '/archive/client-marks/hgtv.jpg' },
  { name: 'International Monetary Fund', src: '/archive/client-marks/imf.jpg' },
  { name: 'Lifetime', src: '/archive/client-marks/lifetime.jpg' },
  { name: 'Lucasfilm', src: '/archive/client-marks/lucasfilms.jpg' },
  { name: 'Magento', src: '/archive/client-marks/magento.jpg', archiveHref: '/archive#legacy-magento-social' },
  { name: 'Metal Gear Solid', src: '/archive/client-marks/metalgear.jpg', archiveHref: '/archive#legacy-metal-gear-solid' },
  { name: 'Mundet', src: '/archive/client-marks/mundet.jpg' },
  { name: 'NBC', src: '/archive/client-marks/nbc.jpg' },
  { name: 'NFL', src: '/archive/client-marks/nfl.jpg' },
  { name: 'Playboy', src: '/archive/client-marks/playboy.jpg' },
  { name: 'SOJA', src: '/archive/client-marks/soja.jpg' },
  { name: 'Sony', src: '/archive/client-marks/sony.jpg' },
  { name: 'STIHL', src: '/archive/client-marks/stihl.jpg' },
  { name: 'TASER', src: '/archive/client-marks/taser.jpg' },
  { name: 'THQ', src: '/archive/client-marks/thq.jpg' },
  { name: 'TV Land', src: '/archive/client-marks/tvland.jpg' },
  { name: 'UFC', src: '/archive/client-marks/ufc.jpg', archiveHref: '/archive#legacy-ufc-japan' },
  { name: 'USA Network', src: '/archive/client-marks/usa.jpg', archiveHref: '/archive#legacy-political-animals' },
  { name: 'Walt Disney Pictures', src: '/archive/client-marks/waltdisney.jpg' },
  { name: 'Warner Bros.', src: '/archive/client-marks/wb.jpg', archiveHref: '/archive#legacy-300' },
  { name: 'World Bank', src: '/archive/client-marks/worldbank.jpg' },
];
