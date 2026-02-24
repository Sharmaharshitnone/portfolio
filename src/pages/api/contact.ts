/**
 * POST /api/contact — Server-rendered API route (Cloudflare Worker).
 *
 * Receives { name, email, message } → writes to Appwrite ContactMessages table.
 * Validates with Zod. Reads Cloudflare binding env per-request.
 * prerender: false → runs on Cloudflare Workers, NOT statically generated.
 */
import type { APIRoute } from 'astro';
import { createAppwrite, ID } from '../../lib/appwrite';
import { z } from 'astro/zod';

export const prerender = false;

const ContactPayload = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

export const POST: APIRoute = async (context) => {
  const { request } = context;
  // ── Parse & validate ─────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const result = ContactPayload.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Validation failed';
    return json({ error: firstError }, 422);
  }

  // ── Read CF bindings per-request ─────────────────────
  const cfEnv = (context.locals as any).runtime?.env ?? {};
  const { databases, DB_ID, contactTableId } = createAppwrite(cfEnv);

  if (!DB_ID || !contactTableId) {
    console.error('[contact] Appwrite not configured — DB_ID or CONTACT_TABLE_ID missing in CF bindings');
    return json({ error: 'Service temporarily unavailable' }, 503);
  }

  // ── Write to Appwrite ─────────────────────────────────
  try {
    await databases.createDocument(DB_ID, contactTableId, ID.unique(), {
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[contact] Appwrite write failed:', err);
    return json({ error: 'Failed to send message. Please try again later.' }, 500);
  }
};

/** Helper: create JSON Response with status code */
function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
