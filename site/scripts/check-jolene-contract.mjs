import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourceRoot = resolve(process.cwd(), 'app/jolene');
const sourceFiles = [
  'public-contract.ts',
  'public-adapter.ts',
  'public-validation.ts',
  'public-fixtures.ts',
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

  const success = fixtures.createFixturePublicJoleneAdapter('success');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.manifest, '/v1/public-evidence/manifest');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.answer, '/v1/portfolio/answer');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.jobFit, '/v1/portfolio/job-fit');
  assert.equal(contract.PUBLIC_JOLENE_ENDPOINTS.contactIntent, '/v1/portfolio/contact-intent');
  const manifest = await success.getManifest();
  assert.equal(manifest.schemaVersion, contract.PUBLIC_JOLENE_SCHEMA_VERSION);
  assert.match(manifest.corpusHash, /^sha256:[a-f0-9]{64}$/);
  assert.ok(manifest.evidenceCount > 0);

  const answer = await success.answer({ question: 'What kind of systems does Carl build?' });
  assert.ok(answer.claims.length > 0);
  assert.ok(answer.citations.length > 0);
  assert.equal(answer.corpusVersion, manifest.corpusVersion);
  assert.ok(answer.citations.every((citation) => /^\/work\/[a-z0-9-]+#evidence$/.test(citation.href)));

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

  const jobFit = await success.compareJob({ jobDescription: 'React, safe AI workflows, and Kubernetes.' });
  assert.deepEqual(
    jobFit.requirements.map((requirement) => requirement.assessment),
    ['direct', 'direct', 'missing'],
  );
  assert.ok(jobFit.caveats.some((caveat) => caveat.includes('not a recommendation')));

  const contact = await success.submitContactIntent({
    name: 'Fixture visitor',
    email: 'visitor@example.com',
    organization: 'Example',
    message: 'I would like Carl to review this contact request.',
    consent: true,
  });
  assert.equal(contact.status, 'pending_review');
  assert.match(contact.message, /No outbound action was taken/);

  await assert.rejects(
    success.answer({ question: '' }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'answerRequest.question',
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
  brokenAnswer.claims[0].evidenceIds = ['fixture:missing-evidence'];
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
  assert.throws(
    () => validation.parsePublicEvidenceManifest({ ...manifest, schemaVersion: '2.0.0' }),
    (error) => error instanceof validation.PublicJoleneContractError && error.path === 'manifest.schemaVersion',
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

  console.log('Public Jolene contract checks passed: schema, fixtures, validation, evidence references, and failure states.');
} finally {
  await rm(outputRoot, { recursive: true, force: true });
}
