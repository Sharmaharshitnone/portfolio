# ADR-005: Cloudflare Pages for Hosting

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

The portfolio needs a hosting platform that is free, fast, supports custom domains, and integrates with the Cloudflare DNS already managing `harshit.systems`.

## Decision

Use **Cloudflare Pages** for static hosting with optional edge functions.

### Why Cloudflare Pages

| Feature | Cloudflare Pages | Vercel | Netlify | GitHub Pages |
|---|---|---|---|---|
| **Free tier** | ✅ Unlimited sites, 500 builds/mo | ✅ 100GB bandwidth | ✅ 100GB bandwidth | ✅ 1GB storage |
| **Global CDN** | ✅ 200+ edge locations | ✅ Edge network | ✅ CDN | ✅ (limited) |
| **Custom domain** | ✅ Native (same DNS) | ✅ Yes | ✅ Yes | ✅ Yes |
| **Edge functions** | ✅ Workers (SSR) | ✅ Edge/Serverless | ✅ Functions | ❌ No |
| **`_headers` file** | ✅ Native security headers | ❌ `vercel.json` | ✅ `_headers` | ❌ No |
| **Astro adapter** | ✅ `@astrojs/cloudflare` | ✅ `@astrojs/vercel` | ✅ `@astrojs/netlify` | ❌ Static only |
| **Build config** | `pnpm build` | `pnpm build` | `pnpm build` | Actions required |

**Cloudflare wins because:** Free, same ecosystem as DNS, native `_headers` for CSP, Workers for future SSR endpoints.

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://harshit.systems',
  // Adapter needed for prerender:false endpoints (/api/views, /api/contact)
  adapter: cloudflare(),
  integrations: [preact(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

> **Note:** The `@astrojs/cloudflare` adapter is required because `/api/views.ts` and `/api/contact.ts` use `export const prerender = false;` for runtime request handling. All other pages remain statically generated.

### Cloudflare Pages Build Settings

| Setting | Value |
|---|---|
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | 20.x |

## Consequences

- Must use `_headers` file in `public/` for security headers
- `@astrojs/cloudflare` adapter is **required** — we use `prerender: false` for `/api/views` and `/api/contact`
- Cloudflare Workers limited to 10ms CPU time on free tier (sufficient for view counting)
- Builds limited to 500/month on free tier (sufficient for daily/weekly updates)

## References

- [Astro + Cloudflare Pages deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
