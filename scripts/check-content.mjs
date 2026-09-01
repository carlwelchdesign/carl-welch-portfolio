import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

async function readPngIdentity(relativePath) {
  const path = await requireFile(relativePath, 24);
  const bytes = await readFile(path);
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error(`${relativePath} is not a valid PNG file.`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

const [
  { githubProjects, githubPortfolioExclusions, githubRepositoryIds, githubSnapshotReview },
  { projects, experience, recommendationReview },
  { recommendations },
  { capabilities },
  { contact },
  { publicEvidenceTargetRecords },
  { careerChapters, earlierPracticeGroups, characterSignals, careerFoundations },
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
assert.equal(
  recommendations.find((item) => item.id === 'portfolio:recommendation:david-allen-2011-06-23')?.relationship,
  'David was Carl’s employer',
  'David Allen must remain identified as Carl’s employer.',
);
assert.equal(
  recommendations.find((item) => item.id === 'portfolio:recommendation:laura-baran-2008-02-02')?.quote,
  'Carl worked on the cutting edge design for a 3D virtual & augmented reality program that broke new ground for commercial and military applications. He was instrumental in the programming of the application software. He is a very focused individual and during his time at General Dynamics I think he surpassed all management expectations with the product he created.',
  'Laura Baran’s recommendation must retain Carl’s approved virtual and augmented reality correction.',
);
requireUnique(capabilities.map((capability) => capability.id), 'Capability IDs');
assert.equal(careerChapters.length, 4, 'The public career portrait must contain four reviewed chapters.');
requireUnique(careerChapters.map((chapter) => chapter.number), 'Career chapter numbers');
assert.equal(earlierPracticeGroups.length, 2, 'Earlier practice must retain the two bounded public groups.');
requireUnique(earlierPracticeGroups.flatMap((group) => group.organizations), 'Earlier practice organizations');
assert.equal(careerFoundations.length, 6, 'The long-view career narrative must retain six distinct foundations.');
assert(careerFoundations.some((foundation) => foundation.title === 'The Army, art school, and GWAR'), 'The career narrative must retain Carl’s early GWAR work.');
assert(careerFoundations.some((foundation) => foundation.technologies.includes('PHP') && foundation.technologies.includes('MySQL')), 'The career narrative must retain Carl’s historical PHP and MySQL foundation.');
requireUnique(careerFoundations.map((foundation) => `${foundation.period}:${foundation.title}`), 'Career foundation records');
requireUnique(characterSignals.map((signal) => signal.recommendationId), 'Character signal recommendation IDs');

const historicalResumeSource = await readFile(resolve(root, 'docs/CAREER_SOURCE_2012_RESUME.md'), 'utf8');
assert(historicalResumeSource.includes('portfolio:source:career:resume-2012'), 'The 2012 resume source must retain its stable source ID.');
assert(!historicalResumeSource.includes('805-403-4819'), 'The historical phone number must not enter the repository source record.');
assert(!historicalResumeSource.includes('carlwelchdesign@gmail.com'), 'The historical email address must not enter the repository source record.');

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
  assert(project.role?.trim(), `${project.name} must identify Carl's role.`);
  assert(project.scope?.trim(), `${project.name} must identify Carl's project scope.`);
  assert(project.story?.heading?.trim(), `${project.name} must include a case-study heading.`);
  assert(project.story?.problem?.trim(), `${project.name} must explain the product problem.`);
  assert(project.story?.contribution?.trim(), `${project.name} must explain Carl's contribution.`);
  assert.equal(project.story?.decisions?.length, 3, `${project.name} must include exactly three key decisions.`);
  assert(project.architecture?.title?.trim(), `${project.name} must name its architecture topology.`);
  assert(project.architecture?.summary?.trim(), `${project.name} must explain its architecture boundary.`);
  assert(project.architecture?.groups?.length >= 3, `${project.name} must include at least three system boundaries.`);
  assert(project.architecture?.nodes?.length >= 10, `${project.name} must include a detailed component topology.`);
  assert(project.architecture?.edges?.length >= 10, `${project.name} must include meaningful system connections.`);
  requireUnique(project.architecture.groups.map((group) => group.id), `${project.name} architecture group IDs`);
  requireUnique(project.architecture.nodes.map((node) => node.id), `${project.name} architecture component IDs`);
  const architectureNodeIds = new Set(project.architecture.nodes.map((node) => node.id));
  for (const group of project.architecture.groups) {
    assert(group.label?.trim(), `${project.name} architecture boundaries must include a label.`);
    assert(group.detail?.trim(), `${project.name} architecture boundaries must explain their responsibility.`);
    assert(group.x >= 0 && group.y >= 0 && group.x + group.width <= 1000 && group.y + group.height <= 620, `${project.name} architecture boundaries must fit the topology canvas.`);
  }
  for (const node of project.architecture.nodes) {
    assert(node.label?.trim(), `${project.name} architecture components must include a label.`);
    assert(node.detail?.trim(), `${project.name} architecture components must explain their system responsibility.`);
    assert(node.technology?.trim(), `${project.name} architecture components must identify concrete technology or policy.`);
    assert(node.x >= 0 && node.y >= 0 && node.x + (node.width ?? 170) <= 1000 && node.y + 80 <= 620, `${project.name} architecture components must fit the topology canvas.`);
  }
  for (const edge of project.architecture.edges) {
    assert(architectureNodeIds.has(edge.from), `${project.name} architecture edge references unknown source ${edge.from}.`);
    assert(architectureNodeIds.has(edge.to), `${project.name} architecture edge references unknown target ${edge.to}.`);
  }
  for (const decision of project.story.decisions) {
    assert(decision.title?.trim(), `${project.name} case-study decisions must include a title.`);
    assert(decision.detail?.trim(), `${project.name} case-study decisions must include a concrete explanation.`);
  }
  const storyCopy = [
    project.story.heading,
    project.story.problem,
    project.story.contribution,
    ...project.story.decisions.flatMap((decision) => [decision.title, decision.detail]),
  ].join(' ');
  assert(!/verified from|approved for publication|preserved source material|public corpus|repository-grounded/i.test(storyCopy), `${project.name} case-study narrative contains internal editorial language.`);
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

const jobSearchOs = projects.find((project) => project.slug === 'job-search-os');
assert(jobSearchOs?.gallery.length >= 6, 'Job Search OS must retain its expanded multi-surface product tour.');
assert(jobSearchOs?.architecture.nodes.length >= 10, 'Job Search OS must retain its detailed source-grounded topology.');
assert(!jobSearchOs?.gallery.some((item) => item.src.includes('system-topology')), 'Job Search OS must not render the rejected topology artifact.');
assert.match(jobSearchOs?.story.contribution ?? '', /LangGraph.*Postgres checkpointing/);
assert.match(jobSearchOs?.story.contribution ?? '', /LangSmith.*redacted tracing/);
assert(
  jobSearchOs?.architecture.nodes.some((node) => node.technology.includes('LangSmith')),
  'Job Search OS architecture must identify its optional LangSmith observability layer.',
);
const echoAtlas = projects.find((project) => project.slug === 'echoatlas');
assert(echoAtlas, 'EchoAtlas case study must remain published.');
assert.equal(echoAtlas.maturity, 'deployed_demo', 'EchoAtlas must retain its bounded public-demonstration maturity.');
assert.equal(echoAtlas.liveUrl, 'https://earth-atlas-ai.vercel.app/');
assert.deepEqual(
  echoAtlas.gallery.map((item) => item.label),
  ['Explore provider availability', 'Review pair comparability', 'Analyze prepared evidence'],
);
const echoAtlasMedia = [echoAtlas.image, ...echoAtlas.gallery];
const echoAtlasMediaIdentities = await Promise.all(echoAtlasMedia.map(async (item) => {
  const identity = await readPngIdentity(`public${item.src}`);
  assert.equal(item.width, 1440, `${item.src} metadata must retain the approved desktop width.`);
  assert.equal(item.height, 960, `${item.src} metadata must retain the approved viewport height.`);
  assert.equal(identity.width, item.width, `${item.src} width metadata must match the PNG.`);
  assert.equal(identity.height, item.height, `${item.src} height metadata must match the PNG.`);
  return identity;
}));
requireUnique(
  echoAtlasMediaIdentities.map((identity) => identity.sha256),
  'EchoAtlas case-study screenshots',
);
assert.match(echoAtlas.story.contribution, /Scientific validity remains undetermined/);
const echoAtlasArchitectureText = echoAtlas.architecture.nodes
  .flatMap((node) => [node.label, node.detail, node.technology])
  .join(' ');
assert.doesNotMatch(
  echoAtlasArchitectureText,
  /portfolio/i,
  'EchoAtlas architecture must describe EchoAtlas itself, not the website hosting its case study.',
);
assert(
  echoAtlas.architecture.nodes.some(
    (node) => node.id === 'vercel'
      && node.label === 'Public EchoAtlas deployment'
      && node.technology === 'Vite · FastAPI · Vercel',
  ),
  'EchoAtlas architecture must identify its bounded public deployment explicitly.',
);
assert(
  echoAtlas.boundaries.some((boundary) => boundary.includes('operational monitoring') && boundary.includes('not implemented')),
  'EchoAtlas must keep operational monitoring outside the shipped capability boundary.',
);
assert(
  echoAtlas.evidence.some((item) => item.id === 'portfolio:claim:echoatlas:prepared-evidence' && /26 machine-generated candidates/.test(item.text)),
  'EchoAtlas must retain the bounded prepared-evidence claim.',
);
assert(
  echoAtlas.evidence.some((item) => item.id === 'portfolio:claim:echoatlas:public-boundary' && /does not process arbitrary remote imagery/.test(item.text)),
  'EchoAtlas must retain the public deployment processing boundary.',
);
assert(projects.find((project) => project.slug === 'flight-tracker-ai')?.gallery.length >= 3, 'Flight Tracker AI must retain live, replay, and route-comparison views.');
assert(projects.find((project) => project.slug === 'wave-factory-essentials')?.gallery.length >= 5, 'Wave Factory Essentials must retain its expanded product-family gallery.');
const supraconscious = projects.find((project) => project.slug === 'supraconscious-avatar-ai');
assert(supraconscious?.image.src === '/projects/supraconscious-avatar-ai/internal-journal.png', 'Supraconscious Avatar AI must lead with the authenticated journal workspace.');
assert(
  JSON.stringify(supraconscious?.gallery.map((item) => item.src)) === JSON.stringify([
    '/projects/supraconscious-avatar-ai/internal-history.png',
    '/projects/supraconscious-avatar-ai/internal-guide.png',
    '/projects/supraconscious-avatar-ai/internal-settings.png',
  ]),
  'Supraconscious Avatar AI must retain its authenticated product gallery.',
);
assert(projects.find((project) => project.slug === 'argent-matchmaking')?.gallery.length >= 3, 'Argent Matchmaking must retain its product-system, direction, and environment views.');
const progressionLab = projects.find((project) => project.slug === 'progression-lab-ai');
assert.equal(progressionLab?.maturity, 'production', 'ProgressionLab must retain its deployed product boundary.');
assert.equal(progressionLab?.liveUrl, 'https://progressionlab.app', 'ProgressionLab must retain its public product URL.');
assert.equal(progressionLab?.image.src, '/projects/progression-lab-ai/generator.png', 'ProgressionLab must lead with the live generator capture.');
assert(progressionLab?.gallery.length >= 2, 'ProgressionLab must retain its generated-result and public-library product tour.');
assert(
  progressionLab?.boundaries.some((boundary) => boundary.includes('user count, revenue, retention, conversion')),
  'ProgressionLab must retain its adoption and commercial-performance boundary.',
);

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

const joleneProject = projects.find((project) => project.slug === 'jolene-ai');
assert(joleneProject, 'Jolene case study must remain published.');
assert.equal(joleneProject.status, 'Deployed career-wide public delegate');
const joleneOrigin = joleneProject.evidence.find((item) => item.id === 'portfolio:claim:jolene-ai:origin');
assert(joleneOrigin, 'Jolene origin evidence must remain published.');
assert.match(joleneProject.story.problem, /March 2026 layoff/);
assert.match(joleneProject.story.problem, /BLM land in Nevada/);
assert.match(joleneProject.story.problem, /generator, Starlink, and my MacBook/);
assert.match(joleneProject.story.contribution, /Jolene is not Dolly, does not impersonate her, and does not imply her endorsement/);
assert.match(joleneOrigin.text, /chief-of-staff agent/);
assert.deepEqual(joleneOrigin.limitations, ['Jolene is not Dolly Parton, does not impersonate her, and does not imply her endorsement.']);
assert.equal(joleneProject.gallery.length, 5, 'Jolene case study must publish its origin photograph and four character-system views.');
assert.equal(
  new Set(joleneProject.gallery.map((item) => item.src)).size,
  joleneProject.gallery.length,
  'Jolene case-study views must use distinct image assets.',
);
assert.deepEqual(
  joleneProject.gallery.map((item) => item.label),
  ['Nevada field camp', 'Conversation state ensemble', 'Canonical identity lock', 'Abandoned greeting experiment', 'Approved runtime atlas'],
);
assert.equal(joleneProject.retrospective?.lessons.length, 4, 'Jolene retrospective must retain all four production lessons.');
assert.match(joleneProject.retrospective?.heading ?? '', /failed animation effort/);
assert.match(
  joleneProject.gallery.find((item) => item.label === 'Abandoned greeting experiment')?.caption ?? '',
  /did not meet the visual bar.*abandoned this direction rather than ship it/,
);
assert.match(joleneProject.retrospective?.summary ?? '', /greeting animation experiment did not.*abandoned that sequence/);
assert(
  joleneProject.architecture.nodes.some((node) => node.id === 'corpus' && /92 published records/.test(node.detail)),
  'Jolene architecture must identify the deployed reviewed career artifact.',
);
assert(
  joleneProject.architecture.nodes.some((node) => node.id === 'evaluation' && /132 cases, 192 turns/.test(node.detail)),
  'Jolene architecture must identify the current launch-evaluation scale.',
);
assert(
  publicEvidenceTargetRecords.some(([evidenceId, path, label, status]) =>
    evidenceId === 'portfolio:claim:jolene-ai:origin'
      && path === '/work/jolene-ai'
      && label === 'Why Carl built Jolene'
      && status === 'available'),
  'Jolene origin evidence must resolve to its public case-study anchor.',
);

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
