import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const checkOnly = process.argv.includes('--check');
const reviewDirectory = fileURLToPath(new URL('../docs/review/', import.meta.url));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const frameFiles = {
  rest: 'jolene-greet-v2-rest.png',
  early: 'jolene-greet-v2-early.png',
  mid: 'jolene-greet-v2-mid.png',
  apex: 'jolene-greet-v2-apex.png',
  secondary: 'jolene-greet-v2-secondary.png',
  settle: 'jolene-greet-v2-settle.png',
};
const expectedHashes = {
  rest: 'a21a02ca80e28ce7c9e816cf9bf6c0ec9afcab8879e53ddcacebf1ee488387ed',
  early: 'a33d7511c8e4dc07531d82dfc405a79bddd57000d45d1f6e2acea2aec08f7489',
  mid: '275bac376d15c93ce4ca1c9a7e7db60c520f5fab42880952c9ca0cec09c0d7a4',
  apex: 'a4b741620e625e5e25ad1b6f4fa73346dbb4adc4a69413b478b11b715b66b388',
  secondary: '99bbd6cf85ac2ceb9d2d22804369ccad096d5be85bb6dddadb4c64cea24c3043',
  settle: '4b17632c258a46a67a5b4131ad9e8cb81534da1a5651a422dc33c5b0ca0e6348',
};
const schedule = [
  ['REST', 'rest', 260],
  ['EARLY', 'early', 140],
  ['MID', 'mid', 130],
  ['APEX', 'apex', 170],
  ['SECONDARY', 'secondary', 120],
  ['APEX_REUSE', 'apex', 150],
  ['SETTLE', 'settle', 140],
  ['MID_REUSE', 'mid', 130],
  ['EARLY_REUSE', 'early', 140],
  ['REST_REUSE', 'rest', 300],
];

const frameBytes = Object.fromEntries(await Promise.all(Object.entries(frameFiles).map(async ([key, name]) => {
  const bytes = await readFile(`${reviewDirectory}/${name}`);
  assert.equal(sha256(bytes), expectedHashes[key], `${name} changed.`);
  return [key, bytes];
})));
const sources = Object.fromEntries(Object.entries(frameBytes).map(([key, bytes]) => [key, `data:image/png;base64,${bytes.toString('base64')}`]));

const browser = await chromium.launch({ headless: true });
let rendered;
try {
  const page = await browser.newPage();
  rendered = await page.evaluate(async ({ imageSources, order }) => {
    const width = 320;
    const height = 460;
    const decoded = {};
    for (const [key, source] of Object.entries(imageSources)) {
      const image = new Image();
      image.src = source;
      await image.decode();
      if (image.width !== width || image.height !== height) throw new Error(`${key} is not 320x460.`);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0);
      decoded[key] = { image, pixels: context.getImageData(0, 0, width, height).data };
    }
    const frameAudits = {};
    for (const [key, { pixels }] of Object.entries(decoded)) {
      let minimumX = width; let minimumY = height; let maximumX = -1; let maximumY = -1;
      let nonBinaryAlphaPixels = 0; let transparentRgbPixels = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const pixelIndex = offset / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        const alpha = pixels[offset + 3];
        if (alpha !== 0 && alpha !== 255) nonBinaryAlphaPixels += 1;
        if (alpha === 0 && (pixels[offset] || pixels[offset + 1] || pixels[offset + 2])) transparentRgbPixels += 1;
        if (!alpha) continue;
        minimumX = Math.min(minimumX, x); minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x); maximumY = Math.max(maximumY, y);
      }
      frameAudits[key] = {
        bboxExclusive: [minimumX, minimumY, maximumX + 1, maximumY + 1],
        characterHeight: maximumY - minimumY + 1,
        nonBinaryAlphaPixels,
        transparentRgbPixels,
      };
    }
    const contact = document.createElement('canvas');
    contact.width = width * 5;
    contact.height = height * 2;
    const contactContext = contact.getContext('2d');
    contactContext.fillStyle = '#080d0b';
    contactContext.fillRect(0, 0, contact.width, contact.height);
    order.forEach((key, index) => contactContext.drawImage(decoded[key].image, (index % 5) * width, Math.floor(index / 5) * height));
    const contact4x = document.createElement('canvas');
    contact4x.width = contact.width * 4;
    contact4x.height = contact.height * 4;
    const zoomContext = contact4x.getContext('2d');
    zoomContext.imageSmoothingEnabled = false;
    zoomContext.drawImage(contact, 0, 0, contact4x.width, contact4x.height);
    return { contact1x: contact.toDataURL('image/png'), contact4x: contact4x.toDataURL('image/png'), frameAudits };
  }, { imageSources: sources, order: schedule.map(([, key]) => key) });
} finally {
  await browser.close();
}

const decode = (dataUrl) => Buffer.from(dataUrl.split(',')[1], 'base64');
const contact1x = decode(rendered.contact1x);
const contact4x = decode(rendered.contact4x);
for (const [key, audit] of Object.entries(rendered.frameAudits)) {
  assert.deepEqual(audit.bboxExclusive, [19, 8, 300, 448], `${key} changes locked bounds.`);
  assert.equal(audit.characterHeight, 440, `${key} changes character height.`);
  assert.equal(audit.nonBinaryAlphaPixels, 0, `${key} has non-binary alpha.`);
  assert.equal(audit.transparentRgbPixels, 0, `${key} contaminates transparent RGB.`);
}
const totalDurationMs = schedule.reduce((sum, [, , duration]) => sum + duration, 0);
assert.equal(totalDurationMs, 1680);
const player = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dolly Greet v2 approved review</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3eee5;color:#111713;font-family:ui-monospace,monospace}.shell{width:min(96vw,780px);border:1px solid #111713;background:#fffaf1}.head{display:flex;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #111713}.head strong{letter-spacing:.08em}.head span{font-size:9px;color:#667067}.stage{height:560px;display:grid;place-items:end center;background:#080d0b;overflow:auto}.stage img{width:320px;height:460px;object-fit:contain;image-rendering:pixelated}.stage[data-zoom="4"]{height:1900px}.stage[data-zoom="4"] img{width:1280px;height:1840px}.controls{display:flex;gap:8px;padding:12px 18px;border-top:1px solid #111713}.controls button{min-height:40px;padding:0 14px;border:1px solid #111713;background:#fffaf1;font:700 10px ui-monospace,monospace}.note{padding:0 18px 16px;color:#667067;font:10px/1.5 system-ui,sans-serif}</style></head><body><main class="shell"><header class="head"><strong>PORT-AVATAR-005.7C · GREET V2</strong><span>APPROVED REVIEW · LOOPS <b data-loops>0</b></span></header><section class="stage" data-zoom="1"><img alt="Dolly greeting animation review"></section><div class="controls"><button type="button" data-play>Pause</button><button type="button" data-zoom>View exact 4x</button></div><p class="note">Ten timed frames over 1.68 seconds. Byte-exact reverse key reuse, native 320x460, 440 px character height, fixed y=448 contact, and no runtime integration.</p></main><script>const frames=${JSON.stringify(schedule.map(([name, key, durationMs]) => ({ name, file: frameFiles[key], durationMs })))};const image=document.querySelector('img');let frame=0;let loops=0;let playing=true;let timer;function step(){clearTimeout(timer);if(!playing)return;const current=frames[frame];image.src=current.file;timer=setTimeout(()=>{frame=(frame+1)%frames.length;if(frame===0){loops+=1;document.querySelector('[data-loops]').textContent=String(loops)}step()},current.durationMs)}document.querySelector('[data-play]').addEventListener('click',event=>{playing=!playing;event.currentTarget.textContent=playing?'Pause':'Play';step()});document.querySelector('[data-zoom]').addEventListener('click',event=>{const stage=document.querySelector('.stage');stage.dataset.zoom=stage.dataset.zoom==='1'?'4':'1';event.currentTarget.textContent=stage.dataset.zoom==='1'?'View exact 4x':'View native 1x'});step();</script></body></html>\n`;
const audit = {
  schemaVersion: '1.0.0',
  status: 'review_only_approved_for_next_integration_gate',
  ticket: 'PORT-AVATAR-005.7C',
  runtimeIntegrationChanged: false,
  deploymentAuthorized: false,
  qa: { actualSpeedCyclesReviewed: 5, native1x: 'pass', exact4x: 'pass', motion: 'pass', identity: 'pass', anatomy: 'pass', alphaAndArtifacts: 'pass' },
  totalDurationMs,
  schedule: schedule.map(([name, key, durationMs]) => ({ name, frame: key, durationMs, sha256: expectedHashes[key] })),
  sourceFrameSha256: expectedHashes,
  frameAudits: rendered.frameAudits,
  exactReverseReuse: { rest: true, early: true, mid: true, apex: true },
  advisoryAccepted: [
    'Half-open travel hands have lower contour density than the spread-finger apex; specialist native-size visual QA passed without adding artificial stipple.',
  ],
};
const outputs = {
  'jolene-greet-v2-contact-1x.png': contact1x,
  'jolene-greet-v2-contact-4x.png': contact4x,
  'jolene-greet-v2-player.html': Buffer.from(player),
  'jolene-greet-v2-audit.json': Buffer.from(`${JSON.stringify(audit, null, 2)}\n`),
};
await mkdir(reviewDirectory, { recursive: true });
for (const [name, bytes] of Object.entries(outputs)) {
  const path = `${reviewDirectory}/${name}`;
  if (checkOnly) {
    const existing = await readFile(path);
    assert.deepEqual(existing, bytes, `${name} is stale; run build:jolene-greet-review.`);
  } else {
    await writeFile(path, bytes);
  }
}
console.log(JSON.stringify({ checkOnly, totalDurationMs, outputs: Object.fromEntries(Object.entries(outputs).map(([name, bytes]) => [name, sha256(bytes)])) }, null, 2));
