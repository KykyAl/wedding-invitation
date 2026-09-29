import * as THREE from "three";
import { palette } from "../config/theme";
import { createRandom } from "../utils/random";

/**
 * Procedural canvas textures — zero network cost, crisp at any DPR we allow.
 * Callers own the returned textures and must dispose them.
 */

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Cotton-paper grain: soft blotches + fine fibres. */
function paintPaper(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, seed: number) {
  const rand = createRandom(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 40; i++) {
    const x = rand.range(0, w);
    const y = rand.range(0, h);
    const r = rand.range(w * 0.05, w * 0.22);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = rand.next() > 0.5;
    g.addColorStop(0, light ? "rgba(255,252,244,0.05)" : "rgba(120,90,50,0.022)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.lineWidth = 1;
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = rand.range(0, w);
    const y = rand.range(0, h);
    const len = rand.range(2, 9);
    const a = rand.range(0, Math.PI * 2);
    ctx.strokeStyle = rand.next() > 0.5 ? "rgba(90,65,35,0.06)" : "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
}

function goldGradient(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, palette.goldDeep);
  g.addColorStop(0.35, palette.goldLight);
  g.addColorStop(0.55, palette.gold);
  g.addColorStop(0.8, palette.goldLight);
  g.addColorStop(1, palette.goldDeep);
  return g;
}

/** Draws text with manual tracking (ctx.letterSpacing isn't universal on older Safari). */
function drawTracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, tracking: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + tracking;
  });
}

/* ------------------------------------------------------------------ */

export function createPaperTexture(
  tone: string,
  seed: number,
  options: { border?: "rect" | "flap"; seams?: boolean } = {},
) {
  const w = 1024;
  const h = 672;
  const { canvas, ctx } = makeCanvas(w, h);
  paintPaper(ctx, w, h, tone, seed);

  ctx.strokeStyle = goldGradient(ctx, 0, 0, w, h);
  if (options.border === "rect") {
    ctx.lineWidth = 3;
    ctx.strokeRect(22, 22, w - 44, h - 44);
  } else if (options.border === "flap") {
    // Hairline following the flap's two slanted edges, inset.
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 16);
    ctx.lineTo(w / 2, h - 34);
    ctx.lineTo(w - 30, 16);
    ctx.stroke();
  }
  if (options.seams) {
    // Folded side panels meeting the bottom panel — soft crease shading.
    ctx.save();
    ctx.strokeStyle = "rgba(110,80,45,0.16)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(90,60,30,0.25)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(24, h - 24);
    ctx.lineTo(w * 0.5, h * 0.46);
    ctx.lineTo(w - 24, h - 24);
    ctx.stroke();
    ctx.restore();
  }
  return toTexture(canvas);
}

/** Blurred triangle used as the flap's contact shadow on the pocket. */
export function createFlapShadowTexture() {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  // Draw off-canvas and let only the blurred shadow land inside.
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = 2000;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(24 - 2000, 20);
  ctx.lineTo(w - 24 - 2000, 20);
  ctx.lineTo(w / 2 - 2000, h - 30);
  ctx.closePath();
  ctx.fill();
  return toTexture(canvas, false);
}

/**
 * Inner lining with a fine gold lattice. Deep brown for the back wall (contrast behind
 * the ivory card); a pale champagne variant for the flap so it still reads in the dark.
 */
export function createLiningTexture(tone: "deep" | "pale" = "deep") {
  const w = 512;
  const h = 512;
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = tone === "deep" ? palette.brown : "#E4D3B4";
  ctx.fillRect(0, 0, w, h);
  const step = 32;
  ctx.strokeStyle = tone === "deep" ? "rgba(217,188,130,0.28)" : "rgba(140,106,58,0.35)";
  ctx.lineWidth = 1.2;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.moveTo(i + h, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }
  ctx.fillStyle = tone === "deep" ? "rgba(217,188,130,0.5)" : "rgba(140,106,58,0.5)";
  for (let y = 0; y <= h; y += step) {
    for (let x = (y / step) % 2 ? step / 2 : 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = toTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export interface CardContent {
  eyebrow: string;
  first: string;
  second: string;
  date: string;
  place: string;
}

/** The invitation card that rises out of the envelope. */
export function createCardTexture(content: CardContent) {
  const w = 1536;
  const h = 990;
  const { canvas, ctx } = makeCanvas(w, h);
  paintPaper(ctx, w, h, palette.ivory, 7);

  const gold = goldGradient(ctx, 0, 0, w, h);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, w - 92, h - 92);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(62, 62, w - 124, h - 124);

  // Corner diamonds
  ctx.fillStyle = gold;
  for (const [x, y] of [
    [62, 62],
    [w - 62, 62],
    [62, h - 62],
    [w - 62, h - 62],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();
  }

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = palette.gold;
  ctx.font = '500 28px "DM Sans", system-ui, sans-serif';
  drawTracked(ctx, content.eyebrow.toUpperCase(), w / 2, 200, 12);

  // Names side by side with a golden ampersand between.
  ctx.textAlign = "center";
  ctx.fillStyle = palette.brown;
  ctx.font = 'italic 400 200px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(content.first, w / 2 - 330, 500);
  ctx.fillText(content.second, w / 2 + 330, 500);
  ctx.fillStyle = gold;
  ctx.font = 'italic 400 150px "Cormorant Garamond", Georgia, serif';
  ctx.fillText("&", w / 2, 490);

  // Divider
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 140, 630);
  ctx.lineTo(w / 2 + 140, 630);
  ctx.stroke();

  ctx.fillStyle = palette.brown;
  ctx.font = '500 40px "DM Sans", system-ui, sans-serif';
  drawTracked(ctx, content.date, w / 2, 730, 10);

  ctx.fillStyle = palette.gold;
  ctx.font = '500 26px "DM Sans", system-ui, sans-serif';
  drawTracked(ctx, content.place.toUpperCase(), w / 2, 800, 10);

  return toTexture(canvas);
}

/**
 * Wax seal face: colour map + bump map for embossed monogram and pooled wax ridge.
 */
export function createSealTextures(initials: [string, string]) {
  const s = 512;
  const color = makeCanvas(s, s);
  const bump = makeCanvas(s, s);

  // Colour: wax with subtle mottling
  const c = color.ctx;
  const g = c.createRadialGradient(s * 0.42, s * 0.38, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "#6A2A22");
  g.addColorStop(0.7, palette.wax);
  g.addColorStop(1, "#2E100D");
  c.fillStyle = g;
  c.fillRect(0, 0, s, s);

  // Bump: raised rim, recessed field, raised monogram
  const b = bump.ctx;
  const rim = b.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2);
  rim.addColorStop(0, "#606060");
  rim.addColorStop(0.72, "#5a5a5a");
  rim.addColorStop(0.8, "#d0d0d0");
  rim.addColorStop(0.92, "#8a8a8a");
  rim.addColorStop(1, "#303030");
  b.fillStyle = rim;
  b.fillRect(0, 0, s, s);

  for (const [ctx, fill] of [
    [b, "#f0f0f0"],
    [c, "rgba(201,160,110,0.55)"],
  ] as const) {
    ctx.fillStyle = fill;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'italic 400 190px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(initials[0], s * 0.4, s * 0.47);
    ctx.fillText(initials[1], s * 0.6, s * 0.55);
    // Ring of dots
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(s / 2 + Math.cos(a) * s * 0.33, s / 2 + Math.sin(a) * s * 0.33, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return { map: toTexture(color.canvas), bumpMap: toTexture(bump.canvas, false) };
}

/** Soft radial glow sprite. */
export function createGlowTexture(rgb = "255,232,196") {
  const s = 256;
  const { canvas, ctx } = makeCanvas(s, s);
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.25, `rgba(${rgb},0.42)`);
  g.addColorStop(0.6, `rgba(${rgb},0.08)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return toTexture(canvas);
}

/** Wide, soft cloud band for mist layers (alpha in the red channel is fine — used as alphaMap). */
export function createMistTexture(seed = 11) {
  const w = 512;
  const h = 128;
  const { canvas, ctx } = makeCanvas(w, h);
  const rand = createRandom(seed);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const x = rand.range(0, w);
    const y = rand.range(h * 0.35, h * 0.7);
    const r = rand.range(20, 60);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${rand.range(0.12, 0.3)})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    // Wrap horizontally so the texture tiles seamlessly.
    if (x < r) ctx.fillRect(x + w - r, y - r, r * 2, r * 2);
    if (x > w - r) ctx.fillRect(x - w - r, y - r, r * 2, r * 2);
  }
  // Vertical falloff: the band's edges must be fully transparent.
  ctx.globalCompositeOperation = "destination-in";
  const fade = ctx.createLinearGradient(0, 0, 0, h);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.35, "rgba(0,0,0,1)");
  fade.addColorStop(0.7, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  const tex = toTexture(canvas, false);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Horizontal soft-edged strip for the forest path. */
export function createPathTexture() {
  const w = 256;
  const h = 16;
  const { canvas, ctx } = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.3, "rgba(255,255,255,0.9)");
  g.addColorStop(0.5, "rgba(255,255,255,1)");
  g.addColorStop(0.7, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return toTexture(canvas, false);
}
