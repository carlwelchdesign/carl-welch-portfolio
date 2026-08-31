'use client';

import { useReducedMotion } from 'motion/react';
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
  index: number;
  assetPath?: string;
  pose: string;
  state: AvatarState;
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
const spriteSheetPath = frameCatalogJson.sheetPath;
const fallbackPath = frameCatalogJson.fallbackPath;
const spriteSheetColumns = frameCatalogJson.columns;
const standaloneAssetPaths = [...new Set(
  Object.values(frameCatalog).flatMap((frame) => frame.assetPath ? [frame.assetPath] : []),
)];

export type JoleneAvatarController = {
  state: AvatarState;
  send: (signal: AvatarSignal) => void;
  settle: (returnState: AvatarState) => void;
};

export function preloadJoleneAvatarAssets(): void {
  for (const assetPath of [spriteSheetPath, fallbackPath, ...standaloneAssetPaths]) {
    const image = new Image();
    image.decoding = 'async';
    image.src = assetPath;
  }
}

export function useJoleneAvatarController(initialState: AvatarState = 'idle'): JoleneAvatarController {
  const [state, setState] = useState<AvatarState>(initialState);

  const send = useCallback((signal: AvatarSignal) => {
    setState(stateForAvatarSignal(signal));
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
  const definition = stateDefinitions[state];
  const [blinkVisible, setBlinkVisible] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  const [fallbackToIdle, setFallbackToIdle] = useState(false);
  const [animatedFrame, setAnimatedFrame] = useState<{ state: AvatarState; index: number }>({ state, index: 0 });

  useEffect(() => {
    if (state !== 'idle' || reducedMotion) return;

    let blinkTimer = 0;
    let resetTimer = 0;
    let cancelled = false;
    const clearVisibleTimer = window.setTimeout(() => setBlinkVisible(false), 0);
    const scheduleBlink = () => {
      const delay = 4_000 + Math.floor(Math.random() * 3_001);
      blinkTimer = window.setTimeout(() => {
        if (cancelled) return;
        setBlinkVisible(true);
        resetTimer = window.setTimeout(() => {
          setBlinkVisible(false);
          if (!cancelled) scheduleBlink();
        }, stateContractJson.blink.durationMs);
      }, delay);
    };
    scheduleBlink();
    return () => {
      cancelled = true;
      window.clearTimeout(clearVisibleTimer);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(resetTimer);
    };
  }, [reducedMotion, state]);

  useEffect(() => {
    if (!definition.returnState) return;
    const settleTimer = window.setTimeout(
      () => onStateComplete?.(definition.returnState!),
      definition.durationsMs.reduce((total, duration) => total + duration, 0),
    );
    return () => window.clearTimeout(settleTimer);
  }, [definition, onStateComplete]);

  useEffect(() => {
    if (reducedMotion || definition.frames.length <= 1) return;

    let frameIndex = 0;
    let cancelled = false;
    const resetTimer = window.setTimeout(() => setAnimatedFrame({ state, index: 0 }), 0);
    let frameTimer = 0;
    const scheduleFrame = () => {
      frameTimer = window.setTimeout(() => {
        if (cancelled) return;
        const nextIndex = frameIndex + 1;
        if (nextIndex >= definition.frames.length && !definition.loop) return;
        frameIndex = nextIndex % definition.frames.length;
        setAnimatedFrame({ state, index: frameIndex });
        scheduleFrame();
      }, definition.durationsMs[frameIndex]);
    };
    scheduleFrame();
    return () => {
      cancelled = true;
      window.clearTimeout(resetTimer);
      window.clearTimeout(frameTimer);
    };
  }, [definition, reducedMotion, state]);

  const representativeFrame = reducedMotionFrameForAvatarState(state);
  const animationFrameIndex = animatedFrame.state === state ? animatedFrame.index : 0;
  const displayedFrameName = reducedMotion
    ? representativeFrame
    : state === 'idle' && blinkVisible
      ? 'blink-0'
      : definition.frames[animationFrameIndex] ?? definition.frames[0];
  const frame = frameCatalog[displayedFrameName];
  if (!frame) throw new Error(`Jolene frame ${displayedFrameName} is not in the frame catalog.`);

  const style = {
    '--jolene-frame-index': frame.index,
    '--jolene-sheet-columns': spriteSheetColumns,
  } as CSSProperties;

  return (
    <span
      className={`jolene-avatar ${className}`.trim()}
      data-avatar-state={state}
      data-avatar-frame={displayedFrameName}
      data-avatar-pose={frame.pose}
      data-avatar-fallback={fallbackToIdle ? 'idle' : sheetReady ? 'sheet' : 'loading'}
      data-avatar-facing="left"
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      style={style}
    >
      {fallbackToIdle ? (
        // eslint-disable-next-line @next/next/no-img-element -- Exact pixel art must bypass image optimization.
        <img className="jolene-avatar-fallback" src={fallbackPath} alt="" draggable={false} />
      ) : frame.assetPath ? (
        // eslint-disable-next-line @next/next/no-img-element -- Exact pixel art must bypass image optimization.
        <img
          className="jolene-avatar-standalone"
          src={frame.assetPath}
          alt=""
          draggable={false}
          decoding="async"
          onLoad={() => setSheetReady(true)}
          onError={() => setFallbackToIdle(true)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- Exact sprite cropping must bypass image optimization.
        <img
          className="jolene-avatar-sheet"
          src={spriteSheetPath}
          alt=""
          draggable={false}
          decoding="async"
          onLoad={() => setSheetReady(true)}
          onError={() => setFallbackToIdle(true)}
        />
      )}
    </span>
  );
}
