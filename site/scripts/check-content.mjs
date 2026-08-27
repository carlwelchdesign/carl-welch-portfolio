import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadTypescriptData } from './load-typescript-data.mjs';

const root = process.cwd();
const allowedStrengths = new Set(['strong', 'moderate', 'limited']);
const allowedMaturities = new Set(['production', 'deployed_demo', 'pre_release', 'prototype', 'planned', 'experiment']);
const stableRecordId = /^portfolio:(claim|capability|limitation|recommendation|source):[a-z0-9-]+(?::[a-z0-9-]+)*$/;

function requireUnique(items, label) {
  const unique = new Set(items);
  if (unique.size !== items.length) throw new Error(`${label} contains duplicate values.`);
}

function requireStableId(id, label) {
  if (typeof id !== 'string' || !stableRecordId.test(id)) {
    throw new Error(`${label} must use a stable portfolio record ID.`);
  }
}

function stableSlug(value) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');
}

function requirePublicEvidence(record, label) {
  requireStableId(record.id, label);
  if (record.reviewState !== 'approved' || record.publicApproved !== true) {
    throw new Error(`${label} is rendered as public evidence without explicit approval.`);
  }
  if (!allowedStrengths.has(record.strength)) throw new Error(`${label} has an invalid evidence strength.`);
  if (!allowedMaturities.has(record.maturity)) throw new Error(`${label} has an invalid project maturity.`);
  if (!Array.isArray(record.sourceIds) || record.sourceIds.length === 0) {
    throw new Error(`${label} must cite at least one stable source record.`);
  }
  record.sourceIds.forEach((sourceId) => requireStableId(sourceId, `${label} source`));
  if (!Array.isArray(record.limitations)) throw new Error(`${label} must model limitations explicitly.`);
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

const [
  { githubProjects, githubPortfolioExclusions, githubRepositoryIds, githubSnapshotReview },
  { projects, experience, recommendationReview },
  { recommendations },
  { capabilities },
  { contact },
  { publicEvidenceTargetRecords },
  { careerChapters, earlierPracticeGroups, characterSignals },
] = await Promise.all([
  loadTypescriptData(resolve(root, 'app/github-projects.ts')),
  loadTypescriptData(resolve(root, 'app/portfolio-data.ts')),
  loadTypescriptData(resolve(root, 'app/recommendations-data.ts')),
  loadTypescriptData(resolve(root, 'app/capabilities-data.ts')),
  loadTypescriptData(resolve(root, 'app/contact-data.ts')),
  loadTypescriptData(resolve(root, 'app/jolene/public-evidence-targets.ts')),
  loadTypescriptData(resolve(root, 'app/career-story-data.ts')),
]);

if (projects.length < 3) throw new Error('At least three detailed case studies are required.');
requireUnique(projects.map((project) => project.slug), 'Case-study slugs');
requireUnique(githubProjects.map((project) => project.name), 'GitHub repository names');
requireUnique(githubPortfolioExclusions.map((project) => project.name), 'GitHub portfolio exclusion names');
requireUnique(githubPortfolioExclusions.map((project) => project.repositoryId), 'GitHub portfolio exclusion IDs');
assert.equal(
  githubPortfolioExclusions.filter(({ name }) => githubProjects.some((project) => project.name === name)).length,
  0,
  'Excluded GitHub repositories must not appear in the public archive.',
);
assert(githubSnapshotReview?.reviewer, 'GitHub snapshot review must name a reviewer.');
assert(Number.isInteger(githubSnapshotReview?.appliedVersion), 'GitHub snapshot review must carry an applied version.');
assert(!Number.isNaN(Date.parse(githubSnapshotReview?.sourceObservedAt)), 'GitHub snapshot review must carry a valid source timestamp.');
assert.deepEqual(
  Object.keys(githubRepositoryIds).sort(),
  githubProjects.map((project) => project.name).sort(),
  'Stable GitHub repository IDs must exactly cover the reviewed archive.',
);
requireUnique(Object.values(githubRepositoryIds), 'GitHub repository IDs');
requireUnique(recommendations.map((item) => `${item.name}:${item.date}`), 'Recommendation attributions');
requireUnique(recommendations.map((item) => item.id), 'Recommendation IDs');
requireUnique(capabilities.map((capability) => capability.id), 'Capability IDs');
assert.equal(careerChapters.length, 4, 'The public career portrait must contain four reviewed chapters.');
requireUnique(careerChapters.map((chapter) => chapter.number), 'Career chapter numbers');
assert.equal(earlierPracticeGroups.length, 2, 'Earlier practice must retain the two bounded public groups.');
requireUnique(earlierPracticeGroups.flatMap((group) => group.organizations), 'Earlier practice organizations');
requireUnique(characterSignals.map((signal) => signal.recommendationId), 'Character signal recommendation IDs');

const projectSlugs = new Set(projects.map((project) => project.slug));
const repositoryNames = new Set(githubProjects.map((project) => project.name));
const companyNames = new Set(experience.map((role) => role.company));
const sourceIds = new Set([
  ...projects.map((project) => project.sourceId),
  ...experience.map((role) => role.sourceId),
  ...githubProjects.map((project) => `portfolio:source:repository:${stableSlug(project.name)}`),
  ...recommendations.map((recommendation) => recommendation.sourceId),
]);
requireUnique([...sourceIds], 'Source IDs');
sourceIds.forEach((sourceId) => requireStableId(sourceId, 'Source ID'));

const publicEvidenceIds = [];
for (const project of projects) {
  if (!allowedMaturities.has(project.maturity)) throw new Error(`${project.name} has an invalid project maturity.`);
  requireStableId(project.sourceId, `${project.name} source`);
  if (!Array.isArray(project.gallery) || project.gallery.length === 0) {
    throw new Error(`${project.name} must include an image-rich project gallery.`);
  }
  requireUnique([project.image.src, ...project.gallery.map((item) => item.src)], `${project.name} media paths`);
  for (const item of project.gallery) {
    assert(item.alt?.trim(), `${project.name} gallery media must include useful alternative text.`);
    assert(item.label?.trim(), `${project.name} gallery media must include a label.`);
    assert(item.caption?.trim(), `${project.name} gallery media must include a caption.`);
    assert(item.width > 0 && item.height > 0, `${project.name} gallery media must include intrinsic dimensions.`);
  }
  for (const evidence of project.evidence) {
    requirePublicEvidence(evidence, `${project.name} evidence ${evidence.id || '(missing ID)'}`);
    if (evidence.maturity !== project.maturity) {
      throw new Error(`${evidence.id} maturity does not match its project boundary.`);
    }
    for (const sourceId of evidence.sourceIds) {
      if (!sourceIds.has(sourceId)) throw new Error(`${evidence.id} references unknown source ${sourceId}.`);
    }
    publicEvidenceIds.push(evidence.id);
  }
}

assert(projects.find((project) => project.slug === 'job-search-os')?.gallery.length >= 4, 'Job Search OS must retain its multi-surface product tour.');
assert(projects.find((project) => project.slug === 'wave-factory-essentials')?.gallery.length >= 4, 'Wave Factory Essentials must retain its multi-image product-family gallery.');

for (const capability of capabilities) {
  if (capability.evidence.length < 2) throw new Error(`${capability.name} does not contain enough supporting evidence.`);
  for (const evidence of capability.evidence) {
    requirePublicEvidence(evidence, `${capability.name} evidence ${evidence.id || '(missing ID)'}`);
    publicEvidenceIds.push(evidence.id);
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
    for (const sourceId of evidence.sourceIds) {
      if (!sourceIds.has(sourceId)) throw new Error(`${evidence.id} references unknown source ${sourceId}.`);
    }
  }
}

requireUnique(publicEvidenceIds, 'Public evidence IDs');

for (const recommendation of recommendations) {
  requireStableId(recommendation.id, 'Recommendation ID');
  requireStableId(recommendation.sourceId, `${recommendation.id} source`);
  if ((recommendation.reviewState === 'approved') !== recommendation.publicApproved) {
    throw new Error(`${recommendation.id} has inconsistent review and public-approval state.`);
  }
  if (recommendation.reviewState !== 'approved' || recommendation.publicApproved !== true) {
    throw new Error(`${recommendation.id} must remain public-approved after Carl approved the reconciled collection.`);
  }
  if (!Array.isArray(recommendation.limitations) || recommendation.limitations.length === 0) {
    throw new Error(`${recommendation.id} must retain its publication limitation.`);
  }
  if (!recommendation.authorProfileUrl.startsWith('https://www.linkedin.com/in/')) {
    throw new Error(`${recommendation.id} must retain its verified LinkedIn author profile.`);
  }
  if (recommendation.sourcePageUrl !== recommendationReview.sourceUrl) {
    throw new Error(`${recommendation.id} must cite the reconciled LinkedIn source page.`);
  }
  if (recommendation.sourceObservedAt !== recommendationReview.sourceObservedAt) {
    throw new Error(`${recommendation.id} must retain the reconciliation timestamp.`);
  }
  if (recommendation.sourceVisibility !== 'All LinkedIn members') {
    throw new Error(`${recommendation.id} must retain its observed LinkedIn visibility.`);
  }
}

assert.equal(recommendationReview.reconciliationState, 'source_verified_publication_approved');
assert(!Number.isNaN(Date.parse(recommendationReview.sourceObservedAt)), 'Recommendation reconciliation must carry a valid source timestamp.');

for (const signal of characterSignals) {
  const recommendation = recommendations.find((item) => item.id === signal.recommendationId);
  if (!recommendation) throw new Error(`${signal.label} references an unknown recommendation.`);
  const normalizedRecommendation = recommendation.quote.replaceAll('_', '');
  if (!normalizedRecommendation.includes(signal.quote)) {
    throw new Error(`${signal.label} is not an exact excerpt of its approved recommendation.`);
  }
}

const expectedNavigationIds = [
  ...projects.flatMap((project) => [
    project.sourceId,
    ...project.evidence.map((evidence) => evidence.id),
    `portfolio:limitation:project:${project.slug}`,
  ]),
  ...experience.map((role) => role.sourceId),
  ...capabilities.flatMap((capability) => capability.evidence.map((evidence) => evidence.id)),
  ...recommendations.map((recommendation) => recommendation.sourceId),
];
const navigationIds = publicEvidenceTargetRecords.map(([evidenceId]) => evidenceId);
requireUnique(navigationIds, 'Public evidence navigation IDs');
if (
  [...expectedNavigationIds].sort().join('\n') !== [...navigationIds].sort().join('\n')
) {
  throw new Error('Public evidence navigation is missing or contains stale reviewed content IDs.');
}
for (const [evidenceId, path, , status] of publicEvidenceTargetRecords) {
  requireStableId(evidenceId, 'Public evidence navigation ID');
  if (!/^\/[a-z0-9/-]+$/.test(path)) throw new Error(`${evidenceId} has an unsafe navigation path.`);
  const recommendation = recommendations.find((item) => item.sourceId === evidenceId);
  const expectedStatus = recommendation && !recommendation.publicApproved ? 'review_required' : 'available';
  if (status !== expectedStatus) throw new Error(`${evidenceId} has an inconsistent navigation publication state.`);
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
  ...projects.flatMap((project) => project.gallery.map((item) => requirePng(`public${item.src}`))),
  ...githubProjects.map((project) => requirePng(`public/github/${project.name}.png`)),
  requireFile('public/carl-welch-resume.pdf', 10_000),
]);

console.log(
  `Content checks passed: ${projects.length} case studies, ${careerChapters.length} career chapters, ${githubProjects.length} public repositories, ${capabilities.length} capabilities, ${recommendations.length} recommendations, and verified contact routes.`,
);
