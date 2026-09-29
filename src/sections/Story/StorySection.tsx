import { useLayoutEffect, useRef } from "react";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { weddingData } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";
import { gsap } from "../../lib/gsap";

interface StorySectionProps {
  reducedMotion: boolean;
}

/** Scene 04 — the journey, told as milestones along a golden thread that draws itself on scroll. */
export function StorySection({ reducedMotion }: StorySectionProps) {
  const section = useRef<HTMLElement>(null);
  const thread = useRef<HTMLSpanElement>(null);
  useReveal(section, reducedMotion);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        thread.current,
        { scaleY: reducedMotion ? 1 : 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-story-list]", start: "top 70%", end: "bottom 60%", scrub: reducedMotion ? false : 0.6 },
        },
      );
      if (!reducedMotion) {
        // Big outlined years move slower than the text → depth.
        gsap.utils.toArray<HTMLElement>("[data-year]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: 18 },
            { yPercent: -18, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } },
          );
        });
      }
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={section} data-scene="story" aria-labelledby="story-title" className="scene-min-h scene-veil relative px-6 py-24 md:py-32">
      <SectionHeading id="story-title" eyebrow="Our Story" title="Perjalanan Kami" />

      <ol data-story-list className="relative mx-auto mt-16 max-w-4xl md:mt-24">
        {/* The golden thread */}
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[1.1rem] w-px bg-gold-deep/20 md:left-1/2 md:-translate-x-1/2"
        >
          <span ref={thread} className="absolute inset-0 origin-top bg-gold-deep" />
        </span>

        {weddingData.story.map((m, i) => {
          const right = i % 2 === 1;
          return (
            <li key={m.year} className="relative grid pb-20 pl-12 last:pb-4 md:grid-cols-2 md:gap-16 md:pl-0">
              {/* node */}
              <span
                aria-hidden="true"
                className="absolute top-3 left-[1.1rem] block size-2.5 -translate-x-1/2 rotate-45 border border-gold-deep bg-ivory md:left-1/2"
              />
              <div className={`relative ${right ? "md:col-start-2" : "md:text-right"}`}>
                <div data-reveal className="relative">
                  <p data-year className="year-outline text-[4.2rem] select-none md:text-[6rem]">
                    <span className="sr-only">Tahun </span>
                    {m.year}
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-brown-deep italic md:text-4xl">{m.title}</h3>
                  <p className={`mt-3 max-w-sm text-[0.95rem] leading-relaxed text-brown/85 ${right ? "" : "md:ml-auto"}`}>
                    {m.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
