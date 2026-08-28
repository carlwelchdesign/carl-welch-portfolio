'use client';

import { m, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import frameCatalogJson from './avatar-frame-catalog.v1.json';
import stateContractJson from './avatar-state-contract.v1.json';
import {
  canTransitionAvatar,
  reducedMotionFrameForAvatarState,
  stateForAvatarSignal,
  type AvatarSignal,
  type AvatarState,
} from './avatar-state-contract';

type FrameDefinition = {
  assetPath: string;
  state: AvatarState;
  translateX: number;
  translateY: number;
  rotateDeg: number;
  scale: number;
  transformOrigin: string;
};

type StateDefinition = {
  frames: string[];
  durationsMs: number[];
  loop: boolean;
  returnState: AvatarState | null;
  reducedMotionFrame: string;
};

const frameCatalog = frameCatalogJson.frames as Record<string, FrameDefinition>;
const stateDefinitions = stateContractJson.definitions as Record<AvatarState, StateDefinition>;
const interruptStates = new Set<AvatarState>(stateContractJson.interruption.alwaysInterruptFor as AvatarState[]);

export type JoleneAvatarController = {
  state: AvatarState;
  send: (signal: AvatarSignal) => void;
  settle: (returnState: AvatarState) => void;
};

export function useJoleneAvatarController(initialState: AvatarState = 'idle'): JoleneAvatarController {
  const [state, setState] = useState<AvatarState>(initialState);

  const send = useCallback((signal: AvatarSignal) => {
    const target = stateForAvatarSignal(signal);
    setState((current) => (
      current === target || interruptStates.has(target) || canTransitionAvatar(current, target)
        ? target
        : current
    ));
  }, []);

  const settle = useCallback((returnState: AvatarState) => {
    setState((current) => canTransitionAvatar(current, returnState) ? returnState : current);
  }, []);

  return { state, send, settle };
}

export function JoleneAvatar({
  state,
  onStateComplete,
  className = '',
  label = 'Jolene',
  decorative = true,
}: {
  state: AvatarState;
  onStateComplete?: (returnState: AvatarState) => void;
  className?: string;
  label?: string;
  decorative?: boolean;
}) {
  const reducedMotion = useReducedMotion() === true;

  return (
    <AvatarPlayback
      key={`${state}:${reducedMotion ? 'still' : 'motion'}`}
      state={state}
      reducedMotion={reducedMotion}
      onStateComplete={onStateComplete}
      className={className}
      label={label}
      decorative={decorative}
    />
  );
}

function AvatarPlayback({
  state,
  reducedMotion,
  onStateComplete,
  className,
  label,
  decorative,
}: {
  state: AvatarState;
  reducedMotion: boolean;
  onStateComplete?: (returnState: AvatarState) => void;
  className: string;
  label: string;
  decorative: boolean;
}) {
  const definition = stateDefinitions[state];
  const [frameIndex, setFrameIndex] = useState(0);

  const frameName = reducedMotion
    ? reducedMotionFrameForAvatarState(state)
    : definition.frames[frameIndex] ?? definition.frames[0];
  const frame = frameCatalog[frameName];

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => {
      const nextFrameIndex = frameIndex + 1;
      if (nextFrameIndex < definition.frames.length) {
        setFrameIndex(nextFrameIndex);
        return;
      }
      if (definition.loop) {
        setFrameIndex(0);
        return;
      }
      if (definition.returnState) onStateComplete?.(definition.returnState);
    }, definition.durationsMs[frameIndex] ?? definition.durationsMs[0]);
    return () => window.clearTimeout(timer);
  }, [definition, frameIndex, onStateComplete, reducedMotion]);

  if (!frame) throw new Error(`Jolene frame ${frameName} is not in the frame catalog.`);

  const style = {
    '--jolene-frame-x': `${frame.translateX}px`,
    '--jolene-frame-y': `${frame.translateY}px`,
    '--jolene-frame-rotation': `${frame.rotateDeg}deg`,
    '--jolene-frame-scale': frame.scale,
    '--jolene-frame-origin': frame.transformOrigin,
  } as CSSProperties;

  return (
    <span
      className={`jolene-avatar ${className}`.trim()}
      data-avatar-state={state}
      data-avatar-frame={frameName}
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      style={style}
    >
      <m.img
        src={frame.assetPath}
        alt=""
        draggable={false}
        decoding="async"
        initial={false}
        animate={{
          x: frame.translateX,
          y: frame.translateY,
          rotate: frame.rotateDeg,
          scale: frame.scale,
        }}
        transition={{ duration: 0 }}
      />
    </span>
  );
}
