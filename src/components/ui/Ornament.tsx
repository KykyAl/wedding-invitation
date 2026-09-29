import type { HTMLAttributes } from "react";

/** Hairline — diamond — hairline. */
export function Ornament({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 ${className}`} {...rest}>
      <span className="hairline w-10 md:w-14" />
      <span className="block size-1.5 rotate-45 border border-current" />
      <span className="hairline w-10 md:w-14" />
    </div>
  );
}
