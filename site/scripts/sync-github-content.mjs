import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';
import {
  applyAcceptedMetadata,
  buildGitHubReview,
  normalizeLiveRepositories,
  renderReviewMarkdown,
} from './github-content-sync-core.mjs';

const owner = 'carlwelchdesign';
const args = parseArgs(process.argv.slice(2));
const contentPath = resolve(process.cwd(), 'app/github-projects.ts');

if (args.apply) {
  if (!args.review) throw new Error('--apply requires the frozen --review JSON artifact.');
  const [source, review, decisions] = await Promise.all([
    readFile(contentPath, 'utf8'),
    readJson(resolve(process.cwd(), args.review)),
    readJson(resolve(process.cwd(), args.apply)),
  ]);
  const result = applyAcceptedMetadata(source, review, decisions);
  if (result.applied.length) await writeFile(contentPath, result.source);
  console.log(JSON.stringify({
    applied: result.applied,
    requiresEditorialReview: result.requiresEditorial,
    wrotePortfolioContent: result.applied.length > 0,
    publicationChanged: false,
  }, null, 2));
  process.exit(0);
}

const { githubProjects, githubRepositoryIds, githubSnapshotReview } = await loadTypescriptData(contentPath);
const { repositories, sourceObservedAt } = await fetchRepositories(owner);
const mediaStatus = await inspectArchiveMedia(githubProjects);
const review = buildGitHubReview({
  snapshotProjects: githubProjects,
  repositoryIds: githubRepositoryIds,
  snapshotReview: githubSnapshotReview,
  liveRepositories: normalizeLiveRepositories(repositories),
  mediaStatus,
  sourceObservedAt,
});

if (args.writeReview) {
  await writeFile(resolve(process.cwd(), args.writeReview), `${JSON.stringify(review, null, 2)}\n`, { flag: 'wx' });
}

console.log(args.format === 'json' ? JSON.stringify(review, null, 2) : renderReviewMarkdown(review));

function parseArgs(values) {
  const parsed = { format: 'markdown' };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--json') parsed.format = 'json';
    else if (value === '--write-review') parsed.writeReview = requireValue(values, ++index, value);
    else if (value === '--review') parsed.review = requireValue(values, ++index, value);
    else if (value === '--apply') parsed.apply = requireValue(values, ++index, value);
    else throw new Error(`Unknown argument: ${value}`);
  }
  return parsed;
}

function requireValue(values, index, flag) {
  if (!values[index]) throw new Error(`${flag} requires a path.`);
  return values[index];
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function fetchRepositories(account) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'carl-welch-portfolio-content-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const repositories = [];
  let sourceObservedAt;
  for (let page = 1; ; page += 1) {
    const response = await fetch(`https://api.github.com/users/${account}/repos?per_page=100&sort=updated&type=owner&page=${page}`, { headers });
    if (!response.ok) {
      const exhausted = response.headers.get('x-ratelimit-remaining') === '0';
      throw new Error(`GitHub content sync failed with HTTP ${response.status}.${exhausted ? ' Set GITHUB_TOKEN or retry after the rate limit resets.' : ''}`);
    }
    sourceObservedAt ??= new Date(response.headers.get('date') ?? Date.now()).toISOString();
    const pageRepositories = await response.json();
    if (!Array.isArray(pageRepositories)) throw new Error('GitHub returned an unexpected repository payload.');
    repositories.push(...pageRepositories);
    if (pageRepositories.length < 100) break;
  }
  return { repositories, sourceObservedAt };
}

async function inspectArchiveMedia(projects) {
  const statuses = new Map();
  await Promise.all(projects.map(async ({ name }) => {
    const path = resolve(process.cwd(), `public/github/${name}.png`);
    try {
      const details = await stat(path);
      const signature = Buffer.alloc(8);
      const file = await import('node:fs/promises').then(({ open }) => open(path, 'r'));
      try {
        await file.read(signature, 0, 8, 0);
      } finally {
        await file.close();
      }
      statuses.set(name, details.size > 8 && signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'valid' : 'invalid');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      statuses.set(name, 'missing');
    }
  }));
  return statuses;
}
