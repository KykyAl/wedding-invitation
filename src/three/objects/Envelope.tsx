import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENVELOPE_POSITION, ENVELOPE_SIZE } from "../../config/scenes";
import { palette } from "../../config/theme";
import { weddingData } from "../../data/wedding";
import { useFontsReady } from "../../hooks/useFontsReady";
import { runtime } from "../../store/experience";
import { coupleInitials, formatDateDots } from "../../utils/format";
import { clamp, dampFactor, smootherstep } from "../../utils/math";
import { createRandom } from "../../utils/random";
import {
  createCardTexture,
  createFlapShadowTexture,
  createLiningTexture,
  createPaperTexture,
  createSealTextures,
} from "../textures";

const { width: W, height: H } = ENVELOPE_SIZE;
const FLAP_DEPTH = H * 0.64;
const POCKET_APEX = -0.05;
const SEAL_Y = H / 2 - FLAP_DEPTH + 0.12;
const CARD = { width: W * 0.92, height: H * 0.9 };

/** Layer depths (local z). Kept tiny but explicit so ordering is deterministic. */
const Z = {
  back: 0,
  flapOpen: 0.006,
  card: 0.012,
  pocket: 0.024,
  shadow: 0.03,
  flapClosed: 0.036,
  seal: 0.05,
};

/** Local position of the card once it has risen and come forward (used by the camera push). */
export const CARD_REST = new THREE.Vector3(0, 1.3, 0.7);

/** ShapeGeometry UVs are raw shape coordinates — remap them to 0..1 over the bounds. */
function normaliseUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const pos = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  const sx = box.max.x - box.min.x;
  const sy = box.max.y - box.min.y;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - box.min.x) / sx, (pos.getY(i) - box.min.y) / sy);
  }
  uv.needsUpdate = true;
  return geometry;
}

function createPocketGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-W / 2, -H / 2);
  s.lineTo(W / 2, -H / 2);
  s.lineTo(W / 2, H / 2);
  s.lineTo(0, POCKET_APEX);
  s.lineTo(-W / 2, H / 2);
  s.closePath();
  return normaliseUVs(new THREE.ShapeGeometry(s));
}

/** Flap in pivot space: hinge along y = 0, tip hanging down. */
function createFlapGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-W / 2, 0);
  s.lineTo(W / 2, 0);
  // Slightly rounded tip, like die-cut stationery.
  s.lineTo(0.12, -FLAP_DEPTH + 0.05);
  s.quadraticCurveTo(0, -FLAP_DEPTH - 0.01, -0.12, -FLAP_DEPTH + 0.05);
  s.closePath();
  return normaliseUVs(new THREE.ShapeGeometry(s, 6));
}

/** Wax blob: a squat cylinder with an irregular, poured edge. */
function createSealGeometry() {
  const g = new THREE.CylinderGeometry(0.3, 0.32, 0.07, 56, 1);
  const pos = g.getAttribute("position");
  const rand = createRandom(3);
  const bumps = Array.from({ length: 7 }, () => ({ f: Math.round(rand.range(2, 9)), p: rand.range(0, 6.28), a: rand.range(0.006, 0.02) }));
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.2) continue;
    const a = Math.atan2(z, x);
    const k = 1 + bumps.reduce((acc, b) => acc + Math.sin(a * b.f + b.p) * b.a, 0) * 3;
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

export function Envelope() {
  const group = useRef<THREE.Group>(null);
  const flapPivot = useRef<THREE.Group>(null);
  const card = useRef<THREE.Mesh>(null);
  const seal = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const fontsReady = useFontsReady();

  const geometries = useMemo(
    () => ({
      pocket: createPocketGeometry(),
      flap: createFlapGeometry(),
      seal: createSealGeometry(),
    }),
    [],
  );

  const staticTextures = useMemo(
    () => ({
      pocket: createPaperTexture("#EEE2CB", 1, { border: "rect", seams: true }),
      flap: createPaperTexture("#F4EBDA", 2, { border: "flap" }),
      lining: createLiningTexture("deep"),
      flapLining: createLiningTexture("pale"),
      shadow: createFlapShadowTexture(),
    }),
    [],
  );

  // Text-bearing textures are redrawn once the webfonts are available.
  const textTextures = useMemo(() => {
    void fontsReady;
    return {
      card: createCardTexture({
        eyebrow: "The Wedding Of",
        first: weddingData.groom.nickname,
        second: weddingData.bride.nickname,
        date: formatDateDots(),
        place: weddingData.venue.name,
      }),
      seal: createSealTextures(coupleInitials()),
    };
  }, [fontsReady]);

  const materials = useMemo(
    () => ({
      pocket: new THREE.MeshStandardMaterial({ map: staticTextures.pocket, roughness: 0.92 }),
      flapFront: new THREE.MeshStandardMaterial({ map: staticTextures.flap, roughness: 0.9 }),
      lining: new THREE.MeshStandardMaterial({ map: staticTextures.lining, roughness: 0.7, side: THREE.DoubleSide }),
      flapBack: new THREE.MeshStandardMaterial({ map: staticTextures.flapLining, roughness: 0.7, side: THREE.BackSide }),
      shadow: new THREE.MeshBasicMaterial({
        color: "#2A1A0C",
        alphaMap: staticTextures.shadow,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      }),
      wax: new THREE.MeshStandardMaterial({ color: palette.wax, roughness: 0.38, metalness: 0.05, transparent: true }),
      card: new THREE.MeshStandardMaterial({ roughness: 0.85 }),
      sealFace: new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.05, bumpScale: 3, transparent: true }),
    }),
    [staticTextures],
  );

  useEffect(() => {
    materials.card.map = textTextures.card;
    materials.sealFace.map = textTextures.seal.map;
    materials.sealFace.bumpMap = textTextures.seal.bumpMap;
    materials.card.needsUpdate = true;
    materials.sealFace.needsUpdate = true;
    return () => {
      textTextures.card.dispose();
      textTextures.seal.map.dispose();
      textTextures.seal.bumpMap.dispose();
    };
  }, [materials, textTextures]);

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(staticTextures).forEach((t) => t.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, staticTextures, materials],
  );

  useFrame(({ clock }, delta) => {
    const o = runtime.opening;
    const g = group.current;
    if (!g) return;

    // Hidden once the world is revealed — the flare covers the swap.
    g.visible = runtime.world.reveal < 1;
    if (!g.visible) return;

    // Idle: slow breathing float + a gentle lean toward the cursor / device tilt.
    const calm = 1 - smootherstep(o.push);
    const k = dampFactor(3, delta);
    tilt.current.x += (-runtime.pointer.y * 0.1 * calm - tilt.current.x) * k;
    tilt.current.y += (runtime.pointer.x * 0.16 * calm - tilt.current.y) * k;
    const t = clock.elapsedTime;
    g.position.y = ENVELOPE_POSITION[1] + Math.sin(t * 0.8) * 0.045 * calm;
    g.rotation.x = tilt.current.x + Math.sin(t * 0.5) * 0.015 * calm;
    g.rotation.y = tilt.current.y + Math.sin(t * 0.37) * 0.025 * calm;

    // Seal lifts off, then falls away and fades.
    const s = seal.current;
    if (s) {
      const lift = smootherstep(clamp(o.seal / 0.35));
      const fall = smootherstep(clamp((o.seal - 0.3) / 0.7));
      s.position.set(fall * 0.25, SEAL_Y - fall * fall * 1.8, Z.seal + lift * 0.16);
      s.rotation.set(fall * 1.1, 0, -fall * 0.5);
      const alpha = 1 - clamp((o.seal - 0.55) / 0.45);
      materials.wax.opacity = alpha;
      materials.sealFace.opacity = alpha;
      s.visible = alpha > 0.001;
    }

    // Flap swings up and over; it tucks behind the card once perpendicular.
    const p = flapPivot.current;
    if (p) {
      p.rotation.x = -o.flap * Math.PI * 0.97;
      p.position.z = o.flap < 0.5 ? Z.flapClosed : Z.flapOpen;
    }
    if (shadow.current) {
      materials.shadow.opacity = 0.34 * (1 - smootherstep(clamp(o.flap / 0.3)));
      shadow.current.visible = materials.shadow.opacity > 0.001;
    }

    // Card rises clear of the pocket, then glides forward toward the lens.
    const c = card.current;
    if (c) {
      const rise = smootherstep(clamp(o.card / 0.6));
      const glide = smootherstep(clamp((o.card - 0.55) / 0.45));
      c.position.set(0, -0.04 + rise * 2.3 - glide * (2.3 - 0.04 - CARD_REST.y), Z.card + glide * (CARD_REST.z - Z.card));
      c.rotation.x = -0.12 * glide * (1 - glide) * 4;
    }
  });

  return (
    <group ref={group} position={[...ENVELOPE_POSITION]}>
      {/* Inside back wall — lining visible through the V */}
      <mesh position-z={Z.back} material={materials.lining}>
        {/* A hair smaller than the pocket so its edge never peeks out when the envelope tilts */}
        <planeGeometry args={[W * 0.99, H * 0.99]} />
      </mesh>

      <mesh ref={card} position={[0, -0.04, Z.card]} material={materials.card}>
        <planeGeometry args={[CARD.width, CARD.height]} />
      </mesh>

      <mesh geometry={geometries.pocket} position-z={Z.pocket} material={materials.pocket} />

      <mesh ref={shadow} position={[0, H / 2 - FLAP_DEPTH / 2 - 0.06, Z.shadow]} material={materials.shadow}>
        <planeGeometry args={[W * 1.02, FLAP_DEPTH * 1.12]} />
      </mesh>

      <group ref={flapPivot} position={[0, H / 2, Z.flapClosed]}>
        <mesh geometry={geometries.flap} material={materials.flapFront} />
        <mesh geometry={geometries.flap} material={materials.flapBack} />
      </group>

      <group ref={seal} position={[0, SEAL_Y, Z.seal]}>
        <mesh geometry={geometries.seal} material={materials.wax} />
        <mesh position-z={0.036} material={materials.sealFace}>
          <circleGeometry args={[0.27, 48]} />
        </mesh>
      </group>
    </group>
  );
}
