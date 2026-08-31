import assert from 'node:assert/strict';

const baseUrl = new URL(process.env.PORTFOLIO_CONTAINER_URL || 'http://127.0.0.1:3000');

async function requireResponse(path, expectedContentType) {
  const response = await fetch(new URL(path, baseUrl), { redirect: 'manual' });
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  assert.match(
    response.headers.get('content-type') || '',
    expectedContentType,
    `${path} returned an unexpected content type`,
  );
  return response;
}

const home = await requireResponse('/', /text\/html/);
const html = await home.text();
assert.match(html, /Carl Welch/);
assert.doesNotMatch(
  html,
  /data-jolene-fixture-launcher/,
  'The default container must not expose the fixture-only Jolene shell.',
);

await requireResponse('/manifest.webmanifest', /application\/manifest\+json|application\/json/);
const resume = await requireResponse('/carl-welch-resume.pdf', /application\/pdf|application\/octet-stream/);
const resumeSignature = Buffer.from(await resume.arrayBuffer()).subarray(0, 4).toString('ascii');
assert.equal(resumeSignature, '%PDF', 'The résumé response is not a valid PDF.');

const disabledJolene = await fetch(new URL('/api/jolene/manifest', baseUrl));
assert.equal(disabledJolene.status, 503, 'The default container must keep the public Jolene BFF disabled.');
assert.deepEqual(await disabledJolene.json(), { error: 'service_disabled' });
assert.equal(disabledJolene.headers.get('cache-control'), 'no-store');

console.log(`Container smoke checks passed at ${baseUrl.origin}: home, manifest, résumé, and Jolene production gate.`);
