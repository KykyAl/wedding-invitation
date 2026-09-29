import { useEffect, useState } from "react";

const FONTS = [
  'italic 400 64px "Cormorant Garamond"',
  '500 64px "Cormorant Garamond"',
  '500 32px "DM Sans"',
];

let ready = false;
let pending: Promise<void> | null = null;

/** Resolves once the display fonts are usable (or after a timeout — never block the experience). */
export function whenFontsReady(timeoutMs = 2500): Promise<void> {
  if (ready) return Promise.resolve();
  if (!pending) {
    const load = Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => undefined);
    const timeout = new Promise<void>((r) => setTimeout(r, timeoutMs));
    pending = Promise.race([load, timeout])
      .catch(() => undefined)
      .then(() => {
        ready = true;
      });
  }
  return pending;
}

/** Canvas textures need the real fonts loaded before drawing text. */
export function useFontsReady(): boolean {
  const [isReady, setReady] = useState(ready);
  useEffect(() => {
    if (isReady) return;
    let alive = true;
    whenFontsReady().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [isReady]);
  return isReady;
}
