import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const spriteManifestUrl = new URL('../docs/jolene-avatar-sprites.v1.json', import.meta.url);
const stateContractUrl = new URL('../app/jolene/avatar-state-contract.v1.json', import.meta.url);
const outputUrl = new URL('../docs/review/jolene-avatar-state-board.png', import.meta.url);
const reviewManifestUrl = new URL('../docs/jolene-avatar-review.v1.json', import.meta.url);
const checkOnly = process.argv.includes('--check');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const labels = Object.freeze({
  idle: ['IDLE', 'ready, warm, breathing'],
  blink: ['BLINK', 'quick natural reset'],
  greet: ['GREET', 'wave + “Howdy, folks!”'],
  listen: ['LISTEN', 'attentive head tilt'],
  think: ['THINK', 'considering the evidence'],
  speak: ['SPEAK', 'confident conversation'],
  evidence: ['EVIDENCE', 'points to cited support'],
  boundary: ['BOUNDARY', 'kind, firm, no bluffing'],
  offline: ['OFFLINE', 'poised, knowing shrug'],
  rest: ['REST', 'quiet after inactivity'],
});

const spriteManifest = JSON.parse(await readFile(spriteManifestUrl, 'utf8'));
const stateContract = JSON.parse(await readFile(stateContractUrl, 'utf8'));
const cards = [];

for (const frame of spriteManifest.frames) {
  const bytes = await readFile(new URL(`../public${frame.path}`, import.meta.url));
  cards.push({
    state: frame.state,
    label: labels[frame.state][0],
    note: labels[frame.state][1],
    dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
    fingerprint: sha256(bytes).slice(0, 10),
  });
}

const browser = await chromium.launch({ headless: true });
let screenshotBytes;
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 1120 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; min-height: 100%; background: #f3eee5; color: #161a17; }
          body { padding: 44px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
          header { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 24px; margin-bottom: 26px; }
          .eyebrow { color: #db3d19; font: 700 12px/1.2 ui-monospace, monospace; letter-spacing: .14em; }
          h1 { margin: 8px 0 4px; font-size: 40px; letter-spacing: -.04em; }
          .subhead { margin: 0; color: #586059; font-size: 16px; }
          .stamp { border: 1px solid #161a17; padding: 12px 16px; font: 700 11px/1.35 ui-monospace, monospace; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
          .card { position: relative; min-width: 0; height: 392px; overflow: hidden; border: 1px solid #b8b4ab; background: #0b100d; }
          .figure { position: absolute; inset: 16px 8px 67px; display: grid; place-items: end center; }
          .figure img { display: block; max-width: 100%; height: 300px; object-fit: contain; object-position: bottom center; image-rendering: pixelated; }
          .meta { position: absolute; inset: auto 0 0; min-height: 66px; padding: 12px 13px; border-top: 1px solid #4d554f; background: #111713; color: #f7f1e7; }
          .name { display: flex; justify-content: space-between; gap: 10px; font: 800 12px/1.2 ui-monospace, monospace; letter-spacing: .1em; }
          .hash { color: #7d8b80; font-size: 9px; letter-spacing: 0; }
          .note { margin-top: 7px; color: #b7c1b9; font-size: 12px; }
          .offline { border-color: #ff5b38; box-shadow: inset 0 0 0 1px #ff5b38; }
          .offline::before { content: "POISE + HUMOR"; position: absolute; z-index: 2; top: 10px; right: 10px; padding: 5px 7px; background: #ff5b38; color: #16100c; font: 900 9px/1 ui-monospace, monospace; letter-spacing: .08em; }
          .flow { margin-top: 14px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 12px; }
          .panel { min-height: 112px; padding: 16px 18px; border: 1px solid #b8b4ab; background: #fffaf1; }
          .panel-title { margin-bottom: 12px; font: 800 11px/1.2 ui-monospace, monospace; letter-spacing: .12em; }
          .sequence { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
          .pill { padding: 6px 9px; border-radius: 999px; background: #16201a; color: #f8f3e9; font: 700 10px/1 ui-monospace, monospace; }
          .arrow { color: #db3d19; font-weight: 900; }
          .rules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; color: #475048; font-size: 12px; line-height: 1.35; }
          .rule strong { display: block; color: #161a17; }
        </style>
      </head>
      <body>
        <header>
          <div>
            <div class="eyebrow">PORT-AVATAR-003 / MOTION REVIEW</div>
            <h1>Jolene state ensemble</h1>
            <p class="subhead">Country Host master, ten readable behaviors, one poised and humorous failure response.</p>
          </div>
          <div class="stamp">LOCAL REVIEW ONLY<br />NO DEPLOYMENT</div>
        </header>
        <main>
          <section class="grid">
            ${cards.map((card) => `<article class="card ${card.state === 'offline' ? 'offline' : ''}">
              <div class="figure"><img src="${card.dataUrl}" alt="${card.state}" /></div>
              <div class="meta"><div class="name"><span>${card.label}</span><span class="hash">${card.fingerprint}</span></div><div class="note">${card.note}</div></div>
            </article>`).join('')}
          </section>
          <section class="flow">
            <div class="panel">
              <div class="panel-title">PRIMARY CONVERSATION PATH</div>
              <div class="sequence"><span class="pill">GREET</span><span class="arrow">→</span><span class="pill">LISTEN</span><span class="arrow">→</span><span class="pill">THINK</span><span class="arrow">→</span><span class="pill">SPEAK</span><span class="arrow">→</span><span class="pill">EVIDENCE</span><span class="arrow">→</span><span class="pill">IDLE</span></div>
            </div>
            <div class="panel">
              <div class="panel-title">LOCKED BEHAVIOR RULES</div>
              <div class="rules"><div class="rule"><strong>Reduced motion</strong>Static representative pose.</div><div class="rule"><strong>Failure interrupt</strong>Offline may interrupt any state.</div><div class="rule"><strong>Provider neutral</strong>UI state never depends on model vendor.</div></div>
            </div>
          </section>
        </main>
      </body>
    </html>`);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  screenshotBytes = await page.screenshot({ type: 'png', fullPage: true });
} finally {
  await browser.close();
}

const expectedPath = '/docs/review/jolene-avatar-state-board.png';
const reviewManifest = {
  schemaVersion: '1.0.0',
  status: 'candidate_pending_carl_approval',
  boardPath: expectedPath,
  boardSha256: sha256(screenshotBytes),
  stateCount: cards.length,
  stateOrder: cards.map(({ state }) => state),
  primarySequence: ['greet', 'listen', 'think', 'speak', 'evidence', 'idle'],
  offlinePresentation: 'poised, lightly humorous shrug; never sad, angry, or apologetic',
  reducedMotion: stateContract.reducedMotion,
  publicUseAuthorized: false,
};

if (checkOnly) {
  const committedBoardBytes = await readFile(outputUrl);
  const committedReviewManifest = JSON.parse(await readFile(reviewManifestUrl, 'utf8'));
  assert.equal(sha256(committedBoardBytes), sha256(screenshotBytes), 'Avatar review board is stale.');
  assert.deepEqual(committedReviewManifest, reviewManifest);
  assert.deepEqual(cards.map(({ state }) => state), stateContract.states);
  assert.equal(cards.find(({ state }) => state === 'offline').note, 'poised, knowing shrug');
  console.log('Jolene avatar review passed: 10-state board, primary transition path, poised offline response, and accessibility rules.');
} else {
  await mkdir(new URL('../docs/review/', import.meta.url), { recursive: true });
  await writeFile(outputUrl, screenshotBytes);
  await writeFile(reviewManifestUrl, `${JSON.stringify(reviewManifest, null, 2)}\n`);
  console.log(`Built Jolene avatar review board at ${outputUrl.pathname}`);
}
