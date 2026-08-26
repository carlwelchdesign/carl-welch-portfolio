import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const baseUrl = (process.env.PORTFOLIO_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const [{ projects }, { githubProjects }] = await Promise.all([
  loadTypescriptData(resolve(process.cwd(), 'app/portfolio-data.ts')),
  loadTypescriptData(resolve(process.cwd(), 'app/github-projects.ts')),
]);

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

const pageExpectations = [
  ['/', 'Carl Welch'],
  ['/work', `${githubProjects.length} public repositories`],
  ['/capabilities', 'What I do, and the work behind it'],
  ['/experience', 'Professional history'],
  ['/recommendations', 'LinkedIn recommendation candidates'],
  ['/contact', 'carlwelchdesign@gmail.com'],
  ...projects.map((project) => [`/work/${project.slug}`, project.name]),
];

await Promise.all(pageExpectations.map(async ([route, expectedText]) => {
  const response = await fetchRoute(route);
  const html = await response.text();
  requirePageStructure(html, route);
  requireText(html, expectedText, route);

  if (route === '/') {
    requireText(html, `<link rel="canonical" href="${baseUrl}"`, route);
    requireText(html, 'property="og:image"', route);
    requireText(html, 'href="/contact"', route);
    requireText(html, 'mailto:carlwelchdesign@gmail.com', route);
  }

  if (route === '/recommendations' && !/<meta name="robots" content="[^"]*noindex/.test(html)) {
    throw new Error('/recommendations must remain excluded from search indexing until publication approval.');
  }
}));

await fetchRoute('/work/not-a-project', 404);

const robots = await (await fetchRoute('/robots.txt')).text();
requireText(robots, 'Disallow: /recommendations', '/robots.txt');

const sitemap = await (await fetchRoute('/sitemap.xml')).text();
for (const project of projects) requireText(sitemap, `/work/${project.slug}`, '/sitemap.xml');
requireText(sitemap, '/capabilities', '/sitemap.xml');
requireText(sitemap, '/experience', '/sitemap.xml');
requireText(sitemap, '/contact', '/sitemap.xml');
if (sitemap.includes('/recommendations')) throw new Error('/recommendations must not appear in the sitemap before approval.');

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
  `Route checks passed: ${pageExpectations.length} pages, ${githubProjects.length} archive images, metadata, indexing gates, sitemap, and résumé.`,
);
