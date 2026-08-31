import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourceRoot = resolve(process.cwd(), 'app/jolene');
const sourceFiles = [
  'public-contract.ts',
  'public-contract-error.ts',
  'public-compatibility.ts',
  'public-adapter.ts',
  'public-validation.ts',
  'public-fixtures.ts',
  'public-evidence-targets.ts',
  'public-evidence-navigation-core.ts',
  'public-evidence-navigation.ts',
].map((file) => resolve(sourceRoot, file));
const outputRoot = await mkdtemp(join(tmpdir(), 'portfolio-jolene-contract-'));

function compileContract() {
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    rootDir: sourceRoot,
    outDir: outputRoot,
    strict: true,
    skipLibCheck: true,
    noEmit: false,
    declaration: false,
    sourceMap: false,
  };
  const host = ts.createCompilerHost(options);
  const program = ts.createProgram(sourceFiles, options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const result = program.emit();
  const allDiagnostics = [...diagnostics, ...result.diagnostics];
  if (allDiagnostics.length > 0 || result.emitSkipped) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(allDiagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => '\n',
      }),
    );
  }
}

try {
  compileContract();
  const contract = await import(pathToFileURL(resolve(outputRoot, 'public-contract.js')).href);
  const adapterModule = await import(pathToFileURL(resolve(outputRoot, 'public-adapter.js')).href);
  const validation = await import(pathToFileURL(resolve(outputRoot, 'public-validation.js')).href);
  const fixtures = await import(pathToFileURL(resolve(outputRoot, 'public-fixtures.js')).href);
  const navigation = await import(pathToFileURL(resolve(outputRoot, 'public-evidence-navigation-core.js')).href);
  const publicNavigation = await import(pathToFileURL(resolve(outputRoot, 'public-evidence-navigation.js')).href);
  const compatibility = await import(pathToFileURL(resolve(outputRoot, 'public-compatibility.js')).href);
  const openApi = JSON.parse(
    await readFile(resolve(process.cwd(), 'contracts/public-jolene-v1.openapi.json'), 'utf8'),
  );
  const validatedProviderManifest = JSON.parse(
    await readFile(resolve(process.cwd(), 'contracts/validated-public-evidence-manifest.json'), 'utf8'),
  );

  assert.equal(openApi.openapi, '3.1.0');
  assert.equal(openApi.info.version, contract.PUBLIC_JOLENE_SCHEMA_VERSION);
  assert.equal(openApi['x-portfolio-runtime'], 'fixture-only');
  assert.equal(openApi['x-public-deployment'], false);
  assert.deepEqual(Object.keys(openApi.paths).sort(), Object.values(contract.PUBLIC_JOLENE_ENDPOINTS).sort());
  assert.equal(
    openApi.components.schemas.PortfolioAnswerRequest.properties.question.maxLength,
    contract.PUBLIC_JOLENE_LIMITS.questionCharacters,
  );
  assert.equal(
    openApi.components.schemas.JobFitRequest.properties.jobDescription.maxLength,
    contract.PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters,
  );
  assert.equal(
    openApi.components.schemas.PortfolioAnswerResponse.properties.claims.maxItems,
    contract.PUBLIC_JOLENE_LIMITS.answerClaims,
  );
  assert.equal(
    openApi.components.schemas.PublicConversationContext.properties.turnCount.maximum,
    contract.PUBLIC_JOLENE_LIMITS.conversationTurns,
  );
  assert.ok('conversationContext' in openApi.components.schemas.PortfolioAnswerRequest.properties);
  assert.ok('conversationContext' in openApi.components.schemas.PortfolioAnswerResponse.properties);
  assert.equal(
    openApi.components.schemas.JobFitResponse.properties.requirements.maxItems,
    contract.PUBLIC_JOLENE_LIMITS.jobRequirements,
  );
  assert.ok(!('sessionToken' in openApi.components.schemas.PortfolioAnswerRequest.properties));
  assert.ok(!('sessionToken' in openApi.components.schemas.JobFitRequest.properties));
  assert.deepEqual(validation.parsePublicEvidenceManifest(validatedProviderManifest), validatedProviderManifest);
  assert.equal(validatedProviderManifest.evidenceCount, 41);
  assert.equal(validatedProviderManifest.revokedEvidenceIds.length, 0);

  const success = fixtures.createFixturePublicJoleneAdapter('success');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.manifest, '/v1/public-evidence/manifest');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.answer, '/v1/portfolio/answer');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.jobFit, '/v1/portfolio/job-fit');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.contactIntent, '/v1/portfolio/contact-intent');
  assert.equal(openApi.openapi, '3.1.0');
  assert.equal(openApi.info.version, contract.PUBLIC_JOLENE_SCHEMA_VERSION);
  assert.deepEqual(Object.keys(openApi.paths).sort(), Object.values(contract.PUBLIC_JOLENE_ENDPOINTS).sort());
  const manifest = await success.getManifest();
  assert.equal(manifest.schemaVersion, contract.PUBLIC_JOLENE_SCHEMA_VERSION);
  assert.match(manifest.corpusHash, /^sha256:[a-f0-9]{64}$/);
  assert.ok(manifest.evidenceCount > 0);
  assert.ok(manifest.reviewedAt);

  const emptyManifest = await fixtures.createFixturePublicJoleneAdapter('empty_corpus').getManifest();
  assert.equal(emptyManifest.evidenceCount, 0);
  assert.equal(emptyManifest.reviewedAt, null);
  assert.deepEqual(
    validation.parsePublicEvidenceManifest(openApi.components.schemas.PublicEvidenceManifest.examples[0]),
    openApi.components.schemas.PublicEvidenceManifest.examples[0],
  );

  const answer = await success.answer({ question: 'What kind of systems does Carl build?' });
  assert.ok(answer.claims.length > 0);
  assert.ok(answer.citations.length > 0);
  assert.equal(answer.corpusVersion, manifest.corpusVersion);
  assert.ok(answer.citations.every((citation) => /^\/work\/[a-z0-9-]+#evidence--portfolio--claim--/.test(citation.href)));
  compatibility.validateResponseAgainstManifest(answer, manifest);
  const activeContext = {
    corpusVersion: answer.corpusVersion,
    projectPath: '/work/jolene-ai',
    evidenceIds: [answer.citations[0].evidenceId],
    turnCount: 1,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  };
  assert.deepEqual(
    validation.parsePortfolioAnswerRequest({
      question: 'What about its security?',
      conversationContext: activeContext,
    }).conversationContext,
    activeContext,
  );
  assert.deepEqual(
    validation.parsePortfolioAnswerResponse({
      ...answer,
      conversationContext: activeContext,
    }).conversationContext,
    activeContext,
  );
  assert.deepEqual(validation.activePublicConversationContext(activeContext), activeContext);
  assert.equal(
    validation.activePublicConversationContext({
      ...activeContext,
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
    }),
    undefined,
  );
  assert.throws(
    () => validation.parsePortfolioAnswerRequest({
      question: 'What about it?',
      conversationContext: { ...activeContext, transcript: 'must not pass' },
    }),
    (error) => error instanceof validation.PublicJoleneContractError &&
      error.path === 'answerRequest.conversationContext',
  );
  assert.throws(
    () => validation.parsePortfolioAnswerResponse({
      ...answer,
      conversationContext: {
        ...activeContext,
        corpusVersion: `career:${'f'.repeat(64)}`,
      },
    }),
    (error) => error instanceof validation.PublicJoleneContractError &&
      error.path === 'answerResponse.conversationContext.corpusVersion',
  );

  const additiveAnswer = structuredClone(answer);
  additiveAnswer.schemaVersion = '1.1.0';
  additiveAnswer.futureOptionalField = { safelyIgnored: true };
  assert.equal(validation.parsePortfolioAnswerResponse(additiveAnswer).schemaVersion, '1.1.0');
  assert.throws(
    () => validation.parsePortfolioAnswerResponse({ ...answer, answer: undefined }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'answerResponse.answer',
  );
  assert.throws(
    () => validation.parsePortfolioAnswerResponse({ ...answer, schemaVersion: '2.0.0' }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'answerResponse.schemaVersion',
  );
  assert.throws(
    () => compatibility.validateResponseAgainstManifest({ ...answer, corpusVersion: 'stale-corpus' }, manifest),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'response.corpusVersion',
  );
  assert.throws(
    () => compatibility.validateResponseAgainstManifest(answer, {
      ...manifest,
      revokedEvidenceIds: [answer.citations[0].evidenceId],
    }),
    (error) => error instanceof validation.PublicJoleneContractError && /revoked evidence/.test(error.message),
  );

  const navigationTarget = {
    evidenceId: answer.citations[0].evidenceId,
    href: answer.citations[0].href,
    anchorId: new URL(answer.citations[0].href, 'https://portfolio.invalid').hash.slice(1),
    label: answer.citations[0].title,
    status: 'available',
  };
  const reviewTarget = {
    ...navigationTarget,
    evidenceId: 'portfolio:source:recommendation:review-candidate',
    status: 'review_required',
  };
  const navigationTargets = new Map([
    [navigationTarget.evidenceId, navigationTarget],
    [reviewTarget.evidenceId, reviewTarget],
  ]);
  const supersededEvidence = new Map([['fixture:legacy:evidence', navigationTarget.evidenceId]]);
  assert.equal(
    navigation.resolveEvidenceTarget(navigationTarget.evidenceId, navigationTargets, supersededEvidence).status,
    'available',
  );
  assert.equal(
    publicNavigation.resolvePublicEvidenceCitation(answer.citations[0], {
      corpusVersion: answer.corpusVersion,
      expectedCorpusVersion: manifest.corpusVersion,
      revokedEvidenceIds: manifest.revokedEvidenceIds,
    }).status,
    'available',
  );
  assert.equal(
    publicNavigation.resolvePublicEvidenceCitation(
      { evidenceId: `career:${'c1'.repeat(16)}`, href: '/capabilities' },
      { corpusVersion: manifest.corpusVersion, expectedCorpusVersion: manifest.corpusVersion },
    ).target.href,
    '/capabilities#main-content',
  );
  assert.equal(
    publicNavigation.resolvePublicEvidenceCitation(
      { evidenceId: `career:${'c2'.repeat(16)}`, href: '/experience#grindr' },
      { corpusVersion: manifest.corpusVersion, expectedCorpusVersion: manifest.corpusVersion },
    ).target.anchorId,
    'grindr',
  );
  assert.equal(
    publicNavigation.resolvePublicEvidenceCitation(
      { evidenceId: `career:${'c3'.repeat(16)}`, href: '/work/job-search-os#evidence' },
      { corpusVersion: manifest.corpusVersion, expectedCorpusVersion: manifest.corpusVersion },
    ).target.anchorId,
    'evidence',
  );
  assert.equal(
    publicNavigation.resolvePublicEvidenceCitation(
      { evidenceId: `career:${'c4'.repeat(16)}`, href: '/contact' },
      { corpusVersion: manifest.corpusVersion, expectedCorpusVersion: manifest.corpusVersion },
    ).status,
    'unavailable',
  );
  assert.equal(
    publicNavigation.resolvePublicEvidenceCitation(
      { evidenceId: `career:${'c5'.repeat(16)}`, href: '/capabilities' },
      {
        corpusVersion: manifest.corpusVersion,
        expectedCorpusVersion: manifest.corpusVersion,
        revokedEvidenceIds: [`career:${'c5'.repeat(16)}`],
      },
    ).status,
    'revoked',
  );
  assert.equal(
    navigation.resolveEvidenceTarget(reviewTarget.evidenceId, navigationTargets, supersededEvidence).status,
    'review_required',
  );
  assert.equal(
    navigation.resolveEvidenceTarget('fixture:legacy:evidence', navigationTargets, supersededEvidence).status,
    'superseded',
  );
  assert.equal(
    navigation.resolveEvidenceTarget('portfolio:claim:missing:record', navigationTargets, supersededEvidence).status,
    'unavailable',
  );
  assert.equal(
    navigation.resolveEvidenceTarget(navigationTarget.evidenceId, navigationTargets, supersededEvidence, {
      revokedEvidenceIds: [navigationTarget.evidenceId],
    }).status,
    'revoked',
  );
  assert.equal(
    navigation.resolveEvidenceTarget(navigationTarget.evidenceId, navigationTargets, supersededEvidence, {
      corpusVersion: 'old-corpus', expectedCorpusVersion: answer.corpusVersion,
    }).status,
    'version_mismatch',
  );

  const partialAnswer = await fixtures
    .createFixturePublicJoleneAdapter('partial_evidence')
    .answer({ question: 'Does Carl meet every requirement?' });
  assert.equal(partialAnswer.claims[0].evidenceStrength, 'limited');
  assert.ok(partialAnswer.limitations.length > 0);

  const noEvidenceAnswer = await fixtures
    .createFixturePublicJoleneAdapter('no_evidence')
    .answer({ question: 'Tell me something unsupported.' });
  assert.equal(noEvidenceAnswer.claims.length, 0);
  assert.equal(noEvidenceAnswer.citations.length, 0);
  assert.equal(
    (await fixtures.createFixturePublicJoleneAdapter('empty_corpus').answer({ question: 'What is public?' })).claims.length,
    0,
  );

  const jobFit = await success.compareJob({ jobDescription: 'React, safe AI workflows, and Kubernetes.' });
  assert.deepEqual(
    jobFit.requirements.map((requirement) => requirement.assessment),
    ['direct', 'direct', 'missing'],
  );
  assert.ok(jobFit.caveats.some((caveat) => caveat.includes('not a recommendation')));
  assert.ok(
    jobFit.requirements
      .filter((requirement) => requirement.assessment === 'missing' || requirement.assessment === 'unknown')
      .every((requirement) => requirement.evidenceIds.length === 0),
  );

  const contact = await success.submitContactIntent({
    name: 'Fixture visitor',
    email: 'visitor@example.com',
    organization: 'Example',
    message: 'I would like Carl to review this contact request.',
    consent: true,
  });
  assert.equal(contact.status, 'pending_review');
  assert.match(contact.message, /No outbound action was taken/);
  assert.ok(!JSON.stringify(contact).includes('visitor@example.com'));
  assert.ok(!JSON.stringify(contact).includes('Fixture visitor'));
  assert.ok(!JSON.stringify(contact).includes('I would like Carl to review this contact request.'));

  const safeErrorExample = openApi.components.schemas.PublicJoleneErrorResponse.examples[0];
  assert.deepEqual(validation.parsePublicJoleneErrorResponse(safeErrorExample), safeErrorExample);

  await assert.rejects(
    success.answer({ question: '' }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'answerRequest.question',
  );
  await assert.rejects(
    success.answer({ question: 'Question', sessionToken: 'v1-does-not-retain-continuity' }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'answerRequest',
  );
  await assert.rejects(
    success.compareJob({ jobDescription: 'x'.repeat(contract.PUBLIC_JOLENE_LIMITS.jobDescriptionCharacters + 1) }),
    (error) =>
      error instanceof validation.PublicJoleneContractError && error.path === 'jobFitRequest.jobDescription',
  );
  await assert.rejects(
    success.submitContactIntent({
      name: 'Fixture visitor',
      email: 'visitor@example.com',
      message: 'No consent.',
      consent: false,
    }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'contactIntentRequest.consent',
  );

  const brokenAnswer = structuredClone(answer);
  brokenAnswer.claims[0].evidenceIds = ['career:00000000-0000-4000-8000-000000009999'];
  assert.throws(
    () => validation.parsePortfolioAnswerResponse(brokenAnswer),
    (error) => error instanceof validation.PublicJoleneContractError && /missing citation/.test(error.message),
  );
  const uncitedAnswer = structuredClone(answer);
  uncitedAnswer.claims[0].evidenceIds = [];
  assert.throws(
    () => validation.parsePortfolioAnswerResponse(uncitedAnswer),
    (error) => error instanceof validation.PublicJoleneContractError && /require cited evidence/.test(error.message),
  );
  const inflatedMaturity = structuredClone(answer);
  inflatedMaturity.claims[0].maturity = 'released_product';
  assert.throws(
    () => validation.parsePortfolioAnswerResponse(inflatedMaturity),
    (error) => error instanceof validation.PublicJoleneContractError && /least mature applicable citation/.test(error.message),
  );
  const externalCitation = structuredClone(answer);
  externalCitation.citations[0].href = 'https://unreviewed.example/evidence';
  assert.throws(
    () => validation.parsePortfolioAnswerResponse(externalCitation),
    (error) => error instanceof validation.PublicJoleneContractError && error.path.endsWith('.href'),
  );
  const unsupportedMissingEvidence = structuredClone(jobFit);
  unsupportedMissingEvidence.requirements[2].evidenceIds = [jobFit.citations[0].evidenceId];
  assert.throws(
    () => validation.parseJobFitResponse(unsupportedMissingEvidence),
    (error) => error instanceof validation.PublicJoleneContractError && /must not cite evidence/.test(error.message),
  );
  const oversizedAnswer = structuredClone(answer);
  oversizedAnswer.answer = 'x'.repeat(contract.PUBLIC_JOLENE_LIMITS.answerCharacters + 1);
  assert.throws(
    () => validation.parsePortfolioAnswerResponse(oversizedAnswer),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'answerResponse.answer',
  );
  assert.throws(
    () => validation.parsePublicEvidenceManifest({ ...manifest, reviewedAt: null }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'manifest.reviewedAt',
  );
  assert.throws(
    () => validation.parsePublicEvidenceManifest({ ...manifest, schemaVersion: '2.0.0' }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'manifest.schemaVersion',
  );

  assert.throws(
    () => validation.parsePublicJoleneErrorResponse({
      ...safeErrorExample,
      supportedSchemaVersions: [],
    }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'errorResponse.supportedSchemaVersions',
  );

  await assert.rejects(
    fixtures.createFixturePublicJoleneAdapter('unavailable').getManifest(),
    (error) => error instanceof adapterModule.PublicJoleneAdapterError && error.code === 'unavailable',
  );
  await assert.rejects(
    fixtures.createFixturePublicJoleneAdapter('rate_limited').answer({ question: 'Can I ask another question?' }),
    (error) =>
      error instanceof adapterModule.PublicJoleneAdapterError &&
      error.code === 'rate_limited' &&
      error.retryAfterSeconds === 60,
  );
  await assert.rejects(
    fixtures.createFixturePublicJoleneAdapter('version_mismatch').getManifest(),
    (error) => error instanceof adapterModule.PublicJoleneAdapterError && error.code === 'version_mismatch',
  );

  console.log('Public Jolene contract checks passed: frozen OpenAPI bounds, additive compatibility, fixtures, corpus/revocation gates, evidence references, and safe failures.');
} finally {
  await rm(outputRoot, { recursive: true, force: true });
}
