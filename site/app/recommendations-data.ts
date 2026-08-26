import type { EvidenceReviewState } from './evidence-types';

export type Recommendation = {
  id: `portfolio:recommendation:${string}`;
  sourceId: `portfolio:source:recommendation:${string}`;
  name: string;
  headline: string | null;
  date: string;
  relationship: string;
  quote: string;
  reviewState: EvidenceReviewState;
  publicApproved: boolean;
  limitations: string[];
};

type RecommendationCandidate = Omit<Recommendation, 'sourceId' | 'reviewState' | 'publicApproved' | 'limitations'>;

function reviewCandidate(candidate: RecommendationCandidate): Recommendation {
  const stableId = candidate.id.replace('portfolio:recommendation:', '');
  return {
    ...candidate,
    sourceId: `portfolio:source:recommendation:${stableId}`,
    reviewState: 'review_required',
    publicApproved: false,
    limitations: ['Candidate attribution and wording require reconciliation against Carl’s official LinkedIn export before publication approval.'],
  };
}

export const recommendations: Recommendation[] = [
  {
    id: 'portfolio:recommendation:sree-sankara-2026-06-02',
    name: 'Sree Sankara',
    headline: 'Senior Software Engineer | Senior Application Developer | SAFe Scrum Master',
    date: 'June 2, 2026',
    relationship: 'Sree was senior to Carl but did not manage Carl directly',
    quote: 'Carl is a skilled frontend engineer who possesses a rare combination of a keen eye for visualization and a deep commitment to high-performance user experience. He is known for creating modular, high-quality UI components using Storybook to accelerate development cycles while elevating our design system standards. He successfully led several critical frontend features that directly improved the experience for our customers. He is a natural mentor who genuinely enjoys sharing knowledge and helping others grow technically. He would be an invaluable asset to any high-performing team!',
  },
  {
    id: 'portfolio:recommendation:corbett-trubey-2017-09-15',
    name: 'Corbett Trubey',
    headline: 'Creative Director | Copywriter | Cookie Eater',
    date: 'September 15, 2017',
    relationship: 'Corbett worked with Carl on the same team',
    quote: "Carl and I had the great opportunity of building Grindr's first ever marketing team. During this wild ride, Carl worked tirelessly to lay the foundation of Grindr's revamped digital presence and create rad new ways to make the brand stand out more than ever before. He brought to the table mad skills, a laid-back positive attitude, and a willingness to do whatever it takes to get the job done right. We had a lot of fun together, and he was an invaluable member of the team. Whoever scores this dude will inevitably feel the same. He's my fave dev bro ever.",
  },
  {
    id: 'portfolio:recommendation:jason-conover-2017-07-17',
    name: 'Jason Conover',
    headline: 'Enterprise Applications Software Engineer at NASA JPL | UX and Product Engineering',
    date: 'July 17, 2017',
    relationship: 'Jason reported to Carl directly',
    quote: 'Carl’s been a true mentor. From advocating React and ES6 to working through complex problems in CodePen, he’s always ready to tackle a challenge. He’s also fearless when it comes to learning new technologies. Nothing intimidates him. I hope to work with Carl again someday!',
  },
  {
    id: 'portfolio:recommendation:shervin-kayvon-2017-07-12',
    name: 'Shervin Kayvon',
    headline: 'Senior Software Engineer • React / Node / AI-Enabled SaaS',
    date: 'July 12, 2017',
    relationship: 'Shervin reported to Carl directly',
    quote: 'Many people claim to be Senior Developers but I can say without a doubt that Carl Welch is truly a Senior Developer. As our Team Manager, he has taught us a great deal of innovative and cutting-edge technologies, and I personally have learned so much from him. My JavaScript and PHP knowledge has greatly increased under his guidance and I continue to learn from him everyday. He’s an invaluable asset to the Grindr team.',
  },
  {
    id: 'portfolio:recommendation:justin-treen-2016-03-13',
    name: 'Justin Treen',
    headline: null,
    date: 'March 13, 2016',
    relationship: 'Justin worked with Carl on the same team',
    quote: "I've worked with Carl on various projects during the last decade. He is one of the nicest people one could work with. He knows his stuff. I wouldn't hesitate to recommend him for any job related to his experience. He also manages people exceptionally well, a rare talent these days.",
  },
  {
    id: 'portfolio:recommendation:todd-rimes-2013-08-13',
    name: 'Todd Rimes',
    headline: 'MBA | Product Manager | Emmy winner @ Peacock | Data Engineering, AI Applications',
    date: 'August 13, 2013',
    relationship: 'Todd worked with Carl on the same team',
    quote: "Carl Welch is a life-saver! On a monstrously understaffed project with lots of JavaScript needs I didn't have time to handle, Carl rescued me several times per day. Familiar with several top-tier JS libraries, Carl always had a solution for each new problem presented by an over-designed UI. And if no library worked, he could just as easily jump in and code it from scratch. Carl's experience, persistence, and (most of all) calm always saved the day.",
  },
  {
    id: 'portfolio:recommendation:jim-talbot-2012-07-31',
    name: 'Jim Talbot',
    headline: 'Strategic Operations | Project Management | Team Coaching | Design & Arts Education',
    date: 'July 31, 2012',
    relationship: 'Jim was Carl’s client',
    quote: "We hired Carl for interactive production on a freelance basis. He's dedicated with an easygoing personality – always professional.",
  },
  {
    id: 'portfolio:recommendation:evan-astrowsky-2012-02-15',
    name: 'Evan Astrowsky',
    headline: 'Director of Integrated Production, Executive Producer',
    date: 'February 15, 2012',
    relationship: 'Evan was Carl’s client',
    quote: 'Carl possesses the right combination of animation artistry and programing ability to make a great contribution to any shop.',
  },
  {
    id: 'portfolio:recommendation:justin-treen-2011-06-30',
    name: 'Justin Treen',
    headline: 'Dogs > Humans',
    date: 'June 30, 2011',
    relationship: 'Justin worked with Carl on the same team',
    quote: "I worked with Carl at David Allen and a couple of other companies after. Carl is a great designer and flash programmer with a track record of producing unique designs that appeal to the masses. Has also has a great personality to boot! I don't hesitate to go to him for my graphic/flash requirements.",
  },
  {
    id: 'portfolio:recommendation:david-allen-2011-06-23',
    name: 'David Allen',
    headline: 'Founder, David Allen Company',
    date: 'June 23, 2011',
    relationship: 'David was Carl’s client',
    quote: 'Carl did great work for us in web design and multimedia production. Super good guy to work with.',
  },
  {
    id: 'portfolio:recommendation:robert-peake-2011-06-18',
    name: 'Robert Peake',
    headline: 'Consultant / Coach / CTO',
    date: 'June 18, 2011',
    relationship: 'Robert managed Carl directly',
    quote: 'Carl is a highly creative guy who stays on the cutting edge of new technologies.',
  },
  {
    id: 'portfolio:recommendation:jacob-tell-2011-06-17',
    name: 'Jacob Tell',
    headline: 'Entrepreneur / Producer / Creative Strategist',
    date: 'June 17, 2011',
    relationship: 'Jacob was Carl’s client',
    quote: 'Carl Welch is a rare breed of web expert. He has his left and right brain working in sync to deliver stellar web designs and functionalities. We have hired him to both design flash animations and code the action-script to bring them to life. Also, Carl has provided our clients some of the most innovative forward-thinking designs we’ve seen on the web. We highly recommend Carl for any style web project.',
  },
  {
    id: 'portfolio:recommendation:laura-baran-2008-02-02',
    name: 'Laura Baran',
    headline: 'Customer Service Representative at FLIR Commercial Systems',
    date: 'February 2, 2008',
    relationship: 'Laura worked with Carl on the same team',
    quote: 'Carl worked on the cutting edge design for a VR & AR program that broke new ground for commercial and military applications. He was instrumental in the programming of the application software. He is a very focused individual and during his time at General Dynamics I think he surpassed all management expectations with the product he created.',
  },
].map(reviewCandidate);
