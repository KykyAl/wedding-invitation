/**
 * Motion tokens. Every animation in the project picks from these — no ad-hoc timings.
 * Motion language: slow in, long settle, no bounce.
 */
export const duration = {
  micro: 0.2,
  fast: 0.45,
  standard: 0.8,
  slow: 1.2,
  cinematic: 1.8,
} as const;

export const ease = {
  /** UI entrances */
  out: "power3.out",
  /** Symmetric moves: flap, card, camera push */
  inOut: "power3.inOut",
  /** Long cinematic travel */
  cinematic: "expo.inOut",
  /** Gentle exits */
  in: "power2.in",
  /** Light that blooms then lingers */
  soft: "sine.inOut",
} as const;

export const stagger = {
  letters: 0.045,
  lines: 0.12,
} as const;

/** Camera damping (higher = snappier). */
export const cameraDamping = {
  opening: 5,
  scroll: 3.2,
  fov: 4,
  pointer: 2.2,
} as const;
