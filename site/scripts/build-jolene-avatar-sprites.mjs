import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const sourceUrl = new URL('../public/jolene/review/country-host-rig-master-v2-source.png', import.meta.url);
const typingExcitedSourceUrl = new URL('../public/jolene/review/country-host-typing-excited-v1-source.png', import.meta.url);
const outputDirectoryUrl = new URL('../public/jolene/sprites/', import.meta.url);
const manifestUrl = new URL('../docs/jolene-avatar-sprites.v1.json', import.meta.url);
const checkOnly = process.argv.includes('--check');

const stateNames = ['idle', 'blink', 'greet', 'excited', 'listen', 'think', 'speak', 'evidence', 'boundary', 'offline', 'rest'];
const frameWidth = 320;
const frameHeight = 460;
const anchor = Object.freeze({ x: 160, y: 448 });
const removalPolicy = Object.freeze({ minimumChannel: 225, maximumChannelSpread: 16, connectivity: 4 });
const outlinePolicy = Object.freeze({ minimumChannel: 104, maximumChannelSpread: 38 });

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const asDataUrl = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;

async function normalizeStandaloneFrame(sourceBytes, state) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    return await page.evaluate(async ({ source, stateName, targetWidth, targetHeight, targetAnchor, policy, outline }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = image.width;
      sourceCanvas.height = image.height;
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) throw new Error('Standalone source canvas context is unavailable.');
      sourceContext.drawImage(image, 0, 0);
      const imageData = sourceContext.getImageData(0, 0, image.width, image.height);

      const pixelCount = image.width * image.height;
      const backgroundVisited = new Uint8Array(pixelCount);
      const backgroundQueue = new Int32Array(pixelCount);
      let backgroundHead = 0;
      let backgroundTail = 0;
      const isNeutralBackground = (pixelIndex) => {
        const offset = pixelIndex * 4;
        const minimum = Math.min(imageData.data[offset], imageData.data[offset + 1], imageData.data[offset + 2]);
        const maximum = Math.max(imageData.data[offset], imageData.data[offset + 1], imageData.data[offset + 2]);
        return minimum >= policy.minimumChannel && maximum - minimum <= policy.maximumChannelSpread;
      };
      const enqueueBackground = (pixelIndex) => {
        if (backgroundVisited[pixelIndex] || !isNeutralBackground(pixelIndex)) return;
        backgroundVisited[pixelIndex] = 1;
        backgroundQueue[backgroundTail++] = pixelIndex;
      };
      for (let x = 0; x < image.width; x += 1) {
        enqueueBackground(x);
        enqueueBackground((image.height - 1) * image.width + x);
      }
      for (let y = 0; y < image.height; y += 1) {
        enqueueBackground(y * image.width);
        enqueueBackground(y * image.width + image.width - 1);
      }
      while (backgroundHead < backgroundTail) {
        const pixelIndex = backgroundQueue[backgroundHead++];
        const x = pixelIndex % image.width;
        const y = Math.floor(pixelIndex / image.width);
        if (x > 0) enqueueBackground(pixelIndex - 1);
        if (x < image.width - 1) enqueueBackground(pixelIndex + 1);
        if (y > 0) enqueueBackground(pixelIndex - image.width);
        if (y < image.height - 1) enqueueBackground(pixelIndex + image.width);
      }
      for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
        if (!backgroundVisited[pixelIndex]) continue;
        const offset = pixelIndex * 4;
        imageData.data[offset] = 0;
        imageData.data[offset + 1] = 0;
        imageData.data[offset + 2] = 0;
        imageData.data[offset + 3] = 0;
      }

      // Generated sources can contain matte islands fully enclosed by the pose,
      // such as the negative space between an arm and the torso. Remove only
      // large neutral components; small enclosed whites in the eyes, smile,
      // earrings, and shirt pattern remain character detail.
      const neutralVisited = new Uint8Array(pixelCount);
      const neutralQueue = new Int32Array(pixelCount);
      let removedInteriorMattePixels = 0;
      for (let seed = 0; seed < pixelCount; seed += 1) {
        if (neutralVisited[seed] || imageData.data[seed * 4 + 3] === 0 || !isNeutralBackground(seed)) continue;
        let neutralHead = 0;
        let neutralTail = 0;
        neutralQueue[neutralTail++] = seed;
        neutralVisited[seed] = 1;
        while (neutralHead < neutralTail) {
          const pixelIndex = neutralQueue[neutralHead++];
          const x = pixelIndex % image.width;
          const y = Math.floor(pixelIndex / image.width);
          const neighbors = [
            x > 0 ? pixelIndex - 1 : -1,
            x < image.width - 1 ? pixelIndex + 1 : -1,
            y > 0 ? pixelIndex - image.width : -1,
            y < image.height - 1 ? pixelIndex + image.width : -1,
          ];
          for (const neighbor of neighbors) {
            if (
              neighbor >= 0
              && !neutralVisited[neighbor]
              && imageData.data[neighbor * 4 + 3] > 0
              && isNeutralBackground(neighbor)
            ) {
              neutralVisited[neighbor] = 1;
              neutralQueue[neutralTail++] = neighbor;
            }
          }
        }
        if (neutralTail < 500) continue;
        removedInteriorMattePixels += neutralTail;
        for (let componentIndex = 0; componentIndex < neutralTail; componentIndex += 1) {
          const offset = neutralQueue[componentIndex] * 4;
          imageData.data[offset] = 0;
          imageData.data[offset + 1] = 0;
          imageData.data[offset + 2] = 0;
          imageData.data[offset + 3] = 0;
        }
      }

      let minimumX = image.width;
      let minimumY = image.height;
      let maximumX = -1;
      let maximumY = -1;
      for (let pixelIndex = 0; pixelIndex < image.width * image.height; pixelIndex += 1) {
        const offset = pixelIndex * 4;
        if (imageData.data[offset + 3] === 0) continue;
        const x = pixelIndex % image.width;
        const y = Math.floor(pixelIndex / image.width);
        minimumX = Math.min(minimumX, x);
        minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x);
        maximumY = Math.max(maximumY, y);
      }
      if (maximumX < minimumX || maximumY < minimumY) throw new Error(`No character pixels found for ${stateName}.`);
      sourceContext.putImageData(imageData, 0, 0);

      const boundsWidth = maximumX - minimumX + 1;
      const boundsHeight = maximumY - minimumY + 1;
      const scale = Math.min((targetWidth - 16) / boundsWidth, (targetHeight - 20) / boundsHeight);
      const drawWidth = Math.max(1, Math.round(boundsWidth * scale));
      const drawHeight = Math.max(1, Math.round(boundsHeight * scale));
      const destinationX = Math.round(targetAnchor.x - drawWidth / 2);
      const destinationY = targetAnchor.y - drawHeight;
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = targetWidth;
      frameCanvas.height = targetHeight;
      const frameContext = frameCanvas.getContext('2d', { willReadFrequently: true });
      if (!frameContext) throw new Error('Standalone frame context is unavailable.');
      frameContext.imageSmoothingEnabled = false;
      frameContext.drawImage(
        sourceCanvas,
        minimumX,
        minimumY,
        boundsWidth,
        boundsHeight,
        destinationX,
        destinationY,
        drawWidth,
        drawHeight,
      );

      const framedImage = frameContext.getImageData(0, 0, targetWidth, targetHeight);
      const framedPixels = framedImage.data;
      let removedMattePixel = true;
      while (removedMattePixel) {
        removedMattePixel = false;
        const pixelsToRemove = [];
        for (let y = 1; y < targetHeight - 1; y += 1) {
          for (let x = 1; x < targetWidth - 1; x += 1) {
            const pixelIndex = y * targetWidth + x;
            const offset = pixelIndex * 4;
            if (framedPixels[offset + 3] === 0) continue;
            const minimum = Math.min(framedPixels[offset], framedPixels[offset + 1], framedPixels[offset + 2]);
            const maximum = Math.max(framedPixels[offset], framedPixels[offset + 1], framedPixels[offset + 2]);
            if (minimum < outline.minimumChannel || maximum - minimum > outline.maximumChannelSpread) continue;
            const neighbors = [pixelIndex - 1, pixelIndex + 1, pixelIndex - targetWidth, pixelIndex + targetWidth];
            if (neighbors.some((neighbor) => framedPixels[neighbor * 4 + 3] === 0)) pixelsToRemove.push(offset);
          }
        }
        for (const offset of pixelsToRemove) {
          framedPixels[offset + 3] = 0;
          removedMattePixel = true;
        }
      }

      const outerPerimeter = [];
      for (let y = 1; y < targetHeight - 1; y += 1) {
        for (let x = 1; x < targetWidth - 1; x += 1) {
          const pixelIndex = y * targetWidth + x;
          const offset = pixelIndex * 4;
          if (framedPixels[offset + 3] === 0) continue;
          const neighbors = [pixelIndex - 1, pixelIndex + 1, pixelIndex - targetWidth, pixelIndex + targetWidth];
          if (neighbors.some((neighbor) => framedPixels[neighbor * 4 + 3] === 0)) outerPerimeter.push(offset);
        }
      }
      for (const offset of outerPerimeter) {
        framedPixels[offset] = 0;
        framedPixels[offset + 1] = 0;
        framedPixels[offset + 2] = 0;
        framedPixels[offset + 3] = 0;
      }
      frameContext.putImageData(framedImage, 0, 0);

      const framePixels = framedPixels;
      let opaquePixels = 0;
      for (let pixelIndex = 3; pixelIndex < framePixels.length; pixelIndex += 4) {
        if (framePixels[pixelIndex] > 0) opaquePixels += 1;
      }
      return {
        state: stateName,
        sourceWidth: image.width,
        sourceHeight: image.height,
        removedInteriorMattePixels,
        dataUrl: frameCanvas.toDataURL('image/png'),
        opaquePixels,
        sourceBounds: { x: minimumX, y: minimumY, width: boundsWidth, height: boundsHeight },
        drawBounds: { x: destinationX, y: destinationY, width: drawWidth, height: drawHeight },
      };
    }, {
      source: asDataUrl(sourceBytes),
      stateName: state,
      targetWidth: frameWidth,
      targetHeight: frameHeight,
      targetAnchor: anchor,
      policy: removalPolicy,
      outline: outlinePolicy,
    });
  } finally {
    await browser.close();
  }
}

const sourceBytes = await readFile(sourceUrl);
const typingExcitedSourceBytes = await readFile(typingExcitedSourceUrl);
const rigBaseFrame = await normalizeStandaloneFrame(sourceBytes, 'rig-base');
const typingExcitedFrame = await normalizeStandaloneFrame(typingExcitedSourceBytes, 'excited');
const result = {
  sourceWidth: rigBaseFrame.sourceWidth,
  sourceHeight: rigBaseFrame.sourceHeight,
  frames: stateNames.map((state) => state === 'excited'
    ? typingExcitedFrame
    : { ...rigBaseFrame, state }),
};
const outputs = [];

const rigBaseBytes = Buffer.from(rigBaseFrame.dataUrl.split(',')[1], 'base64');
const typingExcitedBytes = Buffer.from(typingExcitedFrame.dataUrl.split(',')[1], 'base64');
const rigBasePath = '/jolene/sprites/rig-base-v2.png';
const typingExcitedPath = '/jolene/sprites/typing-excited-v1.png';
const rigBaseOutputUrl = new URL(`../public${rigBasePath}`, import.meta.url);
const typingExcitedOutputUrl = new URL(`../public${typingExcitedPath}`, import.meta.url);
if (checkOnly) {
  const committedBytes = await readFile(rigBaseOutputUrl);
  assert.equal(sha256(committedBytes), sha256(rigBaseBytes), 'The canonical rig base is stale.');
} else {
  await mkdir(outputDirectoryUrl, { recursive: true });
  await writeFile(rigBaseOutputUrl, rigBaseBytes);
}
if (checkOnly) {
  const committedBytes = await readFile(typingExcitedOutputUrl);
  assert.equal(sha256(committedBytes), sha256(typingExcitedBytes), 'The excited typing pose is stale.');
} else {
  await writeFile(typingExcitedOutputUrl, typingExcitedBytes);
}

for (const frame of result.frames) {
  const usesTypingPose = frame.state === 'excited';
  const frameBytes = usesTypingPose ? typingExcitedBytes : rigBaseBytes;
  outputs.push({
    state: frame.state,
    path: usesTypingPose ? typingExcitedPath : rigBasePath,
    sha256: sha256(frameBytes),
    width: frameWidth,
    height: frameHeight,
    opaquePixels: frame.opaquePixels,
    sourceBounds: frame.sourceBounds,
    drawBounds: frame.drawBounds,
    removedInteriorMattePixels: frame.removedInteriorMattePixels,
  });
}

const manifest = {
  schemaVersion: '1.0.0',
  status: 'candidate_pending_visual_approval',
  source: {
    path: '/jolene/review/country-host-rig-master-v2-source.png',
    sha256: sha256(sourceBytes),
    width: result.sourceWidth,
    height: result.sourceHeight,
    generatedWith: 'built-in image generation edit mode',
  },
  overrides: [
    {
      state: 'excited',
      path: '/jolene/review/country-host-typing-excited-v1-source.png',
      sha256: sha256(typingExcitedSourceBytes),
      intent: 'hands clasped at chest, slight forward lean, soft downward gaze toward visitor input',
    },
  ],
  layout: {
    frameWidth,
    frameHeight,
    anchor,
    imageSmoothing: false,
    transparentBackground: true,
    matteCleanup: 'connected neutral fringe and outer perimeter removed',
  },
  frames: outputs,
  invariants: {
    baseStatesShareIdentitySource: true,
    distinctPoseStates: ['excited'],
    providerIndependent: true,
    approvedForPublicUse: false,
  },
};

if (checkOnly) {
  const committedManifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  assert.deepEqual(committedManifest, manifest);
  assert.deepEqual(outputs.map(({ state }) => state), stateNames);
  const baseOutputs = outputs.filter(({ state }) => state !== 'excited');
  assert.equal(new Set(baseOutputs.map(({ sha256: fingerprint }) => fingerprint)).size, 1, 'Base states must share one character identity source.');
  assert.equal(outputs.find(({ state }) => state === 'excited').path, typingExcitedPath, 'Excited state must use the typing pose.');
  assert.ok(baseOutputs.every(({ removedInteriorMattePixels }) => removedInteriorMattePixels >= 500), 'The enclosed arm-to-body matte was not removed.');
  assert.ok(outputs.every(({ opaquePixels }) => opaquePixels > 25_000), 'The canonical rig base lost too much of the character.');
  console.log(`Jolene sprite check passed: ${baseOutputs.length} base states plus one transparent excited typing pose at ${frameWidth}×${frameHeight}.`);
} else {
  await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Built one canonical Jolene rig base and one excited typing pose for ${outputs.length} states in ${outputDirectoryUrl.pathname}`);
}
