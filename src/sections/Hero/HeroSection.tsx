import { useLayoutEffect, useRef } from "react";
import { ScrollHint } from "../../components/ui/ScrollHint";
import { SplitLetters } from "../../components/wedding/SplitLetters";
import { duration, ease, stagger } from "../../config/animation";
import { weddingData } from "../../data/wedding";
import { gsap } from "../../lib/gsap";
import { usePhase } from "../../store/experience";
import { formatDateDots } from "../../utils/format";

interface HeroSectionProps {
  reducedMotion: boolean;
}

/** Scene 01 — the couple framed by the golden arch at golden hour. */
export function HeroSection({ reducedMotion }: HeroSectionProps) {
  const phase = usePhase();
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const { groom, bride } = weddingData;

  // Hidden until the world is revealed.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-fade]", { autoAlpha: 0, y: reducedMotion ? 0 : 14 });
      gsap.set("[data-letter]", { yPercent: reducedMotion ? 0 : 140, autoAlpha: reducedMotion ? 0 : 1 });
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  // Entrance, timed to land as the flare recedes.
  useLayoutEffect(() => {
    if (phase !== "revealed") return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: reducedMotion ? 0.1 : 0.7 });
      if (reducedMotion) {
        tl.to(["[data-hero-fade]", "[data-letter]"], { autoAlpha: 1, y: 0, duration: duration.standard, ease: ease.out });
        return;
      }
      tl.to("[data-hero-eyebrow]", { autoAlpha: 1, y: 0, duration: duration.slow, ease: ease.out })
        .to(
          "[data-hero-name='groom'] [data-letter]",
          { yPercent: 0, duration: duration.cinematic, ease: "expo.out", stagger: stagger.letters },
          0.35,
        )
        .to("[data-hero-amp]", { autoAlpha: 1, y: 0, duration: duration.slow, ease: ease.out }, 0.8)
        .to(
          "[data-hero-name='bride'] [data-letter]",
          { yPercent: 0, duration: duration.cinematic, ease: "expo.out", stagger: stagger.letters },
          0.9,
        )
        .to("[data-hero-date]", { autoAlpha: 1, y: 0, duration: duration.slow, ease: ease.out }, 1.5)
        .to("[data-hero-hint]", { autoAlpha: 1, y: 0, duration: duration.slow, ease: ease.out }, 2.1);
    }, section);
    return () => ctx.kill();
  }, [phase, reducedMotion]);

  // Scroll-away: the typography drifts up and dissolves as the camera passes through the arch.
  useLayoutEffect(() => {
    if (phase !== "revealed" || !content.current) return;
    const ctx = gsap.context(() => {
      gsap.to(content.current, {
        yPercent: reducedMotion ? 0 : -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "70% top", scrub: 0.6 },
      });
    }, section);
    return () => ctx.revert();
  }, [phase, reducedMotion]);

  return (
    <section
      ref={section}
      data-scene="hero"
      aria-labelledby="hero-title"
      className="scene-min-h relative flex flex-col items-center justify-center px-6 text-center text-brown-deep"
    >
      <div ref={content} className="flex flex-col items-center pt-[5svh] md:pt-0 md:pb-[6svh]">
        <p data-hero-fade data-hero-eyebrow className="eyebrow mb-7 text-[0.625rem] tracking-[0.3em] text-brown/80 md:mb-9 md:text-xs md:tracking-(--tracking-eyebrow)">
          We Are Getting Married
        </p>

        <h2
          id="hero-title"
          className="display-names flex flex-col items-center text-[clamp(3.8rem,19vw,6rem)] md:mt-8 md:text-[clamp(5.5rem,9vw,8.5rem)]"
          style={{ textShadow: "0 1px 30px rgba(255,240,215,0.55)" }}
        >
          <span data-hero-name="groom" className="block">
            <SplitLetters text={groom.nickname} />
          </span>
          <span data-hero-fade data-hero-amp aria-hidden="true" className="my-2 block text-[0.42em] text-gold-deep md:my-3">
            ×
          </span>
          <span className="sr-only">dan</span>
          <span data-hero-name="bride" className="block">
            <SplitLetters text={bride.nickname} />
          </span>
        </h2>

        <div data-hero-fade data-hero-date className="mt-8 flex items-center gap-4 text-brown/85 md:mt-10">
          <span className="hairline w-8 text-gold-deep/70 md:w-12" />
          <time dateTime={weddingData.dateTime} className="font-sans text-xs tracking-[0.45em] md:text-sm">
            {formatDateDots()}
          </time>
          <span className="hairline w-8 text-gold-deep/70 md:w-12" />
        </div>
      </div>

      <div data-hero-fade data-hero-hint className="absolute inset-x-0 bottom-[max(4svh,calc(env(safe-area-inset-bottom)+1rem))] flex justify-center text-brown/70">
        <ScrollHint />
      </div>
    </section>
  );
}
