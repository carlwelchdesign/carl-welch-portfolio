import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourceRoot = resolve(process.cwd(), 'app/analytics');
const outputRoot = await mkdtemp(join(tmpdir(), 'portfolio-analytics-'));
const sourceFiles = ['analytics-contract.ts', 'analytics-client.ts'].map((file) => resolve(sourceRoot, file));

try {
  compile();
  const contract = await import(pathToFileURL(resolve(outputRoot, 'analytics-contract.js')).href);
  const client = await import(pathToFileURL(resolve(outputRoot, 'analytics-client.js')).href);

  const approved = [
    ['portfolio_navigation', { destination: 'work' }, 'portfolio'],
    ['evidence_reveal', { surface: 'portfolio' }, 'portfolio'],
    ['resume_download', { location: 'footer' }, 'portfolio'],
    ['outbound_contact', { channel: 'email', location: 'contact' }, 'portfolio'],
    ['jolene_open', { source: 'launcher' }, 'jolene'],
    ['jolene_response', { operation: 'job_fit', state: 'no_evidence' }, 'jolene'],
    ['jolene_citation_followthrough', { destination: 'portfolio' }, 'jolene'],
  ];

  for (const [name, properties, category] of approved) {
    const event = contract.parseAnalyticsEvent(name, properties);
    assert.equal(event.category, category);
    assert.deepEqual(event.properties, properties);
  }

  const prohibitedPayloads = [
    ['jolene_response', { operation: 'answer', state: 'success', transcript: 'private answer' }],
    ['jolene_response', { operation: 'job_fit', state: 'success', jobDescription: 'secret role' }],
    ['outbound_contact', { channel: 'email', location: 'contact', message: 'call me' }],
    ['portfolio_navigation', { destination: 'work', url: '/work?email=visitor@example.com' }],
    ['portfolio_navigation', { destination: 'work', query: 'token=secret' }],
    ['evidence_reveal', { surface: 'portfolio', evidenceId: 'portfolio:claim:private' }],
    ['jolene_open', { source: 'launcher', sessionId: 'visitor-123' }],
  ];
  for (const [name, properties] of prohibitedPayloads) {
    assert.throws(() => contract.parseAnalyticsEvent(name, properties), contract.AnalyticsContractError);
  }
  assert.throws(() => contract.parseAnalyticsEvent('page_view', {}), contract.AnalyticsContractError);
  assert.throws(() => contract.parseAnalyticsEvent('jolene_response', { operation: 'answer' }), contract.AnalyticsContractError);

  assert.equal(client.privacySignalEnabled({ doNotTrack: '1' }), true);
  assert.equal(client.privacySignalEnabled({ doNotTrack: null, globalPrivacyControl: true }), true);
  assert.equal(client.privacySignalEnabled({ doNotTrack: '0', globalPrivacyControl: false }), false);

  client.configureAnalytics('disabled');
  assert.equal(client.trackAnalytics('jolene_open', { source: 'launcher' }), null);

  console.log('Analytics checks passed: closed event dictionary, portfolio/Jolene separation, prohibited-field rejection, privacy signals, and disabled default.');
} finally {
  await rm(outputRoot, { recursive: true, force: true });
}

function compile() {
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
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  };
  const host = ts.createCompilerHost(options);
  const program = ts.createProgram(sourceFiles, options, host);
  const diagnostics = [...ts.getPreEmitDiagnostics(program), ...program.emit().diagnostics];
  if (diagnostics.length) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => '\n',
    }));
  }
}
