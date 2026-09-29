import { useEffect, useRef, useState } from "react";
import { copyText } from "../../utils/clipboard";

interface CopyButtonProps {
  value: string;
  label: string;
  className?: string;
}

/** Copies a value and confirms inline ("Tersalin") — announced to screen readers. */
export function CopyButton({ value, label, className = "" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    const ok = await copyText(value);
    setState(ok ? "done" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };

  return (
    <button type="button" onClick={onClick} className={`btn-line ${className}`} aria-label={`${label}: ${value}`}>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.2">
        {state === "done" ? (
          <path d="M3 8.5l3 3 7-7" />
        ) : (
          <>
            <rect x="5" y="5" width="8" height="8" rx="1" />
            <path d="M3 11V4a1 1 0 0 1 1-1h7" />
          </>
        )}
      </svg>
      <span aria-live="polite">{state === "done" ? "Tersalin" : state === "failed" ? "Gagal, salin manual" : "Salin"}</span>
    </button>
  );
}
