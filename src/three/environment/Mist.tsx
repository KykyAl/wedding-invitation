import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { quality } from "../../config/performance";
import { atmosphere } from "../../config/theme";
import { runtime } from "../../store/experience";
import { createRandom } from "../../utils/random";
import { createMistTexture } from "../textures";

interface Layer {
  z: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

/** Slow-drifting mist bands between the trees — highland morning fog. */
export function Mist() {
  const layers = useMemo<Layer[]>(() => {
    const rand = createRandom(99);
    return Array.from({ length: quality.mistLayers }, (_, i) => ({
      z: -4 - i * (60 / quality.mistLayers) - rand.range(0, 6),
      y: rand.range(1.6, 2.6),
      scale: rand.range(0.9, 1.3),
      speed: rand.range(0.004, 0.01) * (i % 2 ? 1 : -1),
      opacity: rand.range(0.35, 0.6),
    }));
  }, []);

  const base = useMemo(() => createMistTexture(), []);
  const materials = useMemo(
    () =>
      layers.map((l, i) => {
        const tex = base.clone();
        tex.offset.x = i * 0.37;
        return new THREE.MeshBasicMaterial({
          color: atmosphere.world.fog,
          alphaMap: tex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          userData: { baseOpacity: l.opacity, speed: l.speed },
        });
      }),
    [layers, base],
  );

  useEffect(
    () => () => {
      base.dispose();
      materials.forEach((m) => {
        m.alphaMap?.dispose();
        m.dispose();
      });
    },
    [base, materials],
  );

  useFrame((_, delta) => {
    const reveal = runtime.world.reveal;
    for (const m of materials) {
      if (m.alphaMap) m.alphaMap.offset.x += m.userData.speed * Math.min(delta, 0.1);
      m.opacity = m.userData.baseOpacity * reveal;
    }
  });

  return (
    <group>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, l.y, l.z]} scale={[l.scale, 1, 1]} material={materials[i]} renderOrder={2}>
          <planeGeometry args={[70, 7]} />
        </mesh>
      ))}
    </group>
  );
}
