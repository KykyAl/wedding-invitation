import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphere, palette } from "../../config/theme";
import { runtime } from "../../store/experience";

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform vec3 uVoid;
  uniform float uReveal;
  varying vec3 vDir;

  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(0.02, 0.2, h));
    col = mix(col, uTop, smoothstep(0.2, 0.75, h));

    float s = max(dot(dir, uSunDir), 0.0);
    col += uSun * (pow(s, 5.0) * 0.28 + pow(s, 48.0) * 0.55 + pow(s, 900.0) * 1.6);

    col = mix(uVoid, col, uReveal);
    gl_FragColor = vec4(col, 1.0);
    // No tone mapping: the horizon must match three's fog colour exactly (fog is applied post tone-map).
    #include <colorspace_fragment>
  }
`;

/** Golden-hour gradient dome with a low sun. Follows the camera so it reads as infinitely far. */
export function Sky() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => {
    const w = atmosphere.world;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uTop: { value: new THREE.Color(w.skyTop) },
        uMid: { value: new THREE.Color(w.skyMid) },
        uHorizon: { value: new THREE.Color(w.fog) },
        uSun: { value: new THREE.Color(w.sun) },
        uSunDir: { value: new THREE.Vector3(-0.16, 0.035, -1).normalize() },
        uVoid: { value: new THREE.Color(palette.ink) },
        uReveal: { value: 0 },
      },
    });
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ camera }) => {
    material.uniforms.uReveal.value = runtime.world.reveal;
    mesh.current?.position.copy(camera.position);
  });

  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[500, 32, 16]} />
    </mesh>
  );
}
