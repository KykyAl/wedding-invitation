interface SplitLettersProps {
  text: string;
  className?: string;
  /** data attribute used by GSAP to find the letters */
  letterAttr?: string;
}

/**
 * Renders each letter inside its own mask for cinematic rise-in reveals.
 * The mask is padded (and pulled back with negative margins) so italic overhangs
 * and descenders are never clipped. Screen readers get the plain word.
 */
export function SplitLetters({ text, className = "", letterAttr = "data-letter" }: SplitLettersProps) {
  return (
    <span className={`inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((char, i) => (
          <span
            key={i}
            className="-mx-[0.1em] -mt-[0.12em] -mb-[0.26em] inline-block overflow-hidden px-[0.1em] pt-[0.12em] pb-[0.26em] align-bottom"
          >
            <span className="inline-block will-change-transform" {...{ [letterAttr]: "" }}>
              {char === " " ? " " : char}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
