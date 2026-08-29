import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const outputDirectory = fileURLToPath(new URL('../docs/review/', import.meta.url));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const expected = {
  master: '4e437fd64b3997bd834bb2310ed0175e75d9958c27871d4ae3857a18fc82cc6f',
  blinkSequence: 'bf33d2b9ff8876639e4183a521ce20e3bbccb8824648b3101fe45f07cee9927d',
  open: '90d07a6a9e0be7cfd626ef44ad3e50b8617fba2d0cf0d10b5f5b8bd7e7a870cd',
  half: 'b13d98b6368c4f64ed272e17edb2b513083e1dc5f8e2a5385c85981741ae7449',
  closed: 'e37f445094aaa6c212587a729f941fbe530c5d3a971fc8f99d7260897ec27fe9',
};
const [masterBytes, blinkSequenceBytes, identityBytes] = await Promise.all([
  readFile(new URL('../public/jolene/jolene-country-host-master.png', import.meta.url)),
  readFile(new URL('../docs/review/jolene-blink-v2-sequence-face-1x.png', import.meta.url)),
  readFile(new URL('../docs/jolene-avatar-identity-lock.v1.json', import.meta.url)),
]);
assert.equal(sha256(masterBytes), expected.master, 'Canonical Dolly master changed.');
assert.equal(sha256(blinkSequenceBytes), expected.blinkSequence, 'Approved blink-v2 face sequence changed.');
const identity = JSON.parse(identityBytes.toString('utf8'));
const prepBrowser = await chromium.launch({ headless: true });
let reconstructed;
try {
  const page = await prepBrowser.newPage();
  reconstructed = await page.evaluate(async ({ masterSource, sequenceSource, identitySpec }) => {
    const [master, sequence] = await Promise.all([masterSource, sequenceSource].map(async (source) => {
      const image = new Image(); image.src = source; await image.decode(); return image;
    }));
    const { width, height, drawBounds } = identitySpec.productionFrame;
    const baseCanvas = document.createElement('canvas'); baseCanvas.width = width; baseCanvas.height = height;
    const context = baseCanvas.getContext('2d'); context.imageSmoothingEnabled = false;
    const source = identitySpec.master.opaqueBounds;
    context.drawImage(master, source.x, source.y, source.width, source.height, drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);
    const frame = (sequenceIndex) => {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const frameContext = canvas.getContext('2d'); frameContext.imageSmoothingEnabled = false;
      frameContext.drawImage(baseCanvas, 0, 0);
      if (sequenceIndex !== 0) frameContext.drawImage(sequence, sequenceIndex * 120, 0, 120, 108, 120, 92, 120, 108);
      return canvas.toDataURL('image/png');
    };
    return { open: frame(0), half: frame(1), closed: frame(2) };
  }, {
    masterSource: `data:image/png;base64,${masterBytes.toString('base64')}`,
    sequenceSource: `data:image/png;base64,${blinkSequenceBytes.toString('base64')}`,
    identitySpec: identity,
  });
} finally {
  await prepBrowser.close();
}
const decodeDataUrl = (url) => Buffer.from(url.split(',')[1], 'base64');
const openBytes = decodeDataUrl(reconstructed.open);
const halfBytes = decodeDataUrl(reconstructed.half);
const closedBytes = decodeDataUrl(reconstructed.closed);
assert.equal(sha256(openBytes), expected.open, 'Approved OPEN pixels changed.');
assert.equal(sha256(halfBytes), expected.half, 'Approved HALF pixels changed.');
assert.equal(sha256(closedBytes), expected.closed, 'Approved CLOSED pixels changed.');
const asDataUrl = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;

const durationsMs = [600, 320, 280, 360, 280, 320, 700, 70, 85, 70, 600];
const stateSequence = ['open','open','open','open','open','open','open','half','closed','half','open'];
const browser = await chromium.launch({ headless: true });
let result;
try {
  const page = await browser.newPage();
  result = await page.evaluate(async ({ sources, states, durations }) => {
    const width = 320;
    const height = 460;
    const decoded = {};
    for (const [state, source] of Object.entries(sources)) {
      const image = new Image();
      image.src = source;
      await image.decode();
      if (image.width !== width || image.height !== height) throw new Error(`${state} is not 320×460.`);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0);
      decoded[state] = context.getImageData(0, 0, width, height).data;
    }
    const offset = (x, y) => (y * width + x) * 4;
    const clone = (pixels) => new Uint8ClampedArray(pixels);
    const pixelChanged = (left, right, pixelOffset) => [0, 1, 2, 3].some((channel) => left[pixelOffset + channel] !== right[pixelOffset + channel]);
    const edit = (group, x, y, sourceX, sourceY, material) => ({ group, x, y, sourceX, sourceY, material });
    const inhaleEdits = [
      edit('blouseUpper',277,312,276,312,'blouse'), edit('blouseUpper',278,312,277,312,'blouse'), edit('blouseUpper',279,312,278,312,'blouse'), edit('blouseUpper',280,312,279,312,'blouse'),
      edit('blouseUpper',279,313,278,313,'blouse'), edit('blouseUpper',280,313,279,313,'blouse'),
      edit('blouseLower',282,328,281,328,'blouse'), edit('blouseLower',283,328,282,328,'blouse'), edit('blouseLower',284,328,283,328,'blouse'), edit('blouseLower',285,328,284,328,'blouse'),
      edit('blouseLower',284,329,283,329,'blouse'), edit('blouseLower',285,329,284,329,'blouse'),
    ];
    const riseEdits = [
      edit('blouseUpper',279,311,278,311,'blouse'), edit('blouseUpper',280,311,279,311,'blouse'),
      edit('blouseUpper',277,312,276,312,'blouse'), edit('blouseUpper',278,312,277,312,'blouse'), edit('blouseUpper',279,312,278,312,'blouse'), edit('blouseUpper',280,312,279,312,'blouse'),
      edit('blouseUpper',278,313,277,313,'blouse'), edit('blouseUpper',279,313,278,313,'blouse'), edit('blouseUpper',280,313,279,313,'blouse'),
      edit('blouseUpper',279,314,278,314,'blouse'), edit('blouseUpper',280,314,279,314,'blouse'),
      edit('blouseLower',284,327,283,327,'blouse'), edit('blouseLower',285,327,284,327,'blouse'),
      edit('blouseLower',282,328,281,328,'blouse'), edit('blouseLower',283,328,282,328,'blouse'), edit('blouseLower',284,328,283,328,'blouse'), edit('blouseLower',285,328,284,328,'blouse'),
      edit('blouseLower',283,329,282,329,'blouse'), edit('blouseLower',284,329,283,329,'blouse'), edit('blouseLower',285,329,284,329,'blouse'),
      edit('blouseLower',284,330,283,330,'blouse'), edit('blouseLower',285,330,284,330,'blouse'),
      edit('curl',270,224,269,224,'hair-underpaint'), edit('curl',271,224,270,224,'hair'), edit('curl',274,224,273,224,'hair'), edit('curl',275,224,274,224,'hair'),
      edit('curl',270,225,269,225,'hair-underpaint'), edit('curl',271,225,270,225,'hair'), edit('curl',272,225,271,225,'hair'), edit('curl',274,225,273,225,'hair'), edit('curl',275,225,274,225,'hair'),
      edit('curl',270,226,269,226,'hair-underpaint'), edit('curl',271,226,270,226,'hair'), edit('curl',273,226,272,226,'hair'), edit('curl',274,226,273,226,'hair'), edit('curl',275,226,274,226,'hair'),
      edit('curl',270,227,269,227,'hair-underpaint'), edit('curl',271,227,270,227,'hair'), edit('curl',274,227,273,227,'hair'), edit('curl',275,227,274,227,'hair'),
    ];
    const peakEdits = [
      edit('blouseUpper',279,310,278,310,'blouse'), edit('blouseUpper',280,310,279,310,'blouse'),
      edit('blouseUpper',277,311,276,311,'blouse'), edit('blouseUpper',278,311,277,311,'blouse'), edit('blouseUpper',279,311,278,311,'blouse'), edit('blouseUpper',280,311,279,311,'blouse'),
      edit('blouseUpper',278,312,277,312,'blouse'), edit('blouseUpper',279,312,278,312,'blouse'), edit('blouseUpper',280,312,279,312,'blouse'),
      edit('blouseUpper',279,313,278,313,'blouse'), edit('blouseUpper',280,313,279,313,'blouse'),
      edit('blouseLower',284,329,283,329,'blouse'), edit('blouseLower',285,329,284,329,'blouse'),
      edit('blouseLower',282,330,281,330,'blouse'), edit('blouseLower',283,330,282,330,'blouse'), edit('blouseLower',284,330,283,330,'blouse'), edit('blouseLower',285,330,284,330,'blouse'),
      edit('blouseLower',283,331,282,331,'blouse'), edit('blouseLower',284,331,283,331,'blouse'), edit('blouseLower',285,331,284,331,'blouse'),
      edit('blouseLower',284,332,283,332,'blouse'), edit('blouseLower',285,332,284,332,'blouse'),
      edit('curl',270,225,269,225,'hair-underpaint'), edit('curl',271,225,270,225,'hair'), edit('curl',274,225,273,225,'hair'), edit('curl',275,225,274,225,'hair'),
      edit('curl',270,226,269,226,'hair-underpaint'), edit('curl',271,226,270,226,'hair'), edit('curl',272,226,271,226,'hair'), edit('curl',274,226,273,226,'hair'), edit('curl',275,226,274,226,'hair'),
      edit('curl',270,227,269,227,'hair-underpaint'), edit('curl',271,227,270,227,'hair'), edit('curl',273,227,272,227,'hair'), edit('curl',274,227,273,227,'hair'), edit('curl',275,227,274,227,'hair'),
      edit('curl',270,228,269,228,'hair-underpaint'), edit('curl',271,228,270,228,'hair'), edit('curl',274,228,273,228,'hair'), edit('curl',275,228,274,228,'hair'),
    ];
    const keyframeEdits = { rest: [], inhale: inhaleEdits, rise: riseEdits, peak: peakEdits };
    const motionPointSet = new Set(Object.values(keyframeEdits).flat().map(({ x, y }) => `${x},${y}`));
    const faceRect = { x: 120, y: 92, width: 120, height: 108 };
    const eyeRects = [{ x: 140, y: 121, width: 30, height: 15 }, { x: 191, y: 127, width: 24, height: 13 }];
    const hoopRects = [{ x: 99, y: 166, width: 29, height: 30 }, { x: 204, y: 167, width: 30, height: 31 }];
    const rgba = (pixels, pixelOffset) => [pixels[pixelOffset], pixels[pixelOffset + 1], pixels[pixelOffset + 2], pixels[pixelOffset + 3]];
    const setRgba = (pixels, x, y, colors) => {
      const targetOffset = offset(x, y);
      for (let channel = 0; channel < 4; channel += 1) pixels[targetOffset + channel] = colors[channel];
    };
    const applyAuthoredEdits = (pixels, edits) => {
      for (const { x, y, sourceX, sourceY } of edits) setRgba(pixels, x, y, rgba(decoded.open, offset(sourceX, sourceY)));
    };
    const rest = clone(decoded.open);
    const inhale = clone(decoded.open); applyAuthoredEdits(inhale, inhaleEdits);
    const rise = clone(decoded.open); applyAuthoredEdits(rise, riseEdits);
    const peak = clone(decoded.open); applyAuthoredEdits(peak, peakEdits);
    const frames = [rest, inhale, rise, peak, clone(rise), clone(inhale), clone(rest), clone(decoded.half), clone(decoded.closed), clone(decoded.half), clone(rest)];

    const bytesForRect = (pixels, rect) => {
      const bytes = [];
      for (let y = rect.y; y < rect.y + rect.height; y += 1) for (let x = rect.x; x < rect.x + rect.width; x += 1) {
        const pixelOffset = offset(x, y);
        bytes.push(...pixels.slice(pixelOffset, pixelOffset + 4));
      }
      return bytes;
    };
    const bytesForLockedFace = (pixels) => {
      const bytes = [];
      for (let y = faceRect.y; y < faceRect.y + faceRect.height; y += 1) for (let x = faceRect.x; x < faceRect.x + faceRect.width; x += 1) {
        const pixelOffset = offset(x, y);
        bytes.push(...pixels.slice(pixelOffset, pixelOffset + 4));
      }
      return bytes;
    };
    const simpleHash = (bytes) => {
      let hash = 2166136261;
      for (const value of bytes) hash = Math.imul(hash ^ value, 16777619) >>> 0;
      return hash.toString(16).padStart(8, '0');
    };
    const stateEyeHashes = Object.fromEntries(Object.entries(decoded).map(([state, pixels]) => [state, eyeRects.map((rect) => simpleHash(bytesForRect(pixels, rect)))]));
    const stateHoopHashes = Object.fromEntries(Object.entries(decoded).map(([state, pixels]) => [state, hoopRects.map((rect) => simpleHash(bytesForRect(pixels, rect)))]));
    const stateFaceHashes = Object.fromEntries(Object.entries(decoded).map(([state, pixels]) => [state, simpleHash(bytesForLockedFace(pixels))]));
    const palette = new Set();
    for (const pixels of Object.values(decoded)) for (let pixelOffset = 0; pixelOffset < pixels.length; pixelOffset += 4) palette.add(rgba(pixels, pixelOffset).join(','));
    const protectedWhite = (pixels, pixelOffset) => {
      const colors = rgba(pixels, pixelOffset);
      return colors[3] === 255 && Math.min(colors[0], colors[1], colors[2]) >= 210 && Math.max(colors[0], colors[1], colors[2]) - Math.min(colors[0], colors[1], colors[2]) <= 80;
    };
    const protectedWhitePositionHash = (pixels) => {
      const bytes = [];
      for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        if (motionPointSet.has(`${x},${y}`)) continue;
        const pixelOffset = offset(x, y);
        if (!protectedWhite(pixels, pixelOffset)) continue;
        bytes.push(x & 255, x >> 8, y & 255, y >> 8);
      }
      return simpleHash(bytes);
    };
    const stateProtectedWhitePositionHashes = Object.fromEntries(Object.entries(decoded).map(([state, pixels]) => [state, protectedWhitePositionHash(pixels)]));
    const componentSizes = (points) => {
      const remaining = new Set(points.map(([x, y]) => `${x},${y}`));
      const sizes = [];
      while (remaining.size) {
        const [first] = remaining;
        remaining.delete(first);
        const queue = [first.split(',').map(Number)];
        let size = 0;
        while (queue.length) {
          const [x, y] = queue.pop();
          size += 1;
          for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const key = `${x + dx},${y + dy}`;
            if (remaining.delete(key)) queue.push([x + dx, y + dy]);
          }
        }
        sizes.push(size);
      }
      return sizes.sort((a, b) => b - a);
    };
    const pointCentroid = (points) => points.length ? {
      x: points.reduce((sum, [x]) => sum + x, 0) / points.length,
      y: points.reduce((sum, [, y]) => sum + y, 0) / points.length,
    } : null;
    const frameKeyNames = ['rest','inhale','rise','peak','rise','inhale','rest','rest','rest','rest','rest'];
    const groupNames = ['blouseUpper','blouseLower','curl'];
    const groupPoints = Object.fromEntries(groupNames.map((group) => [group, [...new Map(Object.values(keyframeEdits).flat().filter((entry) => entry.group === group).map(({ x, y }) => [`${x},${y}`,[x,y]])).values()]]));
    const bboxFillRatio = (points) => {
      if (!points.length) return 0;
      const xs = points.map(([x]) => x); const ys = points.map(([,y]) => y);
      return points.length / ((Math.max(...xs)-Math.min(...xs)+1)*(Math.max(...ys)-Math.min(...ys)+1));
    };
    const maxStraightRun = (points) => {
      const set = new Set(points.map(([x,y]) => `${x},${y}`));
      let maximum = 0;
      for (const [x,y] of points) {
        let horizontal = 1; while (set.has(`${x+horizontal},${y}`)) horizontal += 1;
        let vertical = 1; while (set.has(`${x},${y+vertical}`)) vertical += 1;
        maximum = Math.max(maximum,horizontal,vertical);
      }
      return maximum;
    };
    const enclosedTransparentCount = (pixels, points) => {
      const xs = points.map(([x]) => x);
      const ys = points.map(([, y]) => y);
      const minX = Math.max(0, Math.min(...xs) - 1);
      const maxX = Math.min(width - 1, Math.max(...xs) + 1);
      const minY = Math.max(0, Math.min(...ys) - 1);
      const maxY = Math.min(height - 1, Math.max(...ys) + 1);
      const transparent = new Set();
      for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) if (pixels[offset(x, y) + 3] === 0) transparent.add(`${x},${y}`);
      const outside = [];
      for (const key of transparent) {
        const [x, y] = key.split(',').map(Number);
        if (x === minX || x === maxX || y === minY || y === maxY) outside.push([x, y]);
      }
      while (outside.length) {
        const [x, y] = outside.pop();
        const key = `${x},${y}`;
        if (!transparent.delete(key)) continue;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) outside.push([x + dx, y + dy]);
      }
      return transparent.size;
    };
    const audits = frames.map((pixels, index) => {
      const reference = decoded[states[index]];
      let minimumY = height;
      let maximumY = -1;
      let nonBinaryAlpha = 0;
      let transparentRgb = 0;
      let paletteViolations = 0;
      let changedOutsideMotionMasks = 0;
      let alphaMaskChanges = 0;
      let changedPixels = 0;
      for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        const pixelOffset = offset(x, y);
        const alpha = pixels[pixelOffset + 3];
        if (alpha !== 0 && alpha !== 255) nonBinaryAlpha += 1;
        if (alpha === 0 && (pixels[pixelOffset] || pixels[pixelOffset + 1] || pixels[pixelOffset + 2])) transparentRgb += 1;
        if (alpha === 255) { minimumY = Math.min(minimumY, y); maximumY = Math.max(maximumY, y); }
        if (!palette.has(rgba(pixels, pixelOffset).join(','))) paletteViolations += 1;
        if (alpha !== decoded.open[pixelOffset + 3]) alphaMaskChanges += 1;
        if (!pixelChanged(pixels, reference, pixelOffset)) continue;
        changedPixels += 1;
        if (!motionPointSet.has(`${x},${y}`)) changedOutsideMotionMasks += 1;
      }
      const activeEdits = keyframeEdits[frameKeyNames[index]];
      const regionalFormAudits = Object.fromEntries(groupNames.map((name) => {
        const edits = activeEdits.filter((entry) => entry.group === name);
        const targets = edits.map(({x,y}) => [x,y]);
        const changed = groupPoints[name].filter(([x,y]) => pixelChanged(pixels,reference,offset(x,y)));
        const alphaChanged = groupPoints[name].filter(([x,y]) => pixels[offset(x,y)+3] !== reference[offset(x,y)+3]);
        let provenanceMismatch = 0; let restoreDistanceViolation = 0;
        for (const {x,y,sourceX,sourceY} of edits) {
          if (Math.max(Math.abs(x-sourceX),Math.abs(y-sourceY)) > 1) restoreDistanceViolation += 1;
          const actual = rgba(pixels,offset(x,y)); const expectedColor = rgba(decoded.open,offset(sourceX,sourceY));
          if (actual.some((value,channel) => value !== expectedColor[channel])) provenanceMismatch += 1;
        }
        return [name,{active:edits.length>0,editCount:edits.length,changedPixels:changed.length,changedComponentSizes:componentSizes(changed),alphaChangedPixels:alphaChanged.length,alphaChangeCentroid:pointCentroid(alphaChanged),provenanceMismatch,restoreDistanceViolation,bboxFillRatio:bboxFillRatio(targets),maxStraightRun:maxStraightRun(targets),enclosedTransparentBefore:enclosedTransparentCount(reference,groupPoints[name]),enclosedTransparentAfter:enclosedTransparentCount(pixels,groupPoints[name])}];
      }));
      return {
        frame: index,
        state: states[index],
        changedPixels,
        changedOutsideMotionMasks,
        minimumY,
        maximumY,
        characterHeight: maximumY - minimumY + 1,
        nonBinaryAlpha,
        transparentRgb,
        paletteViolations,
        alphaMaskChanges,
        faceHash: simpleHash(bytesForLockedFace(pixels)),
        eyeHashes: eyeRects.map((rect) => simpleHash(bytesForRect(pixels, rect))),
        hoopHashes: hoopRects.map((rect) => simpleHash(bytesForRect(pixels, rect))),
        protectedWhitePositionHash: protectedWhitePositionHash(pixels),
        regionalFormAudits,
      };
    });
    const frameHashes = frames.map((pixels) => simpleHash(pixels));
    const keyframeHashes = { rest: frameHashes[0], inhale: frameHashes[1], rise: frameHashes[2], peak: frameHashes[3] };
    for (const frame of audits) {
      if (frame.changedOutsideMotionMasks !== 0) throw new Error(`Frame ${frame.frame} changes pixels outside motion masks.`);
      if (frame.minimumY !== 8 || frame.maximumY !== 447 || frame.characterHeight !== 440) throw new Error(`Frame ${frame.frame} changes height or baseline.`);
      if (frame.nonBinaryAlpha || frame.transparentRgb || frame.paletteViolations) throw new Error(`Frame ${frame.frame} violates alpha or palette.`);
      if (frame.faceHash !== stateFaceHashes[frame.state]) throw new Error(`Frame ${frame.frame} changes the locked face.`);
      if (JSON.stringify(frame.eyeHashes) !== JSON.stringify(stateEyeHashes[frame.state])) throw new Error(`Frame ${frame.frame} changes approved ${frame.state} eye pixels.`);
      if (JSON.stringify(frame.hoopHashes) !== JSON.stringify(stateHoopHashes[frame.state])) throw new Error(`Frame ${frame.frame} changes locked hoop or surrounding pixels.`);
      if (frame.protectedWhitePositionHash !== stateProtectedWhitePositionHashes[frame.state]) throw new Error(`Frame ${frame.frame} changes protected-white positions.`);
      for (const [name, regional] of Object.entries(frame.regionalFormAudits)) {
        if (regional.active && (regional.provenanceMismatch || regional.restoreDistanceViolation)) throw new Error(`Frame ${frame.frame} has invalid authored provenance in ${name}.`);
        if (regional.active && regional.bboxFillRatio > 0.75) throw new Error(`Frame ${frame.frame} fills a rectangular bbox in ${name}.`);
        if (regional.active && regional.maxStraightRun > 4) throw new Error(`Frame ${frame.frame} creates a straight changed edge in ${name}.`);
        if (regional.active && regional.alphaChangedPixels === 0) throw new Error(`Frame ${frame.frame} presents color-only ${name} edits as motion.`);
        if (regional.enclosedTransparentAfter > regional.enclosedTransparentBefore) throw new Error(`Frame ${frame.frame} creates an enclosed transparent gap in ${name}.`);
        if (regional.changedComponentSizes.some((size) => size === 1)) throw new Error(`Frame ${frame.frame} creates a singleton change in ${name}.`);
      }
    }
    const reversalPairs = [[1,5],[2,4],[0,6],[0,10],[7,9]];
    for (const [first, second] of reversalPairs) if (frameHashes[first] !== frameHashes[second]) throw new Error(`Frames ${first}/${second} are not exact reversal reuse.`);
    const activeChangeProgression = audits.slice(0,4).map(({changedPixels}) => changedPixels);
    for (let index=1;index<activeChangeProgression.length;index+=1) if (activeChangeProgression[index]-activeChangeProgression[index-1] > 64) throw new Error('Authored motion has an abrupt changed-pixel progression.');
    let seamChangedPixels = 0;
    for (let pixelOffset = 0; pixelOffset < frames[0].length; pixelOffset += 4) if (pixelChanged(frames.at(-1), frames[0], pixelOffset)) seamChangedPixels += 1;
    const seamRatio = seamChangedPixels / (width * height);
    if (seamRatio > 0.00015) throw new Error(`Final-to-first seam ${(seamRatio * 100).toFixed(4)}% is too large.`);

    const canvasForFrame = (pixels) => {
      const output = document.createElement('canvas');
      output.width = width;
      output.height = height;
      output.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
      return output;
    };
    const atlas = document.createElement('canvas');
    atlas.width = width * frames.length;
    atlas.height = height;
    const atlasContext = atlas.getContext('2d');
    frames.forEach((pixels, index) => atlasContext.putImageData(new ImageData(pixels, width, height), index * width, 0));
    const contact1x = document.createElement('canvas');
    contact1x.width = width * 4;
    contact1x.height = height * 3;
    const contactContext = contact1x.getContext('2d');
    contactContext.fillStyle = '#0b100d';
    contactContext.fillRect(0, 0, contact1x.width, contact1x.height);
    frames.forEach((pixels, index) => contactContext.drawImage(canvasForFrame(pixels), (index % 4) * width, Math.floor(index / 4) * height));
    const contact2x = document.createElement('canvas');
    contact2x.width = contact1x.width * 2;
    contact2x.height = contact1x.height * 2;
    const contact2xContext = contact2x.getContext('2d', { willReadFrequently: true });
    contact2xContext.imageSmoothingEnabled = false;
    contact2xContext.drawImage(contact1x, 0, 0, contact2x.width, contact2x.height);
    const originalContactPixels = contactContext.getImageData(0, 0, contact1x.width, contact1x.height).data;
    const zoomContactPixels = contact2xContext.getImageData(0, 0, contact2x.width, contact2x.height).data;
    for (let y = 0; y < contact1x.height; y += 1) for (let x = 0; x < contact1x.width; x += 1) {
      const sourceOffset = (y * contact1x.width + x) * 4;
      for (let zoomY = 0; zoomY < 2; zoomY += 1) for (let zoomX = 0; zoomX < 2; zoomX += 1) {
        const zoomOffset = ((y * 2 + zoomY) * contact2x.width + (x * 2 + zoomX)) * 4;
        for (let channel = 0; channel < 4; channel += 1) if (zoomContactPixels[zoomOffset + channel] !== originalContactPixels[sourceOffset + channel]) throw new Error('2× contact sheet is not exact nearest-neighbor expansion.');
      }
    }
    return {
      atlas: atlas.toDataURL('image/png'),
      contact1x: contact1x.toDataURL('image/png'),
      contact2x: contact2x.toDataURL('image/png'),
      audit: {
        frameCount: frames.length,
        durationsMs: durations,
        states,
        frameHashes,
        keyframeHashes,
        frameAudits: audits,
        stateEyeHashes,
        stateHoopHashes,
        stateFaceHashes,
        stateProtectedWhitePositionHashes,
        reversalPairs,
        activeChangeProgression,
        seamChangedPixels,
        seamRatio,
        nativeCanvas: { width, height, characterHeight: 440, crownY: 8, baselineY: 448, opaqueBottomY: 447 },
        authoredKeyframeEdits: keyframeEdits,
        motionInterpolation: 'explicit-adjacent-pixel-keyframes-no-color-crossfade',
        exactIntegerZoomValidated: 2,
      },
    };
  }, {
    sources: { open: asDataUrl(openBytes), half: asDataUrl(halfBytes), closed: asDataUrl(closedBytes) },
    states: stateSequence,
    durations: durationsMs,
  });
} finally {
  await browser.close();
}

await mkdir(outputDirectory, { recursive: true });
const decode = (url) => Buffer.from(url.split(',')[1], 'base64');
const atlasBytes = decode(result.atlas);
const contact1xBytes = decode(result.contact1x);
const contact2xBytes = decode(result.contact2x);
const player = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dolly idle + blink private QA proof</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3eee5;color:#111713;font-family:ui-monospace,monospace}.shell{width:min(96vw,780px);border:1px solid #111713;background:#fffaf1}.head{display:flex;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #111713}.head strong{letter-spacing:.08em}.head span{font-size:9px;color:#667067}.stage{height:560px;display:grid;place-items:end center;background:#0b100d;overflow:auto}.stage canvas{width:320px;height:460px;image-rendering:pixelated}.stage[data-zoom="2"]{height:1020px}.stage[data-zoom="2"] canvas{width:640px;height:920px}.controls{display:flex;gap:8px;padding:12px 18px;border-top:1px solid #111713}.controls button{min-height:40px;padding:0 14px;border:1px solid #111713;background:#fffaf1;font:700 10px ui-monospace,monospace}.note{padding:0 18px 16px;color:#667067;font:10px/1.5 system-ui,sans-serif}</style></head><body><main class="shell"><header class="head"><strong>PORT-AVATAR-005.7B · PRIVATE QA</strong><span>QA_PENDING · LOOPS <b data-loops>0</b></span></header><section class="stage" data-zoom="1"><canvas width="320" height="460"></canvas></section><div class="controls"><button type="button" data-play>Pause</button><button type="button" data-zoom>View exact 2×</button></div><p class="note">Eleven frames with exact reversed reuse. Approved v2 OPEN/HALF/CLOSED face pixels are locked. Native 320×460, 440 px character height, y=448 anchor, no transforms. Let this run for five or more loops.</p></main><script>const durations=${JSON.stringify(durationsMs)};const canvas=document.querySelector('canvas');const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;const image=new Image();image.src='./idle-blink-atlas-1x.png';let frame=0;let loops=0;let playing=true;let timer;function draw(){context.clearRect(0,0,320,460);context.drawImage(image,frame*320,0,320,460,0,0,320,460)}function next(){clearTimeout(timer);if(!playing)return;timer=setTimeout(()=>{frame=(frame+1)%durations.length;if(frame===0){loops+=1;document.querySelector('[data-loops]').textContent=String(loops)}draw();next()},durations[frame])}image.addEventListener('load',()=>{draw();next()});document.querySelector('[data-play]').addEventListener('click',event=>{playing=!playing;event.currentTarget.textContent=playing?'Pause':'Play';next()});document.querySelector('[data-zoom]').addEventListener('click',event=>{const stage=document.querySelector('.stage');const zoom=stage.dataset.zoom==='1'?'2':'1';stage.dataset.zoom=zoom;event.currentTarget.textContent=zoom==='1'?'View exact 2×':'View native 1×'});</script></body></html>\n`;
const audit = {
  schemaVersion: '1.0.0',
  status: 'review_only_approved_by_carl',
  approvedBlinkInputSha256: { open: expected.open, half: expected.half, closed: expected.closed },
  canonicalMasterSha256: expected.master,
  repositoryWrites: false,
  runtimeIntegrationChanged: false,
  wholeImageTransforms: false,
  ...result.audit,
};
const reviewPlayer = player
  .replace('./idle-blink-atlas-1x.png', './jolene-idle-blink-v5-atlas-1x.png')
  .replace('PRIVATE QA', 'APPROVED REVIEW')
  .replace('QA_PENDING', 'APPROVED');
const outputs = {
  'jolene-idle-blink-v5-atlas-1x.png': atlasBytes,
  'jolene-idle-blink-v5-contact-1x.png': contact1xBytes,
  'jolene-idle-blink-v5-contact-2x.png': contact2xBytes,
  'jolene-idle-blink-v5-player.html': Buffer.from(reviewPlayer),
  'jolene-idle-blink-v5-audit.json': Buffer.from(`${JSON.stringify(audit, null, 2)}\n`),
};
await Promise.all(Object.entries(outputs).map(([name, bytes]) => writeFile(`${outputDirectory}/${name}`, bytes)));
console.log(JSON.stringify({ outputDirectory, outputSha256: Object.fromEntries(Object.entries(outputs).map(([name, bytes]) => [name, sha256(bytes)])), ...audit }, null, 2));
