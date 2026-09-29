import { weddingData } from "../data/wedding";

const JAKARTA = "Asia/Jakarta";

/** "11 · 11 · 2026" — derived from the ISO date so it never drifts from the data. */
export function formatDateDots(iso: string = weddingData.dateTime): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")} · ${get("month")} · ${get("year")}`;
}

/** Monogram initials, e.g. "R" & "A". */
export function coupleInitials(): [string, string] {
  return [weddingData.groom.nickname.charAt(0), weddingData.bride.nickname.charAt(0)];
}
