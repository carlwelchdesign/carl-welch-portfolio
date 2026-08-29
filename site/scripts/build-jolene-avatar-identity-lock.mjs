import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const masterUrl = new URL('../public/jolene/jolene-country-host-master.png', import.meta.url);
const specificationUrl = new URL('../docs/jolene-avatar-identity-lock.v1.json', import.meta.url);
const boardUrl = new URL('../docs/review/jolene-avatar-identity-lock.png', import.meta.url);
const checkOnly = process.argv.includes('--check');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const asDataUrl = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const masterBytes = await readFile(masterUrl);
const specification = JSON.parse(await readFile(specificationUrl, 'utf8'));

assert.equal(sha256(masterBytes), specification.master.sha256, 'The approved Dolly identity master changed.');
assert.equal(specification.identityPolicy.canonicalMasterOnly, true);
assert.equal(specification.identityPolicy.redrawOrRegenerationAllowed, false);
assert.equal(specification.identityPolicy.runtimeIntegrationChanged, false);
assert.equal(specification.productionFrame.stateScaleVariance, 0);
assert.equal(specification.productionFrame.fractionalTransformsAllowed, false);
assert.ok(specification.poseReferenceDisposition.some(({ productionPixelsAllowed }) => productionPixelsAllowed));
assert.deepEqual(
  [...new Set(specification.poseReferenceDisposition
    .filter(({ productionPixelsAllowed }) => productionPixelsAllowed)
    .map(({ reference }) => reference))],
  [specification.master.path],
);

const renderSpecification = structuredClone(specification);
renderSpecification.reviewBoard = { path: specification.reviewBoard.path };
const renderInputSha256 = sha256(Buffer.from(JSON.stringify(renderSpecification)));

const browser = await chromium.launch({ headless: true });
let screenshotBytes;
let pixelAudit;
try {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1280 }, deviceScaleFactor: 1 });
  const rendered = await page.evaluate(async ({ masterSource, spec }) => {
    const image = new Image();
    image.src = masterSource;
    await image.decode();

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) throw new Error('Identity-lock source canvas is unavailable.');
    sourceContext.drawImage(image, 0, 0);
    const sourceImageData = sourceContext.getImageData(0, 0, image.width, image.height);
    const sourcePixels = sourceImageData.data;

    let nonBinaryAlphaPixels = 0;
    let transparentRgbPixels = 0;
    let opaquePixels = 0;
    let minimumX = image.width;
    let minimumY = image.height;
    let maximumX = -1;
    let maximumY = -1;
    for (let offset = 0; offset < sourcePixels.length; offset += 4) {
      const alpha = sourcePixels[offset + 3];
      if (alpha !== 0 && alpha !== 255) nonBinaryAlphaPixels += 1;
      if (alpha === 0) {
        if (sourcePixels[offset] !== 0 || sourcePixels[offset + 1] !== 0 || sourcePixels[offset + 2] !== 0) {
          transparentRgbPixels += 1;
        }
        continue;
      }
      opaquePixels += 1;
      const pixelIndex = offset / 4;
      const x = pixelIndex % image.width;
      const y = Math.floor(pixelIndex / image.width);
      minimumX = Math.min(minimumX, x);
      minimumY = Math.min(minimumY, y);
      maximumX = Math.max(maximumX, x);
      maximumY = Math.max(maximumY, y);
    }

    const bounds = {
      x: minimumX,
      y: minimumY,
      width: maximumX - minimumX + 1,
      height: maximumY - minimumY + 1,
    };
    const frame = spec.productionFrame;
    const expectedFramePoint = ({ x, y }) => ({
      x: Math.round(frame.drawBounds.x + ((x - bounds.x) * frame.drawBounds.width) / bounds.width),
      y: Math.round(frame.drawBounds.y + ((y - bounds.y) * frame.drawBounds.height) / bounds.height),
    });
    const landmarkMismatches = spec.landmarks.filter((landmark) => {
      const expected = expectedFramePoint(landmark.source);
      return expected.x !== landmark.frame.x || expected.y !== landmark.frame.y;
    }).map(({ id }) => id);

    const paletteMismatches = spec.paletteAnchors.filter((anchor) => {
      const offset = (anchor.source.y * image.width + anchor.source.x) * 4;
      return anchor.rgba.some((channel, index) => channel !== sourcePixels[offset + index]);
    }).map(({ id }) => id);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = frame.width;
    frameCanvas.height = frame.height;
    const frameContext = frameCanvas.getContext('2d', { willReadFrequently: true });
    if (!frameContext) throw new Error('Identity-lock frame canvas is unavailable.');
    frameContext.imageSmoothingEnabled = false;
    frameContext.drawImage(
      sourceCanvas,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      frame.drawBounds.x,
      frame.drawBounds.y,
      frame.drawBounds.width,
      frame.drawBounds.height,
    );

    const silhouetteCanvas = document.createElement('canvas');
    silhouetteCanvas.width = frame.width;
    silhouetteCanvas.height = frame.height;
    const silhouetteContext = silhouetteCanvas.getContext('2d', { willReadFrequently: true });
    if (!silhouetteContext) throw new Error('Identity-lock silhouette canvas is unavailable.');
    const framedImageData = frameContext.getImageData(0, 0, frame.width, frame.height);
    const silhouetteImageData = new ImageData(frame.width, frame.height);
    for (let offset = 0; offset < framedImageData.data.length; offset += 4) {
      if (framedImageData.data[offset + 3] === 0) continue;
      silhouetteImageData.data[offset] = 8;
      silhouetteImageData.data[offset + 1] = 12;
      silhouetteImageData.data[offset + 2] = 9;
      silhouetteImageData.data[offset + 3] = 255;
    }
    silhouetteContext.putImageData(silhouetteImageData, 0, 0);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = image.width;
    maskCanvas.height = image.height;
    const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskContext) throw new Error('Identity-lock mask canvas is unavailable.');
    maskContext.globalAlpha = 0.2;
    maskContext.drawImage(sourceCanvas, 0, 0);
    maskContext.globalAlpha = 1;
    const maskImageData = maskContext.getImageData(0, 0, image.width, image.height);
    const maskPixels = maskImageData.data;
    const selection = spec.intentionalWhiteMasks.selection;
    const maskCounts = {};
    const parseColor = (color) => [
      Number.parseInt(color.slice(1, 3), 16),
      Number.parseInt(color.slice(3, 5), 16),
      Number.parseInt(color.slice(5, 7), 16),
    ];
    for (const region of spec.intentionalWhiteMasks.regions) {
      const [red, green, blue] = parseColor(region.reviewColor);
      const regionSelection = { ...selection, ...region.selectionOverride };
      let count = 0;
      const { x, y, width, height } = region.sourceRect;
      for (let pixelY = y; pixelY < y + height; pixelY += 1) {
        for (let pixelX = x; pixelX < x + width; pixelX += 1) {
          const offset = (pixelY * image.width + pixelX) * 4;
          const channels = [sourcePixels[offset], sourcePixels[offset + 1], sourcePixels[offset + 2]];
          const minimum = Math.min(...channels);
          const maximum = Math.max(...channels);
          if (
            sourcePixels[offset + 3] !== regionSelection.alpha
            || minimum < regionSelection.minimumChannel
            || maximum - minimum > regionSelection.maximumChannelSpread
          ) continue;
          maskPixels[offset] = red;
          maskPixels[offset + 1] = green;
          maskPixels[offset + 2] = blue;
          maskPixels[offset + 3] = 255;
          count += 1;
        }
      }
      maskCounts[region.id] = count;
    }
    maskContext.putImageData(maskImageData, 0, 0);

    const fittedMaskCanvas = document.createElement('canvas');
    fittedMaskCanvas.width = frame.width;
    fittedMaskCanvas.height = frame.height;
    const fittedMaskContext = fittedMaskCanvas.getContext('2d');
    if (!fittedMaskContext) throw new Error('Identity-lock fitted mask canvas is unavailable.');
    fittedMaskContext.imageSmoothingEnabled = false;
    fittedMaskContext.drawImage(
      maskCanvas,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      frame.drawBounds.x,
      frame.drawBounds.y,
      frame.drawBounds.width,
      frame.drawBounds.height,
    );

    return {
      image: { width: image.width, height: image.height },
      bounds,
      opaquePixels,
      nonBinaryAlphaPixels,
      transparentRgbPixels,
      landmarkMismatches,
      paletteMismatches,
      maskCounts,
      frameDataUrl: frameCanvas.toDataURL('image/png'),
      silhouetteDataUrl: silhouetteCanvas.toDataURL('image/png'),
      maskDataUrl: fittedMaskCanvas.toDataURL('image/png'),
    };
  }, { masterSource: asDataUrl(masterBytes), spec: specification });

  pixelAudit = {
    image: rendered.image,
    bounds: rendered.bounds,
    opaquePixels: rendered.opaquePixels,
    nonBinaryAlphaPixels: rendered.nonBinaryAlphaPixels,
    transparentRgbPixels: rendered.transparentRgbPixels,
    landmarkMismatches: rendered.landmarkMismatches,
    paletteMismatches: rendered.paletteMismatches,
    intentionalWhiteMaskCounts: rendered.maskCounts,
  };

  assert.deepEqual(rendered.image, { width: specification.master.width, height: specification.master.height });
  assert.deepEqual(rendered.bounds, specification.master.opaqueBounds);
  assert.equal(rendered.nonBinaryAlphaPixels, 0, 'The canonical master contains partial alpha.');
  assert.equal(rendered.transparentRgbPixels, 0, 'Transparent master pixels must have zero RGB channels.');
  assert.deepEqual(rendered.landmarkMismatches, [], 'Locked landmark mapping drifted.');
  assert.deepEqual(rendered.paletteMismatches, [], 'Locked palette anchor pixels drifted.');
  for (const [maskId, count] of Object.entries(rendered.maskCounts)) {
    assert.ok(count > 0, `Intentional-white mask ${maskId} selected no protected pixels.`);
  }

  const landmarkMarkup = specification.landmarks.map((landmark, index) => {
    const side = index % 2 === 0 ? 'right' : 'left';
    return `<span class="landmark landmark-${side}" style="left:${landmark.frame.x}px;top:${landmark.frame.y}px" title="${escapeHtml(landmark.intent)}"><i></i><b>${escapeHtml(landmark.id)}</b></span>`;
  }).join('');
  const paletteMarkup = specification.paletteAnchors.map((anchor) => {
    const color = `rgb(${anchor.rgba.slice(0, 3).join(' ')})`;
    return `<li><span style="background:${color}"></span><div><strong>${escapeHtml(anchor.id)}</strong><small>${anchor.rgba.slice(0, 3).join(', ')}</small></div></li>`;
  }).join('');
  const masksMarkup = specification.intentionalWhiteMasks.regions.map((region) => `<li><span style="background:${region.reviewColor}"></span><strong>${escapeHtml(region.id)}</strong><small>${rendered.maskCounts[region.id].toLocaleString()} protected pixels</small></li>`).join('');
  const poseMarkup = specification.poseReferenceDisposition.map((pose) => `<tr><th>${escapeHtml(pose.state)}</th><td>${escapeHtml(pose.retain)}</td><td class="${pose.productionPixelsAllowed ? 'canonical' : 'reference'}">${pose.productionPixelsAllowed ? 'CANONICAL PIXELS' : 'POSE ONLY'}</td></tr>`).join('');

  await page.setContent(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 100%; min-height: 100%; background: #f3eee5; color: #111713; }
          body { padding: 34px 40px 40px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
          header { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 22px; }
          .eyebrow, .stamp, .panel h2, th, .state { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; }
          .eyebrow { color: #e23d1b; font-size: 11px; font-weight: 800; }
          h1 { margin: 5px 0 0; font-size: 38px; line-height: 1; letter-spacing: -.045em; }
          header p { margin: 9px 0 0; color: #5a625b; font-size: 14px; }
          .stamp { border: 1px solid #111713; padding: 10px 13px; font-size: 9px; font-weight: 800; line-height: 1.4; }
          .top { display: grid; grid-template-columns: 1.45fr 1fr 1fr; gap: 12px; }
          .panel { min-width: 0; border: 1px solid #aaa69d; background: #fffaf1; overflow: hidden; }
          .panel h2 { margin: 0; padding: 11px 13px; border-bottom: 1px solid #aaa69d; font-size: 10px; }
          .stage { min-height: 492px; padding: 16px; display: grid; place-items: center; background-color: #0b100d; background-image: linear-gradient(45deg, #18201a 25%, transparent 25%), linear-gradient(-45deg, #18201a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18201a 75%), linear-gradient(-45deg, transparent 75%, #18201a 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0; }
          .frame { position: relative; width: 320px; height: 460px; }
          .frame img { display: block; width: 320px; height: 460px; image-rendering: pixelated; }
          .frame::after { content: ''; position: absolute; left: 0; right: 0; top: 448px; border-top: 1px solid #ff5b38; }
          .landmark { position: absolute; z-index: 2; width: 1px; height: 1px; }
          .landmark i { position: absolute; left: -3px; top: -3px; width: 7px; height: 7px; border: 1px solid #53d8fb; background: #0b100d; border-radius: 50%; }
          .landmark b { position: absolute; top: -5px; padding: 2px 4px; background: rgba(11,16,13,.88); color: #fffaf1; white-space: nowrap; font: 6px/1 ui-monospace, monospace; letter-spacing: .04em; text-transform: uppercase; }
          .landmark-right b { left: 7px; }
          .landmark-left b { right: 7px; }
          .canonical-frame { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
          .rules { margin: 0; padding: 0; list-style: none; }
          .rules li { padding: 10px 0; border-bottom: 1px solid #d4cfc5; }
          .rules li:last-child { border-bottom: 0; }
          .rules strong { display: block; font-size: 12px; }
          .rules small { display: block; margin-top: 3px; color: #687068; font-size: 10px; line-height: 1.35; }
          .visual { min-height: 492px; display: grid; place-items: center; background: #0b100d; }
          .visual-silhouette { background: #f3eee5; }
          .visual img { display: block; width: 320px; height: 460px; image-rendering: pixelated; }
          .composites { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
          .composite { min-height: 276px; display: grid; grid-template-rows: 1fr auto; border: 1px solid #aaa69d; overflow: hidden; }
          .composite figure { margin: 0; min-height: 240px; display: grid; place-items: end center; overflow: hidden; }
          .composite img { width: 168px; height: 242px; object-fit: contain; object-position: bottom center; image-rendering: pixelated; }
          .composite figcaption { padding: 8px 10px; border-top: 1px solid rgba(17,23,19,.25); background: #fffaf1; font: 8px ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; }
          .checker figure { background-color: #eee; background-image: linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%); background-size: 16px 16px; background-position: 0 0,0 8px,8px -8px,-8px 0; }
          .dark figure { background: #0b100d; }
          .orange figure { background: #ff6800; }
          .cream figure { background: #f3eee5; }
          .bottom { display: grid; grid-template-columns: .9fr 1.45fr; gap: 12px; margin-top: 12px; }
          .palette { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 0; padding: 14px; list-style: none; }
          .palette li { min-width: 0; display: grid; grid-template-columns: 34px 1fr; gap: 8px; align-items: center; }
          .palette li > span { width: 34px; height: 30px; border: 1px solid rgba(17,23,19,.24); }
          .palette strong, .palette small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .palette strong { font-size: 10px; }
          .palette small { color: #687068; font: 8px ui-monospace, monospace; }
          .masks { margin: 0; padding: 0 14px 14px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px; list-style: none; }
          .masks li { display: grid; grid-template-columns: 12px 1fr; align-items: center; gap: 0 7px; }
          .masks li > span { grid-row: 1 / span 2; width: 12px; height: 28px; }
          .masks strong { font-size: 9px; }
          .masks small { color: #687068; font-size: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 7px 9px; border-bottom: 1px solid #d4cfc5; text-align: left; font-size: 9px; }
          th { width: 76px; font-size: 8px; }
          td:last-child { width: 116px; font: 800 7px ui-monospace, monospace; letter-spacing: .06em; }
          .canonical { color: #167d45; }
          .reference { color: #c13918; }
        </style>
      </head>
      <body>
        <header>
          <div><div class="eyebrow">PORT-AVATAR-005.7A / IDENTITY LOCK</div><h1>Dolly canonical model sheet</h1><p>One approved identity. Every other sprite is pose reference only.</p></div>
          <div class="stamp">REVIEW ONLY<br />MASTER ${specification.master.sha256.slice(0, 12)}<br />NO RUNTIME CHANGE</div>
        </header>
        <section class="top">
          <article class="panel"><h2>Locked landmarks + baseline</h2><div class="stage"><div class="canonical-frame"><div class="frame"><img src="${rendered.frameDataUrl}" alt="" />${landmarkMarkup}</div><ul class="rules"><li><strong>320 × 460 canvas</strong><small>281 × 440 canonical draw bounds</small></li><li><strong>Baseline y = 448</strong><small>Zero tolerance across every state</small></li><li><strong>Crown y = 8</strong><small>Maximum organic variance: 2 px</small></li><li><strong>Scale variance = 0</strong><small>No fractional transforms or whole-image pumping</small></li><li><strong>Face stays registered</strong><small>Eyes, nose, mouth, chin, hoops, knot</small></li></ul></div></div></article>
          <article class="panel"><h2>Silhouette lock</h2><div class="visual visual-silhouette"><img src="${rendered.silhouetteDataUrl}" alt="" /></div></article>
          <article class="panel"><h2>Protected intentional whites</h2><div class="visual"><img src="${rendered.maskDataUrl}" alt="" /></div></article>
        </section>
        <section class="composites" aria-label="Background composites">
          <article class="composite checker"><figure><img src="${rendered.frameDataUrl}" alt="" /></figure><figcaption>Transparency checker</figcaption></article>
          <article class="composite dark"><figure><img src="${rendered.frameDataUrl}" alt="" /></figure><figcaption>Portfolio dark #0b100d</figcaption></article>
          <article class="composite orange"><figure><img src="${rendered.frameDataUrl}" alt="" /></figure><figcaption>Jolene orange #ff6800</figcaption></article>
          <article class="composite cream"><figure><img src="${rendered.frameDataUrl}" alt="" /></figure><figcaption>Portfolio cream #f3eee5</figcaption></article>
        </section>
        <section class="bottom">
          <article class="panel"><h2>Palette anchors</h2><ul class="palette">${paletteMarkup}</ul><h2>Intentional-white masks</h2><ul class="masks">${masksMarkup}</ul></article>
          <article class="panel"><h2>State pose-reference disposition</h2><table><tbody>${poseMarkup}</tbody></table></article>
        </section>
      </body>
    </html>`);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  screenshotBytes = await page.screenshot({ type: 'png', fullPage: true });
} finally {
  await browser.close();
}

assert.ok(screenshotBytes.length > 150_000, 'The Dolly identity-lock review board is unexpectedly small.');

if (checkOnly) {
  const committedBoardBytes = await readFile(boardUrl);
  assert.equal(sha256(committedBoardBytes), specification.reviewBoard.sha256, 'The identity-lock review board fingerprint is stale.');
  assert.equal(renderInputSha256, specification.reviewBoard.renderInputSha256, 'The identity-lock review board inputs changed.');
  console.log(`Dolly identity lock passed: canonical master ${specification.master.sha256.slice(0, 12)}, 13 landmarks, binary alpha, ${Object.keys(pixelAudit.intentionalWhiteMaskCounts).length} protected white masks, and review-only pose disposition.`);
} else {
  await mkdir(new URL('../docs/review/', import.meta.url), { recursive: true });
  await writeFile(boardUrl, screenshotBytes);
  specification.reviewBoard.sha256 = sha256(screenshotBytes);
  specification.reviewBoard.renderInputSha256 = renderInputSha256;
  await writeFile(specificationUrl, `${JSON.stringify(specification, null, 2)}\n`);
  console.log(`Built Dolly identity-lock review board at ${boardUrl.pathname}`);
}
