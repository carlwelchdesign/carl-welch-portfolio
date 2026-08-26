import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const root = process.cwd();

function requireUnique(items, label) {
  const unique = new Set(items);
  if (unique.size !== items.length) throw new Error(`${label} contains duplicate values.`);
}

async function requireFile(relativePath, minimumBytes = 1) {
  const path = resolve(root, relativePath);
  await access(path);
  const file = await stat(path);
  if (!file.isFile() || file.size < minimumBytes) {
    throw new Error(`${relativePath} is missing or unexpectedly small.`);
  }
  return path;
}

async function requirePng(relativePath) {
  const path = await requireFile(relativePath, 16);
  const bytes = await readFile(path);
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error(`${relativePath} is not a valid PNG file.`);
}

const [{ githubProjects }, { projects, experience, recommendationReview }, { recommendations }, { capabilities }, { contact }] = await Promise.all([
  loadTypescriptData(resolve(root, 'app/github-projects.ts')),
  loadTypescriptData(resolve(root, 'app/portfolio-data.ts')),
  loadTypescriptData(resolve(root, 'app/recommendations-data.ts')),
  loadTypescriptData(resolve(root, 'app/capabilities-data.ts')),
  loadTypescriptData(resolve(root, 'app/contact-data.ts')),
]);

if (projects.length < 3) throw new Error('At least three detailed case studies are required.');
requireUnique(projects.map((project) => project.slug), 'Case-study slugs');
requireUnique(githubProjects.map((project) => project.name), 'GitHub repository names');
requireUnique(recommendations.map((item) => `${item.name}:${item.date}`), 'Recommendation attributions');
requireUnique(capabilities.map((capability) => capability.id), 'Capability IDs');

const projectSlugs = new Set(projects.map((project) => project.slug));
const repositoryNames = new Set(githubProjects.map((project) => project.name));
const companyNames = new Set(experience.map((role) => role.company));

for (const capability of capabilities) {
  if (capability.evidence.length < 2) throw new Error(`${capability.name} does not contain enough supporting evidence.`);
  for (const evidence of capability.evidence) {
    const { kind, id } = evidence.reference;
    if (kind === 'project' && !projectSlugs.has(id)) {
      throw new Error(`${capability.name} references unknown case study ${id}.`);
    }
    if (kind === 'repository' && !repositoryNames.has(id)) {
      throw new Error(`${capability.name} references unknown repository ${id}.`);
    }
    if (kind === 'company' && !companyNames.has(id)) {
      throw new Error(`${capability.name} references unknown company ${id}.`);
    }
    if (kind === 'recommendations' && evidence.href !== '/recommendations') {
      throw new Error(`${capability.name} has an invalid recommendations reference.`);
    }
  }
}

if (recommendations.length !== recommendationReview.candidateCount) {
  throw new Error(
    `Recommendation count mismatch: data contains ${recommendations.length}, summary expects ${recommendationReview.candidateCount}.`,
  );
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) throw new Error('Contact email is invalid.');
if (!contact.linkedinUrl.startsWith('https://www.linkedin.com/')) throw new Error('LinkedIn contact URL is invalid.');
if (!contact.githubUrl.startsWith('https://github.com/')) throw new Error('GitHub contact URL is invalid.');
if (contact.resumeUrl !== '/carl-welch-resume.pdf') throw new Error('Résumé contact URL does not match the published asset.');

await Promise.all([
  ...projects.map((project) => requirePng(`public${project.image.src}`)),
  ...githubProjects.map((project) => requirePng(`public/github/${project.name}.png`)),
  requireFile('public/carl-welch-resume.pdf', 10_000),
]);

console.log(
  `Content checks passed: ${projects.length} case studies, ${githubProjects.length} public repositories, ${capabilities.length} capabilities, ${recommendations.length} recommendations, and verified contact routes.`,
);
