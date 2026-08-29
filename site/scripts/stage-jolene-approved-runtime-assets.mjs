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
const greetNames = ['rest', 'early', 'mid', 'apex', 'secondary', 'settle'];
const greetFrames = Object.fromEntries(await Promise.all(greetNames.map(async (name) => [
  name,
  await readFile(new URL(`jolene-greet-v2-${name}.png`, reviewDirectory)),
])));

assert.equal(sha256(idleAtlas), '041692e505323a7d14c96df9b197829814516e661a43191e6aecab402023122c');
const expectedGreetHashes = {
  rest: 'a21a02ca80e28ce7c9e816cf9bf6c0ec9afcab8879e53ddcacebf1ee488387ed',
  early: 'a33d7511c8e4dc07531d82dfc405a79bddd57000d45d1f6e2acea2aec08f7489',
  mid: '275bac376d15c93ce4ca1c9a7e7db60c520f5fab42880952c9ca0cec09c0d7a4',
  apex: 'a4b741620e625e5e25ad1b6f4fa73346dbb4adc4a69413b478b11b715b66b388',
  secondary: '99bbd6cf85ac2ceb9d2d22804369ccad096d5be85bb6dddadb4c64cea24c3043',
  settle: '4b17632c258a46a67a5b4131ad9e8cb81534da1a5651a422dc33c5b0ca0e6348',
};
for (const name of greetNames) assert.equal(sha256(greetFrames[name]), expectedGreetHashes[name]);

const browser = await chromium.launch({ headless: true });
let idleFrames;
try {
  const page = await browser.newPage();
  idleFrames = await page.evaluate(async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    if (image.width !== 3520 || image.height !== 460) throw new Error('Unexpected approved idle atlas dimensions.');
    const frameAt = (index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 460;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.drawImage(image, index * 320, 0, 320, 460, 0, 0, 320, 460);
      return canvas.toDataURL('image/png');
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
} finally {
  await browser.close();
}

const frameOutputs = {
  'idle-rest.png': decodeDataUrl(idleFrames.rest),
  'idle-inhale.png': decodeDataUrl(idleFrames.inhale),
  'idle-rise.png': decodeDataUrl(idleFrames.rise),
  'idle-peak.png': decodeDataUrl(idleFrames.peak),
  'blink-half.png': decodeDataUrl(idleFrames.half),
  'blink-closed.png': decodeDataUrl(idleFrames.closed),
  ...Object.fromEntries(greetNames.map((name) => [`greet-${name}.png`, greetFrames[name]])),
};

const atlasFrameNames = Object.keys(frameOutputs);
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
  frame: { x: (index % 4) * 320, y: Math.floor(index / 4) * 460, w: 320, h: 460 },
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
    image: 'jolene-approved-atlas.png',
    format: 'RGBA8888',
    size: { w: 1280, h: 1380 },
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
