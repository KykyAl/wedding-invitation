import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cameraDamping } from "../config/animation";
import {
  cameraKeyframes,
  ENVELOPE_POSITION,
  ENVELOPE_SIZE,
  fovForAspect,
  INTRO_DRIFT,
  type SceneId,
} from "../config/scenes";
import { runtime } from "../store/experience";
import { dampFactor, smootherstep } from "../utils/math";
import { CARD_REST } from "./objects/Envelope";

const DEG = Math.PI / 180;

interface Frame {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/**
 * Frames the envelope for the current aspect: ~80% of the width on portrait phones,
 * ~34% of the height on landscape screens, sitting below centre so the HTML
 * typography has the upper half.
 */
function openingFrame(aspect: number, fov: number, out: Frame) {
  const tan = Math.tan((fov * DEG) / 2);
  const byWidth = ENVELOPE_SIZE.width / 0.8 / (2 * tan * aspect);
  const byHeight = ENVELOPE_SIZE.height / 0.34 / (2 * tan);
  const d = Math.max(byWidth, byHeight);
  const visibleH = 2 * d * tan;
  const lift = visibleH * (aspect < 1 ? 0.12 : 0.15);
  const [x, y, z] = ENVELOPE_POSITION;
  out.target.set(x, y + lift, z);
  out.position.set(x, y + lift, z + d);
}

/** Close-up on the card as it glides out of the envelope. */
function cardFrame(aspect: number, fov: number, out: Frame) {
  const tan = Math.tan((fov * DEG) / 2);
  const cardW = ENVELOPE_SIZE.width * 0.92;
  const cardH = ENVELOPE_SIZE.height * 0.9;
  const d = Math.max(cardW / 0.86 / (2 * tan * aspect), cardH / 0.62 / (2 * tan));
  const [x, y, z] = ENVELOPE_POSITION;
  out.target.set(x + CARD_REST.x, y + CARD_REST.y, z + CARD_REST.z);
  out.position.set(x + CARD_REST.x, y + CARD_REST.y, z + CARD_REST.z + d);
}

interface CameraRigProps {
  scenes: readonly SceneId[];
  reducedMotion: boolean;
}

/**
 * The single camera director. Every frame it computes a *target* shot from the
 * experience state (opening push-in or scroll position between keyframes), adds
 * pointer/tilt parallax, and damps toward it for a weighty, cinematic feel.
 */
export function CameraRig({ scenes, reducedMotion }: CameraRigProps) {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;

  const keyframes = useMemo(
    () =>
      scenes.map((id) => ({
        position: new THREE.Vector3(...cameraKeyframes[id].position),
        target: new THREE.Vector3(...cameraKeyframes[id].target),
      })),
    [scenes],
  );

  const tmp = useMemo(
    () => ({
      a: { position: new THREE.Vector3(), target: new THREE.Vector3() } as Frame,
      b: { position: new THREE.Vector3(), target: new THREE.Vector3() } as Frame,
      goalPos: new THREE.Vector3(),
      goalLook: new THREE.Vector3(),
      look: new THREE.Vector3(),
      drift: new THREE.Vector3(...INTRO_DRIFT),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
    }),
    [],
  );
  const pointer = useRef({ x: 0, y: 0 });
  const initialised = useRef(false);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const aspect = size.width / size.height;
    const fov = fovForAspect(aspect);
    const { a, b, goalPos, goalLook, look } = tmp;
    const revealed = runtime.world.reveal >= 1;

    if (!revealed) {
      openingFrame(aspect, fov, a);
      cardFrame(aspect, fov, b);
      const t = runtime.opening.push; // already eased by GSAP
      goalPos.lerpVectors(a.position, b.position, t);
      goalLook.lerpVectors(a.target, b.target, t);
    } else {
      const s = THREE.MathUtils.clamp(runtime.scroll.scene, 0, keyframes.length - 1);
      const i = Math.min(Math.floor(s), keyframes.length - 2);
      const from = keyframes[Math.max(0, i)];
      const to = keyframes[Math.max(0, Math.min(i + 1, keyframes.length - 1))];
      // Ease between keyframes so each scene "arrives" and settles.
      const t = keyframes.length > 1 ? smootherstep(s - i) : 0;
      goalPos.lerpVectors(from.position, to.position, t);
      goalLook.lerpVectors(from.target, to.target, t);
      goalPos.addScaledVector(tmp.drift, runtime.world.introDrift);
      goalLook.y += runtime.world.introDrift * 0.6;
    }

    // Parallax from mouse / tilt, applied in camera space.
    const pk = dampFactor(cameraDamping.pointer, delta);
    const px = reducedMotion ? 0 : runtime.pointer.x;
    const py = reducedMotion ? 0 : runtime.pointer.y;
    pointer.current.x += (px - pointer.current.x) * pk;
    pointer.current.y += (py - pointer.current.y) * pk;
    const amount = revealed ? 0.35 : 0.18;
    tmp.right.setFromMatrixColumn(cam.matrixWorld, 0);
    tmp.up.setFromMatrixColumn(cam.matrixWorld, 1);
    goalPos.addScaledVector(tmp.right, pointer.current.x * amount);
    goalPos.addScaledVector(tmp.up, pointer.current.y * amount * 0.6);

    if (!initialised.current || runtime.snapCamera) {
      cam.position.copy(goalPos);
      look.copy(goalLook);
      cam.fov = fov;
      cam.updateProjectionMatrix();
      runtime.snapCamera = false;
      initialised.current = true;
    } else {
      const k = dampFactor(revealed ? cameraDamping.scroll : cameraDamping.opening, delta);
      cam.position.lerp(goalPos, k);
      look.lerp(goalLook, k);
      const fk = dampFactor(cameraDamping.fov, delta);
      if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov += (fov - cam.fov) * fk;
        cam.updateProjectionMatrix();
      }
    }
    cam.lookAt(look);
  });

  return null;
}
