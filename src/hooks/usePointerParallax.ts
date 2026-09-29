import { useEffect } from "react";
import { runtime } from "../store/experience";

/** Mouse position → shared parallax input. Ignores touch so scrolling never jolts the camera. */
export function usePointerParallax(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      runtime.pointer.x = runtime.cursor.x = x;
      runtime.pointer.y = runtime.cursor.y = y;
    };
    const onLeave = () => {
      runtime.pointer.x = 0;
      runtime.pointer.y = 0;
      runtime.cursor.x = runtime.cursor.y = 9;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);
}
