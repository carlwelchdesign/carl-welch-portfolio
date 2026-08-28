import contract from './avatar-state-contract.v1.json';

export const avatarStates = [
  'idle',
  'blink',
  'greet',
  'listen',
  'think',
  'speak',
  'evidence',
  'boundary',
  'offline',
  'rest',
] as const;

export type AvatarState = (typeof avatarStates)[number];
export type AvatarSignal = keyof typeof contract.signals;

const avatarStateSet: ReadonlySet<string> = new Set(avatarStates);

export function isAvatarState(value: string): value is AvatarState {
  return avatarStateSet.has(value);
}

export function stateForAvatarSignal(signal: AvatarSignal): AvatarState {
  const state = contract.signals[signal];
  if (!isAvatarState(state)) throw new Error(`Avatar signal ${signal} maps to an invalid state.`);
  return state;
}

export function canTransitionAvatar(from: AvatarState, to: AvatarState): boolean {
  return (contract.transitions[from] as string[]).includes(to);
}

export function reducedMotionFrameForAvatarState(state: AvatarState): string {
  return contract.definitions[state].reducedMotionFrame;
}

export const avatarStateContract = contract;
