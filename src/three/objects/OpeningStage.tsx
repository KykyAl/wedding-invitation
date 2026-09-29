import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENVELOPE_POSITION } from "../../config/scenes";
import { runtime } from "../../store/experience";
import { createRandom } from "../../utils/random";
import { createGlowTexture } from "../textures";
import { Envelope } from "./Envelope";
import { createFlowerGeometry, FLOWER_TINTS } from "./flowerGeometry";

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    vUv = uv;
    vec3 n = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;

const beamFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    float along = pow(vUv.y, 1.6) * smoothstep(0.0, 0.3, vUv.y);
    float a = along * pow(vFacing, 2.0) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Soft volumetric beam falling on the envelope — a fake light shaft, one draw call. */
function LightBeam() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uOpacity: { value: 0.16 }, uColor: { value: new THREE.Color("#FFE2B0") } },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    material.uniforms.uOpacity.value = 0.16 * (1 - runtime.world.reveal) * (1 - runtime.opening.push * 0.6);
  });
  return (
    <mesh position={[0.4, 3.4, -1.2]} rotation-z={-0.08} material={material} renderOrder={3}>
      <coneGeometry args={[3, 7.6, 40, 1, true]} />
    </mesh>
  );
}

/** Warm halo behind the envelope so it separates from the black void. */
function Halo() {
  const texture = useMemo(() => createGlowTexture("255,214,160"), []);
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.32,
        fog: false,
      }),
    [texture],
  );
  useEffect(
    () => () => {
      texture.dispose();
      material.dispose();
    },
    [texture, material],
  );
  return <sprite material={material} position={[0, 0.2, -1.6]} scale={[11, 8, 1]} renderOrder={-1} />;
}

/** A handful of blooms orbiting slowly around the envelope. */
function DriftingBlooms() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createFlowerGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }), []);
  const blooms = useMemo(() => {
    const rand = createRandom(8);
    return Array.from({ length: 9 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        base: new THREE.Vector3(side * rand.range(2.1, 3.6), rand.range(-1.4, 1.8), rand.range(-1.8, 1.4)),
        scale: rand.range(0.14, 0.26),
        speed: rand.range(0.15, 0.35),
        phase: rand.range(0, Math.PI * 2),
        spin: new THREE.Euler(rand.range(0.4, 1.4), rand.range(0, 6), rand.range(0, 6)),
        tint: new THREE.Color(rand.pick(FLOWER_TINTS)),
      };
    });
  }, []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    blooms.forEach((b, i) => mesh.setColorAt(i, b.tint));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [blooms]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const burst = runtime.opening.burst;
    blooms.forEach((b, i) => {
      p.copy(b.base);
      p.y += Math.sin(t * b.speed + b.phase) * 0.18;
      p.x += Math.cos(t * b.speed * 0.7 + b.phase) * 0.12;
      p.multiplyScalar(1 + burst * 0.9);
      e.set(b.spin.x + t * b.speed * 0.3, b.spin.y + t * b.speed * 0.5, b.spin.z);
      q.setFromEuler(e);
      s.setScalar(b.scale);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, blooms.length]} frustumCulled={false} />;
}

/** Everything that lives in the dark opening void. Unmounted-by-visibility after the reveal. */
export function OpeningStage() {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) group.current.visible = runtime.world.reveal < 1;
  });
  return (
    <group ref={group}>
      <Envelope />
      <group position={[...ENVELOPE_POSITION]}>
        <Halo />
        <LightBeam />
        <DriftingBlooms />
      </group>
    </group>
  );
}
