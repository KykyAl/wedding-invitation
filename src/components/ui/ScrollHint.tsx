interface ScrollHintProps {
  label?: string;
  className?: string;
}

/** A single drop of light travelling down a hairline. */
export function ScrollHint({ label = "Scroll", className = "" }: ScrollHintProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} aria-hidden="true">
      <span className="eyebrow text-[0.625rem] opacity-80">{label}</span>
      <span className="relative block h-12 w-px overflow-hidden bg-current/25">
        <span
          className="absolute inset-x-0 top-0 h-1/2 bg-current"
          style={{ animation: "scroll-drop 2.4s var(--ease-cinematic) infinite" }}
        />
      </span>
    </div>
  );
}
