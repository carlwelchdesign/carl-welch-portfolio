import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const outputDirectory = fileURLToPath(new URL('../docs/review/', import.meta.url));
const masterBytes = await readFile(new URL('../public/jolene/jolene-country-host-master.png', import.meta.url));
const identity = JSON.parse(await readFile(new URL('../docs/jolene-avatar-identity-lock.v1.json', import.meta.url), 'utf8'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256(masterBytes), identity.master.sha256, 'Canonical master hash changed.');

const browser = await chromium.launch({ headless: true });
let result;
try {
  const page = await browser.newPage();
  result = await page.evaluate(async ({ masterSource, identitySpec }) => {
    const image = new Image();
    image.src = masterSource;
    await image.decode();
    const width = identitySpec.productionFrame.width;
    const height = identitySpec.productionFrame.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.imageSmoothingEnabled = false;
    const source = identitySpec.master.opaqueBounds;
    const target = identitySpec.productionFrame.drawBounds;
    context.drawImage(image, source.x, source.y, source.width, source.height, target.x, target.y, target.width, target.height);
    const base = context.getImageData(0, 0, width, height).data;
    const at = (x, y) => (y * width + x) * 4;
    const clone = () => new Uint8ClampedArray(base);
    const rgbaAt = (pixels, x, y) => [...pixels.slice(at(x, y), at(x, y) + 4)];
    const setRgba = (pixels, x, y, rgba) => {
      const offset = at(x, y);
      for (let channel = 0; channel < 4; channel += 1) pixels[offset + channel] = rgba[channel];
    };
    const copy = (pixels, x, y, sourceX, sourceY) => setRgba(pixels, x, y, rgbaAt(base, sourceX, sourceY));
    const inRect = (x, y, rect) => x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
    const eyeDefinitions = {
      near: {
        edit: { x: 140, y: 121, width: 30, height: 15 },
        aperture: { x: 142, y: 127, width: 27, height: 6 },
        movingLiner: { x: 147, y: 121, width: 18, height: 6 },
        halfPath: [[142,132],[143,132],[144,131],[145,131],[146,131],[147,130],[148,130],[149,130],[150,129],[151,129],[152,129],[153,129],[154,129],[155,129],[156,130],[157,130],[158,130],[159,130],[160,130],[161,131],[162,131],[163,131],[164,131],[165,132],[166,132],[167,132]],
        fullPath: [[142,132],[143,131],[144,131],[145,130],[146,130],[147,129],[148,129],[149,128],[150,128],[151,128],[152,127],[153,127],[154,127],[155,128],[156,128],[157,128],[158,129],[159,129],[160,129],[161,130],[162,130],[163,130],[164,131],[165,131],[166,132],[167,132]],
        outerWeight: [[143,132]],
        outerSide: 'left',
      },
      far: {
        edit: { x: 191, y: 127, width: 24, height: 13 },
        aperture: { x: 192, y: 133, width: 23, height: 6 },
        movingLiner: { x: 193, y: 127, width: 20, height: 6 },
        halfPath: [[192,138],[193,137],[194,137],[195,136],[196,136],[197,135],[198,135],[199,135],[200,135],[201,135],[202,136],[203,136],[204,136],[205,137],[206,137],[207,138],[208,138]],
        fullPath: [[192,138],[193,137],[194,137],[195,136],[196,136],[197,135],[198,135],[199,134],[200,134],[201,133],[202,133],[203,133],[204,134],[205,134],[206,135],[207,135],[208,136],[209,136],[210,137],[211,137],[212,138],[213,138]],
        outerWeight: [[212,139]],
        outerSide: 'right',
      },
    };
    const eyes = Object.entries(eyeDefinitions);
    const isCool = (pixels, offset) => {
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      return (red > 170 && green > 170 && blue > 160 && blue >= red * 0.9)
        || (blue > 50 && blue > red * 1.1 && blue > green * 1.05);
    };
    const isEyeDark = (pixels, offset) => pixels[offset + 3] === 255
      && pixels[offset] + pixels[offset + 1] + pixels[offset + 2] < 210;
    const isEyeContent = (pixels, offset) => isCool(pixels, offset) || isEyeDark(pixels, offset);
    const isWarmSkin = (pixels, offset) => {
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      return pixels[offset + 3] === 255 && red >= 135 && red > green * 1.06 && green >= blue * 0.78;
    };
    const skinSamples = Object.fromEntries(eyes.map(([id, eye]) => {
      const samples = [];
      for (let y = eye.edit.y; y < eye.edit.y + eye.edit.height; y += 1) {
        for (let x = eye.edit.x; x < eye.edit.x + eye.edit.width; x += 1) {
          if (inRect(x, y, eye.aperture)) continue;
          if (isWarmSkin(base, at(x, y))) samples.push([x, y]);
        }
      }
      if (samples.length < 4) {
        const cheekY = id === 'near' ? 133 : 139;
        for (let x = eye.edit.x; x < eye.edit.x + eye.edit.width; x += 1) if (isWarmSkin(base, at(x, cheekY))) samples.push([x, cheekY]);
      }
      if (samples.length < 4) throw new Error(`${id} lacks canonical local eyelid colors.`);
      return [id, samples];
    }));
    const nearestSkin = (id, x, y) => skinSamples[id].reduce((best, [sampleX, sampleY]) => {
      const distance = Math.abs(sampleX - x) + Math.abs(sampleY - y) * 1.25;
      return !best || distance < best.distance ? { x: sampleX, y: sampleY, distance } : best;
    }, null);
    const lashColors = Object.fromEntries(eyes.map(([id, eye]) => {
      const counts = new Map();
      for (let y = eye.aperture.y; y < eye.aperture.y + eye.aperture.height; y += 1) {
        for (let x = eye.aperture.x; x < eye.aperture.x + eye.aperture.width; x += 1) {
          const offset = at(x, y);
          if (!isEyeDark(base, offset)) continue;
          const rgba = rgbaAt(base, x, y);
          const key = rgba.join(',');
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
      const colors = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => key.split(',').map(Number));
      if (colors.length < 2) throw new Error(`${id} lacks canonical lash colors.`);
      return [id, colors];
    }));
    const replaceEyePixelWithSkin = (pixels, id, x, y) => {
      const sample = nearestSkin(id, x, y);
      copy(pixels, x, y, sample.x, sample.y);
    };
    const clearMovingLiner = (pixels, id, eye) => {
      for (let y = eye.movingLiner.y; y < eye.movingLiner.y + eye.movingLiner.height; y += 1) {
        for (let x = eye.movingLiner.x; x < eye.movingLiner.x + eye.movingLiner.width; x += 1) {
          const offset = at(x, y);
          if (isEyeDark(base, offset)) replaceEyePixelWithSkin(pixels, id, x, y);
        }
      }
    };
    const pathMap = (path) => new Map(path.map(([x, y]) => [x, y]));
    const authorHalf = (pixels, id, eye) => {
      clearMovingLiner(pixels, id, eye);
      const boundary = pathMap(eye.halfPath);
      for (let y = eye.aperture.y; y < eye.aperture.y + eye.aperture.height; y += 1) {
        for (let x = eye.aperture.x; x < eye.aperture.x + eye.aperture.width; x += 1) {
          const offset = at(x, y);
          if (!isEyeContent(base, offset)) continue;
          const boundaryY = boundary.get(x);
          if (boundaryY === undefined || y <= boundaryY) replaceEyePixelWithSkin(pixels, id, x, y);
        }
      }
      for (const [x, y] of eye.halfPath) setRgba(pixels, x, y, lashColors[id][0]);
    };
    const authorFull = (pixels, id, eye) => {
      clearMovingLiner(pixels, id, eye);
      for (let y = eye.aperture.y; y < eye.aperture.y + eye.aperture.height; y += 1) {
        for (let x = eye.aperture.x; x < eye.aperture.x + eye.aperture.width; x += 1) {
          const offset = at(x, y);
          if (isEyeContent(base, offset)) replaceEyePixelWithSkin(pixels, id, x, y);
        }
      }
      for (const [x, y] of eye.fullPath) setRgba(pixels, x, y, lashColors[id][0]);
      for (const [x, y] of eye.outerWeight) setRgba(pixels, x, y, lashColors[id][1]);
    };
    const half = clone();
    const full = clone();
    for (const [id, eye] of eyes) {
      authorHalf(half, id, eye);
      authorFull(full, id, eye);
    }
    const palette = new Set();
    for (let offset = 0; offset < base.length; offset += 4) palette.add(`${base[offset]},${base[offset + 1]},${base[offset + 2]},${base[offset + 3]}`);
    const pixelChanged = (pixels, x, y) => {
      const offset = at(x, y);
      return [0, 1, 2, 3].some((channel) => pixels[offset + channel] !== base[offset + channel]);
    };
    const outsideChanges = (pixels) => {
      let count = 0;
      for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        const inEditMask = eyes.some(([, eye]) => inRect(x, y, eye.edit));
        if (!inEditMask && pixelChanged(pixels, x, y)) count += 1;
      }
      return count;
    };
    const paletteViolations = (pixels) => {
      let count = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (!palette.has(`${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]},${pixels[offset + 3]}`)) count += 1;
      }
      return count;
    };
    const coolPositions = (pixels, eye) => {
      const positions = [];
      for (let y = eye.aperture.y; y < eye.aperture.y + eye.aperture.height; y += 1) for (let x = eye.aperture.x; x < eye.aperture.x + eye.aperture.width; x += 1) {
        if (isCool(pixels, at(x, y))) positions.push([x, y]);
      }
      return positions;
    };
    const remainingEyePixels = (pixels, eye, excludedPath = []) => {
      const excluded = new Set(excludedPath.map(([x, y]) => `${x},${y}`));
      const points = [];
      for (let y = eye.aperture.y; y < eye.aperture.y + eye.aperture.height; y += 1) for (let x = eye.aperture.x; x < eye.aperture.x + eye.aperture.width; x += 1) {
        if (!excluded.has(`${x},${y}`) && isEyeContent(pixels, at(x, y))) points.push([x, y]);
      }
      return points;
    };
    const finishedDarkAnatomy = (pixels, eye) => {
      const points = [];
      const regions = [eye.movingLiner, eye.aperture];
      for (const region of regions) for (let y = region.y; y < region.y + region.height; y += 1) for (let x = region.x; x < region.x + region.width; x += 1) {
        if (isEyeDark(pixels, at(x, y))) points.push([x, y]);
      }
      return points;
    };
    const survivingOriginalLiner = (pixels, eye) => {
      const points = [];
      for (let y = eye.movingLiner.y; y < eye.movingLiner.y + eye.movingLiner.height; y += 1) for (let x = eye.movingLiner.x; x < eye.movingLiner.x + eye.movingLiner.width; x += 1) {
        const offset = at(x, y);
        if (isEyeDark(base, offset) && [0, 1, 2, 3].every((channel) => pixels[offset + channel] === base[offset + channel])) points.push([x, y]);
      }
      return points;
    };
    const connectedComponents = (points) => {
      const remaining = new Set(points.map(([x, y]) => `${x},${y}`));
      let components = 0;
      while (remaining.size) {
        components += 1;
        const [first] = remaining;
        remaining.delete(first);
        const queue = [first.split(',').map(Number)];
        while (queue.length) {
          const [x, y] = queue.pop();
          for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const key = `${x + dx},${y + dy}`;
            if (remaining.delete(key)) queue.push([x + dx, y + dy]);
          }
        }
      }
      return components;
    };
    const pathMetrics = (path, mainColor) => {
      const yRows = new Set(path.map(([, y]) => y));
      let maximumRun = 1;
      let run = 1;
      for (let index = 1; index < path.length; index += 1) {
        const [previousX, previousY] = path[index - 1];
        const [x, y] = path[index];
        if (x === previousX + 1 && y === previousY) run += 1;
        else run = 1;
        maximumRun = Math.max(maximumRun, run);
      }
      return { distinctYRows: yRows.size, maximumSameColorHorizontalRun: maximumRun, connected: path.every(([x, y], index) => index === 0 || Math.abs(x - path[index - 1][0]) <= 1 && Math.abs(y - path[index - 1][1]) <= 1), mainColor };
    };
    const halfAudits = {};
    const fullAudits = {};
    for (const [id, eye] of eyes) {
      const halfPoints = remainingEyePixels(half, eye, eye.halfPath);
      const halfCool = coolPositions(half, eye);
      const baseCool = new Map(coolPositions(base, eye).map(([x, y]) => [`${x},${y}`, rgbaAt(base, x, y).join(',')]));
      const movedCoolPixels = halfCool.filter(([x, y]) => baseCool.get(`${x},${y}`) !== rgbaAt(half, x, y).join(',')).length;
      halfAudits[id] = {
        visibleArea: halfPoints.length,
        apertureComponentsWithoutLash: connectedComponents(halfPoints),
        coolPixelCount: halfCool.length,
        movedCoolPixels,
        path: pathMetrics(eye.halfPath, lashColors[id][0]),
        finishedDarkComponents: connectedComponents(finishedDarkAnatomy(half, eye)),
        survivingOriginalMovingLinerPixels: survivingOriginalLiner(half, eye),
      };
      fullAudits[id] = {
        coolPixelCount: coolPositions(full, eye).length,
        path: pathMetrics(eye.fullPath, lashColors[id][0]),
        outerWeight: eye.outerWeight,
        outerSide: eye.outerSide,
        finishedDarkComponents: connectedComponents(finishedDarkAnatomy(full, eye)),
        survivingOriginalMovingLinerPixels: survivingOriginalLiner(full, eye),
      };
    }
    const nearFarRatio = halfAudits.near.visibleArea / halfAudits.far.visibleArea;
    const alphaAndBounds = (pixels) => {
      let nonBinaryAlpha = 0;
      let transparentRgb = 0;
      let minY = height;
      let maxY = -1;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const alpha = pixels[offset + 3];
        if (alpha !== 0 && alpha !== 255) nonBinaryAlpha += 1;
        if (alpha === 0 && (pixels[offset] || pixels[offset + 1] || pixels[offset + 2])) transparentRgb += 1;
        if (alpha === 255) {
          const y = Math.floor(offset / 4 / width);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
      return { nonBinaryAlpha, transparentRgb, minY, maxY };
    };
    const audit = {
      outsideMaskChanges: { half: outsideChanges(half), full: outsideChanges(full) },
      paletteViolations: { half: paletteViolations(half), full: paletteViolations(full) },
      half: halfAudits,
      full: fullAudits,
      nearFarVisibleAreaRatio: nearFarRatio,
      alphaAndBounds: { open: alphaAndBounds(base), half: alphaAndBounds(half), full: alphaAndBounds(full) },
      returnFramesExact: true,
    };
    if (audit.outsideMaskChanges.half !== 0 || audit.outsideMaskChanges.full !== 0) throw new Error('Pixels changed outside the approved eye masks.');
    if (audit.paletteViolations.half !== 0 || audit.paletteViolations.full !== 0) throw new Error('Artwork contains noncanonical colors.');
    if (halfAudits.near.apertureComponentsWithoutLash !== 1 || halfAudits.far.apertureComponentsWithoutLash !== 1) throw new Error('Half-open aperture content is disconnected without its lash.');
    if (halfAudits.near.movedCoolPixels !== 0 || halfAudits.far.movedCoolPixels !== 0) throw new Error('Surviving iris or sclera pixels moved.');
    if (!(nearFarRatio >= 1.3 && nearFarRatio <= 1.7)) throw new Error(`Near/far aperture ratio ${nearFarRatio.toFixed(3)} is outside 1.3–1.7.`);
    for (const id of ['near', 'far']) {
      if (halfAudits[id].finishedDarkComponents !== 1 || fullAudits[id].finishedDarkComponents !== 1) throw new Error(`${id} finished anatomy has a parallel dark component.`);
      if (halfAudits[id].survivingOriginalMovingLinerPixels.length !== 0 || fullAudits[id].survivingOriginalMovingLinerPixels.length !== 0) throw new Error(`${id} retains original moving upper-liner pixels.`);
      if (fullAudits[id].coolPixelCount !== 0) throw new Error(`${id} full closure retains cool eye pixels.`);
      if (fullAudits[id].path.distinctYRows < 4) throw new Error(`${id} full lash spans fewer than four Y rows.`);
      if (fullAudits[id].path.maximumSameColorHorizontalRun > 5) throw new Error(`${id} full lash has a horizontal run over five pixels.`);
      if (!fullAudits[id].path.connected) throw new Error(`${id} full lash is disconnected.`);
    }
    for (const state of Object.values(audit.alphaAndBounds)) {
      if (state.nonBinaryAlpha !== 0 || state.transparentRgb !== 0 || state.minY !== 8 || state.maxY !== 447) throw new Error('Alpha, crown, or baseline changed.');
    }

    const toPng = (pixels, outputWidth = width, outputHeight = height) => {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      sourceCanvas.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
      const output = document.createElement('canvas');
      output.width = outputWidth;
      output.height = outputHeight;
      const outputContext = output.getContext('2d');
      outputContext.imageSmoothingEnabled = false;
      outputContext.drawImage(sourceCanvas, 0, 0, outputWidth, outputHeight);
      return output.toDataURL('image/png');
    };
    const faceCrop = (pixels) => {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      sourceCanvas.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
      const crop = document.createElement('canvas');
      crop.width = 120;
      crop.height = 108;
      const cropContext = crop.getContext('2d');
      cropContext.imageSmoothingEnabled = false;
      cropContext.drawImage(sourceCanvas, 120, 92, 120, 108, 0, 0, 120, 108);
      return crop;
    };
    const sequence = [base, half, full, half, base];
    const strip = (scale) => {
      const output = document.createElement('canvas');
      output.width = 120 * 5 * scale;
      output.height = 108 * scale;
      const outputContext = output.getContext('2d');
      outputContext.imageSmoothingEnabled = false;
      sequence.forEach((pixels, index) => outputContext.drawImage(faceCrop(pixels), index * 120 * scale, 0, 120 * scale, 108 * scale));
      return output.toDataURL('image/png');
    };
    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const maskContext = mask.getContext('2d');
    const maskPixels = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const offset = at(x, y);
      if (pixelChanged(half, x, y)) {
        maskPixels[offset] = 255; maskPixels[offset + 1] = 104; maskPixels[offset + 2] = 0; maskPixels[offset + 3] = 255;
      } else if (pixelChanged(full, x, y)) {
        maskPixels[offset] = 83; maskPixels[offset + 1] = 216; maskPixels[offset + 2] = 251; maskPixels[offset + 3] = 255;
      }
    }
    maskContext.putImageData(new ImageData(maskPixels, width, height), 0, 0);
    // Diagnostic overlay: red would indicate a rejected surviving original
    // upper-liner pixel; green is the authored half path; cyan is the retained
    // original-coordinate aperture content.
    for (const [, eye] of eyes) {
      for (const [x, y] of survivingOriginalLiner(half, eye)) setRgba(maskPixels, x, y, [255, 0, 0, 255]);
      for (const [x, y] of eye.halfPath) setRgba(maskPixels, x, y, [58, 220, 120, 255]);
      for (const [x, y] of remainingEyePixels(half, eye, eye.halfPath)) setRgba(maskPixels, x, y, [83, 216, 251, 255]);
    }
    maskContext.putImageData(new ImageData(maskPixels, width, height), 0, 0);
    const maskCrop = document.createElement('canvas');
    maskCrop.width = 120 * 6;
    maskCrop.height = 108 * 6;
    const maskCropContext = maskCrop.getContext('2d');
    maskCropContext.imageSmoothingEnabled = false;
    maskCropContext.drawImage(mask, 120, 92, 120, 108, 0, 0, 720, 648);
    return {
      audit,
      images: {
        open: toPng(base), half: toPng(half), full: toPng(full),
        sequence1x: strip(1), sequence4x: strip(4), sequence6x: strip(6),
        diffMask6x: maskCrop.toDataURL('image/png'),
      },
    };
  }, { masterSource: `data:image/png;base64,${masterBytes.toString('base64')}`, identitySpec: identity });
} finally {
  await browser.close();
}

await mkdir(outputDirectory, { recursive: true });
const decode = (url) => Buffer.from(url.split(',')[1], 'base64');
const files = {
  'open-1x.png': decode(result.images.open),
  'half-1x.png': decode(result.images.half),
  'closed-1x.png': decode(result.images.full),
  'sequence-face-1x.png': decode(result.images.sequence1x),
  'sequence-face-4x.png': decode(result.images.sequence4x),
  'sequence-face-6x.png': decode(result.images.sequence6x),
  'diff-mask-face-6x.png': decode(result.images.diffMask6x),
};
const audit = {
  schemaVersion: '1.0.0',
  status: 'review_only_approved_by_carl',
  canonicalMasterSha256: identity.master.sha256,
  repositoryWrites: false,
  runtimeIntegrationChanged: false,
  ...result.audit,
  outputSha256: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, sha256(bytes)])),
};
await Promise.all([
  writeFile(`${outputDirectory}/jolene-blink-v2-sequence-face-1x.png`, files['sequence-face-1x.png']),
  writeFile(`${outputDirectory}/jolene-blink-v2-sequence-face-6x.png`, files['sequence-face-6x.png']),
  writeFile(`${outputDirectory}/jolene-blink-v2-audit.json`, `${JSON.stringify(audit, null, 2)}\n`),
]);
console.log(JSON.stringify(audit, null, 2));
