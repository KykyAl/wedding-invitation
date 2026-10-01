import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { weddingData } from './src/data/wedding.ts'

/**
 * Deploy configuration (all optional):
 *   BASE_PATH  sub-path the site is served from, e.g. "/wedding-invitation/" for GitHub Pages. Default "/".
 *   SITE_URL   public origin, e.g. "https://kykyal.github.io". Needed for absolute og:image/og:url —
 *              WhatsApp/Facebook ignore relative preview images.
 */
const base = withSlashes(process.env.BASE_PATH ?? '/')
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '')

function withSlashes(p: string) {
  return `/${p.replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/')
}

/** Fills <title>, description and Open Graph tags from the wedding data at build time. */
function weddingMeta(): Plugin {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pageUrl = siteUrl ? siteUrl + base : ''
  const values: Record<string, string> = {
    TITLE: `${weddingData.groom.nickname} & ${weddingData.bride.nickname} — Wedding Invitation`,
    DESCRIPTION: weddingData.meta.description,
    OG_IMAGE: siteUrl + base + weddingData.meta.ogImage.replace(/^\//, ''),
    URL: pageUrl,
    SUMMARY: `${weddingData.groom.nickname} & ${weddingData.bride.nickname} — ${weddingData.date}, ${weddingData.venue.name}.`,
  }
  return {
    name: 'wedding-meta',
    transformIndexHtml: (html) =>
      html
        // Drop og:url entirely when no SITE_URL is known rather than emitting an empty tag.
        .replace(/\s*<meta property="og:url" content="%WEDDING_URL%" \/>/, pageUrl ? '$&' : '')
        .replace(/%WEDDING_(\w+)%/g, (m, key: string) => (key in values ? escape(values[key]) : m)),
    configResolved(config) {
      if (config.command !== 'build') return
      const api = config.env.VITE_API_URL as string | undefined
      if (siteUrl && api && (/localhost|127\.0\.0\.1/.test(api) || (siteUrl.startsWith('https:') && api.startsWith('http:')))) {
        config.logger.warn(
          `\n[wedding-meta] VITE_API_URL is "${api}" — guests' phones cannot reach localhost, and an https site\n` +
            '               cannot call an http API. Use the public https URL of the Go backend.\n',
        )
      }
      if (!siteUrl) {
        config.logger.warn(
          '\n[wedding-meta] SITE_URL is not set — og:image will be relative and WhatsApp will show no preview image.\n' +
            '               Example: SITE_URL=https://kykyal.github.io BASE_PATH=/wedding-invitation/ npm run build\n',
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), weddingMeta()],
  build: {
    // The three.js/R3F chunk (~950 kB raw, ~255 kB gzip) is lazy-loaded after the
    // cover paints, so its size doesn't block first paint. Warn only beyond that.
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        share: fileURLToPath(new URL('./share.html', import.meta.url)),
      },
    },
  },
})
