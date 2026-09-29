import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { weddingData, type Attendance } from "../../data/wedding";
import { readGuestName } from "../../hooks/useGuestName";
import { useReveal } from "../../hooks/useReveal";
import { gsap } from "../../lib/gsap";
import { rsvpService, validateRsvp, type RsvpRecord, type Wish } from "../../services/rsvp";

interface RsvpSectionProps {
  reducedMotion: boolean;
}

const MESSAGE_MAX = 280;

function AttendanceOption({
  value,
  current,
  label,
  sub,
  name,
  onChange,
}: {
  value: Attendance;
  current: Attendance;
  label: string;
  sub: string;
  name: string;
  onChange: (v: Attendance) => void;
}) {
  const checked = value === current;
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center border px-3 py-4 text-center transition-colors duration-500 ${
        checked ? "border-brown-deep bg-brown-deep text-ivory" : "border-gold-deep/40 text-brown hover:border-brown/60"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      <span className="font-display text-xl italic">{label}</span>
      <span className={`mt-1 text-[0.6875rem] tracking-[0.12em] ${checked ? "text-champagne/80" : "text-brown/60"}`}>{sub}</span>
    </label>
  );
}

function Confirmation({ record, onEdit, reducedMotion }: { record: RsvpRecord; onEdit: () => void; reducedMotion: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-confirm]", { autoAlpha: 0, y: 16, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.5 });
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);

  const attend = record.attendance === "attend";
  return (
    <div ref={root} role="status" className="flex flex-col items-center py-4 text-center">
      <svg viewBox="0 0 64 64" className="size-20 text-gold-deep" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="32" cy="32" r="30" strokeWidth="1" strokeDasharray="190" strokeDashoffset={reducedMotion ? 0 : 190} style={{ animation: reducedMotion ? undefined : "draw-stroke 1.2s var(--ease-cinematic) forwards" }} />
        <path d="M21 33l7 7 15-16" strokeWidth="1.4" strokeDasharray="40" strokeDashoffset={reducedMotion ? 0 : 40} style={{ animation: reducedMotion ? undefined : "draw-stroke 0.7s var(--ease-out-soft) 0.9s forwards" }} />
      </svg>
      <p data-confirm className="mt-7 font-display text-3xl leading-tight text-brown-deep italic md:text-4xl">
        Thank you for being part of our story.
      </p>
      <p data-confirm className="mt-4 max-w-sm text-sm leading-relaxed text-brown/85">
        {attend
          ? `Terima kasih, ${record.name}. Kehadiran ${record.guests} orang telah kami catat — sampai jumpa di ${weddingData.venue.name}.`
          : `Terima kasih, ${record.name}. Doa dan ucapan Anda sangat berarti bagi kami.`}
      </p>
      <button data-confirm type="button" onClick={onEdit} className="btn-line mt-8">
        Ubah Konfirmasi
      </button>
    </div>
  );
}

/** Scene 09 — RSVP and the wall of wishes. */
export function RsvpSection({ reducedMotion }: RsvpSectionProps) {
  const section = useRef<HTMLElement>(null);
  const formId = useId();
  const { rsvp } = weddingData;
  useReveal(section, reducedMotion);

  const [loadingOwn, setLoadingOwn] = useState(true);
  const [record, setRecord] = useState<RsvpRecord | null>(null);
  const [editing, setEditing] = useState(true);
  const [name, setName] = useState(readGuestName() ?? rsvp.defaultName);
  const [attendance, setAttendance] = useState<Attendance>("attend");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    let alive = true;
    rsvpService
      .getOwn()
      .then((own) => {
        if (!alive || !own) return;
        setRecord(own);
        setEditing(false);
        setName(own.name);
        setAttendance(own.attendance);
        setGuests(own.guests > 0 ? own.guests : 1);
        setMessage(own.message);
      })
      .catch(() => {
        /* offline / server down — the guest can still fill in the form */
      })
      .finally(() => alive && setLoadingOwn(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    rsvpService
      .listWishes()
      .then((w) => alive && setWishes(w))
      .catch(() => {
        /* keep the wishes already shown */
      });
    return () => {
      alive = false;
    };
  }, [record]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const input = { name, attendance, guests, message };
    const invalid = validateRsvp(input);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const saved = await rsvpService.submit(input);
      setRecord(saved);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section ref={section} data-scene="rsvp" aria-labelledby="rsvp-title" className="scene-min-h scene-veil relative px-5 py-24 md:py-32">
      <SectionHeading id="rsvp-title" eyebrow="RSVP" title="Konfirmasi Kehadiran">
        Mohon konfirmasi kehadiran Anda sebelum <strong className="font-medium text-brown-deep">{rsvp.deadline}</strong>.
      </SectionHeading>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:mt-16 md:grid-cols-[1.1fr_1fr] md:gap-8">
        <div data-reveal className="paper px-6 py-9 md:px-10 md:py-11">
          {loadingOwn ? (
            <p role="status" className="py-16 text-center text-sm tracking-[0.18em] text-brown/60">
              Memuat…
            </p>
          ) : record && !editing ? (
            <Confirmation record={record} onEdit={() => setEditing(true)} reducedMotion={reducedMotion} />
          ) : (
            <form onSubmit={submit} noValidate aria-describedby={error ? `${formId}-error` : undefined} className="flex flex-col gap-7">
              <div>
                <label htmlFor={`${formId}-name`} className="field-label">
                  Nama
                </label>
                <input
                  id={`${formId}-name`}
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={60}
                  required
                  placeholder="Nama Anda"
                />
              </div>

              <fieldset>
                <legend className="field-label mb-3">Kehadiran</legend>
                <div className="grid grid-cols-2 gap-3">
                  <AttendanceOption name={`${formId}-att`} value="attend" current={attendance} onChange={setAttendance} label="Will Attend" sub="Insya Allah hadir" />
                  <AttendanceOption name={`${formId}-att`} value="absent" current={attendance} onChange={setAttendance} label="Unable to Attend" sub="Berhalangan" />
                </div>
              </fieldset>

              <div aria-disabled={attendance === "absent"} className={`transition-opacity duration-500 ${attendance === "absent" ? "opacity-40" : ""}`}>
                <span id={`${formId}-guests-label`} className="field-label">
                  Jumlah Tamu
                </span>
                <div className="mt-3 flex items-center gap-5" role="group" aria-labelledby={`${formId}-guests-label`}>
                  <button
                    type="button"
                    className="btn-line !min-h-10 !px-4"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    disabled={attendance === "absent" || guests <= 1}
                    aria-label="Kurangi jumlah tamu"
                  >
                    −
                  </button>
                  <output aria-live="polite" className="min-w-20 text-center font-display text-3xl text-brown-deep tabular-nums">
                    {guests}
                    <span className="ml-2 font-sans text-xs tracking-[0.2em] text-brown/70 uppercase">orang</span>
                  </output>
                  <button
                    type="button"
                    className="btn-line !min-h-10 !px-4"
                    onClick={() => setGuests((g) => Math.min(rsvp.maxGuests, g + 1))}
                    disabled={attendance === "absent" || guests >= rsvp.maxGuests}
                    aria-label="Tambah jumlah tamu"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor={`${formId}-msg`} className="field-label">
                  Ucapan &amp; Doa
                </label>
                <textarea
                  id={`${formId}-msg`}
                  className="field-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                  placeholder="Tuliskan ucapan untuk kedua mempelai…"
                  rows={3}
                />
                <p className="mt-1 text-right text-[0.6875rem] text-brown/55 tabular-nums">
                  {message.length}/{MESSAGE_MAX}
                </p>
              </div>

              {error && (
                <p id={`${formId}-error`} role="alert" className="-mt-3 text-sm text-[#8A2E22]">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-solid self-center" disabled={status === "sending"}>
                {status === "sending" ? "Mengirim…" : "Confirm RSVP"}
              </button>
            </form>
          )}
        </div>

        <div data-reveal="1" className="paper flex max-h-[34rem] flex-col px-6 py-9 md:max-h-none md:px-9 md:py-11">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-3xl text-brown-deep italic">Ucapan &amp; Doa</h3>
            <span className="text-xs tracking-[0.18em] text-gold-deep tabular-nums">{wishes.length} ucapan</span>
          </div>
          <ul className="mt-6 -mr-3 flex-1 space-y-5 overflow-y-auto pr-3 md:max-h-[30rem]" aria-label="Daftar ucapan tamu">
            {wishes.map((w) => (
              <li key={w.id} className="border-b border-gold-deep/20 pb-5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl text-brown-deep">{w.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.5625rem] tracking-[0.16em] uppercase ${
                      w.attendance === "attend" ? "bg-gold-deep/15 text-gold-deep" : "bg-brown/10 text-brown/70"
                    }`}
                  >
                    {w.attendance === "attend" ? "Hadir" : "Berhalangan"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-brown/85">{w.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
