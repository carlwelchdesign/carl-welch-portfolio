import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const sourceUrl = new URL('../public/jolene/review/country-host-state-sheet-source.png', import.meta.url);
const offlineOverrideUrl = new URL('../public/jolene/review/country-host-offline-shrug-source.png', import.meta.url);
const outputDirectoryUrl = new URL('../public/jolene/sprites/', import.meta.url);
const manifestUrl = new URL('../docs/jolene-avatar-sprites.v1.json', import.meta.url);
const frameCatalogUrl = new URL('../app/jolene/avatar-frame-catalog.v1.json', import.meta.url);
const stateContractUrl = new URL('../app/jolene/avatar-state-contract.v1.json', import.meta.url);
const checkOnly = process.argv.includes('--check');

const stateNames = ['idle', 'blink', 'greet', 'listen', 'think', 'speak', 'evidence', 'boundary', 'offline', 'rest'];
const frameWidth = 320;
const frameHeight = 460;
const anchor = Object.freeze({ x: 160, y: 448 });
const removalPolicy = Object.freeze({ minimumChannel: 225, maximumChannelSpread: 16, connectivity: 4 });

const frameTransforms = Object.freeze({
  'idle-0': { state: 'idle', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'idle-1': { state: 'idle', translateX: 0, translateY: -1, rotateDeg: 0, scale: 1 },
  'idle-2': { state: 'idle', translateX: 0, translateY: -2, rotateDeg: 0, scale: 1.002 },
  'blink-1': { state: 'blink', translateX: 0, translateY: -1, rotateDeg: 0, scale: 1 },
  'blink-2': { state: 'blink', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'greet-0': { state: 'greet', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'greet-1': { state: 'greet', translateX: 1, translateY: -2, rotateDeg: 0.25, scale: 1 },
  'greet-2': { state: 'greet', translateX: -1, translateY: -4, rotateDeg: -0.35, scale: 1.004 },
  'listen-0': { state: 'listen', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'think-0': { state: 'think', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'think-1': { state: 'think', translateX: 1, translateY: -1, rotateDeg: 0.3, scale: 1 },
  'speak-0': { state: 'speak', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'speak-1': { state: 'speak', translateX: 1, translateY: -1, rotateDeg: 0.2, scale: 1.002 },
  'speak-2': { state: 'speak', translateX: -1, translateY: -2, rotateDeg: -0.2, scale: 1.004 },
  'evidence-0': { state: 'evidence', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'evidence-1': { state: 'evidence', translateX: 2, translateY: -1, rotateDeg: 0.25, scale: 1 },
  'evidence-2': { state: 'evidence', translateX: 3, translateY: -2, rotateDeg: 0.4, scale: 1.003 },
  'boundary-0': { state: 'boundary', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'offline-0': { state: 'offline', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'rest-0': { state: 'rest', translateX: 0, translateY: 0, rotateDeg: 0, scale: 1 },
  'rest-1': { state: 'rest', translateX: 0, translateY: 1, rotateDeg: -0.15, scale: 0.998 },
});

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const asDataUrl = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;

async function buildFrames(sourceBytes) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    return await page.evaluate(async ({ source, states, targetWidth, targetHeight, targetAnchor, policy }) => {
      const image = new Image();
      image.src = source;
      await image.decode();

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = image.width;
      sourceCanvas.height = image.height;
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) throw new Error('Canvas 2D context is unavailable.');
      sourceContext.drawImage(image, 0, 0);

      const imageData = sourceContext.getImageData(0, 0, image.width, image.height);
      const { data, width, height } = imageData;
      const isBackground = (pixelIndex) => {
        const offset = pixelIndex * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const minimum = Math.min(red, green, blue);
        const maximum = Math.max(red, green, blue);
        return minimum >= policy.minimumChannel && maximum - minimum <= policy.maximumChannelSpread;
      };

      for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
        if (isBackground(pixelIndex)) data[pixelIndex * 4 + 3] = 0;
      }

      sourceContext.putImageData(imageData, 0, 0);

      const frames = [];
      const columns = 5;
      const rows = 2;
      for (let index = 0; index < states.length; index += 1) {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const sourceLeft = Math.round(column * width / columns);
        const sourceRight = Math.round((column + 1) * width / columns);
        const sourceTop = Math.round(row * height / rows);
        const sourceBottom = Math.round((row + 1) * height / rows);
        const cellWidth = sourceRight - sourceLeft;
        const cellHeight = sourceBottom - sourceTop;
        const cellData = sourceContext.getImageData(sourceLeft, sourceTop, cellWidth, cellHeight);

        const cellVisited = new Uint8Array(cellWidth * cellHeight);
        const cellQueue = new Int32Array(cellWidth * cellHeight);
        for (let seed = 0; seed < cellWidth * cellHeight; seed += 1) {
          if (cellVisited[seed] || cellData.data[seed * 4 + 3] === 0) continue;
          let componentHead = 0;
          let componentTail = 0;
          let touchesSideOrTop = false;
          cellQueue[componentTail++] = seed;
          cellVisited[seed] = 1;

          while (componentHead < componentTail) {
            const pixelIndex = cellQueue[componentHead++];
            const x = pixelIndex % cellWidth;
            const y = Math.floor(pixelIndex / cellWidth);
            if (x === 0 || x === cellWidth - 1 || y === 0) touchesSideOrTop = true;
            const neighbors = [
              x > 0 ? pixelIndex - 1 : -1,
              x < cellWidth - 1 ? pixelIndex + 1 : -1,
              y > 0 ? pixelIndex - cellWidth : -1,
              y < cellHeight - 1 ? pixelIndex + cellWidth : -1,
            ];
            for (const neighbor of neighbors) {
              if (neighbor >= 0 && !cellVisited[neighbor] && cellData.data[neighbor * 4 + 3] > 0) {
                cellVisited[neighbor] = 1;
                cellQueue[componentTail++] = neighbor;
              }
            }
          }

          if (touchesSideOrTop && componentTail < 10_000) {
            for (let componentIndex = 0; componentIndex < componentTail; componentIndex += 1) {
              cellData.data[cellQueue[componentIndex] * 4 + 3] = 0;
            }
          }
        }

        let minimumX = cellWidth;
        let minimumY = cellHeight;
        let maximumX = -1;
        let maximumY = -1;
        for (let pixelIndex = 0; pixelIndex < cellWidth * cellHeight; pixelIndex += 1) {
          if (cellData.data[pixelIndex * 4 + 3] === 0) continue;
          const x = pixelIndex % cellWidth;
          const y = Math.floor(pixelIndex / cellWidth);
          minimumX = Math.min(minimumX, x);
          minimumY = Math.min(minimumY, y);
          maximumX = Math.max(maximumX, x);
          maximumY = Math.max(maximumY, y);
        }
        if (maximumX < minimumX || maximumY < minimumY) throw new Error(`No character pixels found for ${states[index]}.`);

        const cleanCellCanvas = document.createElement('canvas');
        cleanCellCanvas.width = cellWidth;
        cleanCellCanvas.height = cellHeight;
        const cleanCellContext = cleanCellCanvas.getContext('2d');
        if (!cleanCellContext) throw new Error('Clean cell canvas context is unavailable.');
        cleanCellContext.putImageData(cellData, 0, 0);

        const boundsWidth = maximumX - minimumX + 1;
        const boundsHeight = maximumY - minimumY + 1;
        const scale = Math.min(1, (targetWidth - 16) / boundsWidth, (targetHeight - 20) / boundsHeight);
        const drawWidth = Math.max(1, Math.round(boundsWidth * scale));
        const drawHeight = Math.max(1, Math.round(boundsHeight * scale));
        const destinationX = Math.round(targetAnchor.x - drawWidth / 2);
        const destinationY = targetAnchor.y - drawHeight;

        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = targetWidth;
        frameCanvas.height = targetHeight;
        const frameContext = frameCanvas.getContext('2d', { willReadFrequently: true });
        if (!frameContext) throw new Error('Frame canvas context is unavailable.');
        frameContext.imageSmoothingEnabled = false;
        frameContext.drawImage(
          cleanCellCanvas,
          minimumX,
          minimumY,
          boundsWidth,
          boundsHeight,
          destinationX,
          destinationY,
          drawWidth,
          drawHeight,
        );

        const framePixels = frameContext.getImageData(0, 0, targetWidth, targetHeight).data;
        let opaquePixels = 0;
        for (let pixelIndex = 3; pixelIndex < framePixels.length; pixelIndex += 4) {
          if (framePixels[pixelIndex] > 0) opaquePixels += 1;
        }

        frames.push({
          state: states[index],
          dataUrl: frameCanvas.toDataURL('image/png'),
          opaquePixels,
          sourceBounds: { x: minimumX, y: minimumY, width: boundsWidth, height: boundsHeight },
          drawBounds: { x: destinationX, y: destinationY, width: drawWidth, height: drawHeight },
        });
      }

      return { sourceWidth: width, sourceHeight: height, frames };
    }, {
      source: asDataUrl(sourceBytes),
      states: stateNames,
      targetWidth: frameWidth,
      targetHeight: frameHeight,
      targetAnchor: anchor,
      policy: removalPolicy,
    });
  } finally {
    await browser.close();
  }
}

async function normalizeStandaloneFrame(sourceBytes, state) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    return await page.evaluate(async ({ source, stateName, targetWidth, targetHeight, targetAnchor, policy }) => {
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

      let minimumX = image.width;
      let minimumY = image.height;
      let maximumX = -1;
      let maximumY = -1;
      for (let pixelIndex = 0; pixelIndex < image.width * image.height; pixelIndex += 1) {
        const offset = pixelIndex * 4;
        const red = imageData.data[offset];
        const green = imageData.data[offset + 1];
        const blue = imageData.data[offset + 2];
        const minimum = Math.min(red, green, blue);
        const maximum = Math.max(red, green, blue);
        if (minimum >= policy.minimumChannel && maximum - minimum <= policy.maximumChannelSpread) {
          imageData.data[offset + 3] = 0;
          continue;
        }
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

      const framePixels = frameContext.getImageData(0, 0, targetWidth, targetHeight).data;
      let opaquePixels = 0;
      for (let pixelIndex = 3; pixelIndex < framePixels.length; pixelIndex += 4) {
        if (framePixels[pixelIndex] > 0) opaquePixels += 1;
      }
      return {
        state: stateName,
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
    });
  } finally {
    await browser.close();
  }
}

const sourceBytes = await readFile(sourceUrl);
const offlineOverrideBytes = await readFile(offlineOverrideUrl);
const stateContract = JSON.parse(await readFile(stateContractUrl, 'utf8'));
const result = await buildFrames(sourceBytes);
result.frames[stateNames.indexOf('offline')] = await normalizeStandaloneFrame(offlineOverrideBytes, 'offline');
const outputs = [];

for (const frame of result.frames) {
  const bytes = Buffer.from(frame.dataUrl.split(',')[1], 'base64');
  const relativePath = `/jolene/sprites/${frame.state}.png`;
  const outputUrl = new URL(`../public${relativePath}`, import.meta.url);
  if (checkOnly) {
    const committedBytes = await readFile(outputUrl);
    assert.equal(sha256(committedBytes), sha256(bytes), `${frame.state} frame is stale.`);
  } else {
    await mkdir(outputDirectoryUrl, { recursive: true });
    await writeFile(outputUrl, bytes);
  }
  outputs.push({
    state: frame.state,
    path: relativePath,
    sha256: sha256(bytes),
    width: frameWidth,
    height: frameHeight,
    opaquePixels: frame.opaquePixels,
    sourceBounds: frame.sourceBounds,
    drawBounds: frame.drawBounds,
  });
}

const manifest = {
  schemaVersion: '1.0.0',
  status: 'candidate_pending_visual_approval',
  source: {
    path: '/jolene/review/country-host-state-sheet-source.png',
    sha256: sha256(sourceBytes),
    width: result.sourceWidth,
    height: result.sourceHeight,
    generatedWith: 'built-in image generation edit mode',
  },
  overrides: [{
    state: 'offline',
    path: '/jolene/review/country-host-offline-shrug-source.png',
    sha256: sha256(offlineOverrideBytes),
    intent: 'poised, lightly humorous shrug; never sad, angry, or apologetic',
  }],
  layout: {
    frameWidth,
    frameHeight,
    anchor,
    imageSmoothing: false,
    transparentBackground: true,
  },
  frames: outputs,
  invariants: {
    approvedMasterUnmodified: true,
    providerIndependent: true,
    approvedForPublicUse: false,
  },
};

const referencedFrameNames = [...new Set(Object.values(stateContract.definitions).flatMap(({ frames }) => frames))];
const frameCatalog = {
  schemaVersion: '1.0.0',
  contractName: 'jolene.avatar-frame-catalog',
  frameWidth,
  frameHeight,
  anchor,
  imageRendering: 'pixelated',
  frames: Object.fromEntries(referencedFrameNames.map((frameName) => {
    const transform = frameTransforms[frameName];
    assert.ok(transform, `Missing transform for ${frameName}.`);
    return [frameName, {
      assetPath: `/jolene/sprites/${transform.state}.png`,
      ...transform,
      transformOrigin: `${anchor.x}px ${anchor.y}px`,
    }];
  })),
};

if (checkOnly) {
  const committedManifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const committedFrameCatalog = JSON.parse(await readFile(frameCatalogUrl, 'utf8'));
  assert.deepEqual(committedManifest, manifest);
  assert.deepEqual(committedFrameCatalog, frameCatalog);
  assert.deepEqual(outputs.map(({ state }) => state), stateNames);
  assert.deepEqual(Object.keys(frameCatalog.frames), referencedFrameNames);
  assert.ok(outputs.every(({ opaquePixels }) => opaquePixels > 25_000), 'A sprite frame lost too much of the character.');
  console.log(`Jolene sprite check passed: ${outputs.length} transparent ${frameWidth}×${frameHeight} frames with a shared anchor.`);
} else {
  await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(frameCatalogUrl, `${JSON.stringify(frameCatalog, null, 2)}\n`);
  console.log(`Built ${outputs.length} candidate Jolene sprite frames in ${outputDirectoryUrl.pathname}`);
}
