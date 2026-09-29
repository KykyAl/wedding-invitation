import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { quality } from "../../config/performance";
import { ARCH_POSITION } from "../../config/scenes";
import { palette } from "../../config/theme";
import { createRandom } from "../../utils/random";
import { createFlowerGeometry, createLeafGeometry, FLOWER_TINTS } from "./flowerGeometry";

const RADIUS = 2.45;
const POST_HEIGHT = 2.5;

interface Placement {
  position: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
}

/** Point on the arch outline: t ∈ [0,1] runs left post foot → over the top → right post foot. */
function archPoint(t: number, out: THREE.Vector3) {
  const straight = POST_HEIGHT / (POST_HEIGHT * 2 + Math.PI * RADIUS);
  if (t < straight) return out.set(-RADIUS, (t / straight) * POST_HEIGHT, 0);
  if (t > 1 - straight) return out.set(RADIUS, ((1 - t) / straight) * POST_HEIGHT, 0);
  const a = Math.PI - ((t - straight) / (1 - 2 * straight)) * Math.PI;
  return out.set(Math.cos(a) * RADIUS, POST_HEIGHT + Math.sin(a) * RADIUS, 0);
}

/**
 * Asymmetric floral: a lush sweep down the left shoulder, a smaller cluster at the
 * right foot. The crown stays clear so the typography inside the arch can breathe.
 */
function placeBlooms(count: number, seed: number, spread: number): Placement[] {
  const rand = createRandom(seed);
  const p = new THREE.Vector3();
  const result: Placement[] = [];
  for (let i = 0; i < count; i++) {
    const main = rand.next() < 0.72;
    // Bias toward the centre of each cluster.
    const u = (rand.next() + rand.next() + rand.next()) / 3;
    const t = main ? 0.12 + u * 0.24 : 0.86 + u * 0.14;
    archPoint(t, p);
    const radial = new THREE.Vector3(p.x, p.y - POST_HEIGHT, 0).normalize();
    const jitter = spread * (main ? 1 : 0.8);
    result.push({
      position: p
        .clone()
        // Bias outward so blooms spill off the frame rather than into the opening.
        .addScaledVector(radial, rand.range(-jitter * 0.35, jitter))
        .add(new THREE.Vector3(rand.range(-0.08, 0.08), rand.range(-0.08, 0.08), rand.range(-0.28, 0.32))),
      scale: rand.range(0.1, 0.2) * (main ? 1 : 0.9),
      rotation: new THREE.Euler(rand.range(1.0, 1.7), rand.range(-0.6, 0.6), rand.range(0, Math.PI * 2)),
    });
  }
  return result;
}

function useInstances(ref: RefObject<THREE.InstancedMesh | null>, items: Placement[], tints?: readonly string[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const c = new THREE.Color();
    const rand = createRandom(5);
    items.forEach((it, i) => {
      q.setFromEuler(it.rotation);
      s.setScalar(it.scale);
      m.compose(it.position, q, s);
      mesh.setMatrixAt(i, m);
      if (tints) mesh.setColorAt(i, c.set(rand.pick(tints)));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, items, tints]);
}

/** Brushed-gold arch framing the couple's names in the hero shot. */
export function WeddingArch() {
  const flowersRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  const flowerCount = Math.round(70 * quality.flowerDensity);
  const leafCount = Math.round(90 * quality.flowerDensity);

  const flowerGeometry = useMemo(() => createFlowerGeometry(), []);
  const leafGeometry = useMemo(() => createLeafGeometry(), []);
  const blooms = useMemo(() => placeBlooms(flowerCount, 21, 0.2), [flowerCount]);
  const leaves = useMemo(
    () => placeBlooms(leafCount, 77, 0.34).map((p) => ({ ...p, scale: p.scale * 1.5 })),
    [leafCount],
  );

  const materials = useMemo(
    () => ({
      gold: new THREE.MeshStandardMaterial({ color: palette.goldLight, metalness: 1, roughness: 0.32 }),
      goldFine: new THREE.MeshStandardMaterial({ color: palette.gold, metalness: 1, roughness: 0.4 }),
      flower: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#56603F", roughness: 0.8 }),
    }),
    [],
  );

  useInstances(flowersRef, blooms, FLOWER_TINTS);
  useInstances(leavesRef, leaves);

  useEffect(
    () => () => {
      flowerGeometry.dispose();
      leafGeometry.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    },
    [flowerGeometry, leafGeometry, materials],
  );

  return (
    <group position={[...ARCH_POSITION]}>
      {/* Main frame */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * RADIUS, POST_HEIGHT / 2, 0]} material={materials.gold}>
          <cylinderGeometry args={[0.05, 0.05, POST_HEIGHT, 12]} />
        </mesh>
      ))}
      <mesh position={[0, POST_HEIGHT, 0]} material={materials.gold}>
        <torusGeometry args={[RADIUS, 0.05, 10, 72, Math.PI]} />
      </mesh>

      {/* Fine inner line — gives the frame a jeweller's double edge */}
      {[-1, 1].map((side) => (
        <mesh key={`i${side}`} position={[side * (RADIUS - 0.16), POST_HEIGHT / 2, 0]} material={materials.goldFine}>
          <cylinderGeometry args={[0.014, 0.014, POST_HEIGHT, 8]} />
        </mesh>
      ))}
      <mesh position={[0, POST_HEIGHT, 0]} material={materials.goldFine}>
        <torusGeometry args={[RADIUS - 0.16, 0.014, 6, 72, Math.PI]} />
      </mesh>

      {/* Feet */}
      {[-1, 1].map((side) => (
        <mesh key={`f${side}`} position={[side * RADIUS, 0.04, 0]} material={materials.gold}>
          <cylinderGeometry args={[0.16, 0.2, 0.08, 16]} />
        </mesh>
      ))}

      <instancedMesh ref={leavesRef} args={[leafGeometry, materials.leaf, leafCount]} />
      <instancedMesh ref={flowersRef} args={[flowerGeometry, materials.flower, flowerCount]} />
    </group>
  );
}
