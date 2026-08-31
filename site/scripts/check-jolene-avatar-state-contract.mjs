import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('../app/jolene/avatar-state-contract.v1.json', import.meta.url), 'utf8'));
const spriteManifest = JSON.parse(await readFile(new URL('../docs/jolene-avatar-sprites.v1.json', import.meta.url), 'utf8'));
const rigBase = spriteManifest.frames[0];
const rigBaseBytes = await readFile(new URL(`../public${rigBase.path}`, import.meta.url));
const source = await readFile(new URL('../app/jolene/avatar-state-contract.ts', import.meta.url), 'utf8');

const expectedStates = ['idle', 'blink', 'greet', 'excited', 'listen', 'think', 'speak', 'evidence', 'boundary', 'offline', 'rest'];
const expectedSignals = [
  'intro_started',
  'chat_opened',
  'visitor_typing',
  'visitor_input',
  'request_started',
  'answer_started',
  'answer_finished',
  'evidence_highlighted',
  'cannot_verify',
  'service_unavailable',
  'inactive',
  'activity_resumed',
];

assert.equal(contract.schemaVersion, '1.0.0');
assert.equal(contract.contractName, 'jolene.avatar-state');
assert.equal(contract.providerIndependent, true);
assert.deepEqual(contract.states, expectedStates);
assert.equal(contract.initialState, 'idle');
assert.equal(contract.fallbackState, 'idle');

for (const state of expectedStates) {
  const definition = contract.definitions[state];
  assert.ok(definition, `Missing avatar state definition: ${state}`);
  assert.ok(definition.frames.length > 0, `${state} must define at least one frame.`);
  assert.equal(definition.frames.length, definition.durationsMs.length, `${state} frame timing count must match.`);
  assert.ok(definition.durationsMs.every((duration) => Number.isInteger(duration) && duration >= 60 && duration <= 2_000));
  assert.ok(definition.frames.includes(definition.reducedMotionFrame), `${state} reduced-motion frame must belong to the state.`);
  assert.ok(Array.isArray(contract.transitions[state]) && contract.transitions[state].length > 0, `${state} must define transitions.`);
  for (const target of contract.transitions[state]) assert.ok(expectedStates.includes(target), `${state} targets unknown state ${target}.`);
  if (definition.loop) assert.equal(definition.returnState, null, `${state} loops and cannot declare a return state.`);
  else assert.ok(expectedStates.includes(definition.returnState), `${state} must return to a known state.`);
}

assert.deepEqual(Object.keys(contract.signals), expectedSignals);
for (const state of Object.values(contract.signals)) assert.ok(expectedStates.includes(state));
assert.deepEqual(contract.interruption.alwaysInterruptFor, ['offline']);
assert.ok(contract.interruption.maximumSettleMs <= 600);
assert.equal(contract.reducedMotion.animate, false);
assert.equal(contract.reducedMotion.unsolicitedIntroState, 'idle');
assert.equal(contract.rendering.masterPath.split('?')[0], rigBase.path);
assert.equal(contract.rendering.masterSha256, rigBase.sha256);
assert.equal(contract.rendering.frameWidth, rigBase.width);
assert.equal(contract.rendering.frameHeight, rigBase.height);
assert.deepEqual(contract.rendering.anchor, spriteManifest.layout.anchor);
assert.equal(createHash('sha256').update(rigBaseBytes).digest('hex'), contract.rendering.masterSha256);
assert.equal(spriteManifest.invariants.baseStatesShareIdentitySource, true);
assert.deepEqual(spriteManifest.invariants.distinctPoseStates, ['excited', 'think']);
assert.ok(spriteManifest.frames.every(({ drawBounds }) => drawBounds.y === 8 && drawBounds.height === 440), 'Every sprite must keep the shared 440 px character height.');
assert.ok(spriteManifest.frames.every(({ drawBounds }) => drawBounds.y + drawBounds.height === 448), 'Every sprite must meet the shared y=448 baseline.');

for (const forbidden of ['openai', 'anthropic', 'gemini', 'ollama', 'language model', 'llm']) {
  assert.equal(JSON.stringify(contract).toLowerCase().includes(forbidden), false, `Avatar contract leaks provider term: ${forbidden}`);
}

for (const exportedName of ['AvatarState', 'AvatarSignal', 'stateForAvatarSignal', 'canTransitionAvatar', 'reducedMotionFrameForAvatarState']) {
  assert.ok(source.includes(exportedName), `Avatar state module is missing ${exportedName}.`);
}

console.log('Jolene avatar state contract passed: 11 states, 12 signals, validated typing transition, approved master, and reduced-motion fallback.');
