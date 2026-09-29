import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAKE, PIN_OFFSET } from "../../config/scenes";
import { palette } from "../../config/theme";

/**
 * Ranca Upas lake with a golden location pin — from the venue camera's aerial angle it
 * reads like a living map. Water is a glossy disc lit by the procedural environment.
 */
export function Lake() {
  const pin = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const [cx, , cz] = LAKE.center;

  const materials = useMemo(
    () => ({
      water: new THREE.MeshStandardMaterial({ color: "#9C8A70", metalness: 0.55, roughness: 0.12 }),
      shore: new THREE.MeshLambertMaterial({ color: "#8A7254" }),
      pin: new THREE.MeshStandardMaterial({ color: palette.goldLight, metalness: 1, roughness: 0.25 }),
      pulse: new THREE.MeshBasicMaterial({ color: "#FFE3B0", transparent: true, opacity: 0.6, depthWrite: false }),
    }),
    [],
  );

  const pinGeometry = useMemo(() => {
    // Teardrop pin: sphere head + cone tip.
    const head = new THREE.SphereGeometry(0.9, 32, 16);
    head.translate(0, 2.2, 0);
    const tip = new THREE.ConeGeometry(0.78, 1.9, 32, 1, true);
    tip.rotateX(Math.PI);
    tip.translate(0, 1.2, 0);
    return { head, tip };
  }, []);

  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
      Object.values(pinGeometry).forEach((g) => g.dispose());
    },
    [materials, pinGeometry],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pin.current) {
      pin.current.position.y = 1.4 + Math.sin(t * 1.2) * 0.25;
      pin.current.rotation.y = t * 0.6;
    }
    if (pulse.current) {
      const p = (t * 0.45) % 1;
      pulse.current.scale.setScalar(1 + p * 5);
      materials.pulse.opacity = 0.55 * (1 - p);
    }
  });

  return (
    <group position={[cx, 0, cz]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03} material={materials.shore}>
        <circleGeometry args={[LAKE.radius + 1.4, 64]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.045} material={materials.water}>
        <circleGeometry args={[LAKE.radius, 64]} />
      </mesh>
      <mesh ref={pulse} rotation-x={-Math.PI / 2} position={[PIN_OFFSET.x, 0.06, PIN_OFFSET.z]} material={materials.pulse}>
        <ringGeometry args={[0.9, 1.05, 48]} />
      </mesh>
      <group ref={pin} position={[PIN_OFFSET.x, 1.4, PIN_OFFSET.z]}>
        <mesh geometry={pinGeometry.head} material={materials.pin} />
        <mesh geometry={pinGeometry.tip} material={materials.pin} />
      </group>
    </group>
  );
}
