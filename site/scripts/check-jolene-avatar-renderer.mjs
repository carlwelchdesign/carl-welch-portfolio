import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../app/jolene/jolene-avatar.tsx', import.meta.url), 'utf8');
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
console.log('Jolene avatar renderer passed: stepped Motion playback, replaceable assets, central signals, crisp pixels, and reduced-motion frames.');
