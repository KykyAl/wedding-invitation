export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ken Perlin's smootherstep — zero velocity *and* acceleration at both ends. */
export const smootherstep = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Frame-rate independent exponential damping factor. */
export const dampFactor = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);
