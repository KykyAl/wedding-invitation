import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { quality } from "../../config/performance";
import { ENVELOPE_POSITION } from "../../config/scenes";
import { palette } from "../../config/theme";
import { runtime } from "../../store/experience";
import { createRandom } from "../../utils/random";

const BOX = new THREE.Vector3(16, 10, 22);

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  uniform float uTime;
  uniform float uBurst;
  uniform vec3 uCenter;
  uniform vec3 uBox;
  uniform vec3 uBurstCenter;
  attribute vec3 aOffset;
  attribute float aSeed;
  varying float vShade;
  varying float vSeed;
  varying float vFade;
  varying vec2 vUv;

  mat3 rotation(vec3 a) {
    vec3 s = sin(a), c = cos(a);
    mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, c.x, s.x, 0.0, -s.x, c.x);
    mat3 ry = mat3(c.y, 0.0, -s.y, 0.0, 1.0, 0.0, s.y, 0.0, c.y);
    mat3 rz = mat3(c.z, s.z, 0.0, -s.z, c.z, 0.0, 0.0, 0.0, 1.0);
    return rz * ry * rx;
  }

  void main() {
    vUv = uv;
    vSeed = aSeed;

    vec3 base = aOffset;
    base.y -= uTime * (0.22 + aSeed * 0.22);
    base.x += sin(uTime * 0.45 + aSeed * 12.0) * 0.7 + uTime * 0.08;
    base.z += cos(uTime * 0.35 + aSeed * 7.0) * 0.4;

    vec3 rel = mod(base - uCenter + uBox * 0.5, uBox) - uBox * 0.5;
    vec3 world = uCenter + rel;

    vec3 d = world - uBurstCenter;
    float dist = length(d) + 1e-4;
    world += (d / dist) * uBurst * 2.2 * exp(-dist * 0.2);

    float t = uTime * (0.5 + aSeed * 0.8) + aSeed * 6.2831;
    mat3 rot = rotation(vec3(t, t * 0.63, t * 0.41));
    float scale = 0.07 + aSeed * 0.06;
    vec3 local = position;
    // Cup the petal slightly.
    local.z += (local.x * local.x) * 0.9;
    world += rot * (local * scale);

    vec3 n = normalize(rot * vec3(0.0, 0.0, 1.0));
    vShade = 0.62 + 0.38 * abs(n.y);

    vec3 edge = abs(rel) / (uBox * 0.5);
    vFade = 1.0 - smoothstep(0.8, 1.0, max(max(edge.x, edge.y), edge.z));

    vec4 mvPosition = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Petals brushing the lens would fill the frame — dissolve them first.
    vFade *= smoothstep(1.2, 3.0, -mvPosition.z);
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uLight;
  varying float vShade;
  varying float vSeed;
  varying float vFade;
  varying vec2 vUv;

  void main() {
    // Petal silhouette: rounded teardrop inside the quad.
    vec2 p = vUv * 2.0 - 1.0;
    float shape = 1.0 - smoothstep(0.85, 1.0, length(vec2(p.x * (1.25 - p.y * 0.35), p.y)));
    shape *= vFade;
    if (shape < 0.02) discard;
    vec3 col = mix(uColorA, uColorB, vSeed) * vShade * uLight;
    // Soft translucent edge
    gl_FragColor = vec4(col, shape * 0.95);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const burstCenter = new THREE.Vector3(...ENVELOPE_POSITION);
const forward = new THREE.Vector3();

/** Ivory & blush petals drifting down — instanced, GPU-animated, fogged into the scene. */
export function FloatingPetals() {
  const { camera } = useThree();
  const count = quality.petalCount;

  const geometry = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1.35, 3, 3);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute("position", base.getAttribute("position"));
    g.setAttribute("uv", base.getAttribute("uv"));
    const rand = createRandom(7);
    const offsets = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      offsets[i * 3] = rand.range(-BOX.x / 2, BOX.x / 2);
      offsets[i * 3 + 1] = rand.range(-BOX.y / 2, BOX.y / 2);
      offsets[i * 3 + 2] = rand.range(-BOX.z / 2, BOX.z / 2);
      seeds[i] = rand.next();
    }
    g.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    g.instanceCount = count;
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uBurst: { value: 0 },
            uCenter: { value: new THREE.Vector3() },
            uBox: { value: BOX },
            uBurstCenter: { value: burstCenter },
            uColorA: { value: new THREE.Color(palette.ivory) },
            uColorB: { value: new THREE.Color("#E6C3B2") },
            uLight: { value: 0.5 },
          },
        ]),
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    const u = material.uniforms;
    u.uTime.value += Math.min(delta, 0.1);
    u.uBurst.value = runtime.opening.burst;
    camera.getWorldDirection(forward);
    u.uCenter.value.copy(camera.position).addScaledVector(forward, BOX.z * 0.3);
    u.uLight.value = THREE.MathUtils.lerp(0.8, 1.05, runtime.world.reveal);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={4} />;
}
