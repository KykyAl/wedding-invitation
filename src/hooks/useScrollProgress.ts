import { useLayoutEffect, type RefObject } from "react";
import { ScrollTrigger } from "../lib/gsap";
import { runtime } from "../store/experience";

/**
 * Converts native scroll into a continuous scene index for the camera rig.
 *
 * Every `[data-scene]` element inside `containerRef` is a keyframe; the index is
 * `i + t`, where t is how far the viewport top has travelled from section i's top
 * to section i+1's top. Offsets are re-measured on every ScrollTrigger refresh
 * (resize, font load, orientation change).
 */
export function useScrollProgress(containerRef: RefObject<HTMLElement | null>, enabled: boolean): void {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    let tops: number[] = [];

    const measure = () => {
      const sections = Array.from(container.querySelectorAll<HTMLElement>("[data-scene]"));
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      // The last keyframe is reached at max scroll even if the section is shorter than the viewport.
      tops = sections.map((el) => Math.min(el.getBoundingClientRect().top + window.scrollY, maxScroll));
    };

    const update = () => {
      if (tops.length < 2) {
        runtime.scroll.scene = 0;
        return;
      }
      const y = window.scrollY;
      let i = 0;
      while (i < tops.length - 2 && y >= tops[i + 1]) i++;
      const span = Math.max(1, tops[i + 1] - tops[i]);
      runtime.scroll.scene = Math.min(tops.length - 1, Math.max(0, i + (y - tops[i]) / span));
    };

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      onUpdate: update,
      onRefresh: () => {
        measure();
        update();
      },
    });
    measure();
    update();

    return () => trigger.kill();
  }, [containerRef, enabled]);
}
