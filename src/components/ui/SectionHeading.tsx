import type { ReactNode } from "react";
import { Ornament } from "./Ornament";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Eyebrow + italic display title + optional lede — the same rhythm in every scene. */
export function SectionHeading({ id, eyebrow, title, children, className = "" }: SectionHeadingProps) {
  return (
    <header className={`mx-auto flex max-w-2xl flex-col items-center text-center ${className}`}>
      <p data-reveal className="eyebrow text-gold-deep">
        {eyebrow}
      </p>
      <h2 id={id} data-reveal="1" className="section-title mt-4 text-brown-deep md:mt-5">
        {title}
      </h2>
      <Ornament data-reveal="2" className="mt-6 text-gold-deep" />
      {children && (
        <div data-reveal="3" className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-brown/85 text-balance md:text-base">
          {children}
        </div>
      )}
    </header>
  );
}
