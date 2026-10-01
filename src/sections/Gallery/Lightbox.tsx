import { useEffect, useRef } from "react";
import { asset } from "../../utils/asset";

interface LightboxProps {
  photos: readonly string[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

/**
 * Fullscreen viewer on a native <dialog>: focus trap, Esc and focus return come for free.
 * Arrow keys and horizontal swipes navigate.
 */
export function Lightbox({ photos, index, onClose, onChange }: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const isOpen = index !== null;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!isOpen && d.open) {
      d.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onDialogClose = () => {
      document.documentElement.style.overflow = "";
      onClose();
    };
    d.addEventListener("close", onDialogClose);
    return () => d.removeEventListener("close", onDialogClose);
  }, [onClose]);

  const go = (delta: number) => {
    if (index === null) return;
    onChange((index + delta + photos.length) % photos.length);
  };

  return (
    <dialog
      ref={dialog}
      aria-label="Foto layar penuh"
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-ivory backdrop:bg-ink/80"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close();
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {index !== null && (
        <div className="flex size-full flex-col items-center justify-center gap-5 p-4 md:p-10" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
          <img
            key={photos[index]}
            src={asset(photos[index])}
            alt={`Foto ${index + 1} dari ${photos.length}`}
            className="max-h-[80dvh] max-w-full object-contain shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            style={{ animation: "tick 0.6s var(--ease-out-soft)" }}
          />
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => go(-1)} className="btn-invite !min-h-11 !px-4" aria-label="Foto sebelumnya">
              ←
            </button>
            <span className="font-display text-lg tabular-nums">
              {index + 1} / {photos.length}
            </span>
            <button type="button" onClick={() => go(1)} className="btn-invite !min-h-11 !px-4" aria-label="Foto berikutnya">
              →
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => dialog.current?.close()}
        className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-gold-light/50 text-xl text-gold-light md:top-8 md:right-8"
        aria-label="Tutup"
      >
        ×
      </button>
    </dialog>
  );
}
