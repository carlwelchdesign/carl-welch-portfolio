import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const brief = await readFile(new URL('../docs/JOLENE_AVATAR_ART_DIRECTION.md', import.meta.url), 'utf8');
const contract = JSON.parse(await readFile(new URL('../docs/jolene-avatar-brief.v1.json', import.meta.url), 'utf8'));
const selectedReference = await readFile(new URL('../public/jolene/review/country-host-selected-direction.png', import.meta.url));

for (const phrase of [
  '48 × 56 pixels',
  '15 opaque colors plus full transparency',
  'No partial alpha',
  'Four artist studies',
  'imageSmoothingEnabled = false',
  'must not be copied into the repository',
  '“Howdy, folks!”',
  'Play at most once per browser session',
  'The character is a reveal, not a persistent page ornament',
  'prefers-reduced-motion: reduce',
  'approved this brief, its peek-reveal choreography',
  'selected the **Country Host** study',
  '839ade6ea55a69cf4812a238b05204446576eb7241274a06130276b95d0c17b8',
  'production defects were corrected without redesigning the selected character',
  'clean transparent production master on August 28, 2026',
  'ec53fef8888e3faa15b19b2726882844cccc683493892b402dbe04ca394d6ac8',
]) {
  assert.ok(brief.includes(phrase), `Avatar brief is missing: ${phrase}`);
}

assert.deepEqual(contract.supersededStudyProposal.nativeFrame, { width: 48, height: 56 });
assert.deepEqual(contract.supersededStudyProposal.displayScales, [3, 4]);
assert.equal(contract.supersededStudyProposal.opaqueColorLimit, 15);
assert.equal(contract.partialAlphaAllowed, false);
assert.equal(contract.requiredStudies.length, 4);
assert.equal(contract.requiredStates.length, 9);
assert.equal(contract.rendering.integerScaleOnly, false);
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
assert.equal(contract.status, 'production_master_approved_sprite_work_authorized');
assert.equal(contract.approval.briefApproved, true);
assert.equal(contract.approval.briefApprovedAt, '2026-08-28');
assert.equal(contract.approval.reviewStudiesAuthorized, true);
assert.equal(contract.selection.selectedDirection, 'country_host');
assert.equal(contract.selection.referencePath, '/jolene/review/country-host-selected-direction.png');
assert.equal(contract.selection.referenceSha256, '839ade6ea55a69cf4812a238b05204446576eb7241274a06130276b95d0c17b8');
assert.equal(contract.selection.referenceHasAlpha, false);
assert.equal(contract.selection.bakedCheckerboard, true);
assert.equal(contract.selection.visualDirectionApproved, true);
assert.equal(contract.selection.cleanProductionMasterApproved, true);
assert.equal(contract.selection.cleanProductionMasterApprovedAt, '2026-08-28');
assert.equal(contract.productionMaster.path, '/jolene/jolene-country-host-master.png');
assert.equal(contract.productionMaster.sha256, '4e437fd64b3997bd834bb2310ed0175e75d9958c27871d4ae3857a18fc82cc6f');
assert.deepEqual(contract.productionMaster.frame, { width: 1162, height: 1353 });
assert.deepEqual(contract.productionMaster.bottomCenterAnchor, { x: 563, y: 1261 });
assert.equal(contract.productionMaster.palettePolicy, 'preserve_source_rgb');
assert.equal(contract.productionMaster.alphaPolicy, 'binary');
assert.equal(contract.approval.masterSelected, true);
assert.equal(contract.approval.productionAuthorized, true);
assert.equal(contract.approval.publicUseAuthorized, false);

const selectedReferenceDigest = createHash('sha256').update(selectedReference).digest('hex');
assert.equal(selectedReferenceDigest, contract.selection.referenceSha256);
assert.equal(selectedReference.readUInt32BE(16), contract.selection.referenceWidth);
assert.equal(selectedReference.readUInt32BE(20), contract.selection.referenceHeight);
assert.equal([4, 6].includes(selectedReference.readUInt8(25)), contract.selection.referenceHasAlpha);

console.log('Jolene avatar brief checks passed: selected reference fingerprint, native grid, palette, reveal choreography, accessibility, studies, and approval gates.');
