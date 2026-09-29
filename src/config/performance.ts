export type QualityTier = "high" | "low";

export interface QualityProfile {
  tier: QualityTier;
  dpr: [number, number];
  antialias: boolean;
  dustCount: number;
  petalCount: number;
  treeCount: number;
  mistLayers: number;
  flowerDensity: number;
}

const PROFILES: Record<QualityTier, QualityProfile> = {
  high: {
    tier: "high",
    dpr: [1, 1.75],
    antialias: true,
    dustCount: 1400,
    petalCount: 150,
    treeCount: 300,
    mistLayers: 6,
    flowerDensity: 1,
  },
  low: {
    tier: "low",
    dpr: [1, 1.35],
    antialias: false,
    dustCount: 520,
    petalCount: 56,
    treeCount: 150,
    mistLayers: 3,
    flowerDensity: 0.6,
  },
};

/**
 * Heuristic tier detection. Most guests open the link from WhatsApp on a phone,
 * so anything touch-first or modest in cores/memory gets the lighter profile.
 * `?quality=high|low` overrides for testing.
 */
export function detectQuality(): QualityProfile {
  const override = new URLSearchParams(window.location.search).get("quality");
  if (override === "high" || override === "low") return PROFILES[override];

  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;

  const low = coarse || small || cores <= 4 || memory <= 4;
  return PROFILES[low ? "low" : "high"];
}

export const quality: QualityProfile = detectQuality();
