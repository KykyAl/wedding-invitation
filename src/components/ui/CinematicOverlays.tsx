/**
 * Film grain + vignette over everything. Static layers (no blend modes) so they
 * cost nothing per frame on mobile GPUs.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function CinematicOverlays() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(12,9,7,0.38) 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}
