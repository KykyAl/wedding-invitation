import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { CinematicOverlays } from "./components/ui/CinematicOverlays";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { FallbackBackdrop } from "./components/ui/FallbackBackdrop";
import { MusicToggle } from "./components/ui/MusicToggle";
import { useDeviceTilt } from "./hooks/useDeviceTilt";
import { whenFontsReady } from "./hooks/useFontsReady";
import { music } from "./hooks/useMusic";
import { usePageVisible } from "./hooks/usePageVisible";
import { usePointerParallax } from "./hooks/usePointerParallax";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { ScrollTrigger } from "./lib/gsap";
import { ClosingSection } from "./sections/Closing/ClosingSection";
import { CoupleSection } from "./sections/Couple/CoupleSection";
import { EventsSection } from "./sections/Events/EventsSection";
import { GallerySection } from "./sections/Gallery/GallerySection";
import { GiftSection } from "./sections/Gift/GiftSection";
import { HeroSection } from "./sections/Hero/HeroSection";
import { OpeningOverlay } from "./sections/Opening/OpeningOverlay";
import { QuoteSection } from "./sections/Quote/QuoteSection";
import { RsvpSection } from "./sections/RSVP/RsvpSection";
import { StorySection } from "./sections/Story/StorySection";
import { VenueSection } from "./sections/Venue/VenueSection";
import { SCENE_ORDER } from "./sections/registry";
import { getPhase, setPhase, usePhase } from "./store/experience";
import { isWebGLAvailable } from "./utils/webgl";

// three.js + R3F live in their own chunk so the cover paints before the 3D payload lands.
const SceneCanvas = lazy(() => import("./three/SceneCanvas").then((m) => ({ default: m.SceneCanvas })));

/** Never keep a guest on the loader: proceed even if the 3D scene is slow to warm up. */
const READY_TIMEOUT_MS = 9000;

export default function App() {
  const reducedMotion = useReducedMotion();
  const phase = usePhase();
  const pageVisible = usePageVisible();
  const [webgl, setWebgl] = useState(isWebGLAvailable);
  const [sceneReady, setSceneReady] = useState(false);
  const main = useRef<HTMLElement>(null);
  const revealed = phase === "revealed";

  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const dropToFallback = useCallback(() => setWebgl(false), []);

  // loading → sealed once fonts and (if used) the 3D scene are ready.
  useEffect(() => {
    let alive = true;
    const timeout = setTimeout(() => alive && getPhase() === "loading" && setPhase("sealed"), READY_TIMEOUT_MS);
    whenFontsReady().then(() => {
      if (alive && (sceneReady || !webgl) && getPhase() === "loading") setPhase("sealed");
    });
    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, [sceneReady, webgl]);

  // Lock scroll until the invitation is opened; always start the story at the top.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    document.documentElement.classList.toggle("is-locked", !revealed);
    if (revealed) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [revealed]);

  useEffect(() => music.setPageVisible(pageVisible), [pageVisible]);

  useScrollProgress(main, revealed);
  usePointerParallax(!reducedMotion);
  useDeviceTilt(!reducedMotion && phase !== "loading");

  return (
    <>
      {webgl ? (
        <ErrorBoundary fallback={<FallbackBackdrop />} onError={dropToFallback}>
          <Suspense fallback={null}>
            <SceneCanvas
              scenes={SCENE_ORDER}
              reducedMotion={reducedMotion}
              onReady={markSceneReady}
              onContextLost={dropToFallback}
            />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <FallbackBackdrop />
      )}

      {/* Fully hidden until opened: pre-positioned reveal letters must never peek through the cover. */}
      <main
        ref={main}
        inert={!revealed}
        aria-hidden={!revealed}
        className="relative z-10"
        style={{ visibility: revealed ? "visible" : "hidden" }}
      >
        <HeroSection reducedMotion={reducedMotion} />
        <QuoteSection reducedMotion={reducedMotion} />
        <CoupleSection reducedMotion={reducedMotion} />
        <StorySection reducedMotion={reducedMotion} />
        <EventsSection reducedMotion={reducedMotion} />
        <GallerySection reducedMotion={reducedMotion} />
        <VenueSection reducedMotion={reducedMotion} />
        <GiftSection reducedMotion={reducedMotion} />
        <RsvpSection reducedMotion={reducedMotion} />
        <ClosingSection reducedMotion={reducedMotion} />
      </main>

      <CinematicOverlays />
      <OpeningOverlay reducedMotion={reducedMotion} />
      <MusicToggle visible={revealed} />
    </>
  );
}
