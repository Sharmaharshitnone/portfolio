/**
 * GET  /api/views?slug=xxx  → current view count
 * POST /api/views { slug }  → increment + return new count
 *
 * Reads Cloudflare binding env per-request (context.locals.runtime.env).
 * prerender: false → runs as a Cloudflare Worker.
 */
import type { APIRoute } from 'astro';
import { createAppwrite, ID } from '../../lib/appwrite';
import { json } from '../../lib/api-utils';
import { Query } from 'node-appwrite';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const slug = context.url.searchParams.get('slug');
  if (!slug) return json({ error: 'Missing slug parameter' }, 400);

  const cfEnv = context.locals.runtime.env;
  const { databases, DB_ID, viewsTableId } = createAppwrite(cfEnv);

  if (!DB_ID || !viewsTableId) {
    return json({ views: 0 }, 200);
  }

  try {
    const res = await databases.listDocuments(DB_ID, viewsTableId, [
      Query.equal('slug', slug),
      Query.limit(1),
    ]);
    const doc = res.documents[0];
    const views = (doc?.Views ?? doc?.views) ?? 0;
    return json({ views }, 200);
  } catch (err) {
    console.error('[views] Read failed:', err);
    return json({ views: 0 }, 200);
  }
};

export const POST: APIRoute = async (context) => {
  let body: unknown;
  try { body = await context.request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  const slug = (body as Record<string, unknown>)?.slug;
  if (typeof slug !== 'string' || !slug) {
    return json({ error: 'Missing slug' }, 400);
  }

  const cfEnv = context.locals.runtime.env;
  const { databases, DB_ID, viewsTableId } = createAppwrite(cfEnv);

  if (!DB_ID || !viewsTableId) {
    return json({ views: 0 }, 200);
  }

  try {
    const res = await databases.listDocuments(DB_ID, viewsTableId, [
      Query.equal('slug', slug),
      Query.limit(1),
    ]);

    let views: number;
    if (res.documents.length > 0) {
      const doc = res.documents[0];
      views = ((doc.Views ?? doc.views) ?? 0) + 1;
      await databases.updateDocument(DB_ID, viewsTableId, doc.$id, { Views: views });
    } else {
      views = 1;
      await databases.createDocument(DB_ID, viewsTableId, ID.unique(), { slug, Views: 1 });
    }

    return json({ views }, 200);
  } catch (err) {
    console.error('[views] Write failed:', err);
    return json({ views: 0 }, 200);
  }
};
