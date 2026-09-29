import { useSyncExternalStore } from "react";
import { gsap } from "../lib/gsap";
import { weddingData } from "../data/wedding";

/**
 * Background music controller. Muted by default; never autoplays without a gesture.
 * The guest's choice persists in localStorage so returning guests get their preference.
 */
export type MusicState = "off" | "on" | "unavailable";

const STORAGE_KEY = "wedding:music";
const TARGET_VOLUME = 0.55;

let audio: HTMLAudioElement | null = null;
let state: MusicState = weddingData.music.enabled ? "off" : "unavailable";
const listeners = new Set<() => void>();

function emit(next: MusicState) {
  state = next;
  listeners.forEach((l) => l());
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function writePreference(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* private mode — preference just won't persist */
  }
}

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(weddingData.music.url);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    audio.addEventListener("error", () => emit("unavailable"));
  }
  return audio;
}

async function play(): Promise<boolean> {
  if (state === "unavailable") return false;
  const el = getAudio();
  try {
    await el.play();
    gsap.to(el, { volume: TARGET_VOLUME, duration: 2.4, ease: "sine.inOut", overwrite: true });
    emit("on");
    return true;
  } catch {
    // Autoplay policy or missing file — stay quiet, the guest can still tap the button.
    if ((state as MusicState) !== "unavailable") emit("off");
    return false;
  }
}

function pause() {
  if (!audio) return;
  const el = audio;
  gsap.to(el, {
    volume: 0,
    duration: 0.8,
    ease: "sine.out",
    overwrite: true,
    onComplete: () => el.pause(),
  });
  emit("off");
}

export const music = {
  /** Called from the Open Invitation gesture: resumes only if the guest turned music on before. */
  resumeIfPreferred() {
    if (readPreference()) void play();
  },
  async toggle() {
    if (state === "on") {
      pause();
      writePreference(false);
    } else if (await play()) {
      writePreference(true);
    }
  },
  /** Pause while the tab is hidden, resume when it comes back. */
  setPageVisible(visible: boolean) {
    if (!audio || state !== "on") return;
    if (visible) void audio.play().catch(() => emit("off"));
    else audio.pause();
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMusic(): MusicState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
