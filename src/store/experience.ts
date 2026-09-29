import { useSyncExternalStore } from "react";

/**
 * Two layers of state:
 *
 * 1. `runtime` — mutable values written by GSAP / scroll / pointer and read every
 *    frame inside `useFrame`. Never triggers React renders.
 * 2. `phase` — the coarse experience stage. Few transitions, so it lives in a tiny
 *    external store consumed through `useSyncExternalStore`.
 */

export type Phase = "loading" | "sealed" | "opening" | "revealed";

export const runtime = {
  /** Continuous scene index: 0 = first section, 1.5 = halfway between 2nd and 3rd. */
  scroll: { scene: 0 },
  /** Raw normalised -1..1 input from mouse or device tilt. The camera rig smooths it. */
  pointer: { x: 0, y: 0 },
  /** Mouse position in NDC for particle reaction; parked off-screen when there is no mouse. */
  cursor: { x: 9, y: 9 },
  opening: {
    /** 0 → 1: wax seal lifts and falls away */
    seal: 0,
    /** 0 → 1: flap swings open */
    flap: 0,
    /** 0 → 1: card rises out of the pocket */
    card: 0,
    /** 0 → 1: camera pushes into the card */
    push: 0,
    /** 0 → 1 → 0: particles swirl outward */
    burst: 0,
  },
  world: {
    /** 0 = dark opening void, 1 = golden-hour forest */
    reveal: 0,
    /** 1 → 0: hero shot settles from a higher, farther vantage */
    introDrift: 0,
  },
  /** Set to true for one frame to teleport the camera (hidden behind the flare). */
  snapCamera: false,
};

let phase: Phase = "loading";
const listeners = new Set<() => void>();

export function getPhase(): Phase {
  return phase;
}

export function setPhase(next: Phase) {
  if (next === phase) return;
  phase = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePhase(): Phase {
  return useSyncExternalStore(subscribe, getPhase, getPhase);
}
