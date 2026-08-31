import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const frameDirectory = new URL('../art-source/jolene-four-frame-reactions/v1-static-sheet/frames-105x115/', import.meta.url);
const facePatch = [38, 18, 73, 52];
const upperFacePatch = [38, 18, 73, 41];

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  const frameNames = (await readdir(frameDirectory)).filter((name) => name.endsWith('.png')).sort();
  const frames = Object.fromEntries(
    await Promise.all(
      frameNames.map(async (name) => [name, `data:image/png;base64,${(await readFile(new URL(name, frameDirectory))).toString('base64')}`]),
    ),
  );

  const decoded = await page.evaluate(async (sources) => {
    const result = {};
    for (const [name, source] of Object.entries(sources)) {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas 2D context is unavailable.');
      context.drawImage(image, 0, 0);
      result[name] = Array.from(context.getImageData(0, 0, image.width, image.height).data);
    }
    return result;
  }, frames);

  const pixelBytes = (name, [left, top, right, bottom]) => {
    const source = decoded[name];
    assert(source, `Missing Jolene frame ${name}`);
    const bytes = [];
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const offset = (y * 105 + x) * 4;
        bytes.push(...source.slice(offset, offset + 4));
      }
    }
    return bytes;
  };

  const assertPatchMatches = (anchorName, names, patch) => {
    const expected = pixelBytes(anchorName, patch);
    for (const name of names) {
      assert.deepEqual(pixelBytes(name, patch), expected, `${name} redraws the face locked by ${anchorName}`);
    }
  };

  assertPatchMatches('03-attentive.png', ['09-listen-1.png', '10-listen-2.png'], facePatch);
  assertPatchMatches('11-speak-1.png', ['12-speak-mouth.png', '13-speak-3.png'], upperFacePatch);
  assertPatchMatches('05-evidence.png', ['14-evidence-1.png', '15-evidence-2.png', '16-evidence-3.png'], facePatch);
  assertPatchMatches(
    '06-boundary-offline.png',
    ['17-boundary-1.png', '18-boundary-2.png', '19-offline-0.png', '20-offline-1.png', '21-offline-2.png'],
    facePatch,
  );

  for (const [name, bytes] of Object.entries(decoded)) {
    const alphaValues = new Set();
    for (let offset = 3; offset < bytes.length; offset += 4) alphaValues.add(bytes[offset]);
    assert([...alphaValues].every((alpha) => alpha === 0 || alpha === 255), `${name} contains non-binary alpha`);
  }
} finally {
  await browser.close();
}

console.log('Jolene face consistency passed: animated reactions preserve their locked face; only the speaking mouth changes.');
