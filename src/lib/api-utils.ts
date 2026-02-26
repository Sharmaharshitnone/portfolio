/**
 * Shared helpers for SSR API routes (Cloudflare Workers).
 *
 * Eliminates the per-file `json()` helper that was duplicated across
 * status.ts, views.ts, and contact.ts.
 */

/** Create a JSON Response with optional extra headers. */
export function json(
  data: Record<string, unknown>,
  status: number,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
