import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { quality } from "../config/performance";
import type { SceneId } from "../config/scenes";
import { usePageVisible } from "../hooks/usePageVisible";
import "./consoleFilter";
import { CameraRig } from "./CameraRig";
import { Atmosphere } from "./environment/Atmosphere";
import { OpeningStage } from "./objects/OpeningStage";
import { FloatingPetals } from "./particles/FloatingPetals";
import { GoldenDust } from "./particles/GoldenDust";
import { World } from "./World";

/** Fires once after a few frames have rendered — every shader has compiled by then. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current >= 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

interface SceneCanvasProps {
  scenes: readonly SceneId[];
  reducedMotion: boolean;
  onReady: () => void;
  onContextLost: () => void;
}

/** The one and only WebGL canvas — fixed behind the HTML story layer. */
export function SceneCanvas({ scenes, reducedMotion, onReady, onContextLost }: SceneCanvasProps) {
  const visible = usePageVisible();
  const [dpr, setDpr] = useState(quality.dpr[1]);
  const lostHandler = useRef(onContextLost);
  useEffect(() => {
    lostHandler.current = onContextLost;
  }, [onContextLost]);

  return (
    <div className="pointer-events-none fixed inset-0 h-lvh w-full" aria-hidden="true">
    <Canvas
      dpr={[quality.dpr[0], dpr]}
      frameloop={visible ? "always" : "never"}
      gl={{
        antialias: quality.antialias,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
      camera={{ fov: 40, near: 0.1, far: 700, position: [0, 2, 70] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          lostHandler.current();
        });
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(quality.dpr[1], d + 0.25))}
        onFallback={() => setDpr(1)}
      />
      <Atmosphere />
      <CameraRig scenes={scenes} reducedMotion={reducedMotion} />
      <World />
      <OpeningStage />
      <FloatingPetals />
      <GoldenDust />
      <ReadySignal onReady={onReady} />
    </Canvas>
    </div>
  );
}
