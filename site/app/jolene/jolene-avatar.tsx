'use client';

import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { AnimatedSprite, Application, Spritesheet, Texture } from 'pixi.js';
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

type PixiRuntime = {
  app: Application;
  sprite: AnimatedSprite;
  sheet: Spritesheet;
  textureFrom: (source: string) => Texture;
};

const frameCatalog = frameCatalogJson.frames as Record<string, FrameDefinition>;
const stateDefinitions = stateContractJson.definitions as Record<AvatarState, StateDefinition>;
const interruptStates = new Set<AvatarState>(stateContractJson.interruption.alwaysInterruptFor as AvatarState[]);
const atlasManifestPath = '/jolene/approved-animation/jolene-approved-atlas.json';
const atlasImagePath = '/jolene/approved-animation/jolene-approved-atlas.png';

export type JoleneAvatarController = {
  state: AvatarState;
  send: (signal: AvatarSignal) => void;
  settle: (returnState: AvatarState) => void;
};

export function preloadJoleneAvatarAssets(): void {
  for (const assetPath of [
    atlasImagePath,
    stateContractJson.rendering.masterPath,
    frameCatalog['excited-0'].assetPath,
    frameCatalog['evidence-2'].assetPath,
  ]) {
    const image = new Image();
    image.decoding = 'async';
    image.src = assetPath;
  }
}

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
  const stillFrameName = reducedMotionFrameForAvatarState(state);
  const [frameName, setFrameName] = useState(stillFrameName);
  const [rendererReady, setRendererReady] = useState(false);
  const [fallbackToMaster, setFallbackToMaster] = useState(false);
  const [assetUnavailable, setAssetUnavailable] = useState(false);
  const displayedFrameName = reducedMotion ? stillFrameName : frameName;
  const frame = frameCatalog[displayedFrameName] ?? frameCatalog[stillFrameName];
  const handleRendererReady = useCallback(() => setRendererReady(true), []);
  const handleRendererError = useCallback(() => setFallbackToMaster(true), []);

  useEffect(() => {
    if (!reducedMotion || !definition.returnState) return;
    const settleTimer = window.setTimeout(
      () => onStateComplete?.(definition.returnState!),
      stateContractJson.interruption.maximumSettleMs,
    );
    return () => window.clearTimeout(settleTimer);
  }, [definition.returnState, onStateComplete, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || definition.frames.length !== 1 || !definition.returnState) return;
    const settleTimer = window.setTimeout(
      () => onStateComplete?.(definition.returnState!),
      definition.durationsMs[0],
    );
    return () => window.clearTimeout(settleTimer);
  }, [definition.durationsMs, definition.frames.length, definition.returnState, onStateComplete, reducedMotion]);

  if (!frame) throw new Error(`Jolene frame ${frameName} is not in the frame catalog.`);
  const style = {
    '--jolene-frame-x': '0px',
    '--jolene-frame-y': '0px',
    '--jolene-frame-rotation': '0deg',
    '--jolene-frame-scale': 1,
    '--jolene-frame-origin': frame.transformOrigin,
  } as CSSProperties;
  const fallbackSource = fallbackToMaster ? stateContractJson.rendering.masterPath : frame.assetPath;

  return (
    <span
      className={`jolene-avatar ${className}`.trim()}
      data-avatar-state={state}
      data-avatar-frame={displayedFrameName}
      data-avatar-fallback={fallbackToMaster ? 'master' : rendererReady ? 'pixi' : 'frame'}
      data-avatar-facing="left"
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      style={style}
      hidden={assetUnavailable}
    >
      {!reducedMotion && !fallbackToMaster ? (
        <PixiAvatarCanvas
          state={state}
          onFrameChange={setFrameName}
          onStateComplete={onStateComplete}
          onReady={handleRendererReady}
          onError={handleRendererError}
        />
      ) : null}
      {(reducedMotion || !rendererReady || fallbackToMaster) ? (
        // eslint-disable-next-line @next/next/no-img-element -- Pixel frames must bypass image optimization to preserve exact pixels.
        <img
          src={fallbackSource}
          alt=""
          draggable={false}
          decoding="async"
          onError={() => {
            if (fallbackToMaster) setAssetUnavailable(true);
            else setFallbackToMaster(true);
          }}
        />
      ) : null}
    </span>
  );
}

function PixiAvatarCanvas({
  state,
  onFrameChange,
  onStateComplete,
  onReady,
  onError,
}: {
  state: AvatarState;
  onFrameChange: (frameName: string) => void;
  onStateComplete?: (returnState: AvatarState) => void;
  onReady: () => void;
  onError: () => void;
}) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const runtimeRef = useRef<PixiRuntime | null>(null);
  const requestedStateRef = useRef(state);
  const onFrameChangeRef = useRef(onFrameChange);
  const onStateCompleteRef = useRef(onStateComplete);

  useEffect(() => {
    requestedStateRef.current = state;
    onFrameChangeRef.current = onFrameChange;
    onStateCompleteRef.current = onStateComplete;
  }, [onFrameChange, onStateComplete, state]);

  const play = useCallback((runtime: PixiRuntime, nextState: AvatarState) => {
    const definition = stateDefinitions[nextState];
    const frameNames = definition.frames;
    runtime.sprite.stop();
    runtime.sprite.onComplete = undefined;
    runtime.sprite.onFrameChange = (index) => onFrameChangeRef.current(frameNames[index] ?? frameNames[0]);
    runtime.sprite.textures = frameNames.map((name, index) => {
      const assetPath = frameCatalog[name].assetPath;
      const atlasFrameName = assetPath.split('/').at(-1)?.split('?')[0] ?? '';
      const texture = runtime.sheet.textures[atlasFrameName] ?? runtime.textureFrom(assetPath);
      texture.source.scaleMode = 'nearest';
      return { texture, time: definition.durationsMs[index] };
    });
    runtime.sprite.loop = definition.loop;
    runtime.sprite.onComplete = definition.returnState
      ? () => onStateCompleteRef.current?.(definition.returnState!)
      : undefined;
    runtime.sprite.gotoAndStop(0);
    onFrameChangeRef.current(frameNames[0]);
    if (frameNames.length > 1) runtime.sprite.play();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let runtime: PixiRuntime | null = null;
    void (async () => {
      try {
        await import('pixi.js/unsafe-eval');
        const { AnimatedSprite, Application, Assets, Texture } = await import('pixi.js');
        const app = new Application();
        await app.init({
          width: frameCatalogJson.frameWidth,
          height: frameCatalogJson.frameHeight,
          backgroundAlpha: 0,
          antialias: false,
          resolution: 1,
          autoDensity: false,
          powerPreference: 'low-power',
        });
        const sheet = await Assets.load<Spritesheet>(atlasManifestPath);
        await Assets.load([
          stateContractJson.rendering.masterPath,
          frameCatalog['excited-0'].assetPath,
          frameCatalog['evidence-2'].assetPath,
        ]);
        if (cancelled || !hostRef.current) {
          app.destroy({ removeView: true }, { children: true, context: true });
          return;
        }
        const sprite = new AnimatedSprite({ textures: [Texture.EMPTY], autoUpdate: true, autoPlay: false });
        sprite.eventMode = 'none';
        app.stage.eventMode = 'none';
        app.stage.addChild(sprite);
        app.canvas.className = 'jolene-avatar-canvas';
        app.canvas.setAttribute('aria-hidden', 'true');
        hostRef.current.appendChild(app.canvas);
        runtime = { app, sprite, sheet, textureFrom: Texture.from };
        runtimeRef.current = runtime;
        play(runtime, requestedStateRef.current);
        onReady();
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Jolene PixiJS initialization failed.', error);
        if (!cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
      runtimeRef.current = null;
      runtime?.app.destroy({ removeView: true }, { children: true, context: true });
    };
  }, [onError, onReady, play]);

  useEffect(() => {
    if (runtimeRef.current) play(runtimeRef.current, state);
  }, [play, state]);

  return <span ref={hostRef} className="jolene-avatar-pixi" aria-hidden="true" />;
}
