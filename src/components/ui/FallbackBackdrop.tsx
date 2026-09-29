import { useMemo } from "react";
import { usePhase } from "../../store/experience";
import { coupleInitials } from "../../utils/format";
import { createRandom } from "../../utils/random";

/**
 * 2D cinematic stand-in for devices without WebGL (or after a context loss).
 * Same composition and palette as the 3D world: envelope in the dark, then the
 * golden-hour pine forest with the arch.
 */
export function FallbackBackdrop() {
  const phase = usePhase();
  const revealed = phase === "revealed";
  const opening = phase === "opening";

  const dust = useMemo(() => {
    const rand = createRandom(4);
    return Array.from({ length: 26 }, () => ({
      left: rand.range(0, 100),
      top: rand.range(20, 100),
      size: rand.range(1.5, 3.5),
      delay: rand.range(0, 8),
      duration: rand.range(7, 13),
    }));
  }, []);

  const pines = useMemo(() => {
    const rand = createRandom(12);
    return Array.from({ length: 22 }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const x = 50 + side * rand.range(22, 60);
      return { x, h: rand.range(28, 58), w: rand.range(7, 12), shade: rand.range(0.55, 1) };
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Dark void */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: revealed ? 0 : 1,
          background:
            "radial-gradient(ellipse 60% 45% at 50% 62%, rgba(120,84,44,0.35), transparent 70%), #0C0907",
        }}
      />

      {/* Golden-hour forest */}
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: revealed ? 1 : 0 }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 30% at 44% 62%, rgba(255,227,176,0.9), transparent 70%), linear-gradient(180deg, #5A4034 0%, #C89668 38%, #E6CFA8 62%, #E6CFA8 100%)",
          }}
        />
        <svg className="absolute inset-x-0 bottom-0 h-[62%] w-full" viewBox="0 0 100 60" preserveAspectRatio="none">
          <path d="M0 30 Q15 22 30 28 T60 26 T100 24 V60 H0Z" fill="#C9A988" opacity="0.7" />
          {pines.map((p, i) => (
            <path
              key={i}
              d={`M${p.x} ${60 - p.h} L${p.x + p.w / 2} 60 L${p.x - p.w / 2} 60Z`}
              fill="#262B22"
              opacity={p.shade}
            />
          ))}
          <rect x="0" y="54" width="100" height="6" fill="#5E4C38" />
        </svg>
        {/* Arch */}
        <svg className="absolute top-[24%] left-1/2 h-[52%] -translate-x-1/2" viewBox="0 0 60 80" fill="none">
          <path d="M5 80 V32 A25 25 0 0 1 55 32 V80" stroke="#D9BC82" strokeWidth="1.2" />
          <path d="M8.5 80 V32 A21.5 21.5 0 0 1 51.5 32 V80" stroke="#B8955A" strokeWidth="0.4" />
        </svg>
      </div>

      {/* Envelope */}
      <div
        className="absolute left-1/2 aspect-[1.52] w-[min(80vw,52vh)] transition-[opacity,transform] duration-[1400ms] ease-(--ease-cinematic)"
        style={{
          top: "62%",
          opacity: revealed ? 0 : 1,
          transform: `translate(-50%, -50%) scale(${opening ? 1.35 : 1})`,
          perspective: "800px",
        }}
      >
        <div className="absolute inset-0 rounded-[3px] bg-[#EEE2CB] shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
        <svg className="absolute inset-0 size-full" viewBox="0 0 152 100" preserveAspectRatio="none">
          <path d="M0 100 L76 47 L152 100" fill="none" stroke="rgba(110,80,45,0.25)" strokeWidth="0.6" />
        </svg>
        <div
          className="absolute inset-x-0 top-0 h-[64%] origin-top transition-transform duration-[1200ms] ease-(--ease-cinematic)"
          style={{ transform: opening ? "rotateX(180deg)" : "rotateX(0deg)", transformStyle: "preserve-3d" }}
        >
          <svg className="size-full" viewBox="0 0 152 64" preserveAspectRatio="none">
            <path d="M0 0 H152 L76 64Z" fill="#F4EBDA" stroke="#B8955A" strokeWidth="0.5" />
          </svg>
        </div>
        <div
          className="absolute top-[52%] left-1/2 grid aspect-square w-[19%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#4A1C18] font-display text-[clamp(0.9rem,3vw,1.4rem)] text-gold-light/80 italic shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-opacity duration-500"
          style={{ opacity: opening ? 0 : 1 }}
        >
          {coupleInitials().join("")}
        </div>
      </div>

      {/* Dust */}
      {dust.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold-light"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            boxShadow: "0 0 6px rgba(217,188,130,0.8)",
            animation: `float-dust ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
