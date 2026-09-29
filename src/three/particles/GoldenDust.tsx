import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { quality } from "../../config/performance";
import { ENVELOPE_POSITION } from "../../config/scenes";
import { palette } from "../../config/theme";
import { runtime } from "../../store/experience";
import { createRandom } from "../../utils/random";

const BOX = new THREE.Vector3(18, 9, 26);

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uBurst;
  uniform float uAspect;
  uniform vec3 uCenter;
  uniform vec3 uBox;
  uniform vec3 uBurstCenter;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.y += uTime * (0.04 + aSeed * 0.08);
    p.x += sin(uTime * 0.25 + aSeed * 23.0) * 0.35;
    p.z += cos(uTime * 0.2 + aSeed * 17.0) * 0.25;

    // Infinite field: wrap every particle into a box that travels with the camera.
    vec3 rel = mod(p - uCenter + uBox * 0.5, uBox) - uBox * 0.5;
    vec3 world = uCenter + rel;

    // Opening burst: swirl outward from the envelope.
    vec3 d = world - uBurstCenter;
    float dist = length(d) + 1e-4;
    float falloff = exp(-dist * 0.22);
    vec3 swirl = normalize(vec3(-d.y, d.x, 0.35)) * 0.6;
    world += (d / dist + swirl) * uBurst * (1.2 + aSeed * 2.4) * falloff;

    vec4 mv = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;

    // Subtle cursor reaction in screen space.
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 dd = ndc - uPointer;
    dd.x *= uAspect;
    float push = smoothstep(0.28, 0.0, length(dd));
    vec2 dir = normalize(dd + 1e-4);
    gl_Position.xy += vec2(dir.x / uAspect, dir.y) * push * 0.05 * gl_Position.w;

    vec3 edge = abs(rel) / (uBox * 0.5);
    float edgeFade = 1.0 - smoothstep(0.75, 1.0, max(max(edge.x, edge.y), edge.z));
    float nearFade = smoothstep(0.4, 1.6, -mv.z);
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed * 2.2) + aSeed * 40.0);
    vAlpha = twinkle * edgeFade * nearFade;

    // Capped so motes drifting past the lens never become blobs.
    gl_PointSize = min(uSize * (0.35 + aSeed * 0.9) / -mv.z, 9.0) * uPixelRatio;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }
`;

const burstCenter = new THREE.Vector3(...ENVELOPE_POSITION);
const forward = new THREE.Vector3();

/** Floating gold dust — one draw call, animated entirely on the GPU. */
export function GoldenDust() {
  const { camera, gl, size } = useThree();
  const count = quality.dustCount;

  const geometry = useMemo(() => {
    const rand = createRandom(42);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = rand.range(-BOX.x / 2, BOX.x / 2);
      positions[i * 3 + 1] = rand.range(-BOX.y / 2, BOX.y / 2);
      positions[i * 3 + 2] = rand.range(-BOX.z / 2, BOX.z / 2);
      seeds[i] = rand.next();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 90 },
          uPixelRatio: { value: 1 },
          uBurst: { value: 0 },
          uAspect: { value: 1 },
          uCenter: { value: new THREE.Vector3() },
          uBox: { value: BOX },
          uBurstCenter: { value: burstCenter },
          uPointer: { value: new THREE.Vector2(9, 9) },
          uColor: { value: new THREE.Color(palette.goldLight) },
          uOpacity: { value: 1 },
        },
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
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uAspect.value = size.width / size.height;
    u.uBurst.value = runtime.opening.burst;
    // Bias the box ahead of the camera so no particles are wasted behind it.
    camera.getWorldDirection(forward);
    u.uCenter.value.copy(camera.position).addScaledVector(forward, BOX.z * 0.32);
    u.uPointer.value.set(runtime.cursor.x, runtime.cursor.y);
    // Brighter sparks in the dark void, softer sunlit dust in the forest.
    u.uOpacity.value = THREE.MathUtils.lerp(1, 0.75, runtime.world.reveal);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}
