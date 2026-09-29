import { useLayoutEffect, useRef } from "react";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { weddingData } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";
import { gsap } from "../../lib/gsap";

interface CoupleSectionProps {
  reducedMotion: boolean;
}

type Person = typeof weddingData.groom;

/** Portrait in an arched window frame — echoes the golden arch of the hero. */
function Portrait({ person, side }: { person: Person; side: "groom" | "bride" }) {
  return (
    <figure className="flex flex-col items-center text-center">
      <div data-parallax={side === "groom" ? "-8" : "8"} className="relative w-[min(68vw,17rem)] md:w-[19rem]">
        <div className="absolute -inset-2.5 rounded-t-full border border-gold-deep/45" aria-hidden="true" />
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-champagne shadow-[0_40px_80px_-40px_rgba(30,22,16,0.6)]">
          <img
            src={person.photo}
            alt={`Foto ${person.fullName}`}
            loading="lazy"
            decoding="async"
            width={900}
            height={1200}
            className="size-full object-cover"
          />
        </div>
      </div>
      <figcaption className="mt-8 flex flex-col items-center">
        <span className="display-names text-5xl text-brown-deep md:text-6xl">{person.nickname}</span>
        <span className="mt-3 font-display text-xl text-brown md:text-2xl">{person.fullName}</span>
        <span className="mt-4 max-w-[18rem] text-sm leading-relaxed text-brown/80">
          {person.order}
          <br />
          <span className="text-brown-deep">{person.parents}</span>
        </span>
        {person.instagram && (
          <a
            href={`https://instagram.com/${person.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.18em] text-gold-deep underline-offset-4 hover:underline"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
            </svg>
            @{person.instagram}
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/** Scene 03 — the bride and groom, with their families. */
export function CoupleSection({ reducedMotion }: CoupleSectionProps) {
  const section = useRef<HTMLElement>(null);
  const { groom, bride } = weddingData;
  useReveal(section, reducedMotion);

  // Portraits drift at opposite speeds for depth.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -Number(el.dataset.parallax) },
          {
            yPercent: Number(el.dataset.parallax),
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      });
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={section}
      data-scene="couple"
      aria-labelledby="couple-title"
      className="scene-min-h scene-veil relative px-6 py-24 md:py-32"
    >
      <SectionHeading id="couple-title" eyebrow="The Bride & Groom" title="Dua Hati, Satu Janji">
        Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
      </SectionHeading>

      <div className="mx-auto mt-16 grid max-w-5xl items-start gap-16 md:mt-24 md:grid-cols-[1fr_auto_1fr] md:gap-8">
        <div data-reveal>
          <Portrait person={groom} side="groom" />
        </div>
        <div
          aria-hidden="true"
          data-reveal="1"
          className="display-names self-center text-center text-6xl text-gold-deep md:pt-0 md:text-7xl"
        >
          &amp;
        </div>
        <div data-reveal="2" className="md:mt-24">
          <Portrait person={bride} side="bride" />
        </div>
      </div>
    </section>
  );
}
