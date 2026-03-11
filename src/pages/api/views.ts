/**
 * GET  /api/views?slug=xxx  → current view count
 * POST /api/views { slug }  → increment + return new count
 *
 * Reads Cloudflare binding env via cloudflare:workers module.
 * prerender: false → runs as a Cloudflare Worker.
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createAppwrite, ID } from '../../lib/appwrite';
import { json } from '../../lib/api-utils';
import { Query } from 'node-appwrite';
import { z } from 'astro/zod';

export const prerender = false;

/** Validate slug format: lowercase alphanumeric, hyphens, slashes. Max 200 chars. */
const SlugParam = z.string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9][a-z0-9\-\/]*$/, 'Invalid slug format');

export const GET: APIRoute = async (context) => {
  const rawSlug = context.url.searchParams.get('slug');
  const parsed = SlugParam.safeParse(rawSlug);
  if (!parsed.success) return json({ error: 'Invalid slug parameter' }, 400);
  const slug = parsed.data;

  const { databases, DB_ID, viewsTableId } = createAppwrite(env);

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
  const parsedSlug = SlugParam.safeParse(slug);
  if (!parsedSlug.success) {
    return json({ error: 'Invalid slug' }, 400);
  }
  const validSlug = parsedSlug.data;

  const { databases, DB_ID, viewsTableId } = createAppwrite(env);

  if (!DB_ID || !viewsTableId) {
    return json({ views: 0 }, 200);
  }

  try {
    const res = await databases.listDocuments(DB_ID, viewsTableId, [
      Query.equal('slug', validSlug),
      Query.limit(1),
    ]);

    let views: number;
    if (res.documents.length > 0) {
      const doc = res.documents[0];
      views = ((doc.Views ?? doc.views) ?? 0) + 1;
      await databases.updateDocument(DB_ID, viewsTableId, doc.$id, { Views: views });
    } else {
      views = 1;
      await databases.createDocument(DB_ID, viewsTableId, ID.unique(), { slug: validSlug, Views: 1 });
    }

    return json({ views }, 200);
  } catch (err) {
    console.error('[views] Write failed:', err);
    return json({ views: 0 }, 200);
  }
};
