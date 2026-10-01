import { useRef } from "react";
import { Ornament } from "../../components/ui/Ornament";
import { weddingData } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";
import { coupleInitials, formatDateDots } from "../../utils/format";

interface ClosingSectionProps {
  reducedMotion: boolean;
}

/** Scene 10 — the camera rises into the dusk; a last word from the couple and their families. */
export function ClosingSection({ reducedMotion }: ClosingSectionProps) {
  const section = useRef<HTMLElement>(null);
  const { closing, groom, bride, hashtag, credits } = weddingData;
  const [gi, bi] = coupleInitials();
  useReveal(section, reducedMotion);

  return (
    <section
      ref={section}
      data-scene="closing"
      aria-labelledby="closing-title"
      className="scene-min-h relative flex flex-col items-center justify-center px-7 pt-24 pb-10 text-center text-ivory"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,22,16,0) 0%, rgba(30,22,16,0.5) 15%, rgba(30,22,16,0.62) 60%, rgba(12,9,7,0.85) 100%)",
        }}
      />
      <div className="relative flex max-w-2xl flex-col items-center">
        <span data-reveal aria-hidden="true" className="flex size-20 items-center justify-center rounded-full border border-gold-light/60 font-display text-2xl text-gold-light italic">
          {gi}
          <span className="mx-0.5 text-base">&amp;</span>
          {bi}
        </span>
        <p data-reveal="1" className="eyebrow mt-10 text-gold-light">
          Terima Kasih
        </p>
        <p data-reveal="2" className="mt-6 font-display text-xl leading-relaxed text-ivory/95 text-balance md:text-2xl">
          {closing.message}
        </p>
        <p data-reveal="3" className="mt-8 font-display text-lg text-champagne italic">
          Wassalamu’alaikum Warahmatullahi Wabarakatuh
        </p>
        <Ornament data-reveal="3" className="mt-10 text-gold-light" />
        <p data-reveal="4" className="eyebrow mt-10 text-champagne/80">
          {closing.signature}
        </p>
        <h2 id="closing-title" data-reveal="4" className="display-names mt-5 text-[clamp(3.4rem,15vw,6.5rem)] text-ivory">
          {groom.nickname} <span className="text-[0.55em] text-gold-light">&amp;</span> {bride.nickname}
        </h2>
        <p data-reveal="5" className="mt-6 max-w-md text-sm leading-relaxed text-champagne/85">
          {closing.families}
        </p>
        <p data-reveal="5" className="mt-8 font-sans text-xs tracking-[0.45em] text-gold-light">
          {formatDateDots()} · {hashtag}
        </p>
      </div>

      <footer className="relative mt-24 flex flex-col items-center gap-2 text-[0.625rem] tracking-[0.3em] text-champagne/55 uppercase">
        <span>
          {groom.nickname} &amp; {bride.nickname} · {new Date(weddingData.dateTime).getFullYear()}
        </span>
        <span className="tracking-[0.22em] normal-case">
          {credits.label}{" "}
          <a
            href={credits.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-light/80 underline decoration-gold-light/30 underline-offset-4 transition-colors hover:text-gold-light hover:decoration-gold-light"
          >
            {credits.name}
          </a>
        </span>
      </footer>
    </section>
  );
}
