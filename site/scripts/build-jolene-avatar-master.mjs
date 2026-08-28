import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const sourceUrl = new URL('../public/jolene/review/country-host-selected-direction.png', import.meta.url);
const outputUrl = new URL('../public/jolene/jolene-country-host-master.png', import.meta.url);
const manifestUrl = new URL('../docs/jolene-avatar-master.v1.json', import.meta.url);
const checkOnly = process.argv.includes('--check');

const removalPolicy = Object.freeze({
  minimumChannel: 238,
  maximumChannelSpread: 10,
  minimumInteriorComponentPixels: 150,
  connectivity: 4,
});

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const asDataUrl = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;

async function deriveMaster(sourceBytes, existingOutputBytes) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    return await page.evaluate(async ({ source, existingOutput, policy }) => {
      const decode = async (src) => {
        const image = new Image();
        image.src = src;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Canvas 2D context is unavailable.');
        context.drawImage(image, 0, 0);
        return { canvas, context, imageData: context.getImageData(0, 0, image.width, image.height) };
      };

      const decoded = await decode(source);
      const { canvas, context, imageData } = decoded;
      const { width, height, data } = imageData;
      const pixelCount = width * height;
      const visited = new Uint8Array(pixelCount);
      const queue = new Int32Array(pixelCount);
      const removedComponents = [];

      const isNeutralBackground = (pixelIndex) => {
        const offset = pixelIndex * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const minimum = Math.min(red, green, blue);
        const maximum = Math.max(red, green, blue);
        return minimum >= policy.minimumChannel && maximum - minimum <= policy.maximumChannelSpread;
      };

      for (let seed = 0; seed < pixelCount; seed += 1) {
        if (visited[seed] || !isNeutralBackground(seed)) continue;

        let head = 0;
        let tail = 0;
        let touchesEdge = false;
        queue[tail] = seed;
        tail += 1;
        visited[seed] = 1;

        while (head < tail) {
          const pixelIndex = queue[head];
          head += 1;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);
          if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesEdge = true;

          const neighbors = [
            x > 0 ? pixelIndex - 1 : -1,
            x < width - 1 ? pixelIndex + 1 : -1,
            y > 0 ? pixelIndex - width : -1,
            y < height - 1 ? pixelIndex + width : -1,
          ];

          for (const neighbor of neighbors) {
            if (neighbor >= 0 && !visited[neighbor] && isNeutralBackground(neighbor)) {
              visited[neighbor] = 1;
              queue[tail] = neighbor;
              tail += 1;
            }
          }
        }

        if (touchesEdge || tail >= policy.minimumInteriorComponentPixels) {
          removedComponents.push({ pixels: tail, touchesEdge });
          for (let index = 0; index < tail; index += 1) data[queue[index] * 4 + 3] = 0;
        }
      }

      let opaquePixels = 0;
      let transparentPixels = 0;
      let minimumX = width;
      let minimumY = height;
      let maximumX = -1;
      let maximumY = -1;

      for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
        const alpha = data[pixelIndex * 4 + 3];
        if (alpha === 0) {
          transparentPixels += 1;
          continue;
        }
        opaquePixels += 1;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minimumX = Math.min(minimumX, x);
        minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x);
        maximumY = Math.max(maximumY, y);
      }

      context.putImageData(imageData, 0, 0);
      const outputDataUrl = canvas.toDataURL('image/png');
      let mismatchPixels = 0;

      if (existingOutput) {
        const committed = await decode(existingOutput);
        if (committed.imageData.width !== width || committed.imageData.height !== height) {
          mismatchPixels = pixelCount;
        } else {
          const committedData = committed.imageData.data;
          for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
            const offset = pixelIndex * 4;
            const expectedAlpha = data[offset + 3];
            const alphaMatches = committedData[offset + 3] === expectedAlpha;
            const rgbMatches = expectedAlpha === 0 || (
              committedData[offset] === data[offset]
              && committedData[offset + 1] === data[offset + 1]
              && committedData[offset + 2] === data[offset + 2]
            );
            if (!alphaMatches || !rgbMatches) mismatchPixels += 1;
          }
        }
      }

      return {
        outputDataUrl,
        width,
        height,
        opaquePixels,
        transparentPixels,
        removedComponents,
        opaqueBounds: {
          x: minimumX,
          y: minimumY,
          width: maximumX - minimumX + 1,
          height: maximumY - minimumY + 1,
        },
        mismatchPixels,
      };
    }, {
      source: asDataUrl(sourceBytes),
      existingOutput: existingOutputBytes ? asDataUrl(existingOutputBytes) : null,
      policy: removalPolicy,
    });
  } finally {
    await browser.close();
  }
}

const sourceBytes = await readFile(sourceUrl);
const existingOutputBytes = checkOnly ? await readFile(outputUrl) : null;
const result = await deriveMaster(sourceBytes, existingOutputBytes);
const generatedBytes = Buffer.from(result.outputDataUrl.split(',')[1], 'base64');

const manifest = {
  schemaVersion: '1.0.0',
  status: 'approved_for_sprite_production',
  approvedBy: 'Carl Welch',
  approvedAt: '2026-08-28',
  source: {
    path: '/jolene/review/country-host-selected-direction.png',
    sha256: sha256(sourceBytes),
    width: result.width,
    height: result.height,
  },
  output: {
    path: '/jolene/jolene-country-host-master.png',
    sha256: sha256(checkOnly ? existingOutputBytes : generatedBytes),
    width: result.width,
    height: result.height,
    hasAlpha: true,
    opaquePixels: result.opaquePixels,
    transparentPixels: result.transparentPixels,
    opaqueBounds: result.opaqueBounds,
  },
  removalPolicy,
  removedComponents: result.removedComponents,
  invariants: {
    sourceRgbPreservedForOpaquePixels: true,
    sourceDimensionsPreserved: true,
    generativeRedesignUsed: false,
    approvedForAnimation: true,
    approvedForPublicUse: false,
  },
};

if (checkOnly) {
  const committedManifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  assert.equal(result.mismatchPixels, 0, `${result.mismatchPixels} output pixels differ from the deterministic master.`);
  assert.deepEqual(committedManifest, manifest);
  assert.equal(existingOutputBytes[25], 6, 'Master PNG must use RGBA color type.');
  assert.ok(result.transparentPixels > 800_000, 'Expected the checkerboard to become transparent.');
  assert.ok(result.opaquePixels > 300_000, 'Character silhouette lost too many pixels.');
  console.log(`Jolene avatar master check passed: ${result.transparentPixels} transparent pixels, ${result.opaquePixels} preserved opaque pixels.`);
} else {
  await mkdir(new URL('../public/jolene/', import.meta.url), { recursive: true });
  await writeFile(outputUrl, generatedBytes);
  await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Built transparent Jolene master candidate at ${outputUrl.pathname}`);
}
