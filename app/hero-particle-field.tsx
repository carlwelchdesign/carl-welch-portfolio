'use client';

import { useEffect, useRef } from 'react';

const DESKTOP_PARTICLE_COUNT = 64;
const MOBILE_PARTICLE_COUNT = 34;
const MOBILE_BREAKPOINT = 720;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_FRAME_DELTA_SECONDS = 1 / 30;
const TARGET_FRAME_INTERVAL_MILLISECONDS = 1000 / 60;
const POINTER_RADIUS = 156;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  opacity: number;
};

type PointerForce = {
  x: number;
  y: number;
  active: boolean;
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

function createParticles(width: number, height: number, count: number): Particle[] {
  const random = seededRandom(0x4341524c + count);
  return Array.from({ length: count }, (_, index) => {
    const size = 3 + Math.floor(random() * 5);
    const half = size / 2;
    return {
      x: half + random() * Math.max(1, width - size),
      y: half + random() * Math.max(1, height - size),
      vx: (random() - 0.5) * 82,
      vy: (random() - 0.58) * 72,
      size,
      phase: random() * Math.PI * 2 + index * 0.17,
      opacity: 0.42 + random() * 0.5,
    };
  });
}

function resolveParticleCollisions(particles: Particle[]) {
  for (let leftIndex = 0; leftIndex < particles.length; leftIndex += 1) {
    const left = particles[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < particles.length; rightIndex += 1) {
      const right = particles[rightIndex];
      let dx = right.x - left.x;
      let dy = right.y - left.y;
      const minimumDistance = (left.size + right.size) * 0.62;
      let distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= minimumDistance * minimumDistance) continue;

      if (distanceSquared < 0.0001) {
        dx = 0.01;
        dy = 0;
        distanceSquared = dx * dx;
      }
      const distance = Math.sqrt(distanceSquared);
      const normalX = dx / distance;
      const normalY = dy / distance;
      const correction = (minimumDistance - distance) / 2;
      left.x -= normalX * correction;
      left.y -= normalY * correction;
      right.x += normalX * correction;
      right.y += normalY * correction;

      const relativeVelocity = (right.vx - left.vx) * normalX + (right.vy - left.vy) * normalY;
      if (relativeVelocity >= 0) continue;
      const impulse = (-(1 + 0.84) * relativeVelocity) / 2;
      left.vx -= impulse * normalX;
      left.vy -= impulse * normalY;
      right.vx += impulse * normalX;
      right.vy += impulse * normalY;
    }
  }
}

function containParticle(particle: Particle, width: number, height: number, index: number) {
  const half = particle.size / 2;
  if (particle.x < half) {
    particle.x = half;
    particle.vx = Math.abs(particle.vx) * 0.86;
  } else if (particle.x > width - half) {
    particle.x = width - half;
    particle.vx = -Math.abs(particle.vx) * 0.86;
  }

  if (particle.y < half) {
    particle.y = half;
    particle.vy = Math.abs(particle.vy) * 0.86;
  } else if (particle.y > height - half) {
    particle.y = height - half;
    particle.vy = -Math.max(Math.abs(particle.vy) * 0.86, 72 + (index % 6) * 7);
  }
}

function stepParticles(
  particles: Particle[],
  width: number,
  height: number,
  deltaSeconds: number,
  elapsedMilliseconds: number,
  pointer: PointerForce,
) {
  particles.forEach((particle, index) => {
    let accelerationX = Math.sin(particle.phase + elapsedMilliseconds * 0.00032) * 7;
    let accelerationY = 30 + Math.cos(particle.phase + elapsedMilliseconds * 0.00021) * 3;

    if (pointer.active) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0.001 && distance < POINTER_RADIUS) {
        const pressure = (1 - distance / POINTER_RADIUS) * 430;
        accelerationX += (dx / distance) * pressure;
        accelerationY += (dy / distance) * pressure;
      }
    }

    particle.vx = (particle.vx + accelerationX * deltaSeconds) * 0.999;
    particle.vy = (particle.vy + accelerationY * deltaSeconds) * 0.999;
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed > 210) {
      particle.vx = (particle.vx / speed) * 210;
      particle.vy = (particle.vy / speed) * 210;
    }
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;
    containParticle(particle, width, height, index);
  });

  resolveParticleCollisions(particles);
  particles.forEach((particle, index) => containParticle(particle, width, height, index));
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
) {
  context.clearRect(0, 0, width, height);
  for (const particle of particles) {
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    const trailSteps = speed > 48 ? 2 : 1;
    for (let step = trailSteps; step >= 1; step -= 1) {
      const trailScale = step / (trailSteps + 1);
      const trailSize = Math.max(2, Math.round(particle.size * (1 - trailScale * 0.38)));
      context.fillStyle = `rgba(9, 12, 9, ${particle.opacity * (0.11 + trailScale * 0.08)})`;
      context.fillRect(
        Math.round(particle.x - particle.vx * 0.018 * step - trailSize / 2),
        Math.round(particle.y - particle.vy * 0.018 * step - trailSize / 2),
        trailSize,
        trailSize,
      );
    }
    context.fillStyle = `rgba(9, 12, 9, ${particle.opacity})`;
    context.fillRect(
      Math.round(particle.x - particle.size / 2),
      Math.round(particle.y - particle.size / 2),
      particle.size,
      particle.size,
    );
  }
}

function countBoundsViolations(particles: Particle[], width: number, height: number) {
  return particles.filter((particle) => {
    const half = particle.size / 2;
    return particle.x < half || particle.x > width - half || particle.y < half || particle.y > height - half;
  }).length;
}

export function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = canvas?.closest<HTMLElement>('.hero-field');
    const context = canvas?.getContext('2d');
    if (!canvas || !field || !context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer: PointerForce = { x: 0, y: 0, active: false };
    let particles: Particle[] = [];
    let width = 1;
    let height = 1;
    let frameCount = 0;
    let inputEvents = 0;
    let lastFrameTime = 0;
    let animationFrame: number | null = null;
    let inView = false;
    let documentVisible = document.visibilityState === 'visible';
    let reduceMotion = motionPreference.matches;

    const updateDiagnostics = () => {
      canvas.dataset.frameCount = String(frameCount);
      canvas.dataset.inputEvents = String(inputEvents);
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
      if (lastFrameTime !== 0 && time - lastFrameTime < TARGET_FRAME_INTERVAL_MILLISECONDS) {
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }
      const deltaSeconds = lastFrameTime === 0
        ? 1 / 60
        : Math.min((time - lastFrameTime) / 1000, MAX_FRAME_DELTA_SECONDS);
      lastFrameTime = time;
      stepParticles(particles, width, height, deltaSeconds, time, pointer);
      frameCount += 1;
      render();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const syncAnimation = () => {
      const active = shouldAnimate();
      canvas.dataset.active = String(active);
      canvas.dataset.renderMode = reduceMotion ? 'static' : 'dynamic';
      if (active && animationFrame === null) {
        lastFrameTime = 0;
        animationFrame = window.requestAnimationFrame(tick);
      } else if (!active && animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };

    const resize = () => {
      const rect = field.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const quality = window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
      const particleCount = quality === 'mobile' ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
      canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
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
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
      inputEvents += 1;
      canvas.dataset.inputEvents = String(inputEvents);
    };
    const onPointerLeave = () => {
      pointer.active = false;
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

    canvas.dataset.inputEvents = '0';
    field.addEventListener('pointermove', onPointerMove, { passive: true });
    field.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionPreference.addEventListener('change', onMotionPreferenceChange);
    intersectionObserver.observe(field);
    resizeObserver.observe(field);
    resize();

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
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
      data-physics-model="gravity-collision-pointer"
      data-target-fps="60"
    />
  );
}
