import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const owner = 'carlwelchdesign';
const { githubProjects, githubSnapshotDate } = await loadTypescriptData(
  resolve(process.cwd(), 'app/github-projects.ts'),
);

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'carl-welch-portfolio-archive-check',
  'X-GitHub-Api-Version': '2022-11-28',
};

if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const liveProjects = [];
for (let page = 1; ; page += 1) {
  const response = await fetch(
    `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated&type=owner&page=${page}`,
    { headers },
  );

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const rateMessage = remaining === '0' ? ' GitHub API rate limit is exhausted; retry later or set GITHUB_TOKEN.' : '';
    throw new Error(`GitHub archive check failed with HTTP ${response.status}.${rateMessage}`);
  }

  const pageProjects = await response.json();
  if (!Array.isArray(pageProjects)) throw new Error('GitHub returned an unexpected repository payload.');
  liveProjects.push(...pageProjects);
  if (pageProjects.length < 100) break;
}

const snapshotByName = new Map(githubProjects.map((project) => [project.name, project]));
const liveByName = new Map(liveProjects.map((project) => [project.name, project]));
const added = [...liveByName.keys()].filter((name) => !snapshotByName.has(name));
const removed = [...snapshotByName.keys()].filter((name) => !liveByName.has(name));
const changed = [];

for (const [name, snapshot] of snapshotByName) {
  const live = liveByName.get(name);
  if (!live) continue;

  const differences = [];
  if ((live.language ?? null) !== snapshot.language) differences.push('language');
  if (live.html_url !== snapshot.url) differences.push('repository URL');
  if (live.updated_at !== snapshot.updatedAt) differences.push('updated date');
  if (differences.length) changed.push(`${name}: ${differences.join(', ')}`);
}

if (added.length || removed.length || changed.length) {
  const details = [
    added.length ? `New public repositories: ${added.join(', ')}` : null,
    removed.length ? `No longer public or removed: ${removed.join(', ')}` : null,
    changed.length ? `Changed metadata:\n- ${changed.join('\n- ')}` : null,
  ].filter(Boolean);
  throw new Error(`GitHub archive has drifted from the ${githubSnapshotDate} snapshot.\n${details.join('\n')}`);
}

console.log(`GitHub archive is current: ${liveProjects.length} public repositories match the ${githubSnapshotDate} snapshot.`);
