/**
 * Resolves a `public/` path against Vite's base URL, so the same data works at the
 * domain root (Vercel, own server) and under a sub-path (GitHub Pages: /wedding-invitation/).
 */
export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return import.meta.env.BASE_URL.replace(/\/$/, "") + path;
}
