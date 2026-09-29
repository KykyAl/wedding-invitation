import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { quality } from "../../config/performance";
import { LAKE } from "../../config/scenes";
import { createRandom } from "../../utils/random";

/** One low-poly pine: trunk + four stacked cones, merged into a single geometry. */
function createPineGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.09, 0.16, 1.6, 6);
  trunk.translate(0, 0.8, 0);
  parts.push(trunk);
  // Six drooping tiers read as a spruce silhouette rather than a stack of cones.
  const tiers = [
    { r: 1.45, h: 1.9, y: 1.4 },
    { r: 1.25, h: 1.8, y: 2.25 },
    { r: 1.05, h: 1.7, y: 3.05 },
    { r: 0.84, h: 1.55, y: 3.8 },
    { r: 0.62, h: 1.4, y: 4.5 },
    { r: 0.38, h: 1.3, y: 5.15 },
  ];
  for (const t of tiers) {
    const cone = new THREE.ConeGeometry(t.r, t.h, 9, 1);
    // Pull the rim down slightly so each tier droops over the one below.
    const pos = cone.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 0) pos.setY(i, pos.getY(i) - 0.18);
    }
    cone.translate(0, t.y + t.h / 2, 0);
    parts.push(cone);
  }
  const merged = mergeGeometries(parts.map((g) => g.toNonIndexed()));
  parts.forEach((g) => g.dispose());
  if (!merged) throw new Error("pine merge failed");
  merged.computeVertexNormals();

  // Height gradient baked into vertex colours: shadowed skirts, sun-warmed tips.
  const pos = merged.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color("#8A8A7A");
  const tip = new THREE.Color("#FFF1D6");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.lerpColors(base, tip, Math.min(1, Math.max(0, pos.getY(i) / 6.4)) ** 1.4);
    c.toArray(colors, i * 3);
  }
  merged.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return merged;
}

/**
 * The pine forest of Ranca Upas — a single instanced draw call.
 * Trees line both sides of the aisle; fog turns distant rows into layered silhouettes.
 */
export function PineForest() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = quality.treeCount;
  const geometry = useMemo(() => createPineGeometry(), []);
  const material = useMemo(() => new THREE.MeshLambertMaterial({ color: "#ffffff", vertexColors: true }), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = createRandom(1234);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const dark = new THREE.Color("#1C2119");
    const light = new THREE.Color("#363A2B");
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      // Denser near the aisle, thinning out to the sides.
      const x = side * (4.2 + Math.pow(rand.next(), 1.6) * 40);
      const z = rand.range(24, -160);
      // Keep a clearing around the arch, and thin the rows the hero camera sits among,
      // so the frame opens onto the aisle instead of being walled in by foreground trunks.
      const nearArch = Math.abs(z) < 5 && Math.abs(x) < 7.5;
      const nearCamera = (z > 2 || (z < -1 && z > -12)) && Math.abs(x) < 11;
      let px = nearArch || nearCamera ? x + side * (nearCamera ? 7 : 4) : x;
      // No trees standing in the lake: push them to its shore.
      const dz = z - LAKE.center[2];
      const shore = LAKE.radius + 2.5;
      if (Math.hypot(px, dz) < shore) px = side * Math.sqrt(Math.max(0, shore * shore - dz * dz)) + side * 0.5;
      pos.set(px, 0, z);
      const s = rand.range(0.85, 1.75) * (1 + Math.abs(x) * 0.012);
      scl.set(s * rand.range(0.9, 1.1), s * rand.range(0.95, 1.25), s * rand.range(0.9, 1.1));
      q.setFromAxisAngle(up, rand.range(0, Math.PI * 2));
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      color.lerpColors(dark, light, rand.next());
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <instancedMesh ref={ref} args={[geometry, material, count]} />;
}
