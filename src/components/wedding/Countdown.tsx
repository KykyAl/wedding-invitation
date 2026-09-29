import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface CountdownProps {
  target: string;
  className?: string;
}

const UNITS = [
  { key: "d", label: "Hari" },
  { key: "h", label: "Jam" },
  { key: "m", label: "Menit" },
  { key: "s", label: "Detik" },
] as const;

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

/**
 * Real-time countdown. Renders once; every tick writes straight to the DOM through refs,
 * so React never re-renders. Only digits that changed get the subtle "tick" animation.
 */
export function Countdown({ target, className = "" }: CountdownProps) {
  const reduced = useReducedMotion();
  const cells = useRef<Record<string, HTMLSpanElement | null>>({});
  const done = useRef<HTMLParagraphElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    const last: Record<string, string> = {};
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const remaining = end - Date.now();
      const parts = split(remaining);
      for (const { key } of UNITS) {
        const el = cells.current[key];
        const text = String(parts[key]).padStart(2, "0");
        if (!el || last[key] === text) continue;
        el.textContent = text;
        if (last[key] !== undefined && !reduced) {
          el.style.animation = "none";
          void el.offsetWidth; // restart the CSS animation
          el.style.animation = "tick 0.5s var(--ease-out-soft)";
        }
        last[key] = text;
      }
      const finished = remaining <= 0;
      if (grid.current) grid.current.hidden = finished;
      if (done.current) done.current.hidden = !finished;
      if (!finished) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5); // align to the second
    };
    tick();
    return () => clearTimeout(timer);
  }, [target, reduced]);

  return (
    <div className={className}>
      <div ref={grid} role="timer" aria-label="Hitung mundur menuju hari pernikahan" className="flex items-start justify-center gap-3 md:gap-6">
        {UNITS.map(({ key, label }, i) => (
          <div key={key} className="flex items-start gap-3 md:gap-6">
            {i > 0 && (
              <span aria-hidden="true" className="pt-3 font-display text-2xl text-gold-deep/60 md:pt-4 md:text-3xl">
                ·
              </span>
            )}
            <div className="flex w-14 flex-col items-center md:w-20">
              <span
                ref={(el) => {
                  cells.current[key] = el;
                }}
                className="inline-block font-display text-[2.6rem] leading-none font-light text-brown-deep tabular-nums md:text-6xl"
              >
                00
              </span>
              <span className="field-label mt-2 text-[0.5625rem] md:text-[0.625rem]">{label}</span>
            </div>
          </div>
        ))}
      </div>
      <p ref={done} hidden className="text-center font-display text-3xl text-brown-deep italic">
        Hari bahagia telah tiba.
      </p>
    </div>
  );
}
