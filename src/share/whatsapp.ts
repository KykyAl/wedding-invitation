import { weddingData } from "../data/wedding";

export interface Guest {
  name: string;
  /** International format without "+", e.g. 6281234567890 — empty when not given. */
  phone: string;
}

/** "08123…" / "+62 812-…" / "62812…" → "62812…". Returns "" when it doesn't look like a phone number. */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return /^\d{9,15}$/.test(d) ? d : "";
}

/**
 * One guest per line: "Andi Pratama" or "Andi Pratama - 0812 3456 7890"
 * (separator may also be "," ";" or a tab). Blank lines and duplicates are skipped.
 */
export function parseGuests(text: string): Guest[] {
  const seen = new Set<string>();
  const out: Guest[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(.*?)(?:\s*[-,;\t]\s*)(\+?[\d\s-]{9,})$/);
    const name = (match ? match[1] : trimmed).trim().slice(0, 40);
    const phone = match ? normalizePhone(match[2]) : "";
    const key = `${name.toLowerCase()}|${phone}`;
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push({ name, phone });
  }
  return out;
}

export function guestLink(base: string, name: string): string {
  const url = new URL(base);
  url.searchParams.set("to", name);
  return url.toString();
}

export function fillTemplate(template: string, name: string, link: string): string {
  const { groom, bride, date, venue } = weddingData;
  const values: Record<string, string> = {
    nama: name,
    link,
    mempelai: `${groom.nickname} & ${bride.nickname}`,
    tanggal: date,
    lokasi: venue.name,
  };
  return template.replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m);
}

/** wa.me opens the chat directly when a number is known, otherwise the contact picker. */
export function whatsappUrl(message: string, phone = ""): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
