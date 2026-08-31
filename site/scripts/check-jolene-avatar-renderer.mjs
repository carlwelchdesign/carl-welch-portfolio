import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../app/jolene/jolene-avatar.tsx', import.meta.url), 'utf8');
const chatSource = await readFile(new URL('../app/jolene/jolene-chat.tsx', import.meta.url), 'utf8');
const evidenceSource = await readFile(new URL('../app/jolene/jolene-evidence.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');
const contract = JSON.parse(await readFile(new URL('../app/jolene/avatar-state-contract.v1.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('../app/jolene/avatar-frame-catalog.v1.json', import.meta.url), 'utf8'));

for (const requirement of [
  "from 'motion/react'",
  'useReducedMotion',
  "import('pixi.js')",
  "import('pixi.js/unsafe-eval')",
  'AnimatedSprite',
  'jolene-approved-atlas.json',
  'useJoleneAvatarController',
  'stateForAvatarSignal',
  'canTransitionAvatar',
  'data-avatar-state',
  'data-avatar-frame',
  'preloadJoleneAvatarAssets',
  'data-avatar-fallback',
  'fallbackToMaster',
  'maximumSettleMs',
  'data-avatar-facing="left"',
]) {
  assert.ok(source.includes(requirement), `Jolene avatar renderer is missing ${requirement}.`);
}

for (const forbidden of ['openai', 'anthropic', 'gemini']) {
  assert.equal(source.toLowerCase().includes(forbidden), false, `Jolene renderer includes forbidden coupling: ${forbidden}`);
}

for (const requirement of ['image-rendering: pixelated', 'pointer-events: none', 'contain: layout style', 'transform: scaleX(-1)', 'jolene-avatar-canvas']) {
  assert.ok(styles.includes(requirement), `Jolene avatar CSS is missing ${requirement}.`);
}
assert.equal(styles.includes('contain: layout paint style'), false, 'Paint containment would clip scaled typing frames.');
assert.ok(styles.includes("[data-avatar-frame='think-dance-b']"), 'Loading dance must mirror its second beat.');

const primarySequence = ['greet', 'excited', 'listen', 'think', 'speak', 'evidence', 'idle'];
for (let index = 0; index < primarySequence.length - 1; index += 1) {
  const from = primarySequence[index];
  const to = primarySequence[index + 1];
  assert.ok(contract.transitions[from].includes(to), `Primary avatar sequence cannot transition ${from} → ${to}.`);
}

for (const state of contract.states) {
  const definition = contract.definitions[state];
  for (const frameName of definition.frames) assert.ok(catalog.frames[frameName], `${state} references missing frame ${frameName}.`);
  assert.ok(catalog.frames[definition.reducedMotionFrame], `${state} reduced-motion frame is missing.`);
}

assert.deepEqual(contract.interruption.alwaysInterruptFor, ['offline']);
assert.equal(catalog.imageRendering, 'pixelated');
const activeFrames = Object.values(contract.definitions).flatMap(({ frames }) => frames);
const activeAssetPaths = new Set(activeFrames.map((frameName) => catalog.frames[frameName].assetPath));
assert.ok([...activeAssetPaths].every((assetPath) => assetPath.includes('/jolene/approved-animation/') || assetPath.includes('/jolene/sprites/')), 'Runtime references an unapproved avatar asset location.');
assert.ok(contract.definitions.idle.frames.length > 3, 'Idle must use the approved breathing and blink loop.');
assert.deepEqual(contract.definitions.greet.frames, ['greet-wave'], 'Greet must use the original one-frame wave.');
assert.deepEqual(contract.definitions.think.frames, ['think-dance-a', 'think-dance-b'], 'Loading must alternate the mirrored dance pose.');
for (const state of contract.states.filter((name) => !['idle', 'blink', 'greet', 'think'].includes(name))) {
  assert.equal(contract.definitions[state].frames.length, 1, `${state} must remain a stable pose until its animation is separately approved.`);
}
assert.ok(Object.values(catalog.frames).filter(({ state }) => state === 'excited').every(({ assetPath }) => assetPath.includes('typing-excited-v1.png')), 'Excited frames must use the approved typing pose.');
assert.ok(Object.values(catalog.frames).filter(({ state }) => state === 'excited').every(({ scale, translateY }) => scale === 1 && translateY === 0), 'Excited frames must stay at native scale and remain seated on the divider.');
assert.ok(Object.values(catalog.frames).filter(({ state }) => state === 'think').every(({ assetPath }) => assetPath.includes('loading-dance-')), 'Think frames must use the loading dance pose.');
assert.ok(contract.rendering.masterPath.includes('/jolene/sprites/rig-base-v2.png'), 'Fallback must use the corrected rig base.');
assert.equal(chatSource.includes('answerAnimationTimer'), false, 'A received answer must stop the loading dance immediately.');
assert.ok(chatSource.includes("sendAvatar('answer_finished')"), 'A received answer must restore the default pose.');

for (const signal of Object.keys(contract.signals)) {
  assert.ok(chatSource.includes(`'${signal}'`) || ['answer_started'].includes(signal), `Chat does not drive avatar signal ${signal}.`);
}
for (const integrationBoundary of [
  'Howdy, folks!',
  'jolene-country-host-intro-seen-v1',
  'introVisible && !open',
  '<JoleneAvatar',
  "sendAvatar('chat_opened')",
  "sendAvatar('evidence_highlighted')",
  "'service_unavailable'",
  'jolene-starter-stage',
  'jolene-conversation-scroll',
  'jolene-conversation-avatar',
  'messagesRef',
  'messageScroller.scrollTo',
  "behavior: reducedMotion ? 'auto' : 'smooth'",
  "sendAvatar('visitor_typing')",
  'typingAnimationTimer',
  '650',
]) {
  assert.ok(chatSource.includes(integrationBoundary), `Chat integration is missing ${integrationBoundary}.`);
}
assert.ok(evidenceSource.includes('onToggle'), 'Evidence expansion must expose a state signal.');
assert.ok(evidenceSource.includes('onOpen?.()'), 'Evidence expansion must notify the avatar controller.');
console.log('Jolene avatar renderer passed: PixiJS AnimatedSprite playback, central signals, one-time cameo, chat/evidence/error integration, crisp pixels, and reduced motion.');
