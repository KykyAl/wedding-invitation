import { useRef } from "react";
import { CopyButton } from "../../components/ui/CopyButton";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { weddingData } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";

interface GiftSectionProps {
  reducedMotion: boolean;
}

/** 1234567890 → 1234 5678 90 — easier to read aloud and to verify. */
const groupDigits = (n: string) => n.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

/** Scene 08 — wedding gift: digital envelopes and a delivery address, each one tap to copy. */
export function GiftSection({ reducedMotion }: GiftSectionProps) {
  const section = useRef<HTMLElement>(null);
  const { gift } = weddingData;
  useReveal(section, reducedMotion);

  return (
    <section ref={section} data-scene="gift" aria-labelledby="gift-title" className="scene-min-h scene-veil relative px-5 py-24 md:py-32">
      <SectionHeading id="gift-title" eyebrow="Wedding Gift" title="Tanda Kasih">
        {gift.intro}
      </SectionHeading>

      <ul className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
        {gift.accounts.map((acc, i) => (
          <li key={acc.bank + acc.number} data-reveal={i} className="paper flex flex-col items-center px-6 py-9 text-center">
            <span className="grid size-12 place-items-center rounded-full border border-gold-deep/50 font-display text-lg text-gold-deep italic">
              {acc.bank.charAt(0)}
            </span>
            <p className="eyebrow mt-5 text-gold-deep">{acc.bank}</p>
            <p className="mt-3 font-display text-[1.9rem] leading-none text-brown-deep tabular-nums">{groupDigits(acc.number)}</p>
            <p className="mt-3 text-sm text-brown/80">a.n. {acc.holder}</p>
            <CopyButton value={acc.number.replace(/\D/g, "")} label={`Salin nomor ${acc.bank}`} className="mt-6" />
          </li>
        ))}
      </ul>

      <div data-reveal className="paper mx-auto mt-6 flex max-w-5xl flex-col items-center gap-6 px-7 py-9 text-center md:flex-row md:justify-between md:px-12 md:text-left">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
          <svg aria-hidden="true" viewBox="0 0 32 32" className="size-10 shrink-0 text-gold-deep" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="4" y="12" width="24" height="16" />
            <rect x="2.5" y="8" width="27" height="4" />
            <path d="M16 8v20M16 8c-2-4-7-5-7-1.5S14 8 16 8zm0 0c2-4 7-5 7-1.5S18 8 16 8z" />
          </svg>
          <div>
            <p className="eyebrow text-gold-deep">Kirim Kado</p>
            <p className="mt-3 font-display text-2xl text-brown-deep">{gift.address.recipient}</p>
            <address className="mt-1 max-w-md text-sm leading-relaxed text-brown/85 not-italic">
              {gift.address.full}
              <br />
              Telp. {gift.address.phone}
            </address>
          </div>
        </div>
        <CopyButton
          value={`${gift.address.recipient} (${gift.address.phone})\n${gift.address.full}`}
          label="Salin alamat pengiriman"
          className="shrink-0"
        />
      </div>
    </section>
  );
}
