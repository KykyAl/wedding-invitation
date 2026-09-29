import { music, useMusic } from "../../hooks/useMusic";

interface MusicToggleProps {
  visible: boolean;
}

/** Floating ♪ control. Muted by default; the guest decides. */
export function MusicToggle({ visible }: MusicToggleProps) {
  const state = useMusic();
  if (state === "unavailable") return null;
  const on = state === "on";

  return (
    <button
      type="button"
      onClick={() => void music.toggle()}
      aria-pressed={on}
      aria-label={on ? "Matikan musik latar" : "Putar musik latar"}
      title={on ? "Matikan musik" : "Putar musik"}
      className={`fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-full border border-gold-light/50 bg-ink/55 text-gold-light shadow-[0_8px_30px_rgba(12,9,7,0.35)] transition-[opacity,transform,border-color] duration-700 ease-(--ease-out-soft) hover:border-gold-light md:right-8 md:bottom-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      {on ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
          {[0, 0.2, 0.4, 0.1].map((d, i) => (
            <span
              key={i}
              className="block w-[2px] origin-bottom rounded-full bg-current"
              style={{ height: "100%", animation: `music-bar 1.1s ease-in-out ${d}s infinite` }}
            />
          ))}
        </span>
      ) : (
        <span className="font-display text-xl leading-none italic" aria-hidden="true">
          ♪
        </span>
      )}
    </button>
  );
}
