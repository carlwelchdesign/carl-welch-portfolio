import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const reviewDirectory = new URL('../docs/review/', import.meta.url);
const outputDirectory = fileURLToPath(new URL('../public/jolene/approved-animation/', import.meta.url));
const checkOnly = process.argv.includes('--check');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const decodeDataUrl = (url) => Buffer.from(url.split(',')[1], 'base64');

const idleAtlas = await readFile(new URL('jolene-idle-blink-v5-atlas-1x.png', reviewDirectory));
const greetWave = await readFile(new URL('../public/jolene/sprites/greet.png', import.meta.url));
const loadingDance = await readFile(new URL('../public/jolene/sprites/loading-dance-v1.png', import.meta.url));
const evidencePoint = await readFile(new URL('../public/jolene/sprites/evidence.png', import.meta.url));

assert.equal(sha256(idleAtlas), '041692e505323a7d14c96df9b197829814516e661a43191e6aecab402023122c');
assert.equal(
  sha256(greetWave),
  '185259c7634741878473e834a77ab23ac888d9cd5c766472bab5d828f347580c',
  'The approved single-frame wave changed. Preserve the canonical face, eyes, teeth, hair, hand, and alpha exactly.',
);
assert.equal(
  sha256(evidencePoint),
  'c6d15a756133e2b4c41213bef383aafab787a1d1dac02cc4a1866c8b470ad367',
  'The approved pointing pose changed.',
);

const browser = await chromium.launch({ headless: true });
let idleFrames;
let normalizedEvidencePoint;
try {
  const page = await browser.newPage();
  idleFrames = await page.evaluate(async (idleSource) => {
    const image = new Image();
    image.src = idleSource;
    await image.decode();
    if (image.width !== 3520 || image.height !== 460) throw new Error('Unexpected approved idle atlas dimensions.');
    const frameAt = (index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 460;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.imageSmoothingEnabled = false;
      context.drawImage(image, index * 320, 0, 320, 460, 0, 0, 320, 460);
      const frame = context.getImageData(0, 0, 320, 460);
      const original = new Uint8ClampedArray(frame.data);
      const hairMask = new Uint8Array(320 * 460);
      const pixelIndex = (x, y) => y * 320 + x;
      for (let y = 155; y <= 315; y += 1) {
        for (let x = 245; x <= 291; x += 1) {
          const offset = pixelIndex(x, y) * 4;
          const red = original[offset];
          const green = original[offset + 1];
          const blue = original[offset + 2];
          if (
            original[offset + 3] > 0
            && red > 80
            && red >= green
            && green > blue
            && green / red > 0.62
            && green - blue > 25
          ) hairMask[pixelIndex(x, y)] = 1;
        }
      }
      const expandedMask = new Uint8Array(hairMask);
      for (let y = 155; y <= 315; y += 1) {
        for (let x = 245; x <= 291; x += 1) {
          const index = pixelIndex(x, y);
          const offset = index * 4;
          if (hairMask[index] || original[offset + 3] === 0) continue;
          if (
            hairMask[pixelIndex(x - 1, y)]
            || hairMask[pixelIndex(x + 1, y)]
            || hairMask[pixelIndex(x, y - 1)]
            || hairMask[pixelIndex(x, y + 1)]
          ) expandedMask[index] = 1;
        }
      }
      let extendedTransparentPixels = 0;
      for (let y = 155; y <= 315; y += 1) {
        for (let x = 245; x <= 291; x += 1) {
          const sourceIndex = pixelIndex(x, y);
          if (!expandedMask[sourceIndex]) continue;
          const targetIndex = pixelIndex(x + 10, y);
          const sourceOffset = sourceIndex * 4;
          const targetOffset = targetIndex * 4;
          if (frame.data[targetOffset + 3] === 0) extendedTransparentPixels += 1;
          frame.data[targetOffset] = original[sourceOffset];
          frame.data[targetOffset + 1] = original[sourceOffset + 1];
          frame.data[targetOffset + 2] = original[sourceOffset + 2];
          frame.data[targetOffset + 3] = original[sourceOffset + 3];
        }
      }
      context.putImageData(frame, 0, 0);
      return { dataUrl: canvas.toDataURL('image/png'), extendedTransparentPixels };
    };
    return {
      rest: frameAt(0),
      inhale: frameAt(1),
      rise: frameAt(2),
      peak: frameAt(3),
      half: frameAt(7),
      closed: frameAt(8),
    };
  }, `data:image/png;base64,${idleAtlas.toString('base64')}`);
  normalizedEvidencePoint = decodeDataUrl(await page.evaluate(async (evidenceSource) => {
    const image = new Image();
    image.src = evidenceSource;
    await image.decode();
    if (image.width !== 320 || image.height !== 460) throw new Error('Unexpected pointing-frame dimensions.');

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    sourceContext.imageSmoothingEnabled = false;
    sourceContext.drawImage(image, 0, 0);
    const pixels = sourceContext.getImageData(0, 0, image.width, image.height).data;
    let minX = image.width;
    let minY = image.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        if (pixels[(y * image.width + x) * 4 + 3] === 0) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX || maxY < minY) throw new Error('The pointing frame contains no visible pixels.');

    const sourceWidth = maxX - minX + 1;
    const sourceHeight = maxY - minY + 1;
    const targetHeight = 440;
    const targetWidth = Math.round(sourceWidth * targetHeight / sourceHeight);
    const targetX = Math.round((320 - targetWidth) / 2);
    const targetY = 448 - targetHeight;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 320;
    outputCanvas.height = 460;
    const outputContext = outputCanvas.getContext('2d');
    outputContext.imageSmoothingEnabled = false;
    outputContext.drawImage(
      image,
      minX,
      minY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight,
    );
    return outputCanvas.toDataURL('image/png');
  }, `data:image/png;base64,${evidencePoint.toString('base64')}`));
} finally {
  await browser.close();
}

const frameOutputs = {
  'idle-rest.png': decodeDataUrl(idleFrames.rest.dataUrl),
  'idle-inhale.png': decodeDataUrl(idleFrames.inhale.dataUrl),
  'idle-rise.png': decodeDataUrl(idleFrames.rise.dataUrl),
  'idle-peak.png': decodeDataUrl(idleFrames.peak.dataUrl),
  'blink-half.png': decodeDataUrl(idleFrames.half.dataUrl),
  'blink-closed.png': decodeDataUrl(idleFrames.closed.dataUrl),
  'greet-wave.png': greetWave,
  'loading-dance-a.png': loadingDance,
  'loading-dance-b.png': loadingDance,
  'evidence-point.png': normalizedEvidencePoint,
};

for (const [name, frame] of Object.entries(idleFrames)) {
  assert.ok(frame.extendedTransparentPixels >= 1_000, `${name} did not receive the complete outer-hair silhouette.`);
}

const atlasFrameNames = Object.keys(frameOutputs);
const atlasColumns = 4;
const atlasRows = Math.ceil(atlasFrameNames.length / atlasColumns);
const atlasBrowser = await chromium.launch({ headless: true });
let atlasBytes;
try {
  const page = await atlasBrowser.newPage();
  const atlasDataUrl = await page.evaluate(async (sources) => {
    const frameWidth = 320;
    const frameHeight = 460;
    const columns = 4;
    const rows = Math.ceil(sources.length / columns);
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * columns;
    canvas.height = frameHeight * rows;
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    for (let index = 0; index < sources.length; index += 1) {
      const image = new Image();
      image.src = sources[index];
      await image.decode();
      context.drawImage(image, (index % columns) * frameWidth, Math.floor(index / columns) * frameHeight);
    }
    return canvas.toDataURL('image/png');
  }, atlasFrameNames.map((name) => `data:image/png;base64,${frameOutputs[name].toString('base64')}`));
  atlasBytes = decodeDataUrl(atlasDataUrl);
} finally {
  await atlasBrowser.close();
}

const atlasFrames = Object.fromEntries(atlasFrameNames.map((name, index) => [name, {
  frame: { x: (index % atlasColumns) * 320, y: Math.floor(index / atlasColumns) * 460, w: 320, h: 460 },
  rotated: false,
  trimmed: false,
  spriteSourceSize: { x: 0, y: 0, w: 320, h: 460 },
  sourceSize: { w: 320, h: 460 },
} ]));
const atlasManifest = Buffer.from(`${JSON.stringify({
  frames: atlasFrames,
  meta: {
    app: 'Aseprite-compatible Jolene approved runtime export',
    version: '1.0',
    image: `jolene-approved-atlas.png?v=${sha256(atlasBytes).slice(0, 12)}`,
    format: 'RGBA8888',
    size: { w: atlasColumns * 320, h: atlasRows * 460 },
    scale: '1',
  },
}, null, 2)}\n`);

const outputs = {
  ...frameOutputs,
  'jolene-approved-atlas.png': atlasBytes,
  'jolene-approved-atlas.json': atlasManifest,
};

if (checkOnly) {
  await Promise.all(Object.entries(outputs).map(async ([name, expectedBytes]) => {
    const actualBytes = await readFile(`${outputDirectory}/${name}`);
    assert.equal(sha256(actualBytes), sha256(expectedBytes), `Runtime frame ${name} is stale.`);
  }));
  console.log(`Verified ${Object.keys(outputs).length} approved Jolene runtime frames.`);
} else {
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all(Object.entries(outputs).map(([name, bytes]) => writeFile(`${outputDirectory}/${name}`, bytes)));
  console.log(`Staged ${Object.keys(outputs).length} approved Jolene runtime frames.`);
}
