import { useMemo } from "react";

const MAX_LENGTH = 40;

/**
 * Reads `?to=Nama+Tamu` for the personalised greeting.
 * Only a display name — rendered as text (React escapes it), trimmed and length-capped.
 */
export function readGuestName(search: string = window.location.search): string | null {
  const raw = new URLSearchParams(search).get("to");
  if (!raw) return null;
  const cleaned = raw
    // oxlint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
}

export function useGuestName(): string | null {
  return useMemo(() => readGuestName(), []);
}
