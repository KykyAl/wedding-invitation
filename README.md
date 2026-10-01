# Cinematic 3D Wedding Invitation — Template

React 19 · TypeScript · Vite 8 · Three.js (React Three Fiber + drei) · GSAP ScrollTrigger · Tailwind CSS 4

```bash
npm install
npm run dev        # http://localhost:5173/?to=Nama+Tamu
npm run build      # type-check + production build
npm run lint
```

## Deploy (GitHub Pages)

Every push to `main` builds and publishes via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

One-time setup on GitHub:
1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. *(When the Go backend is online)* **Settings → Secrets and variables → Actions → Variables → New variable**
   `API_URL` = `https://api.your-domain.com` (https, without `/api/v1`). Without it, RSVPs use per-device localStorage.
   Add the Pages origin (`https://kykyal.github.io`) to the backend's `ALLOWED_ORIGINS`.
3. Push → the site appears at `https://kykyal.github.io/wedding-invitation/`.

`SITE_URL` and `BASE_PATH` are filled automatically by `actions/configure-pages`, including for a custom
domain (Settings → Pages → Custom domain). Building elsewhere (Vercel, Netlify, own server at the domain root):
`SITE_URL=https://your-domain npm run build` and upload `dist/`.

## Sending via WhatsApp

Open **`<site>/share.html`** (unlisted, `noindex`; the data stays in your browser):
paste guests one per line (`Nama - 0812…` to open the chat directly), adjust the message
(`{nama} {link} {mempelai} {tanggal} {lokasi}`), then tap **Kirim WA** per guest. Each link carries `?to=Nama`,
so the cover greets the guest by name. The default message lives in `weddingData.share.message`.

WhatsApp caches link previews: if you change the OG image after sharing, test with a new link (e.g. add `&v=2`).

## Customising the invitation

All content lives in [`src/data/wedding.ts`](src/data/wedding.ts) — couple & parents, date (`dateTime` drives every
displayed date and the countdown), events (`start`/`end` feed the calendar links), dress code, venue & travel notes,
story, gallery, gift accounts & delivery address, RSVP settings, seed wishes, closing text, music and page meta.
Components never hardcode wedding data — `<title>` and Open Graph tags are injected from it at build time too.

> ⚠️ This is a **template**: names, parents, dates, venue, bank/e-wallet numbers, phone, addresses and wishes are
> all **example values** — replace them in `src/data/wedding.ts` before sharing.

For WhatsApp previews the `og:image` must be an absolute URL: `SITE_URL=https://your-domain npm run build`.

Guest personalisation: `/?to=Nama+Tamu` → “Dear Nama Tamu,” on the cover (sanitised, max 40 chars).
Testing aid: `?quality=low|high` forces a performance tier.

## Architecture

```
src/
  data/wedding.ts            content (single source of truth)
  config/
    theme.ts                 palette + atmosphere (mirrored in styles/index.css @theme)
    animation.ts             motion tokens: durations, easings, staggers, camera damping
    scenes.ts                camera keyframes per scene, envelope/arch placement
    performance.ts           quality tiers (mobile-first detection)
  store/experience.ts        `runtime` (mutable, read per frame) + `phase` (React store)
  hooks/                     scroll→scene index, pointer & tilt parallax, music, reduced motion…
  three/
    SceneCanvas.tsx          the ONE WebGL canvas (lazy-loaded chunk)
    CameraRig.tsx            single camera director: opening push-in + scroll keyframes + parallax
    environment/             sky, terrain & ridges, pine forest, mist, fog/lights
    objects/                 envelope, opening stage, golden arch, procedural flowers
    particles/               gold dust + petals (GPU-animated, camera-wrapped)
    textures.ts              procedural canvas textures (paper, card, wax seal, lining…)
  sections/
    registry.ts              ordered scroll scenes (add new scenes here)
    Opening/ Hero/ Quote/ Couple/ Story/ Events/ Gallery/ Venue/ Gift/ RSVP/ Closing/
                             HTML story layer over the canvas (10 scroll scenes)
  services/rsvp.ts           RSVP + wishes data layer (localStorage mock behind an interface)
  components/ui|wedding      shared UI (music toggle, fallback, overlays, split letters)
```

**Experience phases**: `loading → sealed → opening → revealed`. The opening film is a GSAP timeline
([`openingTimeline.ts`](src/sections/Opening/openingTimeline.ts)) that animates `runtime.opening.*`;
the 3D layer reads those values in `useFrame`, so React never re-renders per frame.

**Scroll**: native scroll. Each `[data-scene]` section is a camera keyframe; the continuous index
(`runtime.scroll.scene`) is eased between keyframes and damped in the camera rig.

**Adding a scene**: add a section with `data-scene="<id>"`, append the id to `SCENE_ORDER`, and make sure
`cameraKeyframes[<id>]` is where you want the camera.

## Performance & resilience

- Mobile tier: DPR ≤ 1.35, no MSAA, ~40% particle/tree counts; drei `PerformanceMonitor` lowers DPR further on FPS drops.
- Instanced forest/flowers/petals, GPU-only particle animation, no shadow maps, no HDR downloads (procedural RoomEnvironment).
- Light count is constant across the reveal → no shader recompile hitch.
- Render loop paused when the tab is hidden; every geometry/material/texture is disposed on unmount.
- No WebGL, a render error or a lost context → CSS/SVG fallback with the same composition.
- `prefers-reduced-motion`: short crossfade opening, no parallax, no letter animations.

## Features

Opening envelope → Hero (arch) → Quote → Couple (portraits, parents, Instagram) → Story (self-drawing timeline) →
Events (live countdown, Google Calendar + .ics, dress code, floating rings) → Gallery (swipe/drag filmstrip with depth,
fullscreen lightbox) → Venue (Google Maps embed, Open Map, copy address, travel notes, aerial lake + pin in 3D) →
Gift (copyable bank / e-wallet numbers, delivery address) → RSVP (validated form, confirmation, editable) + wishes wall →
Closing.

**Backend later:** implement `RsvpService` from [`src/services/rsvp.ts`](src/services/rsvp.ts) with HTTP calls and export
it as `rsvpService` — no UI changes needed. Today submissions are stored per device (localStorage).

## Assets to supply

Footer credit: `weddingData.credits`.

After filling in the real names, refresh the WhatsApp preview image (needs Python + Pillow):
`python3 scripts/generate-placeholders.py --og-only --groom "Nama" --bride "Nama" --date "12 · 06 · 2027" --venue "Nama Venue"`

Placeholder images (labelled "placeholder") ship so everything works; replace them with real photos, same file names:

- `public/assets/couple/groom.webp`, `bride.webp` — portraits, 3:4.
- `public/assets/gallery/gallery-01…06.webp` — prewedding photos (shown 4:5, full-frame in the lightbox).
- `public/assets/og/wedding-preview.jpg` — 1200×630 WhatsApp/social preview.
- `public/assets/music/wedding-cinematic.mp3` — background music (the ♪ button hides itself while the file is missing).
