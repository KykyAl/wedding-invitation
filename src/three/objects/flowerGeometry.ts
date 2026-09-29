import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

function paint(geometry: THREE.BufferGeometry, color: THREE.Color) {
  const count = geometry.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) color.toArray(colors, i * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * A garden-rose-like bloom: two rings of cupped petals around a golden heart.
 * Vertex colours carry the petal/heart split; instance colour tints the petals.
 * Unit radius ≈ 1 — scale per instance.
 */
export function createFlowerGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const white = new THREE.Color(1, 1, 1);
  const rings = [
    { count: 7, radius: 0.55, tilt: 0.55, size: [0.42, 0.1, 0.62] as const, shade: 1 },
    { count: 5, radius: 0.28, tilt: 0.95, size: [0.3, 0.08, 0.42] as const, shade: 0.9 },
  ];
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const petal = new THREE.SphereGeometry(1, 8, 6);
      petal.scale(ring.size[0], ring.size[1], ring.size[2]);
      petal.translate(0, 0, ring.radius);
      petal.rotateX(-ring.tilt);
      petal.rotateY((i / ring.count) * Math.PI * 2 + ring.radius);
      parts.push(paint(petal.toNonIndexed(), white.clone().multiplyScalar(ring.shade)));
      petal.dispose();
    }
  }
  const heart = new THREE.SphereGeometry(0.2, 8, 6);
  heart.translate(0, 0.12, 0);
  parts.push(paint(heart.toNonIndexed(), new THREE.Color("#C9A25E")));
  heart.dispose();

  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error("flower merge failed");
  merged.computeVertexNormals();
  return merged;
}

/** Slim leaf. */
export function createLeafGeometry(): THREE.BufferGeometry {
  const leaf = new THREE.SphereGeometry(1, 6, 4);
  leaf.scale(0.32, 0.06, 1);
  leaf.translate(0, 0, 0.9);
  return leaf;
}

export const FLOWER_TINTS = ["#F6EEE2", "#EFE1CB", "#E8CDBE", "#F3E6D3", "#DCC3A3"] as const;
