import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RINGS_POSITION } from "../../config/scenes";
import { palette } from "../../config/theme";
import { createGlowTexture } from "../textures";

/** Two interlocked wedding bands turning slowly above the aisle — the events scene's hero object. */
export function FloatingRings() {
  const group = useRef<THREE.Group>(null);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.TorusGeometry(0.62, 0.075, 24, 96), []);
  const materials = useMemo(
    () => ({
      gold: new THREE.MeshStandardMaterial({ color: palette.goldLight, metalness: 1, roughness: 0.18 }),
      rose: new THREE.MeshStandardMaterial({ color: "#E2B48C", metalness: 1, roughness: 0.22 }),
    }),
    [],
  );
  const glowTex = useMemo(() => createGlowTexture("255,226,180"), []);
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }),
    [glowTex],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      materials.gold.dispose();
      materials.rose.dispose();
      glowTex.dispose();
      glowMat.dispose();
    },
    [geometry, materials, glowTex, glowMat],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.position.y = RINGS_POSITION[1] + Math.sin(t * 0.7) * 0.12;
      group.current.rotation.y = t * 0.25;
    }
    if (a.current) a.current.rotation.set(0.35 + Math.sin(t * 0.4) * 0.08, 0, 0.2);
    if (b.current) b.current.rotation.set(Math.PI / 2 + 0.25, 0.3, Math.sin(t * 0.35) * 0.1);
  });

  return (
    <group ref={group} position={[...RINGS_POSITION]}>
      <sprite material={glowMat} scale={[5, 5, 1]} renderOrder={-1} />
      <mesh ref={a} geometry={geometry} material={materials.gold} position={[-0.32, 0, 0]} />
      <mesh ref={b} geometry={geometry} material={materials.rose} position={[0.32, 0, 0]} />
    </group>
  );
}
