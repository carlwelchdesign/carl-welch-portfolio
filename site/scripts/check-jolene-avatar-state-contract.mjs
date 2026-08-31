import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('../app/jolene/avatar-state-contract.v1.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('../app/jolene/avatar-frame-catalog.v1.json', import.meta.url), 'utf8'));
const artManifest = JSON.parse(await readFile(new URL('../art-source/jolene-four-frame-reactions/v1-static-sheet/manifest.json', import.meta.url), 'utf8'));
const runtimeSheet = await readFile(new URL('../public/jolene/v1-static-sheet/jolene-v1-static-sheet.png', import.meta.url));
const source = await readFile(new URL('../app/jolene/avatar-state-contract.ts', import.meta.url), 'utf8');

const expectedStates = ['idle', 'blink', 'greet', 'excited', 'listen', 'think', 'speak', 'evidence', 'boundary', 'offline', 'rest'];
const expectedSignals = [
  'intro_started', 'chat_opened', 'visitor_typing', 'visitor_input', 'request_started', 'answer_started',
  'answer_finished', 'evidence_highlighted', 'cannot_verify', 'service_unavailable', 'inactive', 'activity_resumed',
];

assert.equal(contract.schemaVersion, '2.0.0');
assert.equal(contract.contractName, 'jolene.avatar-state');
assert.equal(contract.providerIndependent, true);
assert.deepEqual(contract.states, expectedStates);
assert.equal(contract.initialState, 'idle');
assert.equal(contract.fallbackState, 'idle');

for (const state of expectedStates) {
  const definition = contract.definitions[state];
  assert.ok(definition, `Missing avatar state definition: ${state}`);
  assert.equal(definition.frames.length, definition.durationsMs.length, `${state} frame timing count must match.`);
  assert.ok(catalog.frames[definition.frames[0]], `${state} references a missing catalog frame.`);
  assert.ok(catalog.frames[definition.reducedMotionFrame], `${state} reduced-motion frame is missing.`);
  assert.ok(Array.isArray(contract.transitions[state]) && contract.transitions[state].length > 0, `${state} must define transitions.`);
  for (const target of contract.transitions[state]) assert.ok(expectedStates.includes(target), `${state} targets unknown state ${target}.`);
  if (definition.loop) assert.equal(definition.returnState, null, `${state} loops and cannot declare a return state.`);
  else assert.ok(expectedStates.includes(definition.returnState), `${state} must return to a known state.`);
}

const animatedReactionStates = ['listen', 'speak', 'evidence', 'boundary', 'offline'];
for (const state of animatedReactionStates) {
  const definition = contract.definitions[state];
  assert.ok(definition.frames.length >= 3, `${state} must use an authored multi-frame reaction.`);
  assert.equal(new Set(definition.frames).size, definition.frames.length, `${state} must not pad its reaction with duplicate frame IDs.`);
}
assert.notDeepEqual(contract.definitions.listen.frames, contract.definitions.speak.frames, 'Listen and speak must remain visually distinct.');
assert.notDeepEqual(contract.definitions.boundary.frames, contract.definitions.offline.frames, 'Boundary and offline must remain distinct reactions.');
assert.notEqual(
  catalog.frames[contract.definitions.listen.reducedMotionFrame].pose,
  catalog.frames[contract.definitions.speak.reducedMotionFrame].pose,
  'Reduced-motion listen and speak poses must remain visually distinct.',
);
assert.equal(catalog.frames[contract.definitions.speak.reducedMotionFrame].index, 11, 'Speak must hold an open-eyed representative frame.');
assert.ok(contract.definitions.speak.durationsMs[1] <= 120, 'The mouth-change speaking beat must remain brief and read as speech.');
assert.deepEqual(contract.definitions.rest.frames, ['rest-0'], 'Rest must retain the known-good closed-eye pose until an identity-locked loop exists.');
assert.equal(catalog.frames[contract.definitions.think.reducedMotionFrame].pose, 'attentive', 'Think must not use the rejected malformed standalone face.');

assert.deepEqual(Object.keys(contract.signals), expectedSignals);
for (const [signal, state] of Object.entries(contract.signals)) {
  assert.ok(expectedStates.includes(state));
  const frameName = contract.definitions[state].reducedMotionFrame;
  assert.equal(catalog.frames[frameName].pose, artManifest.signalToPose[signal], `${signal} does not use its approved pose.`);
}

assert.equal(contract.rendering.sheetPath, artManifest.sheet.runtimePath);
assert.equal(contract.rendering.sheetSha256, artManifest.sheet.runtimeSha256);
assert.equal(createHash('sha256').update(runtimeSheet).digest('hex'), contract.rendering.sheetSha256);
assert.equal(contract.rendering.frameWidth, artManifest.nativeCell.width);
assert.equal(contract.rendering.frameHeight, artManifest.nativeCell.height);
assert.equal(contract.rendering.columns, artManifest.sheet.columns);
assert.equal(artManifest.appendOnlyCompatibility.preservedLeadingCellCount, 9);
assert.equal(artManifest.appendOnlyCompatibility.preservedLeadingWidth, 945);
assert.equal(artManifest.appendOnlyCompatibility.preservedLeadingRgbaSha256, '05d3a7e4cb29953dec80f6ca702216d74f652094f7a87862909bc84bff5c6070');
assert.deepEqual(
  [...new Set(Object.values(catalog.frames).map(({ index }) => index))].sort((a, b) => a - b),
  Array.from({ length: 22 }, (_value, index) => index),
  'The runtime catalog must include every reviewed frame and no discarded variants.',
);
assert.equal(contract.blink.minimumIntervalMs, artManifest.blink.runtimeIntervalMs.minimum);
assert.equal(contract.blink.maximumIntervalMs, artManifest.blink.runtimeIntervalMs.maximum);
assert.equal(contract.blink.durationMs, artManifest.blink.blinkDurationMs);
assert.equal(contract.reducedMotion.animate, false);

for (const forbidden of ['openai', 'anthropic', 'gemini', 'ollama', 'language model', 'llm']) {
  assert.equal(JSON.stringify(contract).toLowerCase().includes(forbidden), false, `Avatar contract leaks provider term: ${forbidden}`);
}
for (const exportedName of ['AvatarState', 'AvatarSignal', 'stateForAvatarSignal', 'canTransitionAvatar', 'reducedMotionFrameForAvatarState']) {
  assert.ok(source.includes(exportedName), `Avatar state module is missing ${exportedName}.`);
}

console.log('Jolene avatar state contract passed: authored reactions animate only where face identity is locked; Rest and Think use stable V1 poses.');
