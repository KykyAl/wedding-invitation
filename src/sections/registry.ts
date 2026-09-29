import type { SceneId } from "../config/scenes";

/**
 * Ordered scroll scenes. Each id must match a `data-scene` section in the DOM and a
 * camera keyframe in config/scenes.ts. Add the next scenes here as they are built.
 */
export const SCENE_ORDER = [
  "hero",
  "quote",
  "couple",
  "story",
  "events",
  "gallery",
  "venue",
  "gift",
  "rsvp",
  "closing",
] as const satisfies readonly SceneId[];
