import { useLayoutEffect, useRef, useState } from "react";
import { duration, ease, stagger } from "../../config/animation";
import { weddingData } from "../../data/wedding";
import { requestTiltPermission } from "../../hooks/useDeviceTilt";
import { useGuestName } from "../../hooks/useGuestName";
import { music } from "../../hooks/useMusic";
import { gsap } from "../../lib/gsap";
import { runtime, setPhase, usePhase } from "../../store/experience";
import { coupleInitials, formatDateDots } from "../../utils/format";
import { playOpening } from "./openingTimeline";

interface OpeningOverlayProps {
  reducedMotion: boolean;
}

/**
 * The invitation cover. HTML typography sits over the 3D envelope; the button
 * starts the opening film and the flare hides the cut into the world.
 */
export function OpeningOverlay({ reducedMotion }: OpeningOverlayProps) {
  const phase = usePhase();
  const guest = useGuestName();
  const [finished, setFinished] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const flare = useRef<HTMLDivElement>(null);
  const { groom, bride } = weddingData;
  const [gi, bi] = coupleInitials();

  const entered = useRef(false);
  const timeline = useRef<gsap.core.Animation | null>(null);

  // Cover entrance, once, as soon as the scene is ready. Not reverted on phase
  // change — the opening timeline takes over these elements from here.
  useLayoutEffect(() => {
    if (phase !== "sealed" || !root.current || entered.current) return;
    entered.current = true;
    const items = gsap.utils.toArray<HTMLElement>("[data-cover]", root.current);
    timeline.current = gsap.fromTo(
        items,
        { autoAlpha: 0, y: reducedMotion ? 0 : 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reducedMotion ? duration.fast : duration.cinematic,
          ease: ease.out,
          stagger: reducedMotion ? 0 : stagger.lines,
          delay: 0.2,
        },
      );
  }, [phase, reducedMotion]);

  useLayoutEffect(() => () => void timeline.current?.kill(), []);

  const open = () => {
    if (phase !== "sealed" || !root.current || !flare.current) return;
    // Both must run synchronously inside the click for iOS / autoplay policies.
    requestTiltPermission();
    music.resumeIfPreferred();
    setPhase("opening");

    timeline.current?.kill();
    timeline.current = playOpening({
      content: gsap.utils.toArray<HTMLElement>("[data-cover]", root.current),
      flare: flare.current,
      reducedMotion,
      onReveal: () => {
        runtime.world.reveal = 1;
        runtime.snapCamera = true;
        window.scrollTo(0, 0);
        setPhase("revealed");
      },
      onComplete: () => setFinished(true),
    });
  };

  if (finished) return null;

  const loading = phase === "loading";

  return (
    <div
      ref={root}
      role={phase === "revealed" ? undefined : "dialog"}
      aria-modal={phase === "revealed" ? undefined : true}
      aria-hidden={phase === "revealed" ? true : undefined}
      aria-labelledby="cover-title"
      className="fixed inset-0 z-20 text-ivory"
      style={{ pointerEvents: phase === "revealed" ? "none" : "auto" }}
    >
      {/* Loader — the monogram breathing on a hairline */}
      <div
        className="absolute inset-0 grid place-items-center transition-opacity duration-700"
        style={{ opacity: loading ? 1 : 0, pointerEvents: "none" }}
        aria-hidden={!loading}
      >
        <div className="flex flex-col items-center gap-5 text-gold-light">
          <span className="font-display text-4xl font-light italic">
            {gi}
            <span className="mx-1 text-2xl text-gold">&amp;</span>
            {bi}
          </span>
          <span className="relative block h-px w-24 overflow-hidden bg-gold/25">
            <span
              className="absolute inset-0 bg-linear-to-r from-transparent via-gold-light to-transparent"
              style={{ animation: "shimmer 1.6s var(--ease-cinematic) infinite" }}
            />
          </span>
          <span className="sr-only" role="status">
            Menyiapkan undangan…
          </span>
        </div>
      </div>

      {/* Cover typography — upper half, above the envelope */}
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[max(7svh,2.5rem)] text-center md:pt-[8svh]">
        <p data-cover className="invisible font-display text-lg text-champagne/90 italic md:text-xl">
          Dear {guest ?? "You"},
        </p>
        <p data-cover className="eyebrow invisible mt-5 text-gold-light md:mt-6">
          The Wedding Of
        </p>
        <h1
          id="cover-title"
          data-cover
          className="display-names invisible mt-4 flex flex-col items-center text-[clamp(3.6rem,17vw,5.4rem)] text-ivory md:mt-5 md:flex-row md:items-baseline md:gap-6 md:text-[clamp(4.5rem,8.5vw,7.5rem)]"
        >
          <span>{groom.nickname}</span>
          <span className="my-1 font-display text-[0.5em] text-gold-light md:my-0">&amp;</span>
          <span>{bride.nickname}</span>
        </h1>
        <p data-cover className="invisible mt-5 font-sans text-xs tracking-[0.5em] text-champagne/80 md:mt-6 md:text-sm">
          <time dateTime={weddingData.dateTime}>{formatDateDots()}</time>
        </p>
      </div>

      {/* Call to action — below the envelope */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(6svh,calc(env(safe-area-inset-bottom)+1.5rem))]">
        <button
          type="button"
          data-cover
          onClick={open}
          disabled={phase !== "sealed"}
          className="btn-invite invisible"
        >
          <span aria-hidden="true" className="block size-1 rotate-45 bg-current" />
          Open Invitation
          <span aria-hidden="true" className="block size-1 rotate-45 bg-current" />
        </button>
      </div>

      {/* Flare — warm light that floods the frame and hides the cut */}
      <div
        ref={flare}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, #FFFBF3 0%, #F6E7CB 38%, #E6CFA8 75%, #D9BC92 100%)",
        }}
      />
    </div>
  );
}
