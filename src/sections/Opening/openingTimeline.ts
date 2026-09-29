import { duration, ease } from "../../config/animation";
import { gsap } from "../../lib/gsap";
import { runtime } from "../../store/experience";

interface OpeningTimelineOptions {
  /** HTML elements of the invitation cover that leave first */
  content: Element[];
  /** Full-screen light flare that hides the cut from void to forest */
  flare: HTMLElement;
  reducedMotion: boolean;
  /** Called under full flare: swap the world, snap the camera, unlock scroll */
  onReveal: () => void;
  onComplete: () => void;
}

/**
 * The opening film, in beats:
 *   0.0  cover typography lifts away
 *   0.15 wax seal lifts and falls
 *   0.75 flap swings open · gold dust swirls outward
 *   1.55 card rises out of the pocket
 *   1.9  camera pushes into the card
 *   3.5  warm light floods the frame
 *   4.4  — cut to the forest, hidden in the flare —
 *   4.55 light recedes; hero shot settles from a high, distant vantage
 */
export function playOpening({ content, flare, reducedMotion, onReveal, onComplete }: OpeningTimelineOptions) {
  const o = runtime.opening;
  const w = runtime.world;

  if (reducedMotion) {
    return gsap
      .timeline({ onComplete })
      .to(content, { autoAlpha: 0, duration: duration.fast, ease: ease.in })
      .to(flare, { opacity: 1, duration: duration.fast, ease: ease.in }, "<0.1")
      .call(() => {
        Object.assign(o, { seal: 1, flap: 1, card: 1, push: 1, burst: 0 });
        w.introDrift = 0;
        onReveal();
      })
      .to(flare, { opacity: 0, duration: duration.standard, ease: ease.out });
  }

  const REVEAL_AT = 4.4;
  return gsap
    .timeline({ onComplete })
    .to(content, { autoAlpha: 0, y: -18, duration: 0.9, stagger: 0.06, ease: ease.in }, 0)
    .to(o, { seal: 1, duration: 1.1, ease: "power2.inOut" }, 0.15)
    .to(o, { flap: 1, duration: 1.3, ease: ease.inOut }, 0.75)
    .to(o, { burst: 1, duration: 1.8, ease: "power2.out" }, 0.9)
    .to(o, { card: 1, duration: 2.1, ease: "power2.inOut" }, 1.55)
    .to(o, { push: 1, duration: 2.4, ease: ease.inOut }, 1.9)
    .to(flare, { opacity: 1, duration: 0.9, ease: "power2.in" }, REVEAL_AT - 0.9)
    .call(
      () => {
        o.burst = 0;
        w.introDrift = 1;
        onReveal();
      },
      [],
      REVEAL_AT,
    )
    .to(flare, { opacity: 0, duration: 1.9, ease: "power2.out" }, REVEAL_AT + 0.15)
    .fromTo(
      w,
      { introDrift: 1 },
      { introDrift: 0, duration: 3.4, ease: "power3.out", immediateRender: false },
      REVEAL_AT + 0.05,
    );
}
