import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { quality } from "../../config/performance";
import { LAKE, LANTERN_RANGE } from "../../config/scenes";
import { palette } from "../../config/theme";
import { runtime } from "../../store/experience";
import { createRandom } from "../../utils/random";

const POST_HEIGHT = 1.15;

function lanternPositions(): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const { from, to, spacing, offsetX } = LANTERN_RANGE;
  for (let z = from, i = 0; z >= to; z -= spacing, i++) {
    // The aisle skirts the lake — no lanterns standing in the water.
    if (Math.abs(z - LAKE.center[2]) < LAKE.radius + 1) continue;
    const stagger = i % 2 ? 0.25 : -0.25;
    out.push(new THREE.Vector3(-offsetX, 0, z + stagger), new THREE.Vector3(offsetX, 0, z - stagger));
  }
  return out;
}

const glowVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vFlicker;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vFlicker = 0.82 + 0.18 * sin(uTime * (5.0 + aSeed * 3.0) + aSeed * 30.0) * sin(uTime * 2.3 + aSeed * 11.0);
    gl_PointSize = min(210.0 / -mv.z, 90.0) * uPixelRatio;
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFlicker;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = smoothstep(0.25, 0.0, d);
    float halo = pow(max(0.0, 1.0 - d), 3.0) * 0.45;
    gl_FragColor = vec4(uColor, (core + halo) * vFlicker * uOpacity);
  }
`;

/**
 * Brass lanterns lining the aisle: instanced posts + lamps, and one Points draw call
 * for all the flickering glows.
 */
export function Lanterns() {
  const posts = useRef<THREE.InstancedMesh>(null);
  const lamps = useRef<THREE.InstancedMesh>(null);
  const { gl } = useThree();
  const positions = useMemo(() => {
    const all = lanternPositions();
    // Low tier: every other pair.
    return quality.tier === "low" ? all.filter((_, i) => Math.floor(i / 2) % 2 === 0) : all;
  }, []);
  const count = positions.length;

  const geos = useMemo(() => {
    const post = new THREE.CylinderGeometry(0.025, 0.035, POST_HEIGHT, 6);
    post.translate(0, POST_HEIGHT / 2, 0);
    const lamp = new THREE.OctahedronGeometry(0.11, 0);
    lamp.scale(1, 1.5, 1);
    return { post, lamp };
  }, []);

  const mats = useMemo(
    () => ({
      post: new THREE.MeshStandardMaterial({ color: palette.goldDeep, metalness: 0.9, roughness: 0.45 }),
      lamp: new THREE.MeshBasicMaterial({ color: "#FFE3B0" }),
    }),
    [],
  );

  const glow = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const rand = createRandom(17);
    positions.forEach((v, i) => {
      p.set([v.x, POST_HEIGHT + 0.12, v.z], i * 3);
      s[i] = rand.next();
    });
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color("#FFC98A") },
        uOpacity: { value: 0 },
      },
    });
    return { geometry: g, material: m };
  }, [positions, count]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      posts.current?.setMatrixAt(i, m.makeTranslation(p.x, 0, p.z));
      lamps.current?.setMatrixAt(i, m.makeTranslation(p.x, POST_HEIGHT + 0.12, p.z));
    });
    for (const ref of [posts, lamps]) {
      if (!ref.current) continue;
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.computeBoundingSphere();
    }
  }, [positions]);

  useEffect(
    () => () => {
      geos.post.dispose();
      geos.lamp.dispose();
      mats.post.dispose();
      mats.lamp.dispose();
      glow.geometry.dispose();
      glow.material.dispose();
    },
    [geos, mats, glow],
  );

  useFrame((_, delta) => {
    const u = glow.material.uniforms;
    u.uTime.value += Math.min(delta, 0.1);
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uOpacity.value = runtime.world.reveal;
  });

  return (
    <group>
      <instancedMesh ref={posts} args={[geos.post, mats.post, count]} />
      <instancedMesh ref={lamps} args={[geos.lamp, mats.lamp, count]} />
      <points geometry={glow.geometry} material={glow.material} renderOrder={6} />
    </group>
  );
}
