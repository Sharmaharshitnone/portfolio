/**
 * src/middleware.ts — Astro middleware for security headers & Origin validation.
 *
 * Runs on every SSR request (Cloudflare Worker). Static pages are pre-rendered
 * and bypass this middleware entirely (output: "static" + per-route prerender: false).
 *
 * ── CSRF / Origin validation ──────────────────────────────────────────────────
 * POST/PUT/PATCH/DELETE requests to /api/* must include an Origin header that
 * matches the site's own origin. This prevents cross-site form submissions and
 * CSRF attacks. Browsers always send Origin on cross-origin requests.
 *
 * Allowed origins:
 *   - Production: https://harshit.systems
 *   - Local dev:  http://localhost:* (any port)
 */
import { defineMiddleware } from 'astro:middleware';

/** Origins that are allowed to make mutating requests to /api/* */
const ALLOWED_ORIGINS = new Set([
  'https://harshit.systems',
]);

/** Returns true if the origin is a localhost dev URL (any port). */
function isLocalhostOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  // Only validate mutating requests to API routes
  if (url.pathname.startsWith('/api/') && MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get('Origin');

    // Browsers always send Origin on cross-origin requests and on same-origin
    // POST. If it's missing, it might be a server-to-server call or a very old
    // browser — block it to be safe.
    if (!origin) {
      return new Response(JSON.stringify({ error: 'Missing Origin header' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_ORIGINS.has(origin) && !isLocalhostOrigin(origin)) {
      return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
