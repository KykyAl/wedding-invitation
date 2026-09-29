import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ENVELOPE_POSITION } from "../../config/scenes";
import { atmosphere } from "../../config/theme";
import { runtime } from "../../store/experience";

const [ex, ey, ez] = ENVELOPE_POSITION;

/**
 * Fog, lights and environment for both moods. The light *count* never changes —
 * only intensities — so the reveal never triggers a shader recompile.
 */
export function Atmosphere() {
  const { gl, scene } = useThree();
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const front = useRef<THREE.DirectionalLight>(null);

  const colors = useMemo(
    () => ({
      fogOpening: new THREE.Color(atmosphere.opening.fog),
      fogWorld: new THREE.Color(atmosphere.world.fog),
    }),
    [],
  );

  const fog = useMemo(
    () => new THREE.Fog(atmosphere.opening.fog, atmosphere.opening.fogNear, atmosphere.opening.fogFar),
    [],
  );

  // Procedural studio environment for gold reflections — no HDR download.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    scene.fog = fog;
    scene.background = colors.fogOpening.clone();
    room.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      scene.fog = null;
      env.dispose();
    };
  }, [gl, scene, fog, colors]);

  useFrame(() => {
    const r = runtime.world.reveal;
    const o = atmosphere.opening;
    const w = atmosphere.world;
    fog.color.lerpColors(colors.fogOpening, colors.fogWorld, r);
    fog.near = THREE.MathUtils.lerp(o.fogNear, w.fogNear, r);
    fog.far = THREE.MathUtils.lerp(o.fogFar, w.fogFar, r);
    if (scene.background instanceof THREE.Color) scene.background.copy(fog.color);

    const dark = 1 - r;
    if (hemi.current) hemi.current.intensity = 0.12 * dark + 0.8 * r;
    if (key.current) key.current.intensity = 70 * dark;
    if (fill.current) fill.current.intensity = 4 * dark;
    if (sun.current) sun.current.intensity = 2.4 * r;
    if (front.current) front.current.intensity = 0.25 * dark + 0.9 * r;
    scene.environmentIntensity = 0.35 * dark + 0.55 * r;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#FFE6C4", "#4A3826", 0.12]} />
      {/* Opening: a warm key from above-left, like a single candle-lit spot on a table. */}
      <spotLight
        ref={key}
        position={[ex - 1.5, ey + 5.5, ez + 3]}
        angle={0.55}
        penumbra={0.9}
        decay={2}
        distance={20}
        color="#FFE0B2"
        intensity={70}
        onUpdate={(l) => {
          l.target.position.set(ex, ey, ez);
          l.target.updateMatrixWorld();
        }}
      />
      <pointLight ref={fill} position={[ex + 2.5, ey - 1, ez + 3]} color="#FFC98F" intensity={4} distance={12} decay={2} />
      {/* World: low sun behind the arch (rim light) + soft front fill. */}
      <directionalLight ref={sun} position={[-8, 7, -40]} color="#FFD9A0" intensity={0} />
      <directionalLight ref={front} position={[3, 6, 20]} color="#FFE9CC" intensity={0.25} />
    </>
  );
}
