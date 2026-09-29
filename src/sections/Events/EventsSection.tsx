import { useRef } from "react";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Countdown } from "../../components/wedding/Countdown";
import { weddingData, type WeddingEvent } from "../../data/wedding";
import { useReveal } from "../../hooks/useReveal";
import { downloadIcs, googleCalendarUrl } from "../../utils/calendar";

interface EventsSectionProps {
  reducedMotion: boolean;
}

const couple = `${weddingData.groom.nickname} & ${weddingData.bride.nickname}`;

function EventCard({ event, index }: { event: WeddingEvent; index: number }) {
  return (
    <article data-reveal={index} className="paper flex flex-col items-center px-7 py-10 text-center md:px-10 md:py-12">
      <p className="eyebrow text-gold-deep">{index === 0 ? "Pertama" : "Kedua"}</p>
      <h3 className="mt-4 font-display text-4xl text-brown-deep italic md:text-5xl">{event.type}</h3>

      <div className="mt-7 flex items-center gap-5 text-brown-deep">
        <span className="text-right font-sans text-xs tracking-[0.3em] uppercase">{event.day}</span>
        <span aria-hidden="true" className="h-10 w-px bg-gold-deep/50" />
        <time dateTime={event.start} className="font-display text-2xl">
          {event.date}
        </time>
      </div>

      <p className="mt-4 font-sans text-sm tracking-[0.2em] text-brown">
        <time dateTime={event.start}>{event.time}</time> — selesai
      </p>

      <span aria-hidden="true" className="hairline mt-7 w-24 text-gold-deep/60" />

      <p className="mt-6 font-display text-2xl text-brown-deep">{event.venue}</p>
      <address className="mt-2 max-w-[18rem] text-sm leading-relaxed text-brown/80 not-italic">{event.address}</address>

      <a
        href={googleCalendarUrl(event, couple)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-line mt-8"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="2" y="3" width="12" height="11" rx="1" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
        </svg>
        Simpan ke Kalender
      </a>
    </article>
  );
}

/** Scene 05 — the day itself: countdown, both ceremonies, dress code. */
export function EventsSection({ reducedMotion }: EventsSectionProps) {
  const section = useRef<HTMLElement>(null);
  const { events, dressCode, dateTime } = weddingData;
  useReveal(section, reducedMotion);

  return (
    <section ref={section} data-scene="events" aria-labelledby="events-title" className="scene-min-h scene-veil relative px-5 py-24 md:py-32">
      <SectionHeading id="events-title" eyebrow="Save The Date" title="Hari Bahagia">
        Merupakan suatu kebahagiaan bagi kami untuk mengundang Anda di hari istimewa ini.
      </SectionHeading>

      <div data-reveal="3" className="mt-12 md:mt-16">
        <Countdown target={dateTime} />
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
        {events.map((event, i) => (
          <EventCard key={event.type} event={event} index={i} />
        ))}
      </div>

      <div data-reveal className="mx-auto mt-6 flex max-w-4xl justify-center">
        <button
          type="button"
          onClick={() => downloadIcs(events, couple, `${couple.replace(/\W+/g, "-")}.ics`)}
          className="text-xs tracking-[0.18em] text-gold-deep underline decoration-gold-deep/40 underline-offset-4 hover:decoration-gold-deep"
        >
          Unduh semua jadwal (.ics — Apple / Outlook)
        </button>
      </div>

      <div data-reveal className="mx-auto mt-16 flex max-w-xl flex-col items-center text-center md:mt-20">
        <p className="eyebrow text-gold-deep">Dress Code</p>
        <p className="mt-3 font-display text-3xl text-brown-deep italic">{dressCode.title}</p>
        <ul className="mt-5 flex gap-3" aria-label="Palet warna yang disarankan">
          {dressCode.colors.map((c) => (
            <li key={c} className="size-9 rounded-full border border-ivory shadow-[0_0_0_1px_rgba(140,106,58,0.4)]" style={{ background: c }}>
              <span className="sr-only">{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-brown/80 text-balance">{dressCode.note}</p>
      </div>
    </section>
  );
}
