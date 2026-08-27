import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const baseUrl = (process.env.PORTFOLIO_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const [{ projects, experience }, { githubProjects }, { capabilities }, { recommendations }] = await Promise.all([
  loadTypescriptData(resolve(process.cwd(), 'app/portfolio-data.ts')),
  loadTypescriptData(resolve(process.cwd(), 'app/github-projects.ts')),
  loadTypescriptData(resolve(process.cwd(), 'app/capabilities-data.ts')),
  loadTypescriptData(resolve(process.cwd(), 'app/recommendations-data.ts')),
]);

function evidenceAnchorId(evidenceId) {
  return `evidence--${evidenceId.replaceAll(':', '--')}`;
}

async function fetchRoute(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`);
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}.`);
  }
  return response;
}

function requireText(html, text, route) {
  if (!html.includes(text)) throw new Error(`${route} is missing expected content: ${text}`);
}

function requirePageStructure(html, route) {
  requireText(html, '<html lang="en"', route);
  requireText(html, 'class="skip-link"', route);
  requireText(html, 'id="main-content"', route);
  const headingCount = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (headingCount !== 1) throw new Error(`${route} rendered ${headingCount} h1 elements; expected exactly one.`);
  if (!/<title>[^<]+<\/title>/.test(html)) throw new Error(`${route} is missing a document title.`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) throw new Error(`${route} is missing a meta description.`);
}

function getTag(html, tagName, attribute, value) {
  return (html.match(new RegExp(`<${tagName}[^>]*>`, 'g')) || [])
    .find((tag) => tag.includes(`${attribute}="${value}"`));
}

function getTagAttribute(tag, attribute) {
  return tag?.match(new RegExp(`${attribute}="([^"]*)"`))?.[1];
}

function requireShareMetadata(html, route) {
  const canonicalUrl = route === '/' ? baseUrl : new URL(route, `${baseUrl}/`).toString();
  const canonicalTag = getTag(html, 'link', 'rel', 'canonical');
  const openGraphUrlTag = getTag(html, 'meta', 'property', 'og:url');
  const openGraphTitleTag = getTag(html, 'meta', 'property', 'og:title');
  const openGraphImageTag = getTag(html, 'meta', 'property', 'og:image');
  const twitterTitleTag = getTag(html, 'meta', 'name', 'twitter:title');
  const documentTitle = html.match(/<title>([^<]+)<\/title>/)?.[1];

  if (getTagAttribute(canonicalTag, 'href') !== canonicalUrl) {
    throw new Error(`${route} canonical URL does not match ${canonicalUrl}.`);
  }
  if (getTagAttribute(openGraphUrlTag, 'content') !== canonicalUrl) {
    throw new Error(`${route} Open Graph URL does not match ${canonicalUrl}.`);
  }
  if (getTagAttribute(openGraphTitleTag, 'content') !== documentTitle) {
    throw new Error(`${route} Open Graph title does not match its document title.`);
  }
  if (getTagAttribute(twitterTitleTag, 'content') !== documentTitle) {
    throw new Error(`${route} X card title does not match its document title.`);
  }
  const openGraphImageUrl = getTagAttribute(openGraphImageTag, 'content');
  if (!openGraphImageUrl) {
    throw new Error(`${route} is missing an Open Graph image.`);
  }
  if (new URL(openGraphImageUrl).origin !== baseUrl) {
    throw new Error(`${route} Open Graph image does not use the configured public origin.`);
  }

  return openGraphImageUrl;
}

const pageExpectations = [
  ['/', 'Carl Welch'],
  ['/work', `${githubProjects.length} public repositories`],
  ['/about', 'Senior product engineer with a long creative-technology practice'],
  ['/capabilities', 'What I do, and the work behind it'],
  ['/experience', 'Professional history'],
  ['/recommendations', 'Source-verified LinkedIn recommendations'],
  ['/contact', 'carlwelchdesign@gmail.com'],
  ...projects.map((project) => [`/work/${project.slug}`, project.name]),
];
const shareImageUrls = new Set();
const routeEvidenceIds = new Map([
  ['/experience', experience.map((role) => role.sourceId)],
  ['/capabilities', capabilities.flatMap((capability) => capability.evidence.map((evidence) => evidence.id))],
  ['/recommendations', recommendations.map((recommendation) => recommendation.sourceId)],
  ...projects.map((project) => [
    `/work/${project.slug}`,
    [
      project.sourceId,
      ...project.evidence.map((evidence) => evidence.id),
      `portfolio:limitation:project:${project.slug}`,
    ],
  ]),
]);

await Promise.all(pageExpectations.map(async ([route, expectedText]) => {
  const response = await fetchRoute(route);
  const html = await response.text();
  requirePageStructure(html, route);
  shareImageUrls.add(requireShareMetadata(html, route));
  requireText(html, expectedText, route);
  for (const evidenceId of routeEvidenceIds.get(route) || []) {
    requireText(html, `id="${evidenceAnchorId(evidenceId)}"`, route);
  }
  if (route === '/experience') {
    for (const role of experience) requireText(html, `id="${role.id}"`, route);
  }

  if (route === '/') {
    requireText(html, 'href="/contact"', route);
    requireText(html, 'mailto:carlwelchdesign@gmail.com', route);
  }

  if (route === '/recommendations' && /<meta name="robots" content="[^"]*noindex/.test(html)) {
    throw new Error('/recommendations must be indexable after publication approval.');
  }

  if (route.startsWith('/work/')) requireText(html, 'id="evidence"', route);
}));

await Promise.all([...shareImageUrls].map(async (imageUrl) => {
  const response = await fetch(imageUrl);
  if (response.status !== 200) {
    throw new Error(`${imageUrl} returned ${response.status}; expected 200.`);
  }
  if (!response.headers.get('content-type')?.startsWith('image/')) {
    throw new Error(`${imageUrl} did not return an image content type.`);
  }
}));

await fetchRoute('/work/not-a-project', 404);

const robots = await (await fetchRoute('/robots.txt')).text();
if (robots.includes('Disallow: /recommendations')) throw new Error('/robots.txt still blocks approved recommendations.');

const sitemap = await (await fetchRoute('/sitemap.xml')).text();
for (const project of projects) requireText(sitemap, `/work/${project.slug}`, '/sitemap.xml');
requireText(sitemap, '/capabilities', '/sitemap.xml');
requireText(sitemap, '/about', '/sitemap.xml');
requireText(sitemap, '/experience', '/sitemap.xml');
requireText(sitemap, '/contact', '/sitemap.xml');
requireText(sitemap, '/recommendations', '/sitemap.xml');

await Promise.all(githubProjects.map(async (project) => {
  const response = await fetchRoute(`/github/${project.name}.png`);
  if (!response.headers.get('content-type')?.startsWith('image/png')) {
    throw new Error(`/github/${project.name}.png did not return image/png.`);
  }
}));

const resume = await fetchRoute('/carl-welch-resume.pdf');
if (!resume.headers.get('content-type')?.startsWith('application/pdf')) {
  throw new Error('/carl-welch-resume.pdf did not return application/pdf.');
}

console.log(
  `Route checks passed: ${pageExpectations.length} pages, ${githubProjects.length} archive images, evidence anchors, metadata, indexing gates, sitemap, and résumé.`,
);
