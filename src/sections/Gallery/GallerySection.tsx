import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { weddingData } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";
import { Lightbox } from "./Lightbox";

interface GallerySectionProps {
  reducedMotion: boolean;
}

const DRAG_THRESHOLD = 6;

/** Scene 06 — a cinematic filmstrip: swipe / drag, photos curve away with depth, tap to open. */
export function GallerySection({ reducedMotion }: GallerySectionProps) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const dragMoved = useRef(false);
  const photos = weddingData.gallery;
  useReveal(section, reducedMotion);

  // Depth: each frame rotates/scales by its distance from the centre of the strip.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const item = child as HTMLElement;
        const center = item.offsetLeft + item.offsetWidth / 2;
        const t = Math.max(-1, Math.min(1, (center - mid) / (el.clientWidth * 0.6)));
        if (Math.abs(center - mid) < best) {
          best = Math.abs(center - mid);
          nearest = i;
        }
        const inner = item.firstElementChild as HTMLElement | null;
        if (!inner) return;
        inner.style.transform = reducedMotion
          ? ""
          : `perspective(1200px) rotateY(${-t * 16}deg) scale(${1 - Math.abs(t) * 0.1})`;
        inner.style.opacity = String(1 - Math.abs(t) * 0.35);
      });
      setActive((prev) => (prev === nearest ? prev : nearest));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  // Mouse drag on desktop (touch uses native swipe + scroll-snap).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      dragMoved.current = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!dragMoved.current && Math.abs(dx) > DRAG_THRESHOLD) {
        dragMoved.current = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
        el.setPointerCapture(e.pointerId);
      }
      if (dragMoved.current) el.scrollLeft = startScroll - dx;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (dragMoved.current) {
        // Re-enable snapping and settle on the nearest frame.
        const item = el.children[0] as HTMLElement | undefined;
        const step = item ? item.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth;
        const target = Math.round(el.scrollLeft / step) * step;
        el.scrollTo({ left: target, behavior: "smooth" });
        setTimeout(() => (el.style.scrollSnapType = ""), 450);
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  const scrollToIndex = useCallback(
    (i: number) => {
      const el = track.current;
      const item = el?.children[i] as HTMLElement | undefined;
      if (!el || !item) return;
      el.scrollTo({
        left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  return (
    <section ref={section} data-scene="gallery" aria-labelledby="gallery-title" className="scene-min-h scene-veil relative py-24 md:py-32">
      <div className="px-6">
        <SectionHeading id="gallery-title" eyebrow="Our Moments" title="Galeri Kenangan">
          Geser untuk melihat, ketuk untuk memperbesar.
        </SectionHeading>
      </div>

      <div data-reveal="2" className="relative mt-12 md:mt-16">
        <div
          ref={track}
          role="list"
          aria-label="Foto prewedding"
          className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto px-[calc(50%-var(--w)/2)] py-6 [scrollbar-width:none] md:gap-8 [&::-webkit-scrollbar]:hidden"
          style={{ "--w": "min(66vw, 21rem)" } as CSSProperties}
        >
          {photos.map((src, i) => (
            <div key={src} role="listitem" className="w-(--w) shrink-0 snap-center">
              <button
                type="button"
                onClick={() => {
                  if (dragMoved.current) return;
                  setOpen(i);
                }}
                className="group relative block aspect-[4/5] w-full overflow-hidden bg-champagne shadow-[0_40px_70px_-35px_rgba(30,22,16,0.65)] transition-[opacity] will-change-transform"
                aria-label={`Buka foto ${i + 1} dari ${photos.length}`}
              >
                <img
                  src={src}
                  alt={`Momen ${weddingData.groom.nickname} & ${weddingData.bride.nickname}, foto ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  width={1200}
                  height={1500}
                  className="size-full object-cover transition-transform duration-[1.2s] ease-(--ease-out-soft) select-none group-hover:scale-[1.04]"
                />
                <span aria-hidden="true" className="absolute inset-2 border border-ivory/40" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 px-6">
          <button
            type="button"
            className="btn-line !min-h-11 !px-4 !text-sm !text-brown-deep"
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="Foto sebelumnya"
          >
            ←
          </button>
          <p className="min-w-16 text-center font-display text-xl text-brown-deep tabular-nums" aria-live="polite">
            {String(active + 1).padStart(2, "0")}
            <span className="mx-2 text-gold-deep" aria-hidden="true">/</span>
            <span className="sr-only">dari</span>
            {String(photos.length).padStart(2, "0")}
          </p>
          <button
            type="button"
            className="btn-line !min-h-11 !px-4 !text-sm !text-brown-deep"
            onClick={() => scrollToIndex(Math.min(photos.length - 1, active + 1))}
            disabled={active === photos.length - 1}
            aria-label="Foto berikutnya"
          >
            →
          </button>
        </div>
      </div>

      <Lightbox
        photos={photos}
        index={open}
        onClose={() => setOpen(null)}
        onChange={(i) => {
          setOpen(i);
          scrollToIndex(i);
        }}
      />
    </section>
  );
}
