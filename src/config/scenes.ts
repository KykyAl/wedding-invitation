/**
 * The camera path through the world. Each scroll scene maps to one camera keyframe;
 * sections register themselves with the same id and the rig interpolates between them.
 *
 * Coordinates are metres. The forest path runs along -Z; the opening envelope floats
 * alone in the dark far behind the camera start (+Z), hidden from the forest by fog.
 */
export type Vec3 = readonly [number, number, number];

export type SceneId =
  | "hero"
  | "quote"
  | "couple"
  | "story"
  | "events"
  | "gallery"
  | "venue"
  | "gift"
  | "rsvp"
  | "closing";

export interface CameraKeyframe {
  position: Vec3;
  target: Vec3;
}

export const cameraKeyframes: Record<SceneId, CameraKeyframe> = {
  // Framed by the golden arch, sun low behind it.
  hero: { position: [0, 1.8, 10.5], target: [0, 2.3, 0] },
  // Through the arch, tilting up into the dusk sky and falling petals.
  quote: { position: [0.9, 1.45, -5], target: [-1.6, 5.8, -30] },
  // Walking the lantern-lit aisle deeper into the pines.
  couple: { position: [-1.4, 1.7, -14], target: [0.8, 2.2, -26] },
  story: { position: [2, 1.6, -25], target: [-0.8, 2, -37] },
  // The floating rings hang above the aisle.
  events: { position: [0, 2.1, -38], target: [0, 3, -50] },
  gallery: { position: [-1.8, 2.2, -54], target: [0.4, 2.1, -66] },
  // Rise up for an aerial, map-like view of the lake and the golden pin.
  venue: { position: [5, 11, -64], target: [0, 0.4, -84] },
  gift: { position: [0, 1.9, -97], target: [0, 2.2, -109] },
  rsvp: { position: [-1.5, 1.8, -107], target: [0.6, 2.3, -119] },
  // Tilt up into the dusk sky to close.
  closing: { position: [0, 3, -120], target: [0, 20, -160] },
};

/** Where the invitation envelope floats during the opening. */
export const ENVELOPE_POSITION: Vec3 = [0, 1.6, 60];
export const ENVELOPE_SIZE = { width: 3.2, height: 2.1 } as const;

/** The arch that frames the hero. */
export const ARCH_POSITION: Vec3 = [0, 0, 0];

/** Interlocked rings floating over the aisle in the events scene. */
export const RINGS_POSITION: Vec3 = [3.6, 4.8, -51];

/** Lake — seen from above in the venue scene. */
export const LAKE = { center: [0, 0, -84] as Vec3, radius: 11 } as const;

/** Golden location pin, offset from the lake centre so it sits beside (not behind) the venue title. */
export const PIN_OFFSET = { x: -6, z: -2 } as const;

/** Lanterns line the aisle between these z values. */
export const LANTERN_RANGE = { from: -6, to: -122, spacing: 6.5, offsetX: 2.4 } as const;

/** Camera offset the hero shot settles from right after the reveal. */
export const INTRO_DRIFT: Vec3 = [0, 1.4, 7];

/**
 * Vertical FOV adapted to aspect so portrait phones keep the arch/envelope in frame
 * instead of cropping the sides.
 */
export function fovForAspect(aspect: number): number {
  if (aspect >= 1) return 40;
  return Math.min(62, 40 + (1 - aspect) * 36);
}
