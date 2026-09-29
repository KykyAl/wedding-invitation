import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../../config/theme";
import { runtime } from "../../store/experience";
import { createRandom } from "../../utils/random";
import { createPathTexture } from "../textures";

const PATH_LENGTH = 220;
const PATH_CENTER_Z = 20 - PATH_LENGTH / 2;

/** Meadow floor + a pale footpath that leads the eye down the forest aisle. */
function Ground() {
  const pathTex = useMemo(() => createPathTexture(), []);
  useEffect(() => () => pathTex.dispose(), [pathTex]);

  return (
    <group>
      {/* Ends at z = +30 so nothing sits under the opening envelope (z = 60). */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -85]}>
        <planeGeometry args={[420, 230]} />
        <meshLambertMaterial color="#6A5540" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, PATH_CENTER_Z]}>
        <planeGeometry args={[3.4, PATH_LENGTH]} />
        <meshLambertMaterial
          color={palette.beige}
          alphaMap={pathTex}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

interface RidgeProps {
  z: number;
  baseHeight: number;
  amplitude: number;
  color: string;
  seed: number;
}

/**
 * Distant mountain silhouette (Ciwidey highlands). Unfogged so it survives the fog far plane;
 * the colour is pre-mixed toward the horizon to fake aerial perspective.
 */
function Ridge({ z, baseHeight, amplitude, color, seed }: RidgeProps) {
  const geometry = useMemo(() => {
    const rand = createRandom(seed);
    const width = 700;
    const steps = 90;
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -10);
    const phase = rand.range(0, 10);
    for (let i = 0; i <= steps; i++) {
      const x = -width / 2 + (i / steps) * width;
      const n =
        Math.sin(x * 0.018 + phase) * 0.5 +
        Math.sin(x * 0.043 + phase * 2) * 0.3 +
        Math.sin(x * 0.11 + phase * 3) * 0.12 +
        rand.range(-0.04, 0.04);
      // A valley where the sun sets (sun direction x ≈ -0.16 · distance).
      const valley = 1 - 0.75 * Math.exp(-(((x + z * -0.16) / 60) ** 2));
      shape.lineTo(x, (baseHeight + n * amplitude) * valley);
    }
    shape.lineTo(width / 2, -10);
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 1);
  }, [baseHeight, amplitude, seed, z]);

  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false }),
    [color],
  );

  const target = useMemo(() => new THREE.Color(color), [color]);
  const dark = useMemo(() => new THREE.Color(palette.ink), []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    material.color.lerpColors(dark, target, runtime.world.reveal);
  });

  return <mesh geometry={geometry} material={material} position={[0, 0, z]} renderOrder={-5} />;
}

export function Terrain() {
  return (
    <group>
      <Ground />
      <Ridge z={-230} baseHeight={26} amplitude={16} color="#D7B994" seed={3} />
      <Ridge z={-170} baseHeight={14} amplitude={10} color="#B8977A" seed={9} />
    </group>
  );
}
