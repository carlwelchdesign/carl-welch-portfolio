'use client';

import { useEffect, useRef } from 'react';

const DESKTOP_PARTICLE_COUNT = 14000;
const MOBILE_PARTICLE_COUNT = 6000;
const MINIMUM_PARTICLE_OPACITY = 0.55;
const CLOUD_COUNT = 9;
const PIXEL_SIZE = 2;
const MOBILE_BREAKPOINT = 720;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_FRAME_DELTA_SECONDS = 1 / 30;
const TARGET_FRAME_INTERVAL_MILLISECONDS = 1000 / 60;
const POINTER_RADIUS = 172;
const TAU = Math.PI * 2;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  opacity: number;
  windAffinity: number;
};

type PointerForce = {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  previousTime: number;
  speed: number;
  active: boolean;
  initialized: boolean;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const first = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(TAU * random());
}

function createParticles(width: number, height: number, count: number): Particle[] {
  const random = seededRandom(0x434c4f55 + count);
  const centers = Array.from({ length: CLOUD_COUNT }, (_, index) => ({
    x: width * (0.08 + ((index * 0.193 + random() * 0.11) % 0.84)),
    y: height * (0.09 + ((index * 0.271 + random() * 0.13) % 0.82)),
    spreadX: width * (0.06 + random() * 0.06),
    spreadY: height * (0.045 + random() * 0.06),
  }));

  return Array.from({ length: count }, (_, index) => {
    const center = centers[index % CLOUD_COUNT];
    return {
      x: Math.max(0, Math.min(width - PIXEL_SIZE, center.x + gaussian(random) * center.spreadX)),
      y: Math.max(0, Math.min(height - PIXEL_SIZE, center.y + gaussian(random) * center.spreadY)),
      vx: (random() - 0.35) * 46,
      vy: (random() - 0.5) * 34,
      phase: random() * TAU,
      opacity: MINIMUM_PARTICLE_OPACITY + random() * (1 - MINIMUM_PARTICLE_OPACITY),
      windAffinity: 0.72 + random() * 0.5,
    };
  });
}

function sampleWind(particle: Particle, width: number, height: number, elapsedSeconds: number) {
  const x = particle.x / Math.max(1, width);
  const y = particle.y / Math.max(1, height);
  return {
    x: (24
      + Math.sin(y * TAU + elapsedSeconds * 0.26) * 38
      + Math.cos(y * TAU * 2 - elapsedSeconds * 0.15 + particle.phase) * 13) * particle.windAffinity,
    y: (Math.sin(x * TAU - elapsedSeconds * 0.22) * 31
      + Math.cos(x * TAU * 2 + elapsedSeconds * 0.12 + particle.phase * 0.5) * 11) * particle.windAffinity,
  };
}

function stepParticles(
  particles: Particle[],
  width: number,
  height: number,
  deltaSeconds: number,
  elapsedMilliseconds: number,
  pointer: PointerForce,
) {
  let repelledParticles = 0;
  let reboundEvents = 0;
  const elapsedSeconds = elapsedMilliseconds / 1000;
  const maximumX = Math.max(0, width - PIXEL_SIZE);
  const maximumY = Math.max(0, height - PIXEL_SIZE);

  for (const particle of particles) {
    const wind = sampleWind(particle, width, height, elapsedSeconds);
    let accelerationX = (wind.x - particle.vx) * 1.4;
    let accelerationY = (wind.y - particle.vy) * 1.4;

    if (pointer.active) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > 0.01 && distanceSquared < POINTER_RADIUS * POINTER_RADIUS) {
        const distance = Math.sqrt(distanceSquared);
        const pressure = 1 - distance / POINTER_RADIUS;
        const force = pressure * pressure * (720 + pointer.speed * 0.75);
        accelerationX += (dx / distance) * force;
        accelerationY += (dy / distance) * force;
        repelledParticles += 1;
      }
    }

    particle.vx = (particle.vx + accelerationX * deltaSeconds) * 0.997;
    particle.vy = (particle.vy + accelerationY * deltaSeconds) * 0.997;
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed > 290) {
      particle.vx = (particle.vx / speed) * 290;
      particle.vy = (particle.vy / speed) * 290;
    }
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;

    if (particle.x < 0) {
      particle.x = 0;
      particle.vx = Math.abs(particle.vx) * 0.88;
      reboundEvents += 1;
    } else if (particle.x > maximumX) {
      particle.x = maximumX;
      particle.vx = -Math.abs(particle.vx) * 0.88;
      reboundEvents += 1;
    }
    if (particle.y < 0) {
      particle.y = 0;
      particle.vy = Math.abs(particle.vy) * 0.88;
      reboundEvents += 1;
    } else if (particle.y > maximumY) {
      particle.y = maximumY;
      particle.vy = -Math.abs(particle.vy) * 0.88;
      reboundEvents += 1;
    }
  }

  return { repelledParticles, reboundEvents };
}

function drawParticles(context: CanvasRenderingContext2D, particles: Particle[], width: number, height: number) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#090c09';
  for (const particle of particles) {
    context.globalAlpha = particle.opacity;
    context.fillRect(Math.floor(particle.x), Math.floor(particle.y), PIXEL_SIZE, PIXEL_SIZE);
  }
  context.globalAlpha = 1;
}

function countBoundsViolations(particles: Particle[], width: number, height: number) {
  const maximumX = Math.max(0, width - PIXEL_SIZE);
  const maximumY = Math.max(0, height - PIXEL_SIZE);
  return particles.filter(({ x, y }) => x < 0 || x > maximumX || y < 0 || y > maximumY).length;
}

export function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = canvas?.closest<HTMLElement>('.hero-field');
    const context = canvas?.getContext('2d');
    if (!canvas || !field || !context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer: PointerForce = {
      x: 0, y: 0, previousX: 0, previousY: 0, previousTime: 0,
      speed: 0, active: false, initialized: false,
    };
    let particles: Particle[] = [];
    let width = 1;
    let height = 1;
    let frameCount = 0;
    let inputEvents = 0;
    let wakeEvents = 0;
    let repelledParticles = 0;
    let reboundEvents = 0;
    let lastFrameTime = 0;
    let animationFrame: number | null = null;
    let inView = false;
    let documentVisible = document.visibilityState === 'visible';
    let reduceMotion = motionPreference.matches;

    const updateDiagnostics = () => {
      canvas.dataset.frameCount = String(frameCount);
      canvas.dataset.inputEvents = String(inputEvents);
      canvas.dataset.wakeEvents = String(wakeEvents);
      canvas.dataset.repelledParticles = String(repelledParticles);
      canvas.dataset.reboundEvents = String(reboundEvents);
      canvas.dataset.pointerSpeed = String(Math.round(pointer.speed));
      canvas.dataset.boundsViolations = String(countBoundsViolations(particles, width, height));
    };
    const render = () => {
      drawParticles(context, particles, width, height);
      updateDiagnostics();
    };
    const shouldAnimate = () => inView && documentVisible && !reduceMotion;
    const tick = (time: number) => {
      animationFrame = null;
      if (!shouldAnimate()) return;
      if (lastFrameTime && time - lastFrameTime < TARGET_FRAME_INTERVAL_MILLISECONDS) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }
      const deltaSeconds = lastFrameTime
        ? Math.min((time - lastFrameTime) / 1000, MAX_FRAME_DELTA_SECONDS)
        : 1 / 60;
      lastFrameTime = time;
      const result = stepParticles(particles, width, height, deltaSeconds, time, pointer);
      repelledParticles = result.repelledParticles;
      reboundEvents += result.reboundEvents;
      pointer.speed *= 0.91;
      frameCount += 1;
      render();
      animationFrame = requestAnimationFrame(tick);
    };
    const syncAnimation = () => {
      const active = shouldAnimate();
      canvas.dataset.active = String(active);
      canvas.dataset.renderMode = reduceMotion ? 'static' : 'dynamic';
      if (active && animationFrame === null) {
        lastFrameTime = 0;
        animationFrame = requestAnimationFrame(tick);
      } else if (!active && animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };
    const resize = () => {
      const rect = field.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const quality = innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
      const particleCount = quality === 'mobile' ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
      canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.imageSmoothingEnabled = false;
      particles = createParticles(width, height, particleCount);
      frameCount = reduceMotion ? 1 : 0;
      canvas.dataset.quality = quality;
      canvas.dataset.particleCount = String(particleCount);
      canvas.dataset.devicePixelRatio = String(devicePixelRatio);
      render();
      syncAnimation();
    };
    const onPointerMove = (event: PointerEvent) => {
      const rect = field.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const time = performance.now();
      if (pointer.initialized) {
        const seconds = Math.max((time - pointer.previousTime) / 1000, 1 / 120);
        pointer.speed = Math.min(1400, Math.hypot(x - pointer.previousX, y - pointer.previousY) / seconds);
        if (Math.abs(x - pointer.previousX) + Math.abs(y - pointer.previousY) > 1) wakeEvents += 1;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.previousX = x;
      pointer.previousY = y;
      pointer.previousTime = time;
      pointer.active = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      pointer.initialized = true;
      inputEvents += 1;
      updateDiagnostics();
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.initialized = false;
      pointer.speed = 0;
      repelledParticles = 0;
      updateDiagnostics();
    };
    const onVisibilityChange = () => {
      documentVisible = document.visibilityState === 'visible';
      syncAnimation();
    };
    const onMotionPreferenceChange = () => {
      reduceMotion = motionPreference.matches;
      frameCount = reduceMotion ? 1 : 0;
      render();
      syncAnimation();
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      syncAnimation();
    }, { threshold: 0.02 });
    const resizeObserver = new ResizeObserver(resize);

    field.addEventListener('pointermove', onPointerMove, { passive: true });
    field.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionPreference.addEventListener('change', onMotionPreferenceChange);
    intersectionObserver.observe(field);
    resizeObserver.observe(field);
    resize();

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      field.removeEventListener('pointermove', onPointerMove);
      field.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-particle-canvas"
      aria-hidden="true"
      data-physics-model="wind-bounce-pointer-repel"
      data-pixel-size={PIXEL_SIZE}
      data-minimum-opacity={MINIMUM_PARTICLE_OPACITY}
      data-cloud-count={CLOUD_COUNT}
      data-boundary-mode="hard-rebound"
      data-weather-mode="procedural"
      data-target-fps="60"
    />
  );
}
