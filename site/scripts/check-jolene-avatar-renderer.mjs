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
  'useJoleneAvatarController',
  'stateForAvatarSignal',
  'canTransitionAvatar',
  'data-avatar-state',
  'data-avatar-frame',
  'transition={{ duration: 0 }}',
]) {
  assert.ok(source.includes(requirement), `Jolene avatar renderer is missing ${requirement}.`);
}

for (const forbidden of ['canvas', 'webgl', 'openai', 'anthropic', 'gemini', 'requestanimationframe']) {
  assert.equal(source.toLowerCase().includes(forbidden), false, `Jolene renderer includes forbidden coupling: ${forbidden}`);
}

for (const requirement of ['image-rendering: pixelated', 'pointer-events: none', 'contain: layout paint style']) {
  assert.ok(styles.includes(requirement), `Jolene avatar CSS is missing ${requirement}.`);
}

const primarySequence = ['greet', 'listen', 'think', 'speak', 'evidence', 'idle'];
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

for (const signal of Object.keys(contract.signals)) {
  assert.ok(chatSource.includes(`'${signal}'`) || ['answer_finished'].includes(signal), `Chat does not drive avatar signal ${signal}.`);
}
for (const integrationBoundary of [
  'Howdy, folks!',
  'jolene-country-host-intro-seen-v1',
  'introVisible && !open',
  '<JoleneAvatar',
  "sendAvatar('chat_opened')",
  "sendAvatar('evidence_highlighted')",
  "'service_unavailable'",
]) {
  assert.ok(chatSource.includes(integrationBoundary), `Chat integration is missing ${integrationBoundary}.`);
}
assert.ok(evidenceSource.includes('onToggle'), 'Evidence expansion must expose a state signal.');
assert.ok(evidenceSource.includes('onOpen?.()'), 'Evidence expansion must notify the avatar controller.');
console.log('Jolene avatar renderer passed: stepped playback, central signals, one-time cameo, chat/evidence/error integration, crisp pixels, and reduced motion.');
