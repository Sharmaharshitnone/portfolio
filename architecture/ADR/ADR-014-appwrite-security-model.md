# ADR-014: Appwrite Security Model — Server SDK Only

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Harshit Sharma

## Context

The portfolio uses Appwrite as a BaaS for three collections:
- **ContactMessages** — stores contact form submissions (contains PII)
- **PageViews** — stores per-slug view counts
- **LiveStatus** — stores the current live status message

All three are accessed exclusively through Astro SSR API routes running on
Cloudflare Workers. The routes use the `node-appwrite` server SDK with an API
key (`client.setKey(apiKey)`), which **bypasses collection-level permissions**.

### Problem

All three collections were initially configured with "any" role having full
CRUD permissions. This meant anyone who discovered the Appwrite project ID
could directly access the Appwrite REST API and:
- Read all contact messages (PII exposure)
- Manipulate view counts
- Change the live status

### Options Evaluated

1. **Client SDK with collection permissions** — Use the Appwrite Web SDK in
   browser, rely on collection permissions for access control.
   - Rejected: Exposes project ID + endpoint to client, requires complex
     permission rules, doesn't fit the SSR-only architecture.

2. **Server SDK + locked-down permissions (chosen)** — Keep server SDK with
   API key, remove "any" role from all collections, add only the owner's
   user ID with full CRUD.
   - API key bypasses permissions, so API routes still work.
   - Direct Appwrite API access is blocked for unauthenticated users.
   - Owner can still browse data in Appwrite Console.

3. **Server SDK + IP allowlisting** — Restrict Appwrite to only accept
   requests from Cloudflare Worker IPs.
   - Nice additional layer but Appwrite Cloud doesn't support IP allowlisting
     at the project level.

## Decision

**Option 2 — Server SDK with locked-down collection permissions.**

### Permission Configuration

For all three collections:
- Remove all "any" role permissions
- Add `user:<owner_user_id>` with Read, Create, Update, Delete

### Additional Security Layers

1. **Origin validation middleware** (`src/middleware.ts`):
   - All POST/PUT/PATCH/DELETE requests to `/api/*` must include an `Origin`
     header matching `https://harshit.systems` or `localhost:*`
   - Prevents CSRF attacks from third-party sites

2. **Zod input validation**:
   - All API routes validate input with Zod schemas before touching Appwrite
   - `SlugParam` regex prevents injection in views API
   - `ContactPayload` validates name, email, message bounds

3. **Rate limiting** (Cloudflare WAF):
   - `/api/contact` POST: 5 requests per 10 minutes per IP
   - `/api/views` POST: 30 requests per 1 minute per IP
   - Configured in Cloudflare Dashboard, not in code

4. **Per-request client factory** (`createAppwrite(cfEnv)`):
   - Appwrite credentials are read from Cloudflare Worker env bindings per-request
   - Never available at module scope or in client bundles
   - API key stored as a Cloudflare Pages secret (encrypted at rest)

## Consequences

- Direct Appwrite API access is blocked for unauthenticated users
- API routes continue to work via server SDK (bypasses permissions)
- Owner retains full access via Appwrite Console
- Origin validation prevents cross-site request forgery
- Rate limiting prevents abuse of write endpoints
- Manual step required: owner must update collection permissions in Appwrite Console
  (see `temp/APPWRITE-SECURITY.md` for step-by-step instructions)
