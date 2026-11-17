"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createSceneInput, type SceneInputHandle } from "./sceneInput";

/**
 * The 3D hero: a glowing orange core inside three glass gimbal rings, with a
 * few glass shapes in orbit.
 *
 * - It turns to face the mouse or finger on springs, the rings swinging a
 *   little behind. Nearby orbiting pieces are drawn toward the pointer, and
 *   the core glows brighter as it gets close.
 * - A flick or swipe spins it; a tap or click sends a pulse through it.
 * - On phones, tilting the device turns it too (see `tilt.ts`).
 * - As the page scrolls (`progress` goes 0 to 1) the pieces drift apart.
 * - This file is loaded lazily, in the browser only, after the page is usable
 *   (see `Hero.tsx`), because three.js is by far the heaviest dependency.
 */

const ORANGE = "#ff5f1f";
const BACKGROUND = "#0a0a0a";

type Ring = {
  radius: number;
  tube: number;
  /** Fixed tilt of the ring's frame, in radians. */
  tilt: [number, number, number];
  /** Tumble speed, radians per second. */
  speed: number;
  /** Extra scale gained by the end of the scroll. */
  spread: number;
};

const RINGS: Ring[] = [
  { radius: 1.08, tube: 0.13, tilt: [0.5, 0.2, 0.1], speed: 0.42, spread: 0.25 },
  { radius: 1.5, tube: 0.085, tilt: [-0.9, 0.5, 0.6], speed: -0.3, spread: 0.6 },
  { radius: 1.92, tube: 0.05, tilt: [1.3, -0.3, -0.4], speed: 0.2, spread: 1.05 },
];

type Satellite = {
  kind: "sphere" | "ring" | "capsule" | "dot";
  size: number;
  orbit: number;
  speed: number;
  phase: number;
  tilt: [number, number, number];
};

const SATELLITES: Satellite[] = [
  {
    kind: "sphere",
    size: 0.28,
    orbit: 2.3,
    speed: 0.34,
    phase: 0.4,
    tilt: [0.5, 0, 0.3],
  },
  {
    kind: "ring",
    size: 0.24,
    orbit: 2.55,
    speed: -0.26,
    phase: 2.6,
    tilt: [-0.7, 0, 0.5],
  },
  {
    kind: "capsule",
    size: 0.17,
    orbit: 2.1,
    speed: 0.22,
    phase: 4.4,
    tilt: [1.1, 0, -0.6],
  },
  {
    kind: "sphere",
    size: 0.15,
    orbit: 2.75,
    speed: 0.4,
    phase: 5.3,
    tilt: [0.2, 0, -1.0],
  },
  { kind: "dot", size: 0.07, orbit: 1.95, speed: 0.7, phase: 1.2, tilt: [-0.3, 0, 0.9] },
  { kind: "dot", size: 0.05, orbit: 2.6, speed: -0.5, phase: 3.3, tilt: [0.9, 0, 0.2] },
  { kind: "dot", size: 0.06, orbit: 2.4, speed: 0.58, phase: 0.2, tilt: [-1.2, 0, -0.4] },
];

/** Small repeatable random generator, so the dust looks the same on every visit. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createDustPositions(count: number): Float32Array {
  const random = seededRandom(7);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    // Points on a thick shell around the cluster.
    const radius = 3 + random() * 3.5;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.7;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
}

function createHaloTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255, 120, 50, 0.6)");
    gradient.addColorStop(0.3, "rgba(255, 95, 31, 0.2)");
    gradient.addColorStop(1, "rgba(255, 95, 31, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const coreVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Deep orange in the middle, a lighter rim where the surface turns away.
// `uGlow` (0 and up) heats it toward the lighter colour and brightens it.
const coreFragmentShader = /* glsl */ `
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.0);
    vec3 deep = vec3(1.0, 0.3, 0.06);
    vec3 hot = vec3(1.0, 0.74, 0.52);
    vec3 color = mix(deep, hot, rim);
    color = mix(color, hot, min(uGlow, 1.0) * 0.45) * (1.0 + uGlow * 0.35);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export type HeroSceneProps = {
  /** Scroll progress through the hero, 0 at the top to 1 when it has left. */
  progress: MotionValue<number>;
  /** Rendering stops while this is false (hero scrolled out of view). */
  active: boolean;
  /** Called once, after the first frame has been drawn. */
  onReady: () => void;
  /** Called if the device cannot keep a usable frame rate, even at low quality. */
  onGiveUp: () => void;
  /**
   * Lighter rendering for phone-sized screens: fewer pixels, simpler glass
   * and less geometry. The scene looks the same at that size.
   */
  lite?: boolean;
  /**
   * Turn with the phone's tilt. Pass `true` only once the browser allows it
   * (on iPhones, after the visitor has accepted the permission prompt).
   */
  tilt?: boolean;
};

export default function HeroScene({
  progress,
  active,
  onReady,
  onGiveUp,
  lite = false,
  tilt = false,
}: HeroSceneProps) {
  const [maxDpr, setMaxDpr] = useState(lite ? 1.25 : 1.5);
  const slowSamples = useRef(0);

  // Start sharp. On a slow sample, first render fewer pixels. If it is slow
  // again after that, or hopelessly slow at any point, hand over to the static
  // artwork.
  function handleSlow(fps: number) {
    slowSamples.current += 1;
    if (fps < HOPELESS_FPS || slowSamples.current > 1) onGiveUp();
    else setMaxDpr(1);
  }

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ position: [0, 0, CAMERA_Z], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
    >
      <color attach="background" args={[BACKGROUND]} />
      <FrameRateGuard active={active} onSlow={handleSlow} />
      <StudioLights />
      <Cluster
        progress={progress}
        onReady={onReady}
        active={active}
        lite={lite}
        tilt={tilt}
      />
    </Canvas>
  );
}

/** Time to let shaders compile and the page settle before measuring, in ms. */
const WARMUP_MS = 1200;
/** Length of one frame-rate sample, in ms. */
const SAMPLE_MS = 1500;
/**
 * Below this the scene is reported as slow. Kept under 30 on purpose: phones
 * in battery-saver mode cap animation at 30 fps, and that is still fine.
 */
const SLOW_FPS = 24;
/** Below this there is no point trying a lower quality first. */
const HOPELESS_FPS = 12;

type FrameRateGuardProps = {
  active: boolean;
  onSlow: (fps: number) => void;
};

/**
 * Measures the real frame rate in short samples and reports the slow ones.
 * Sampling restarts whenever rendering resumes (hero back in view, tab back in
 * front), so a pause is never mistaken for a slow device.
 */
function FrameRateGuard({ active, onSlow }: FrameRateGuardProps) {
  const sample = useRef({ start: 0, frames: 0 });

  useEffect(() => {
    const restart = () => {
      sample.current = { start: 0, frames: 0 };
    };
    restart();
    document.addEventListener("visibilitychange", restart);
    return () => document.removeEventListener("visibilitychange", restart);
  }, [active]);

  useFrame(() => {
    const now = performance.now();
    const current = sample.current;

    if (current.start === 0) {
      current.start = now + WARMUP_MS;
      current.frames = 0;
      return;
    }
    if (now < current.start) return;

    current.frames += 1;
    const elapsed = now - current.start;
    if (elapsed < SAMPLE_MS) return;

    const fps = (current.frames / elapsed) * 1000;
    current.start = now;
    current.frames = 0;
    if (fps < SLOW_FPS) onSlow(fps);
  });

  return null;
}

/**
 * Reflections for the glass. The "environment" is built from a few coloured
 * panels rendered once into a cube map, so nothing is downloaded.
 */
function StudioLights() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#060606"]} />
      <Lightformer
        form="rect"
        intensity={5}
        color="#ffffff"
        position={[0, 6, -1]}
        scale={[12, 3, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={7}
        color={ORANGE}
        position={[-7, -2, 2]}
        scale={[3, 9, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={3}
        color="#cfe0ff"
        position={[7, 2, 1]}
        scale={[2, 7, 1]}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="ring"
        intensity={4}
        color="#ffe2d1"
        position={[0, -1, 9]}
        scale={4}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="circle"
        intensity={3}
        color={ORANGE}
        position={[2, -6, -4]}
        scale={5}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}

/** A value that is pulled toward a target and can overshoot it. */
type Spring = { value: number; velocity: number };

const spring = (): Spring => ({ value: 0, velocity: 0 });

/**
 * Moves a spring toward `target`. Low damping makes it overshoot and swing
 * back. It is stepped in small slices, so it feels the same at any frame rate.
 */
function stepSpring(
  state: Spring,
  target: number,
  [stiffness, damping]: readonly [number, number],
  delta: number,
) {
  const steps = Math.ceil(delta * 120);
  const dt = delta / steps;
  for (let i = 0; i < steps; i += 1) {
    state.velocity +=
      (stiffness * (target - state.value) - damping * state.velocity) * dt;
    state.value += state.velocity * dt;
  }
}

function limit(value: number, max: number) {
  return Math.min(Math.max(value, -max), max);
}

/** How far the cluster turns to face the pointer, in radians. */
const TURN_SIDEWAYS = 0.75;
const TURN_UP_DOWN = 0.55;
/** [stiffness, damping] of that turn: quick, with a small overshoot. */
const TURN_SPRING = [70, 11] as const;
/** The rings follow on looser springs, inner to outer, so they lag and swing. */
const RING_SPRINGS = [
  [48, 7],
  [34, 5.2],
  [24, 4],
] as const;
/** Spin gained from a flick one screen height long, in radians per second. */
const FLICK_SPIN = 6;
const MAX_SPIN = 8;
/** Which way, and how much, each ring tumbles from a sideways flick. */
const RING_FLICK = [1, -0.8, 0.6];
/** Springs that let the cluster wobble after an up or down flick, and after a tap. */
const WOBBLE_SPRING = [30, 4.5] as const;
const PULSE_SPRING = [60, 7] as const;
const PULSE_KICK = 9;
/** Share of the distance to the pointer that a nearby orbiting piece moves. */
const PULL = 0.55;
/** How far that pull reaches, in the cluster's own units. */
const PULL_RADIUS = 1.5;
/** Distance from the camera to the cluster's plane. */
const CAMERA_Z = 9;

type Motion = {
  /** Where the cluster looks, in canvas pixels; eased toward the pointer. */
  aimX: number;
  aimY: number;
  /** 0 to 1: a real pointer or finger (rather than tilt or idle drift) is driving it. */
  live: number;
  /** 0 to 1: tilt is driving it. */
  tilting: number;
  turnX: Spring;
  turnY: Spring;
  rings: Array<{ turnX: Spring; turnY: Spring; spin: number; spinVelocity: number }>;
  spin: number;
  spinVelocity: number;
  wobble: Spring;
  pulse: Spring;
  glow: number;
};

function createMotion(): Motion {
  return {
    aimX: Number.NaN,
    aimY: Number.NaN,
    live: 0,
    tilting: 0,
    turnX: spring(),
    turnY: spring(),
    rings: RINGS.map(() => ({
      turnX: spring(),
      turnY: spring(),
      spin: 0,
      spinVelocity: 0,
    })),
    spin: 0,
    spinVelocity: 0,
    wobble: spring(),
    pulse: spring(),
    glow: 0,
  };
}

type ClusterProps = Pick<HeroSceneProps, "progress" | "onReady" | "active"> & {
  lite: boolean;
  tilt: boolean;
};

function Cluster({ progress, onReady, active, lite, tilt }: ClusterProps) {
  const cluster = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const dust = useRef<THREE.Points>(null);
  const ringPivots = useRef<Array<THREE.Group | null>>([]);
  const ringMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const satelliteMeshes = useRef<Array<THREE.Mesh | null>>([]);

  const time = useRef(0);
  const intro = useRef(0);
  const announced = useRef(false);
  const input = useRef<SceneInputHandle | null>(null);
  const motion = useRef<Motion | null>(null);
  const scratch = useRef<THREE.Vector3 | null>(null);

  const viewport = useThree((state) => state.viewport);
  const portrait = viewport.aspect < 0.9;

  // Sit to the right on wide screens, and up top on tall ones, clear of the text.
  const baseScale = portrait
    ? Math.min(0.9, viewport.width / 4.6)
    : Math.min(0.95, viewport.height / 6);
  const baseX = portrait ? viewport.width * 0.06 : viewport.width * 0.22;
  const baseY = portrait ? viewport.height * 0.25 : viewport.height * 0.09;

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transmission: 1,
        thickness: 0.9,
        roughness: 0.04,
        ior: 1.48,
        // Dispersion (the rainbow fringe) triples the refraction work.
        dispersion: lite ? 0 : 6,
        attenuationColor: "#ffc9a6",
        attenuationDistance: 3,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.35,
      }),
    [lite],
  );

  const coreMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVertexShader,
        fragmentShader: coreFragmentShader,
        uniforms: { uGlow: { value: 0 } },
        toneMapped: false,
      }),
    [],
  );

  const haloTexture = useMemo(() => createHaloTexture(), []);
  const dustPositions = useMemo(() => createDustPositions(lite ? 140 : 320), [lite]);

  // Smoothness of the curved shapes: [around the tube, around the ring].
  const ringDetail: [number, number] = lite ? [24, 96] : [40, 160];
  const sphereDetail = lite ? 28 : 44;

  useEffect(() => {
    return () => {
      glass.dispose();
      coreMaterial.dispose();
      haloTexture.dispose();
    };
  }, [glass, coreMaterial, haloTexture]);

  // The canvas sits under the page text, so it never receives events itself;
  // the input listens on the window (see `sceneInput.ts`).
  useEffect(() => {
    const handle = createSceneInput();
    input.current = handle;
    return () => {
      handle.destroy();
      input.current = null;
    };
  }, []);

  // The motion sensor runs only while the scene is on screen.
  useEffect(() => {
    input.current?.listenToTilt(tilt && active);
  }, [tilt, active]);

  useFrame((state, rawDelta) => {
    const group = cluster.current;
    if (!group) return;

    const handle = input.current;
    const io = handle ? handle.state : null;
    const impulses = handle?.take();
    // After a pause (scene off screen, tab in the background), forget flicks
    // and taps that happened meanwhile, and don't let the scene jump.
    const fresh = rawDelta <= 0.25;
    const delta = Math.min(rawDelta, 0.1);
    time.current += delta;
    const t = time.current;

    intro.current = Math.min(1, intro.current + delta / 1.9);
    const grow = 1 - Math.pow(1 - intro.current, 4);
    const scroll = progress.get();
    const m = (motion.current ??= createMotion());
    const point = (scratch.current ??= new THREE.Vector3());

    // Where the cluster is on screen, in canvas pixels.
    const { size } = state;
    const unit = size.height / viewport.height;
    const scale = baseScale * (0.3 + 0.7 * grow) * (1 + scroll * 0.25);
    const worldY = baseY + scroll * viewport.height * 0.2 + Math.sin(t * 0.55) * 0.06;
    const centerX = size.width / 2 + baseX * unit;
    const centerY = size.height / 2 - worldY * unit;
    const radius = RINGS[RINGS.length - 1].radius * scale * unit;
    // Pointer distance at which the turn is about three quarters of its maximum.
    const reach = Math.max(radius * 1.5, size.height * 0.3);

    // What it looks at: the pointer or finger; else a point set by the tilt
    // of the phone; else a slow drift around its centre.
    let aimX = centerX + Math.sin(t * 0.37) * reach * 0.25;
    let aimY = centerY + Math.sin(t * 0.29 + 1) * reach * 0.15;
    let rate = 2;
    let live = 0;
    let tilting = 0;
    if (io?.present) {
      aimX = io.x - size.left;
      aimY = io.y - size.top;
      rate = 14;
      live = 1;
    } else if (io?.tilt) {
      aimX = centerX + io.tilt.x * reach;
      aimY = centerY + io.tilt.y * reach;
      rate = 6;
      tilting = 1;
    }
    const follow = 1 - Math.exp(-delta * rate);
    m.aimX = Number.isNaN(m.aimX) ? aimX : m.aimX + (aimX - m.aimX) * follow;
    m.aimY = Number.isNaN(m.aimY) ? aimY : m.aimY + (aimY - m.aimY) * follow;
    m.live += (live - m.live) * (1 - Math.exp(-delta * 4));
    m.tilting += (tilting - m.tilting) * (1 - Math.exp(-delta * 3));

    // Turn to face it. The rings follow more loosely.
    const faceY = TURN_SIDEWAYS * Math.tanh((m.aimX - centerX) / reach);
    const faceX = TURN_UP_DOWN * Math.tanh((m.aimY - centerY) / reach);
    stepSpring(m.turnX, faceX, TURN_SPRING, delta);
    stepSpring(m.turnY, faceY, TURN_SPRING, delta);
    m.rings.forEach((ring, index) => {
      stepSpring(ring.turnX, faceX, RING_SPRINGS[index], delta);
      stepSpring(ring.turnY, faceY, RING_SPRINGS[index], delta);
    });

    // A flick or swipe spins it; a tap or click sends a pulse through it.
    // With a mouse, only flicks across the cluster count, not every quick
    // move toward the menu.
    if (io && impulses && fresh) {
      const distance = Math.hypot(io.x - size.left - centerX, io.y - size.top - centerY);
      const near = io.touch ? 1 : Math.exp(-((distance / (radius * 1.8)) ** 2));
      const flickX = (impulses.flickX / size.height) * near;
      const flickY = (impulses.flickY / size.height) * near;

      m.spinVelocity = limit(m.spinVelocity + flickX * FLICK_SPIN, MAX_SPIN);
      m.wobble.velocity += flickY * FLICK_SPIN * 0.7;
      m.rings.forEach((ring, index) => {
        ring.spinVelocity = limit(
          ring.spinVelocity + (flickX * RING_FLICK[index] + flickY * 0.5) * FLICK_SPIN,
          MAX_SPIN,
        );
      });

      if (impulses.pulses > 0) {
        m.pulse.velocity += PULSE_KICK * Math.min(impulses.pulses, 2);
        m.rings.forEach((ring, index) => {
          ring.spinVelocity = limit(
            ring.spinVelocity + RING_FLICK[index] * 2.5,
            MAX_SPIN,
          );
        });
      }
    }
    m.spinVelocity *= Math.exp(-delta * 1.1);
    m.spin += m.spinVelocity * delta;
    m.rings.forEach((ring) => {
      ring.spinVelocity *= Math.exp(-delta * 1.5);
      ring.spin += ring.spinVelocity * delta;
    });
    stepSpring(m.wobble, 0, WOBBLE_SPRING, delta);
    stepSpring(m.pulse, 0, PULSE_SPRING, delta);
    const pulse = m.pulse.value;

    // The core glows brighter as the pointer gets close.
    const aimDistance = Math.hypot(m.aimX - centerX, m.aimY - centerY);
    const glowTarget = m.live * Math.exp(-((aimDistance / (radius * 0.8)) ** 2));
    m.glow += (glowTarget - m.glow) * (1 - Math.exp(-delta * 5));
    const glow = m.glow + Math.max(pulse, 0) * 0.9;

    // Scrolling still turns the cluster and pulls it apart, as before.
    group.rotation.x = m.turnX.value + m.wobble.value + scroll * 0.55;
    group.rotation.y = m.turnY.value + m.spin + scroll * 1.15;
    group.position.set(baseX, worldY, 0);
    group.scale.setScalar(scale);

    ringMeshes.current.forEach((mesh, index) => {
      const pivot = ringPivots.current[index];
      if (!mesh || !pivot) return;
      const ring = RINGS[index];
      const motionOfRing = m.rings[index];
      // Only the difference: the cluster's own turn already applies.
      pivot.rotation.set(
        motionOfRing.turnX.value - m.turnX.value,
        motionOfRing.turnY.value - m.turnY.value,
        0,
      );
      mesh.rotation.x = t * ring.speed + (1 - grow) * 2.4 + motionOfRing.spin;
      mesh.rotation.y = t * ring.speed * 0.6;
      mesh.scale.setScalar(
        (1 + scroll * ring.spread) * (1 + pulse * 0.14 * (1 + index * 0.4)),
      );
    });

    group.updateMatrixWorld();

    // Orbiting pieces near the pointer are drawn toward it. The pull is
    // worked out on screen, at each piece's own depth.
    const pull = Math.max(m.live, m.tilting) * PULL;
    const pullRadius = PULL_RADIUS * scale;
    satelliteMeshes.current.forEach((mesh, index) => {
      const parent = mesh?.parent;
      if (!mesh || !parent) return;
      const satellite = SATELLITES[index];
      const angle = satellite.phase + t * satellite.speed;
      const orbit =
        satellite.orbit *
        (0.55 + 0.45 * grow) *
        (1 + scroll * 1.5) *
        (1 + Math.max(pulse, -0.5) * 0.35);
      point.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);

      if (pull > 0.001) {
        parent.localToWorld(point);
        const depth = (CAMERA_Z - point.z) / CAMERA_Z;
        const dx = ((m.aimX - size.width / 2) / unit) * depth - point.x;
        const dy = (-(m.aimY - size.height / 2) / unit) * depth - point.y;
        const strength =
          pull * Math.exp(-(dx * dx + dy * dy) / (pullRadius * pullRadius));
        point.x += dx * strength;
        point.y += dy * strength;
        parent.worldToLocal(point);
      }

      mesh.position.copy(point);
      mesh.rotation.x += delta * 0.5;
      mesh.rotation.y += delta * 0.35;
    });

    if (core.current) {
      core.current.scale.setScalar(1 + Math.sin(t * 1.3) * 0.025 + pulse * 0.12);
      (core.current.material as THREE.ShaderMaterial).uniforms.uGlow.value = glow;
    }
    if (halo.current) {
      halo.current.scale.set(6.4 * (1 + glow * 0.25), 6.4 * (1 + glow * 0.25), 1);
      halo.current.material.color.setScalar(1 + glow * 0.8);
    }

    if (dust.current) {
      // The dust turns less than the cluster when it spins, which adds depth.
      dust.current.rotation.y = t * 0.02 + scroll * 0.5 - m.spin * 0.6;
    }

    if (!announced.current) {
      announced.current = true;
      onReady();
    }
  });

  return (
    <group ref={cluster}>
      {/* Core and its glow. */}
      <mesh ref={core} material={coreMaterial}>
        <sphereGeometry args={[0.56, sphereDetail, sphereDetail]} />
      </mesh>
      <sprite ref={halo} scale={[6.4, 6.4, 1]}>
        <spriteMaterial
          map={haloTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          transparent
        />
      </sprite>

      {/* Gimbal rings. The outer group lets each ring lag behind the turn. */}
      {RINGS.map((ring, index) => (
        <group
          key={index}
          ref={(pivot) => {
            ringPivots.current[index] = pivot;
          }}
        >
          <group rotation={ring.tilt}>
            <mesh
              ref={(mesh) => {
                ringMeshes.current[index] = mesh;
              }}
              material={glass}
            >
              <torusGeometry args={[ring.radius, ring.tube, ...ringDetail]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Orbiting pieces. */}
      {SATELLITES.map((satellite, index) => (
        <group key={index} rotation={satellite.tilt}>
          <mesh
            ref={(mesh) => {
              satelliteMeshes.current[index] = mesh;
            }}
            material={satellite.kind === "dot" ? coreMaterial : glass}
          >
            {satellite.kind === "ring" && (
              <torusGeometry args={[satellite.size, satellite.size * 0.34, 24, 64]} />
            )}
            {satellite.kind === "capsule" && (
              <capsuleGeometry args={[satellite.size, satellite.size * 2.2, 12, 28]} />
            )}
            {(satellite.kind === "sphere" || satellite.kind === "dot") && (
              <sphereGeometry args={[satellite.size, sphereDetail, sphereDetail]} />
            )}
          </mesh>
        </group>
      ))}

      {/* Faint dust for depth. */}
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#f4efe9"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
