"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * The 3D hero: a glowing orange core inside three glass gimbal rings, with a
 * few glass shapes in orbit.
 *
 * - It leans toward the cursor.
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
const coreFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.0);
    vec3 deep = vec3(1.0, 0.3, 0.06);
    vec3 hot = vec3(1.0, 0.74, 0.52);
    gl_FragColor = vec4(mix(deep, hot, rim), 1.0);
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
};

export default function HeroScene({
  progress,
  active,
  onReady,
  onGiveUp,
  lite = false,
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
      camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
    >
      <color attach="background" args={[BACKGROUND]} />
      <FrameRateGuard active={active} onSlow={handleSlow} />
      <StudioLights />
      <Cluster progress={progress} onReady={onReady} lite={lite} />
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

type ClusterProps = Pick<HeroSceneProps, "progress" | "onReady"> & { lite: boolean };

function Cluster({ progress, onReady, lite }: ClusterProps) {
  const cluster = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Points>(null);
  const ringMeshes = useRef<Array<THREE.Mesh | null>>([]);
  const satelliteMeshes = useRef<Array<THREE.Mesh | null>>([]);

  const time = useRef(0);
  const intro = useRef(0);
  const announced = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

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

  // The canvas sits under the page text, so it never receives pointer events
  // itself. Listen on the window instead.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, rawDelta) => {
    const group = cluster.current;
    if (!group) return;

    // Clamp so the scene doesn't jump after the tab or the loop was paused.
    const delta = Math.min(rawDelta, 0.1);
    time.current += delta;
    const t = time.current;

    intro.current = Math.min(1, intro.current + delta / 1.9);
    const grow = 1 - Math.pow(1 - intro.current, 4);
    const scroll = progress.get();

    // Ease the whole cluster toward the cursor, and turn it as the page scrolls.
    const ease = 1 - Math.exp(-delta * 3);
    const targetX = pointer.current.y * 0.2 + scroll * 0.55;
    const targetY = pointer.current.x * 0.3 + scroll * 1.15;
    group.rotation.x += (targetX - group.rotation.x) * ease;
    group.rotation.y += (targetY - group.rotation.y) * ease;
    group.position.set(
      baseX,
      baseY + scroll * viewport.height * 0.2 + Math.sin(t * 0.55) * 0.06,
      0,
    );
    group.scale.setScalar(baseScale * (0.3 + 0.7 * grow) * (1 + scroll * 0.25));

    ringMeshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const ring = RINGS[index];
      mesh.rotation.x = t * ring.speed + (1 - grow) * 2.4;
      mesh.rotation.y = t * ring.speed * 0.6;
      mesh.scale.setScalar(1 + scroll * ring.spread);
    });

    satelliteMeshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const satellite = SATELLITES[index];
      const angle = satellite.phase + t * satellite.speed;
      const orbit = satellite.orbit * (0.55 + 0.45 * grow) * (1 + scroll * 1.5);
      mesh.position.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
      mesh.rotation.x += delta * 0.5;
      mesh.rotation.y += delta * 0.35;
    });

    if (core.current) {
      core.current.scale.setScalar(1 + Math.sin(t * 1.3) * 0.025);
    }

    if (dust.current) {
      dust.current.rotation.y = t * 0.02 + scroll * 0.5;
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
      <sprite scale={[6.4, 6.4, 1]}>
        <spriteMaterial
          map={haloTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          transparent
        />
      </sprite>

      {/* Gimbal rings. */}
      {RINGS.map((ring, index) => (
        <group key={index} rotation={ring.tilt}>
          <mesh
            ref={(mesh) => {
              ringMeshes.current[index] = mesh;
            }}
            material={glass}
          >
            <torusGeometry args={[ring.radius, ring.tube, ...ringDetail]} />
          </mesh>
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
