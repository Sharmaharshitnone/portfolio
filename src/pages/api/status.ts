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
import { Query } from 'appwrite';

export const prerender = false;

/** Default status shown when Appwrite is unavailable */
const DEFAULT_STATUS = {
  status: 'Building distributed systems',
  emoji: '++',
  updatedAt: new Date().toISOString(),
};

export const GET: APIRoute = async (context) => {
  const cfEnv = (context.locals as any).runtime?.env ?? {};
  const { databases, DB_ID } = createAppwrite(cfEnv);
  const statusTableId = cfEnv.APPWRITE_STATUS_TABLE_ID || '';

  if (!DB_ID || !statusTableId) {
    return json(DEFAULT_STATUS, 200);
  }

  try {
    const res = await databases.listDocuments(DB_ID, statusTableId, [
      Query.orderDesc('$updatedAt'),
      Query.limit(1),
    ]);

    if (res.documents.length === 0) {
      return json(DEFAULT_STATUS, 200);
    }

    const doc = res.documents[0];
    return json({
      status: doc.status ?? DEFAULT_STATUS.status,
      emoji: doc.emoji ?? DEFAULT_STATUS.emoji,
      updatedAt: doc.$updatedAt ?? doc.updatedAt ?? DEFAULT_STATUS.updatedAt,
    }, 200);
  } catch (err) {
    console.error('[status] Read failed:', err);
    return json(DEFAULT_STATUS, 200);
  }
};

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}
