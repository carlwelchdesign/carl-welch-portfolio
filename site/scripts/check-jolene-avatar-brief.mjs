import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const brief = await readFile(new URL('../docs/JOLENE_AVATAR_ART_DIRECTION.md', import.meta.url), 'utf8');
const contract = JSON.parse(await readFile(new URL('../docs/jolene-avatar-brief.v1.json', import.meta.url), 'utf8'));

for (const phrase of [
  '48 × 56 pixels',
  '15 opaque colors plus full transparency',
  'No partial alpha',
  'Four artist studies',
  'imageSmoothingEnabled = false',
  'Carl must select one study',
  'must not be copied into the repository',
  '“Howdy, folks!”',
  'Play at most once per browser session',
  'The character is a reveal, not a persistent page ornament',
  'prefers-reduced-motion: reduce',
]) {
  assert.ok(brief.includes(phrase), `Avatar brief is missing: ${phrase}`);
}

assert.deepEqual(contract.nativeFrame, { width: 48, height: 56 });
assert.deepEqual(contract.displayScales, [3, 4]);
assert.equal(contract.opaqueColorLimit, 15);
assert.equal(contract.partialAlphaAllowed, false);
assert.equal(contract.requiredStudies.length, 4);
assert.equal(contract.requiredStates.length, 9);
assert.equal(contract.rendering.integerScaleOnly, true);
assert.equal(contract.rendering.canvasImageSmoothing, false);
assert.equal(contract.visibility.defaultCharacterState, 'hidden');
assert.equal(contract.visibility.launcherAlwaysAvailable, true);
assert.equal(contract.visibility.showCharacterWhileChatOpen, true);
assert.equal(contract.visibility.hideCharacterWhenChatClosed, true);
assert.equal(contract.visibility.intro.sessionFrequency, 'once');
assert.equal(contract.visibility.intro.greeting, 'Howdy, folks!');
assert.equal(contract.visibility.intro.hiddenAfterExit, true);
assert.equal(contract.visibility.intro.cancelToChatOpen, true);
assert.equal(contract.visibility.intro.replayOnRouteChange, false);
assert.equal(contract.visibility.intro.replayAfterChatClose, false);
assert.equal(contract.visibility.states.length, 7);
assert.equal(contract.interaction.introAriaHidden, true);
assert.equal(contract.interaction.introFocusable, false);
assert.equal(contract.interaction.introPointerEvents, 'none');
assert.equal(contract.interaction.autoAnnounceGreeting, false);
assert.equal(contract.motion.transformOnly, true);
assert.equal(contract.motion.layoutShiftAllowed, false);
assert.equal(contract.motion.continuousIdleMotionAllowed, false);
assert.equal(contract.motion.reducedMotionBehavior, 'launcher_only');
assert.equal(contract.approval.masterSelected, false);
assert.equal(contract.approval.productionAuthorized, false);
assert.equal(contract.approval.publicUseAuthorized, false);

console.log('Jolene avatar brief checks passed: native grid, palette, reveal choreography, accessibility, studies, and approval gates.');
