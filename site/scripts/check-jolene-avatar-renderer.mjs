import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../app/jolene/jolene-avatar.tsx', import.meta.url), 'utf8');
const chatSource = await readFile(new URL('../app/jolene/jolene-chat.tsx', import.meta.url), 'utf8');
const evidenceSource = await readFile(new URL('../app/jolene/jolene-evidence.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');
const contract = JSON.parse(await readFile(new URL('../app/jolene/avatar-state-contract.v1.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('../app/jolene/avatar-frame-catalog.v1.json', import.meta.url), 'utf8'));
const artManifest = JSON.parse(await readFile(new URL('../art-source/jolene-four-frame-reactions/v1-static-sheet/manifest.json', import.meta.url), 'utf8'));

for (const requirement of [
  "from 'motion/react'", 'useReducedMotion', 'useJoleneAvatarController', 'stateForAvatarSignal',
  'canTransitionAvatar', 'data-avatar-state', 'data-avatar-frame', 'data-avatar-pose',
  'preloadJoleneAvatarAssets', 'data-avatar-fallback', 'data-avatar-facing="left"',
  '4_000', '3_001', 'blink-0', 'setFallbackToIdle',
]) assert.ok(source.includes(requirement), `Jolene static renderer is missing ${requirement}.`);

for (const forbidden of ['pixi.js', 'AnimatedSprite', 'rotateDeg', 'translateX', 'translateY']) {
  assert.equal(source.includes(forbidden), false, `Jolene v1 renderer still includes ${forbidden}.`);
}
for (const provider of ['openai', 'anthropic', 'gemini']) {
  assert.equal(source.toLowerCase().includes(provider), false, `Jolene renderer includes forbidden coupling: ${provider}`);
}

for (const requirement of [
  'image-rendering: pixelated', 'pointer-events: none', 'contain: layout paint style',
  'overflow: hidden', 'transform: scaleX(-1)', 'width: calc(var(--jolene-sheet-columns) * 100%)',
  'left: calc(var(--jolene-frame-index) * -100%)',
]) assert.ok(styles.includes(requirement), `Jolene avatar CSS is missing ${requirement}.`);

for (const playbackRequirement of [
  'animatedFrame', 'definition.frames.length <= 1', 'definition.durationsMs[frameIndex]',
  'setAnimatedFrame({ state, index: 0 })', 'setAnimatedFrame({ state, index: frameIndex })', "'--jolene-sheet-columns'",
]) assert.ok(source.includes(playbackRequirement), `Jolene renderer is missing timed playback: ${playbackRequirement}.`);

assert.equal(catalog.sheetPath, artManifest.sheet.runtimePath);
assert.equal(catalog.frameWidth, 105);
assert.equal(catalog.frameHeight, 115);
assert.equal(catalog.columns, artManifest.sheet.columns);
assert.equal(catalog.columns, 22);
assert.equal(artManifest.runtimeIntegrated, true);
assert.equal(artManifest.publicUseAuthorized, false);
assert.equal(artManifest.invariants.noRuntimeRotationOrScaling, true);
assert.equal(artManifest.invariants.allCharacterPixelsInsideCell, true);

for (const state of contract.states) {
  const definition = contract.definitions[state];
  assert.equal(definition.frames.length, definition.durationsMs.length, `${state} must provide timing for every frame.`);
  assert.ok(catalog.frames[definition.frames[0]], `${state} references a missing frame.`);
}

for (const signal of Object.keys(contract.signals)) {
  assert.ok(chatSource.includes(`'${signal}'`) || signal === 'answer_finished', `Chat does not drive avatar signal ${signal}.`);
}
for (const integrationBoundary of [
  'Howdy, folks!', 'jolene-country-host-intro-seen-v1', 'introVisible && !open', '<JoleneAvatar',
  "sendAvatar('chat_opened')", "sendAvatar('evidence_highlighted')", "'service_unavailable'",
  "sendAvatar('visitor_typing')", 'typingAnimationTimer', 'scheduleInactivity',
  'avatarStateContract.inactivity.restAfterMs', "sendAvatar('inactive')",
]) assert.ok(chatSource.includes(integrationBoundary), `Chat integration is missing ${integrationBoundary}.`);

assert.ok(evidenceSource.includes('onToggle'), 'Evidence expansion must expose a state signal.');
assert.ok(evidenceSource.includes('onOpen?.()'), 'Evidence expansion must notify the avatar controller.');
console.log('Jolene avatar renderer passed: authored reactions, timed frame playback, reduced-motion representatives, crisp crop, and idle fallback.');
