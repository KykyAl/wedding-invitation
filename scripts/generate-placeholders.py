#!/usr/bin/env python3
"""
Generates the placeholder images the template ships with:
  public/assets/gallery/gallery-01..06.webp   golden-hour scenes (replace with prewedding photos)
  public/assets/couple/groom.webp, bride.webp portraits with the initial
  public/assets/og/wedding-preview.jpg        1200x630 WhatsApp / social preview

Re-run with the real names to refresh the WhatsApp preview image:
  python3 scripts/generate-placeholders.py --groom Pria --bride Wanita --date "12 · 06 · 2027" --venue "Nama Venue"
  python3 scripts/generate-placeholders.py --og-only --groom ... (only the preview image)

Requires Pillow (pip install pillow).
"""
import argparse, math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SERIF_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSerifDisplay-LightItalic.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
    "/Library/Fonts/Georgia Italic.ttf",
    "C:/Windows/Fonts/georgiai.ttf",
]
SANS_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
]


def font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def scene(w, h, seed, sun=(0.45, 0.62), palette=None):
    """Painterly golden-hour pine forest: gradient sky, sun glow, layered ridges and pines, mist, bokeh."""
    r = random.Random(seed)
    top, mid, hor = palette or (hexc("5A4034"), hexc("C89668"), hexc("EFD9B2"))
    img = Image.new("RGB", (w, h))
    px = img.load()
    sx, sy = sun[0] * w, sun[1] * h
    for y in range(h):
        t = y / h
        c = lerp(top, mid, min(1, t / 0.45)) if t < 0.45 else lerp(mid, hor, min(1, (t - 0.45) / 0.25))
        for x in range(w):
            g = max(0, 1 - math.hypot(x - sx, y - sy) / (0.55 * max(w, h))) ** 2.2
            px[x, y] = (min(255, int(c[0] + g * 70)), min(255, int(c[1] + g * 55)), min(255, int(c[2] + g * 35)))
    d = ImageDraw.Draw(img, "RGBA")
    for layer in range(4):
        depth = layer / 3
        col = lerp(hexc("E6CFA8"), hexc("2A2E22"), 0.18 + depth * 0.55)
        base = h * (0.66 + depth * 0.09)
        pts = [(0, h)] + [(i * w / 40, base - (math.sin(i * 0.5 + seed + layer) * 0.03 + 0.02) * h) for i in range(41)] + [(w, h)]
        d.polygon(pts, fill=col + (255,))
        for _ in range(int(9 + layer * 4)):
            x = r.uniform(-0.05, 1.05) * w
            if abs(x / w - sun[0]) < 0.12 and layer < 3:
                continue
            th = r.uniform(0.08, 0.2) * h * (0.55 + depth * 0.7)
            tw = th * 0.3
            by = base + r.uniform(0, 0.04) * h
            for k in range(5):
                f = k / 5
                d.polygon([(x, by - th * (1 - f * 0.15) - th * 0.05), (x - tw * (1 - f) * 0.6, by - th * f * 0.8), (x + tw * (1 - f) * 0.6, by - th * f * 0.8)], fill=col + (255,))
            d.rectangle([x - tw * 0.04, by - th * 0.1, x + tw * 0.04, by + h * 0.05], fill=col + (255,))
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    fog = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fog)
    for _ in range(24):
        cx, cy, rr = r.uniform(0, w), r.uniform(0.55, 0.8) * h, r.uniform(0.1, 0.3) * w
        fd.ellipse([cx - rr, cy - rr * 0.25, cx + rr, cy + rr * 0.25], fill=(240, 222, 190, 40))
    for _ in range(40):
        cx, cy, rr = r.uniform(0, w), r.uniform(0, h), r.uniform(3, 18) * w / 1200
        fd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(255, 230, 180, r.randint(40, 110)))
    img = Image.alpha_composite(img.convert("RGBA"), fog.filter(ImageFilter.GaussianBlur(w / 120)))
    noise = Image.effect_noise((w, h), 18).convert("L")
    img = Image.blend(img, Image.merge("RGBA", (noise, noise, noise, Image.new("L", (w, h), 255))), 0.05)
    return img.convert("RGB")


def label(img, text):
    w, h = img.size
    ImageDraw.Draw(img, "RGBA").text((w * 0.04, h - w * 0.06), text.upper(), font=font(SANS_CANDIDATES, max(12, int(w / 70))), fill=(58, 42, 30, 150))
    return img


def centered(d, width, y, text, f, fill):
    bb = d.textbbox((0, 0), text, font=f)
    d.text(((width - (bb[2] - bb[0])) / 2 - bb[0], y), text, font=f, fill=fill)


def og_image(groom, bride, date, venue):
    og = scene(1200, 630, 99, (0.5, 0.7), (hexc("1E1610"), hexc("6B4A30"), hexc("C89668")))
    d = ImageDraw.Draw(og, "RGBA")
    d.rectangle([0, 0, 1200, 630], fill=(12, 9, 7, 110))
    centered(d, 1200, 170, "T H E   W E D D I N G   O F", font(SANS_CANDIDATES, 20), (217, 188, 130, 255))
    names = f"{groom} & {bride}"
    size = 112
    while size > 60 and d.textbbox((0, 0), names, font=font(SERIF_CANDIDATES, size))[2] > 1080:
        size -= 4  # long names: shrink to fit
    centered(d, 1200, 225 + (112 - size) // 2, names, font(SERIF_CANDIDATES, size), (247, 241, 230, 255))
    d.line([(540, 380), (660, 380)], fill=(184, 149, 90, 255), width=2)
    centered(d, 1200, 400, f"{date}  —  {venue.upper()}", font(SANS_CANDIDATES, 26), (233, 217, 188, 255))
    os.makedirs(f"{ROOT}/og", exist_ok=True)
    og.save(f"{ROOT}/og/wedding-preview.jpg", "JPEG", quality=85, optimize=True, progressive=True)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--groom", default="Pria")
    p.add_argument("--bride", default="Wanita")
    p.add_argument("--date", default="12 · 06 · 2027")
    p.add_argument("--venue", default="Nama Venue")
    p.add_argument("--og-only", action="store_true")
    a = p.parse_args()

    if not a.og_only:
        os.makedirs(f"{ROOT}/gallery", exist_ok=True)
        os.makedirs(f"{ROOT}/couple", exist_ok=True)
        sizes = [(1200, 1500), (1600, 1067)] * 3
        suns = [(0.5, 0.6), (0.38, 0.64), (0.6, 0.58), (0.5, 0.66), (0.42, 0.6), (0.62, 0.63)]
        for i, ((w, h), s) in enumerate(zip(sizes, suns), 1):
            label(scene(w, h, i * 7, s), f"placeholder · foto {i:02d}").save(f"{ROOT}/gallery/gallery-{i:02d}.webp", "WEBP", quality=78, method=6)
        for name, initial, s, seed in [("groom", a.groom[:1].upper(), (0.35, 0.55), 31), ("bride", a.bride[:1].upper(), (0.65, 0.55), 47)]:
            im = scene(900, 1200, seed, s)
            d = ImageDraw.Draw(im, "RGBA")
            f = font(SERIF_CANDIDATES, 520)
            bb = d.textbbox((0, 0), initial, font=f)
            d.text(((900 - (bb[2] - bb[0])) / 2 - bb[0], (1200 - (bb[3] - bb[1])) / 2 - bb[1] - 80), initial, font=f, fill=(255, 248, 236, 120))
            label(im, f"placeholder · foto pengantin {'pria' if name == 'groom' else 'wanita'}").save(f"{ROOT}/couple/{name}.webp", "WEBP", quality=80, method=6)
    og_image(a.groom, a.bride, a.date, a.venue)
    print("done")


if __name__ == "__main__":
    main()
