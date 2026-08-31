import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const moduleUrl = new URL('../app/site-metadata.ts', import.meta.url).href;
const importExpression = `const metadata = await import(${JSON.stringify(moduleUrl)}); console.log(metadata.siteUrl.origin);`;

function loadMetadata(siteUrl) {
  return spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--input-type=module', '--eval', importExpression],
    {
      encoding: 'utf8',
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: siteUrl },
    },
  );
}

for (const [siteUrl, expectedOrigin] of [
  ['https://portfolio.example', 'https://portfolio.example'],
  ['http://127.0.0.1:3000', 'http://127.0.0.1:3000'],
]) {
  const result = loadMetadata(siteUrl);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), expectedOrigin);
}

for (const siteUrl of [
  'ftp://portfolio.example',
  'https://user:password@portfolio.example',
  'https://portfolio.example/path',
  'https://portfolio.example?preview=true',
  'https://portfolio.example#preview',
]) {
  const result = loadMetadata(siteUrl);
  assert.notEqual(result.status, 0, `${siteUrl} must not be accepted as a public origin.`);
}

console.log('Metadata origin checks passed: valid origins resolve and unsafe public URLs fail closed.');
