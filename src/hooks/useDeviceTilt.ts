import { useEffect } from "react";
import { runtime } from "../store/experience";
import { clamp } from "../utils/math";

type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

let permission: "unknown" | "granted" | "denied" = "unknown";

/**
 * iOS requires an explicit permission request inside a user gesture.
 * Call this synchronously from the "Open Invitation" click handler.
 */
export function requestTiltPermission(): void {
  const Ctor = (window as Window & { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent;
  if (!Ctor) {
    permission = "denied";
    return;
  }
  if (typeof Ctor.requestPermission !== "function") {
    permission = "granted";
    return;
  }
  Ctor.requestPermission()
    .then((state) => {
      permission = state;
      window.dispatchEvent(new Event("tiltpermission"));
    })
    .catch(() => {
      permission = "denied";
    });
}

/** Maps device tilt onto the shared parallax input (touch devices only). */
export function useDeviceTilt(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !window.matchMedia("(pointer: coarse)").matches) return;

    let base: { beta: number; gamma: number } | null = null;
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      // First reading becomes "neutral" — guests hold phones at many angles.
      base ??= { beta: e.beta, gamma: e.gamma };
      runtime.pointer.x = clamp((e.gamma - base.gamma) / 22, -1, 1);
      runtime.pointer.y = clamp(-(e.beta - base.beta) / 22, -1, 1);
    };

    const attach = () => {
      if (permission === "denied") return;
      window.addEventListener("deviceorientation", onOrientation);
    };
    attach();
    window.addEventListener("tiltpermission", attach);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("tiltpermission", attach);
      runtime.pointer.x = 0;
      runtime.pointer.y = 0;
    };
  }, [enabled]);
}
