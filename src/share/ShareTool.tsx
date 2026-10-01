import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "../components/ui/CopyButton";
import { weddingData } from "../data/wedding";
import { fillTemplate, guestLink, parseGuests, whatsappUrl } from "./whatsapp";

const STORE = {
  guests: "wedding:share:guests",
  template: "wedding:share:template",
  base: "wedding:share:base",
  sent: "wedding:share:sent",
};

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

/** The invitation's own URL, wherever this tool is hosted (root domain or GitHub Pages sub-path). */
const defaultBase = () => new URL(import.meta.env.BASE_URL, window.location.origin).toString();

/**
 * Private helper for the couple: paste guest names (optionally with phone numbers),
 * get a personalised `?to=` link per guest and a one-tap WhatsApp message.
 * Everything stays in this browser — nothing is uploaded.
 */
export function ShareTool() {
  const { groom, bride } = weddingData;
  const [guestText, setGuestText] = usePersistent(STORE.guests, "Andi Pratama - 0812 3456 7890\nKeluarga Bapak Budi\nSarah");
  const [template, setTemplate] = usePersistent(STORE.template, weddingData.share.message);
  const [base, setBase] = usePersistent(STORE.base, defaultBase());
  const [sent, setSent] = usePersistent<Record<string, boolean>>(STORE.sent, {});

  const guests = useMemo(() => parseGuests(guestText), [guestText]);
  const baseValid = useMemo(() => {
    try {
      return /^https?:$/.test(new URL(base).protocol);
    } catch {
      return false;
    }
  }, [base]);

  const rows = useMemo(
    () =>
      baseValid
        ? guests.map((g) => {
            const link = guestLink(base, g.name);
            const message = fillTemplate(template, g.name, link);
            return { ...g, key: `${g.name}|${g.phone}`, link, message, wa: whatsappUrl(message, g.phone) };
          })
        : [],
    [guests, base, baseValid, template],
  );

  const sentCount = rows.filter((r) => sent[r.key]).length;
  const isLocal = /localhost|127\.0\.0\.1/.test(base);

  const downloadCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = ["Nama,Nomor,Link", ...rows.map((r) => [r.name, r.phone, r.link].map(esc).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "link-undangan.csv" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="min-h-svh bg-ivory px-5 py-12 text-brown md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="eyebrow text-gold-deep">Alat Kirim Undangan</p>
          <h1 className="section-title mt-3 text-brown-deep">
            {groom.nickname} &amp; {bride.nickname}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brown/80">
            Buat link undangan personal untuk setiap tamu dan kirim langsung lewat WhatsApp. Data hanya tersimpan di
            browser ini — halaman ini tidak perlu dibagikan ke tamu.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="paper p-6 md:p-8" aria-labelledby="guests-h">
            <h2 id="guests-h" className="font-display text-2xl text-brown-deep italic">
              1. Daftar Tamu
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brown/70">
              Satu tamu per baris. Tambahkan nomor setelah tanda “-” agar chat langsung terbuka, contoh:
              <br />
              <code className="text-brown-deep">Andi Pratama - 0812 3456 7890</code>
            </p>
            <textarea
              value={guestText}
              onChange={(e) => setGuestText(e.target.value)}
              rows={10}
              className="field-input mt-4 !font-sans !text-sm"
              aria-label="Daftar tamu"
            />
            <p className="mt-2 text-xs text-brown/60">{guests.length} tamu</p>
          </section>

          <section className="paper p-6 md:p-8" aria-labelledby="tpl-h">
            <h2 id="tpl-h" className="font-display text-2xl text-brown-deep italic">
              2. Pesan WhatsApp
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brown/70">
              Penanda otomatis: <code>{"{nama}"}</code> <code>{"{link}"}</code> <code>{"{mempelai}"}</code>{" "}
              <code>{"{tanggal}"}</code> <code>{"{lokasi}"}</code>. Teks di antara *bintang* jadi tebal di WhatsApp.
            </p>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={10}
              className="field-input mt-4 !font-sans !text-sm"
              aria-label="Template pesan"
            />
            <div className="mt-3 flex justify-end">
              <button type="button" className="text-xs text-gold-deep underline underline-offset-4" onClick={() => setTemplate(weddingData.share.message)}>
                Kembalikan ke template awal
              </button>
            </div>
          </section>
        </div>

        <section className="paper mt-6 p-6 md:p-8" aria-labelledby="base-h">
          <h2 id="base-h" className="font-display text-2xl text-brown-deep italic">
            3. Alamat Undangan
          </h2>
          <input
            value={base}
            onChange={(e) => setBase(e.target.value.trim())}
            className="field-input mt-3 !font-sans !text-base"
            aria-label="URL undangan"
            inputMode="url"
          />
          {!baseValid && <p className="mt-2 text-sm text-[#8A2E22]">URL tidak valid — awali dengan https://</p>}
          {isLocal && (
            <p className="mt-2 text-sm text-[#8A2E22]">
              Ini alamat lokal (localhost) — tamu tidak bisa membukanya. Gunakan alamat setelah deploy.
            </p>
          )}
        </section>

        <section className="mt-10" aria-labelledby="list-h">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="list-h" className="font-display text-3xl text-brown-deep italic">
                Link Tamu
              </h2>
              <p className="mt-1 text-xs tracking-[0.12em] text-brown/70">
                {sentCount} dari {rows.length} sudah dikirim
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-line" onClick={downloadCsv} disabled={!rows.length}>
                Unduh CSV
              </button>
              <button type="button" className="btn-line" onClick={() => setSent({})} disabled={!sentCount}>
                Reset tanda terkirim
              </button>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {rows.map((r) => (
              <li key={r.key} className={`paper flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between ${sent[r.key] ? "opacity-60" : ""}`}>
                <div className="min-w-0">
                  <p className="font-display text-xl text-brown-deep">
                    {r.name}
                    {sent[r.key] && <span className="ml-3 align-middle text-[0.625rem] tracking-[0.2em] text-gold-deep uppercase">Terkirim</span>}
                  </p>
                  <p className="mt-1 truncate text-xs text-brown/70">
                    {r.phone ? `+${r.phone} · ` : ""}
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      {r.link}
                    </a>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CopyButton value={r.message} label={`Salin pesan untuk ${r.name}`} className="!min-h-10 !px-4" />
                  <a
                    href={r.wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setSent((s) => ({ ...s, [r.key]: true }))}
                    className="btn-solid !min-h-10 !bg-[#1F6F4A] !px-4 hover:!bg-[#185a3c]"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
                    </svg>
                    Kirim WA
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {rows[0] && (
            <details className="paper mt-8 p-6">
              <summary className="cursor-pointer font-display text-xl text-brown-deep italic">Pratinjau pesan ({rows[0].name})</summary>
              <pre className="mt-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-brown">{rows[0].message}</pre>
            </details>
          )}
        </section>
      </div>
    </main>
  );
}
