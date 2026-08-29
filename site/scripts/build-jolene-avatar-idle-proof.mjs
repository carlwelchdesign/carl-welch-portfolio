import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const masterUrl = new URL('../public/jolene/jolene-country-host-master.png', import.meta.url);
const identityLockUrl = new URL('../docs/jolene-avatar-identity-lock.v1.json', import.meta.url);
const proofManifestUrl = new URL('../docs/jolene-avatar-idle-proof.v1.json', import.meta.url);
const atlasUrl = new URL('../docs/review/jolene-avatar-idle-proof-atlas.png', import.meta.url);
const boardUrl = new URL('../docs/review/jolene-avatar-idle-proof-board.png', import.meta.url);
const playerUrl = new URL('../docs/review/jolene-avatar-idle-proof.html', import.meta.url);
const checkOnly = process.argv.includes('--check');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const asDataUrl = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;

const [masterBytes, identityLockText, proofManifestText] = await Promise.all([
  readFile(masterUrl),
  readFile(identityLockUrl, 'utf8'),
  readFile(proofManifestUrl, 'utf8'),
]);
const identityLock = JSON.parse(identityLockText);
const proofManifest = JSON.parse(proofManifestText);

assert.equal(sha256(masterBytes), identityLock.master.sha256, 'The approved Dolly master changed after identity approval.');
assert.equal(proofManifest.master.sha256, identityLock.master.sha256);
assert.equal(proofManifest.identityInvariants.generatedRedraw, false);
assert.equal(proofManifest.identityInvariants.wholeImageTransforms, false);
assert.equal(proofManifest.runtimeIntegrationChanged, false);
assert.deepEqual(proofManifest.frame.anchor, identityLock.productionFrame.anchor);
assert.equal(proofManifest.frame.characterHeight, identityLock.productionFrame.canonicalCharacterHeight);
assert.equal(proofManifest.loop.frameCount, proofManifest.loop.durationsMs.length);

const renderSpecification = structuredClone(proofManifest);
renderSpecification.outputs = {
  atlas: { path: proofManifest.outputs.atlas.path },
  board: { path: proofManifest.outputs.board.path },
  player: { path: proofManifest.outputs.player.path },
};
const renderInputSha256 = sha256(Buffer.from(JSON.stringify({ proof: renderSpecification, identity: identityLock.master })));

const browser = await chromium.launch({ headless: true });
let screenshotBytes;
let atlasBytes;
let playerBytes;
let audit;
try {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1280 }, deviceScaleFactor: 1 });
  const rendered = await page.evaluate(async ({ masterSource, identity, proof }) => {
    const image = new Image();
    image.src = masterSource;
    await image.decode();

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) throw new Error('Idle-proof source context is unavailable.');
    sourceContext.drawImage(image, 0, 0);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = proof.frame.width;
    frameCanvas.height = proof.frame.height;
    const frameContext = frameCanvas.getContext('2d', { willReadFrequently: true });
    if (!frameContext) throw new Error('Idle-proof frame context is unavailable.');
    frameContext.imageSmoothingEnabled = false;
    const sourceBounds = identity.master.opaqueBounds;
    const drawBounds = identity.productionFrame.drawBounds;
    frameContext.drawImage(
      sourceCanvas,
      sourceBounds.x,
      sourceBounds.y,
      sourceBounds.width,
      sourceBounds.height,
      drawBounds.x,
      drawBounds.y,
      drawBounds.width,
      drawBounds.height,
    );
    const base = frameContext.getImageData(0, 0, proof.frame.width, proof.frame.height);
    const width = proof.frame.width;
    const height = proof.frame.height;

    const clonePixels = () => new Uint8ClampedArray(base.data);
    const offsetFor = (x, y) => (y * width + x) * 4;
    const copyPixel = (target, targetX, targetY, source, sourceX, sourceY) => {
      const targetOffset = offsetFor(targetX, targetY);
      const sourceOffset = offsetFor(sourceX, sourceY);
      target[targetOffset] = source[sourceOffset];
      target[targetOffset + 1] = source[sourceOffset + 1];
      target[targetOffset + 2] = source[sourceOffset + 2];
      target[targetOffset + 3] = source[sourceOffset + 3];
    };

    const moveHighlights = (pixels, region, deltaY, predicate, cadence = 5) => {
      const source = new Uint8ClampedArray(pixels);
      const targets = new Set();
      for (let y = region.y; y < region.y + region.height; y += 1) {
        for (let x = region.x; x < region.x + region.width; x += 1) {
          if ((x + y) % cadence !== 0) continue;
          const sourceOffset = offsetFor(x, y);
          const channels = [source[sourceOffset], source[sourceOffset + 1], source[sourceOffset + 2], source[sourceOffset + 3]];
          if (!predicate(channels)) continue;
          const targetY = y + deltaY;
          if (targetY < region.y || targetY >= region.y + region.height) continue;
          const targetOffset = offsetFor(x, targetY);
          if (source[targetOffset + 3] !== 255 || targets.has(targetOffset)) continue;
          copyPixel(pixels, x, y, source, x, targetY);
          copyPixel(pixels, x, targetY, source, x, y);
          targets.add(targetOffset);
        }
      }
    };

    const authorShoulderBreath = (pixels) => {
      const source = new Uint8ClampedArray(pixels);
      const region = proof.authoredRegions.shoulderBreath;
      const isBlouse = ([red, green, blue, alpha]) => alpha === 255 && red > 55 && red > green * 1.35 && red > blue * 1.2;
      for (let y = region.y; y < region.y + region.height; y += 1) {
        if (y % 2 !== 0) continue;
        let left = -1;
        let right = -1;
        for (let x = region.x; x < region.x + region.width; x += 1) {
          const offset = offsetFor(x, y);
          if (!isBlouse([source[offset], source[offset + 1], source[offset + 2], source[offset + 3]])) continue;
          if (left === -1) left = x;
          right = x;
        }
        if (left > 0 && source[offsetFor(left - 1, y) + 3] === 0) copyPixel(pixels, left - 1, y, source, left, y);
        if (right >= 0 && right < width - 1 && source[offsetFor(right + 1, y) + 3] === 0) copyPixel(pixels, right + 1, y, source, right, y);
      }
    };

    const authorBlink = (pixels, eye, stage) => {
      const source = new Uint8ClampedArray(pixels);
      const isLeftEye = eye.x < width / 2;
      const eyeInterior = {
        x: eye.x,
        y: eye.y,
        width: eye.width,
        // Dolly's canonical three-quarter pose places the far eye six pixels
        // lower. These bounds isolate each eyeball and upper lash while leaving
        // both brows and the surrounding socket pixels byte-identical.
        height: isLeftEye ? 8 : 11,
      };
      const skinSampleY = eyeInterior.y + eyeInterior.height + 1;
      for (let y = eyeInterior.y; y < eyeInterior.y + eyeInterior.height; y += 1) {
        const sourceY = Math.min(height - 1, skinSampleY + ((y - eyeInterior.y) % 2));
        for (let x = eyeInterior.x; x < eyeInterior.x + eyeInterior.width; x += 1) {
          copyPixel(pixels, x, y, source, x, sourceY);
        }
      }

      let lashOffset = offsetFor(eyeInterior.x, eyeInterior.y);
      let lashValue = Number.POSITIVE_INFINITY;
      for (let y = eyeInterior.y; y < eyeInterior.y + eyeInterior.height; y += 1) {
        for (let x = eyeInterior.x; x < eyeInterior.x + eyeInterior.width; x += 1) {
          const candidateOffset = offsetFor(x, y);
          const value = source[candidateOffset] + source[candidateOffset + 1] + source[candidateOffset + 2];
          if (source[candidateOffset + 3] === 255 && value < lashValue) {
            lashOffset = candidateOffset;
            lashValue = value;
          }
        }
      }

      // Closing and opening use the same normalized eyelid drawing. Nothing is
      // scaled or compressed: the upper lid simply descends over the eye, then
      // resolves into one clean curved lash at full closure.
      const centerY = eyeInterior.y + Math.round(eyeInterior.height * (stage === 'half' ? 0.5 : 0.68));
      const inset = stage === 'half' ? 3 : 4;
      const thickness = stage === 'half' ? 2 : 1;
      for (let x = eyeInterior.x + inset; x < eyeInterior.x + eyeInterior.width - inset; x += 1) {
        const normalized = (x - (eyeInterior.x + inset)) / Math.max(1, eyeInterior.width - inset * 2 - 1);
        const arcDrop = normalized < 0.16 || normalized > 0.84 ? 1 : 0;
        for (let row = 0; row < thickness; row += 1) {
          const targetOffset = offsetFor(x, centerY + arcDrop + row);
          pixels[targetOffset] = source[lashOffset];
          pixels[targetOffset + 1] = source[lashOffset + 1];
          pixels[targetOffset + 2] = source[lashOffset + 2];
          pixels[targetOffset + 3] = 255;
        }
      }
    };

    const hairPredicate = ([red, green, blue, alpha]) => alpha === 255 && red >= 225 && green >= 170 && blue >= 95 && red - blue <= 155;
    const hoopPredicate = ([red, green, blue, alpha]) => alpha === 255 && red >= 175 && green >= 95 && green > blue * 1.35;
    const hairRegions = [proof.authoredRegions.leftHairSettle, proof.authoredRegions.rightHairSettle];
    const hoopRegions = [proof.authoredRegions.leftHoopSettle, proof.authoredRegions.rightHoopSettle];

    const frames = Array.from({ length: proof.loop.frameCount }, () => clonePixels());
    for (const region of hairRegions) moveHighlights(frames[0], region, 1, hairPredicate, 7);
    for (const region of hairRegions) moveHighlights(frames[1], region, 1, hairPredicate, 5);
    for (const region of hairRegions) moveHighlights(frames[2], region, 1, hairPredicate, 5);
    for (const region of hoopRegions) moveHighlights(frames[1], region, 1, hoopPredicate, 4);
    authorShoulderBreath(frames[2]);
    authorShoulderBreath(frames[3]);
    for (const region of hoopRegions) moveHighlights(frames[3], region, -1, hoopPredicate, 4);
    for (const region of hairRegions) moveHighlights(frames[4], region, -1, hairPredicate, 6);
    for (const region of hairRegions) moveHighlights(frames[5], region, -1, hairPredicate, 6);
    authorBlink(frames[5], proof.authoredRegions.leftEye, 'half');
    authorBlink(frames[5], proof.authoredRegions.rightEye, 'half');
    authorBlink(frames[6], proof.authoredRegions.leftEye, 'closed');
    authorBlink(frames[6], proof.authoredRegions.rightEye, 'closed');
    authorBlink(frames[7], proof.authoredRegions.leftEye, 'half');
    authorBlink(frames[7], proof.authoredRegions.rightEye, 'half');
    for (const region of hoopRegions) moveHighlights(frames[7], region, 1, hoopPredicate, 5);
    for (const region of hairRegions) moveHighlights(frames[8], region, 1, hairPredicate, 6);
    for (const region of hairRegions) moveHighlights(frames[9], region, 1, hairPredicate, 7);
    for (const region of hoopRegions) moveHighlights(frames[9], region, -1, hoopPredicate, 31);

    const frameDataUrls = [];
    const frameAudits = [];
    const mouthRect = { x: 158, y: 161, width: 50, height: 38 };
    const faceRect = { x: 130, y: 90, width: 100, height: 130 };
    const eyeRects = [proof.authoredRegions.leftEye, proof.authoredRegions.rightEye];
    const within = (x, y, rect) => x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
    const pixelChanged = (candidate, reference, offset) => (
      candidate[offset] !== reference[offset]
      || candidate[offset + 1] !== reference[offset + 1]
      || candidate[offset + 2] !== reference[offset + 2]
      || candidate[offset + 3] !== reference[offset + 3]
    );
    const eyeBytes = (pixels, rect) => {
      const bytes = [];
      for (let y = rect.y; y < rect.y + rect.height; y += 1) {
        for (let x = rect.x; x < rect.x + rect.width; x += 1) {
          const offset = offsetFor(x, y);
          bytes.push(pixels[offset], pixels[offset + 1], pixels[offset + 2], pixels[offset + 3]);
        }
      }
      return bytes;
    };
    const eyeChangedPixels = (pixels, rect) => {
      let count = 0;
      for (let y = rect.y; y < rect.y + rect.height; y += 1) {
        for (let x = rect.x; x < rect.x + rect.width; x += 1) {
          if (pixelChanged(pixels, base.data, offsetFor(x, y))) count += 1;
        }
      }
      return count;
    };
    const forbiddenClosedEyeColorCount = (pixels, rect) => {
      let count = 0;
      for (let y = rect.y; y < rect.y + rect.height; y += 1) {
        for (let x = rect.x; x < rect.x + rect.width; x += 1) {
          const offset = offsetFor(x, y);
          const red = pixels[offset];
          const green = pixels[offset + 1];
          const blue = pixels[offset + 2];
          const coolSclera = red > 175 && green > 175 && blue > 165 && blue >= red * 0.92;
          const blueIris = blue > 55 && blue > red * 1.12 && blue > green * 1.08;
          if (coolSclera || blueIris) count += 1;
        }
      }
      return count;
    };
    const isProtectedWhite = (pixels, offset) => {
      const channels = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
      return pixels[offset + 3] === 255
        && Math.min(...channels) >= identity.intentionalWhiteMasks.selection.minimumChannel
        && Math.max(...channels) - Math.min(...channels) <= identity.intentionalWhiteMasks.selection.maximumChannelSpread;
    };
    const protectedWhitesOutsideEyes = (pixels) => {
      let count = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (eyeRects.some((rect) => within(x, y, rect))) continue;
          if (isProtectedWhite(pixels, offsetFor(x, y))) count += 1;
        }
      }
      return count;
    };
    const baseProtectedWhitesOutsideEyes = protectedWhitesOutsideEyes(base.data);
    for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
      const pixels = frames[frameIndex];
      let minimumY = height;
      let maximumY = -1;
      let nonBinaryAlpha = 0;
      let transparentRgb = 0;
      let changedPixels = 0;
      let mouthChanges = 0;
      let lockedFaceChanges = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const offset = offsetFor(x, y);
          const alpha = pixels[offset + 3];
          if (alpha !== 0 && alpha !== 255) nonBinaryAlpha += 1;
          if (alpha === 0 && (pixels[offset] !== 0 || pixels[offset + 1] !== 0 || pixels[offset + 2] !== 0)) transparentRgb += 1;
          if (alpha === 255) {
            minimumY = Math.min(minimumY, y);
            maximumY = Math.max(maximumY, y);
          }
          if (!pixelChanged(pixels, base.data, offset)) continue;
          changedPixels += 1;
          if (within(x, y, mouthRect)) mouthChanges += 1;
          if (
            within(x, y, faceRect)
            && ![...eyeRects, ...hoopRegions].some((rect) => within(x, y, rect))
          ) lockedFaceChanges += 1;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Idle-proof authored-frame context is unavailable.');
      context.putImageData(new ImageData(pixels, width, height), 0, 0);
      frameDataUrls.push(canvas.toDataURL('image/png'));
      frameAudits.push({
        frameIndex,
        changedPixels,
        minimumY,
        maximumY,
        characterHeight: maximumY - minimumY + 1,
        nonBinaryAlpha,
        transparentRgb,
        mouthChanges,
        lockedFaceChanges,
        eyeChanges: eyeRects.map((rect) => eyeChangedPixels(pixels, rect)),
        protectedWhiteDriftOutsideEyes: protectedWhitesOutsideEyes(pixels) - baseProtectedWhitesOutsideEyes,
      });
    }

    const eyeAudit = {
      halfCloseMatchesHalfOpen: eyeRects.map((rect) => (
        JSON.stringify(eyeBytes(frames[5], rect)) === JSON.stringify(eyeBytes(frames[7], rect))
      )),
      closedForbiddenEyeColors: eyeRects.map((rect) => forbiddenClosedEyeColorCount(frames[6], rect)),
    };

    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = width * frames.length;
    atlasCanvas.height = height;
    const atlasContext = atlasCanvas.getContext('2d');
    if (!atlasContext) throw new Error('Idle-proof atlas context is unavailable.');
    for (let index = 0; index < frames.length; index += 1) {
      atlasContext.putImageData(new ImageData(frames[index], width, height), index * width, 0);
    }

    const faceDataUrls = [4, 5, 6].map((frameIndex) => {
      const faceSourceCanvas = document.createElement('canvas');
      faceSourceCanvas.width = width;
      faceSourceCanvas.height = height;
      faceSourceCanvas.getContext('2d').putImageData(new ImageData(frames[frameIndex], width, height), 0, 0);
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 720;
      faceCanvas.height = 540;
      const faceContext = faceCanvas.getContext('2d');
      faceContext.imageSmoothingEnabled = false;
      faceContext.fillStyle = '#0b100d';
      faceContext.fillRect(0, 0, faceCanvas.width, faceCanvas.height);
      faceContext.drawImage(faceSourceCanvas, 110, 90, 120, 90, 0, 0, 720, 540);
      return faceCanvas.toDataURL('image/png');
    });

    let seamChangedPixels = 0;
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = width;
    diffCanvas.height = height;
    const diffPixels = new Uint8ClampedArray(width * height * 4);
    for (let offset = 0; offset < frames[0].length; offset += 4) {
      if (pixelChanged(frames[0], frames.at(-1), offset)) {
        seamChangedPixels += 1;
        diffPixels[offset] = 255;
        diffPixels[offset + 1] = 91;
        diffPixels[offset + 2] = 56;
        diffPixels[offset + 3] = 255;
      } else if (base.data[offset + 3] === 255) {
        diffPixels[offset] = 20;
        diffPixels[offset + 1] = 28;
        diffPixels[offset + 2] = 22;
        diffPixels[offset + 3] = 90;
      }
    }
    diffCanvas.getContext('2d').putImageData(new ImageData(diffPixels, width, height), 0, 0);

    return {
      frameDataUrls,
      faceDataUrls,
      atlasDataUrl: atlasCanvas.toDataURL('image/png'),
      diffDataUrl: diffCanvas.toDataURL('image/png'),
      frameAudits,
      eyeAudit,
      seamChangedPixels,
      seamChangeRatio: seamChangedPixels / (width * height),
    };
  }, { masterSource: asDataUrl(masterBytes), identity: identityLock, proof: proofManifest });

  const frameBytes = rendered.frameDataUrls.map((dataUrl) => Buffer.from(dataUrl.split(',')[1], 'base64'));
  const frameHashes = frameBytes.map(sha256);
  atlasBytes = Buffer.from(rendered.atlasDataUrl.split(',')[1], 'base64');
  assert.equal(new Set(frameHashes).size, proofManifest.loop.frameCount, 'Every idle-proof drawing must be unique.');
  assert.ok(rendered.seamChangeRatio > 0, 'Loop seam proof must exercise authored pixels.');
  assert.ok(rendered.seamChangeRatio < 0.0025, `The last-to-first idle loop seam changes ${(rendered.seamChangeRatio * 100).toFixed(3)}% of the canvas.`);
  for (const frame of rendered.frameAudits) {
    assert.ok(frame.changedPixels > 0, `Frame ${frame.frameIndex} has no authored pixel changes.`);
    assert.equal(frame.minimumY, proofManifest.frame.crownY, `Frame ${frame.frameIndex} crown drifted.`);
    assert.equal(frame.maximumY, proofManifest.frame.opaqueBottomY, `Frame ${frame.frameIndex} baseline drifted.`);
    assert.equal(frame.characterHeight, proofManifest.frame.characterHeight, `Frame ${frame.frameIndex} height drifted.`);
    assert.equal(frame.nonBinaryAlpha, 0, `Frame ${frame.frameIndex} contains partial alpha.`);
    assert.equal(frame.transparentRgb, 0, `Frame ${frame.frameIndex} contains RGB data under transparency.`);
    assert.equal(frame.mouthChanges, 0, `Frame ${frame.frameIndex} changed the mouth or tooth band.`);
    assert.equal(frame.lockedFaceChanges, 0, `Frame ${frame.frameIndex} changed locked face pixels outside the eye masks.`);
    assert.equal(frame.protectedWhiteDriftOutsideEyes, 0, `Frame ${frame.frameIndex} changed protected white pixels outside the blinking eyes.`);
  }
  assert.deepEqual(rendered.eyeAudit.halfCloseMatchesHalfOpen, [true, true], 'The half-close and half-open eye drawings must match exactly.');
  assert.deepEqual(rendered.eyeAudit.closedForbiddenEyeColors, [0, 0], 'The closed-eye drawing retained sclera or blue iris pixels.');
  for (const frameIndex of [5, 6, 7]) {
    const [leftChanges, rightChanges] = rendered.frameAudits[frameIndex].eyeChanges;
    const leftCoverage = leftChanges / (proofManifest.authoredRegions.leftEye.width * 8);
    const rightCoverage = rightChanges / (proofManifest.authoredRegions.rightEye.width * 11);
    const changeRatio = leftCoverage / rightCoverage;
    assert.ok(changeRatio > 0.9 && changeRatio < 1.1, `Frame ${frameIndex} closes the eyes asymmetrically (${changeRatio.toFixed(3)} normalized coverage).`);
  }

  audit = {
    frameHashes,
    frameAudits: rendered.frameAudits,
    seamChangedPixels: rendered.seamChangedPixels,
    seamChangeRatio: rendered.seamChangeRatio,
    eyeAudit: rendered.eyeAudit,
  };

  const player = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dolly idle + blink review proof</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3eee5;color:#111713;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.shell{width:min(94vw,760px);border:1px solid #111713;background:#fffaf1}.head{display:flex;justify-content:space-between;gap:20px;padding:18px 20px;border-bottom:1px solid #111713}.head strong{font-size:14px;letter-spacing:.08em}.head span{font-size:9px;color:#667067}.stage{min-height:560px;display:grid;place-items:end center;background:#0b100d;overflow:hidden}.stage canvas{width:320px;height:460px;image-rendering:pixelated}.controls{display:flex;flex-wrap:wrap;gap:8px;padding:14px 20px;border-top:1px solid #111713}.controls button{min-height:40px;padding:0 14px;border:1px solid #111713;background:#fffaf1;font:700 10px ui-monospace,monospace;cursor:pointer}.controls button[data-active=true]{background:#ff6800}.note{padding:0 20px 18px;color:#667067;font:10px/1.5 system-ui,sans-serif}
  </style>
</head>
<body>
  <main class="shell">
    <header class="head"><strong>PORT-AVATAR-005.7B · IDLE + BLINK</strong><span>REVIEW ONLY · NO RUNTIME CHANGE</span></header>
    <section class="stage"><canvas width="320" height="460" aria-label="Animated review proof of Dolly's subtle breathing and natural blink"></canvas></section>
    <div class="controls"><button type="button" data-action="toggle" data-active="true">Pause</button><button type="button" data-bg="#0b100d">Dark</button><button type="button" data-bg="#ff6800">Orange</button><button type="button" data-bg="#f3eee5">Cream</button><button type="button" data-bg="checker">Checker</button></div>
    <p class="note">Ten unique authored drawings. Fixed 320×460 canvas, 440 px character height, y=448 anchor, binary transparency, unchanged mouth and identity landmarks.</p>
  </main>
  <script>
    const durations=${JSON.stringify(proofManifest.loop.durationsMs)};const canvas=document.querySelector('canvas');const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;const image=new Image();image.src='./jolene-avatar-idle-proof-atlas.png';let frame=0;let playing=true;let timer;function draw(){context.clearRect(0,0,320,460);context.drawImage(image,frame*320,0,320,460,0,0,320,460)}function schedule(){clearTimeout(timer);if(!playing)return;timer=setTimeout(()=>{frame=(frame+1)%durations.length;draw();schedule()},durations[frame])}image.addEventListener('load',()=>{draw();schedule()});document.querySelector('[data-action=toggle]').addEventListener('click',event=>{playing=!playing;event.currentTarget.textContent=playing?'Pause':'Play';event.currentTarget.dataset.active=String(playing);schedule()});document.querySelectorAll('[data-bg]').forEach(button=>button.addEventListener('click',()=>{const stage=document.querySelector('.stage');if(button.dataset.bg==='checker'){stage.style.backgroundColor='#eee';stage.style.backgroundImage='linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)';stage.style.backgroundSize='20px 20px';stage.style.backgroundPosition='0 0,0 10px,10px -10px,-10px 0'}else{stage.style.background=button.dataset.bg}}));
  </script>
</body>
</html>\n`;
  playerBytes = Buffer.from(player);

  const frameCards = rendered.frameDataUrls.map((source, index) => `<article><div><img src="${source}" alt="" /></div><p><strong>F${String(index).padStart(2, '0')}</strong><span>${proofManifest.loop.durationsMs[index]} ms</span><small>${audit.frameAudits[index].changedPixels} authored px</small></p></article>`).join('');
  await page.setContent(`<!doctype html>
    <html lang="en"><head><meta charset="utf-8" /><style>
      *{box-sizing:border-box}html,body{margin:0;background:#f3eee5;color:#111713}body{padding:34px 40px 42px;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.mono,.eyebrow,h2,article p{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.eyebrow{color:#df3e1b;font-size:11px;font-weight:800;letter-spacing:.12em}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}h1{margin:5px 0 0;font-size:40px;line-height:1;letter-spacing:-.045em}header p{margin:9px 0 0;color:#667067;font-size:14px}.stamp{padding:10px 12px;border:1px solid #111713;font-size:9px;font-weight:800;line-height:1.4}.strip{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.strip article{border:1px solid #aaa69d;background:#fffaf1;overflow:hidden}.strip article>div{height:290px;display:grid;place-items:end center;background:#0b100d}.strip img{display:block;width:188px;height:270px;object-fit:contain;object-position:bottom center;image-rendering:pixelated}.strip p{margin:0;padding:8px 10px;display:grid;grid-template-columns:1fr auto;gap:3px 8px;border-top:1px solid #586059;font-size:9px}.strip strong{letter-spacing:.1em}.strip span,.strip small{color:#667067}.strip small{grid-column:1/-1}.proofs{display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:10px;margin-top:10px}.panel{min-width:0;min-height:330px;border:1px solid #aaa69d;background:#fffaf1;overflow:hidden}.panel h2{margin:0;padding:10px 12px;border-bottom:1px solid #aaa69d;font-size:9px;letter-spacing:.1em}.faces{padding:14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.faces figure{min-width:0;margin:0}.faces div{height:220px;display:grid;place-items:center;background:#0b100d;overflow:hidden}.faces img{display:block;width:100%;height:220px;object-fit:cover;image-rendering:pixelated}.faces figcaption{padding:7px;border:1px solid #aaa69d;border-top:0;font:8px ui-monospace,monospace}.seam{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px}.seam figure{margin:0;display:grid;place-items:end center;background:#f3eee5;overflow:hidden}.seam img{width:160px;height:230px;image-rendering:pixelated}.seam figcaption{align-self:end;width:100%;padding:6px;background:#fffaf1;border-top:1px solid #aaa69d;font:8px ui-monospace,monospace}.metrics{margin:0;padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.metrics div{padding:10px;border:1px solid #d2ccc1}.metrics dt{font:7px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#667067}.metrics dd{margin:5px 0 0;font-size:17px;font-weight:800}.pass{color:#167d45}
    </style></head><body>
      <header><div><div class="eyebrow">PORT-AVATAR-005.7B / MOTION PROOF</div><h1>Dolly idle + blink loop</h1><p>Subtle authored motion from the locked canonical master. No redraw, scale, rotation, or runtime integration.</p></div><div class="stamp mono">REVIEW ONLY<br />10 UNIQUE FRAMES<br />MASTER ${proofManifest.master.sha256.slice(0, 12)}</div></header>
      <section class="strip">${frameCards}</section>
      <section class="proofs">
        <article class="panel"><h2>OPEN → HALF → CLOSED</h2><div class="faces"><figure><div><img src="${rendered.faceDataUrls[0]}" alt="" /></div><figcaption>OPEN / F04</figcaption></figure><figure><div><img src="${rendered.faceDataUrls[1]}" alt="" /></div><figcaption>HALF / F05</figcaption></figure><figure><div><img src="${rendered.faceDataUrls[2]}" alt="" /></div><figcaption>CLOSED / F06</figcaption></figure></div></article>
        <article class="panel"><h2>LAST → FIRST SEAM</h2><div class="seam"><figure><img src="${rendered.frameDataUrls[9]}" alt="" /><figcaption>F09</figcaption></figure><figure><img src="${rendered.frameDataUrls[0]}" alt="" /><figcaption>F00</figcaption></figure><figure><img src="${rendered.diffDataUrl}" alt="" /><figcaption>DIFF</figcaption></figure><figure><img src="${rendered.frameDataUrls[2]}" alt="" /><figcaption>BREATH PEAK</figcaption></figure></div></article>
        <article class="panel"><h2>DETERMINISTIC QA</h2><dl class="metrics"><div><dt>Unique frames</dt><dd class="pass">10 / 10</dd></div><div><dt>Loop seam</dt><dd>${(rendered.seamChangeRatio * 100).toFixed(3)}%</dd></div><div><dt>Canvas</dt><dd>320×460</dd></div><div><dt>Height</dt><dd>440 px</dd></div><div><dt>Baseline</dt><dd>y 448</dd></div><div><dt>Scale</dt><dd>1.000</dd></div><div><dt>Alpha</dt><dd class="pass">0 / 255</dd></div><div><dt>Mouth drift</dt><dd class="pass">0 px</dd></div><div><dt>Face drift</dt><dd class="pass">0 px</dd></div><div><dt>Runtime edits</dt><dd class="pass">NONE</dd></div></dl></article>
      </section>
    </body></html>`);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  screenshotBytes = await page.screenshot({ type: 'png', fullPage: true });
} finally {
  await browser.close();
}

assert.ok(atlasBytes.length > 200_000, `The idle-proof atlas is unexpectedly small at ${atlasBytes.length} bytes.`);
assert.ok(screenshotBytes.length > 150_000, `The idle-proof review board is unexpectedly small at ${screenshotBytes.length} bytes.`);

if (checkOnly) {
  const [committedAtlas, committedBoard, committedPlayer] = await Promise.all([
    readFile(atlasUrl),
    readFile(boardUrl),
    readFile(playerUrl),
  ]);
  assert.equal(sha256(atlasBytes), sha256(committedAtlas), 'The deterministic idle-proof atlas is stale.');
  assert.equal(sha256(committedAtlas), proofManifest.outputs.atlas.sha256);
  assert.equal(sha256(committedBoard), proofManifest.outputs.board.sha256);
  assert.equal(sha256(playerBytes), sha256(committedPlayer), 'The idle-proof player is stale.');
  assert.equal(sha256(committedPlayer), proofManifest.outputs.player.sha256);
  assert.equal(renderInputSha256, proofManifest.outputs.renderInputSha256);
  console.log(`Dolly idle proof passed: ${audit.frameHashes.length} unique authored frames, fixed 440px height and y=448 baseline, binary alpha, locked face and mouth, ${(audit.seamChangeRatio * 100).toFixed(3)}% loop seam.`);
} else {
  await mkdir(new URL('../docs/review/', import.meta.url), { recursive: true });
  await Promise.all([
    writeFile(atlasUrl, atlasBytes),
    writeFile(boardUrl, screenshotBytes),
    writeFile(playerUrl, playerBytes),
  ]);
  proofManifest.outputs.atlas.sha256 = sha256(atlasBytes);
  proofManifest.outputs.board.sha256 = sha256(screenshotBytes);
  proofManifest.outputs.player.sha256 = sha256(playerBytes);
  proofManifest.outputs.renderInputSha256 = renderInputSha256;
  await writeFile(proofManifestUrl, `${JSON.stringify(proofManifest, null, 2)}\n`);
  console.log(`Built Dolly idle + blink review proof at ${boardUrl.pathname}`);
}
