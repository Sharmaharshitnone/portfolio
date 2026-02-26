/**
 * GET /api/status → current live status message
 *
 * Reads from Appwrite LiveStatus table (single document).
 * Table schema: { status: string, emoji: string, updatedAt: string }
 *
 * Falls back to a default status if Appwrite is unconfigured or fails.
 * prerender: false → runs as a Cloudflare Worker.
 */
import type { APIRoute } from 'astro';
import { createAppwrite } from '../../lib/appwrite';
import { json } from '../../lib/api-utils';
import { Query } from 'node-appwrite';

export const prerender = false;

/** Build a default status response with a fresh timestamp per request */
function defaultStatus() {
  return {
    status: 'Building distributed systems',
    emoji: '++',
  };
}

export const GET: APIRoute = async (context) => {
  const cfEnv = context.locals.runtime.env;
  const { databases, DB_ID, statusTableId } = createAppwrite(cfEnv);

  if (!DB_ID || !statusTableId) {
    return statusJson(defaultStatus());
  }

  try {
    const res = await databases.listDocuments(DB_ID, statusTableId, [
      Query.orderDesc('$updatedAt'),
      Query.limit(1),
    ]);

    if (res.documents.length === 0) {
      return statusJson(defaultStatus());
    }

    const doc = res.documents[0];
    const fallback = defaultStatus();

    // Validate fields before sending — guard against malformed documents
    const status = typeof doc.status === 'string' && doc.status.length <= 200
      ? doc.status : fallback.status;
    const emoji = typeof doc.emoji === 'string' && doc.emoji.length <= 10
      ? doc.emoji : fallback.emoji;

    return statusJson({ status, emoji });
  } catch (err) {
    console.error('[status] Read failed:', err);
    return statusJson(defaultStatus());
  }
};

/** Status responses are cacheable at the edge. */
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
};

function statusJson(data: Record<string, unknown>): Response {
  return json(data, 200, CACHE_HEADERS);
}
