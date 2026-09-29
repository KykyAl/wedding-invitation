import { useLayoutEffect, type RefObject } from "react";
import { duration, ease } from "../config/animation";
import { gsap } from "../lib/gsap";

/**
 * Reveals every `[data-reveal]` inside the section as it enters the viewport.
 * `data-reveal="2"` staggers that element by 2 steps.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const step = Number(el.dataset.reveal) || 0;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: reducedMotion ? 0 : 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reducedMotion ? duration.fast : duration.slow,
            ease: ease.out,
            delay: step * 0.12,
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          },
        );
      });
    }, scope);
    return () => ctx.revert();
  }, [scope, reducedMotion]);
}
