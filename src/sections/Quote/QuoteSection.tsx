import { useLayoutEffect, useRef } from "react";
import { duration, ease, stagger } from "../../config/animation";
import { weddingData } from "../../data/wedding";
import { gsap } from "../../lib/gsap";

interface QuoteSectionProps {
  reducedMotion: boolean;
}

/** Scene 02 — through the arch, looking up into the dusk: the verse that frames the day. */
export function QuoteSection({ reducedMotion }: QuoteSectionProps) {
  const section = useRef<HTMLElement>(null);
  const { quote } = weddingData;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-quote-item]");
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: reducedMotion ? 0 : 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration.cinematic,
          ease: ease.out,
          stagger: stagger.lines * 1.5,
          scrollTrigger: {
            trigger: section.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={section}
      data-scene="quote"
      aria-label="Ayat pernikahan"
      className="scene-min-h relative flex items-center justify-center px-7 py-24 text-center text-brown-deep"
    >
      {/* Soft dusk scrim so the verse stays legible over the moving sky */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 75% 42% at 50% 50%, rgba(247,241,230,0.55), transparent 78%)" }}
      />
      <figure className="relative mx-auto max-w-[34rem] md:max-w-[44rem]">
        <div data-quote-item className="mx-auto mb-10 flex items-center justify-center gap-3 text-gold-deep">
          <span className="hairline w-10" />
          <span aria-hidden="true" className="block size-1.5 rotate-45 border border-current" />
          <span className="hairline w-10" />
        </div>
        <blockquote data-quote-item>
          <p className="text-balance font-display text-[clamp(1.6rem,6.4vw,2.2rem)] leading-[1.35] font-light italic md:text-[clamp(2.2rem,3.2vw,2.9rem)]">
            “{quote.text}”
          </p>
        </blockquote>
        <figcaption data-quote-item className="eyebrow mt-10 text-gold-deep">
          {quote.source}
        </figcaption>
      </figure>
    </section>
  );
}
