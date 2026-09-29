import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { weddingData } from './src/data/wedding.ts'

/** Fills <title>, description and Open Graph tags from the wedding data at build time. */
function weddingMeta(): Plugin {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // WhatsApp/Facebook need an absolute og:image URL: build with SITE_URL=https://your-domain npm run build
  const site = (process.env.SITE_URL ?? '').replace(/\/$/, '')
  const values: Record<string, string> = {
    TITLE: `${weddingData.groom.nickname} & ${weddingData.bride.nickname} — Wedding Invitation`,
    DESCRIPTION: weddingData.meta.description,
    OG_IMAGE: site + weddingData.meta.ogImage,
    SUMMARY: `${weddingData.groom.nickname} & ${weddingData.bride.nickname} — ${weddingData.date}, ${weddingData.venue.name}.`,
  }
  return {
    name: 'wedding-meta',
    transformIndexHtml: (html) => html.replace(/%WEDDING_(\w+)%/g, (m, key: string) => (key in values ? escape(values[key]) : m)),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), weddingMeta()],
  build: {
    // The three.js/R3F chunk (~950 kB raw, ~255 kB gzip) is lazy-loaded after the
    // cover paints, so its size doesn't block first paint. Warn only beyond that.
    chunkSizeWarningLimit: 1000,
  },
})
