import type { WeddingEvent } from "../data/wedding";

/** 2026-11-11T08:00:00+07:00 → 20261111T010000Z */
function toUtcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventTitle(event: WeddingEvent, couple: string) {
  return `${event.type} — ${couple}`;
}

/** Pre-filled "Add to Google Calendar" link. */
export function googleCalendarUrl(event: WeddingEvent, couple: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(event, couple),
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(event.end)}`,
    details: `${event.type} ${couple}. ${event.day}, ${event.date} · ${event.time}`,
    location: `${event.venue}, ${event.address}`,
    ctz: "Asia/Jakarta",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** iCalendar file with every event — opens natively in Apple Calendar / Outlook. */
export function buildIcs(events: readonly WeddingEvent[], couple: string): string {
  const now = toUtcStamp(new Date().toISOString());
  const body = events.flatMap((e, i) => [
    "BEGIN:VEVENT",
    `UID:${toUtcStamp(e.start)}-${i}@wedding-invitation`,
    `DTSTAMP:${now}`,
    `DTSTART:${toUtcStamp(e.start)}`,
    `DTEND:${toUtcStamp(e.end)}`,
    `SUMMARY:${escapeIcs(eventTitle(e, couple))}`,
    `LOCATION:${escapeIcs(`${e.venue}, ${e.address}`)}`,
    `DESCRIPTION:${escapeIcs(`${e.day}, ${e.date} · ${e.time}`)}`,
    "END:VEVENT",
  ]);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//ID", "CALSCALE:GREGORIAN", ...body, "END:VCALENDAR"].join("\r\n");
}

export function downloadIcs(events: readonly WeddingEvent[], couple: string, filename: string) {
  const blob = new Blob([buildIcs(events, couple)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
