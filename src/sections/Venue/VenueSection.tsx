import { useEffect, useRef, useState } from "react";
import { CopyButton } from "../../components/ui/CopyButton";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { weddingData } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";

interface VenueSectionProps {
  reducedMotion: boolean;
}

/** Map iframe mounts only when near the viewport — Google Maps is heavy on mobile. */
function LazyMap({ src, title }: { src: string; title: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={holder} className="relative aspect-[4/3] w-full overflow-hidden bg-champagne md:aspect-auto md:h-full md:min-h-[26rem]">
      {visible ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0 [filter:sepia(0.35)_saturate(0.85)_contrast(0.95)]"
          allowFullScreen
        />
      ) : (
        <div className="grid size-full place-items-center text-sm text-brown/60">Memuat peta…</div>
      )}
    </div>
  );
}

/** Scene 07 — the venue, with the aerial lake view in the 3D world behind. */
export function VenueSection({ reducedMotion }: VenueSectionProps) {
  const section = useRef<HTMLElement>(null);
  const { venue } = weddingData;
  useReveal(section, reducedMotion);

  return (
    <section ref={section} data-scene="venue" aria-labelledby="venue-title" className="scene-min-h scene-veil relative px-5 py-24 md:py-32">
      <SectionHeading id="venue-title" eyebrow="The Venue" title={venue.name} />

      <div data-reveal="3" className="paper mx-auto mt-12 grid max-w-5xl overflow-hidden md:mt-16 md:grid-cols-[1.15fr_1fr]">
        <div className="p-2.5 md:p-3">
          <LazyMap src={venue.embedUrl} title={`Peta lokasi ${venue.name}`} />
        </div>

        <div className="flex flex-col px-7 py-9 md:px-10 md:py-12">
          <p className="eyebrow text-gold-deep">Alamat</p>
          <address className="mt-3 font-display text-2xl leading-snug text-brown-deep not-italic md:text-[1.7rem]">
            {venue.name}
            <br />
            <span className="text-lg text-brown md:text-xl">{venue.address}</span>
          </address>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href={venue.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-solid">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M8 14.5s4.5-4.3 4.5-8a4.5 4.5 0 0 0-9 0c0 3.7 4.5 8 4.5 8z" />
                <circle cx="8" cy="6.5" r="1.6" />
              </svg>
              Open Map
            </a>
            <CopyButton value={`${venue.name}, ${venue.address}`} label="Salin alamat" />
          </div>

          <span aria-hidden="true" className="hairline mt-9 w-full text-gold-deep/30" />

          <p className="eyebrow mt-8 text-gold-deep">Info Perjalanan</p>
          <ul className="mt-4 space-y-3">
            {venue.notes.map((note) => (
              <li key={note} className="flex gap-3 text-sm leading-relaxed text-brown/85">
                <span aria-hidden="true" className="mt-2 block size-1 shrink-0 rotate-45 bg-gold-deep" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
