# ADR-008: `@astrojs/sitemap` + `@astrojs/rss` for SEO

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

A recruiter-facing portfolio must be discoverable via search engines. Sitemaps help crawlers index all pages; RSS feeds let developers subscribe to engineering log updates.

## Decision

Use official Astro integrations: `@astrojs/sitemap` for automatic sitemap generation and `@astrojs/rss` for RSS feed of engineering logs.

### Sitemap Configuration

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://harshit.systems',  // REQUIRED
  integrations: [sitemap()],
});
```

**Result:** Auto-generates `sitemap-index.xml` and `sitemap-0.xml` at build time containing all static routes.

### RSS Feed Endpoint

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const logs = await getCollection('logs');
  return rss({
    title: 'Harshit Sharma — Engineering Logs',
    description: 'Daily and weekly engineering updates',
    site: context.site,
    items: logs
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((log) => ({
        title: log.data.title,
        pubDate: log.data.pubDate,
        link: `/logs/${log.id}/`,
      })),
  });
}
```

### SEO Checklist

| Item | Implementation |
|---|---|
| `<title>` per page | Dynamic via `BaseHead.astro` props |
| `<meta name="description">` | Per-page descriptions |
| Open Graph tags | `og:title`, `og:description`, `og:image`, `og:url` |
| Twitter Card | `twitter:card`, `twitter:title`, `twitter:image` |
| Canonical URL | `<link rel="canonical" href={Astro.url} />` |
| Sitemap | Auto-generated via `@astrojs/sitemap` |
| RSS | `/rss.xml` for engineering logs |
| `robots.txt` | `public/robots.txt` with sitemap reference |

## Consequences

- `site` property MUST be set in `astro.config.mjs`
- Sitemap regenerated on every build (automatic)
- RSS feed is a build-time static endpoint (not dynamic)
- OG images handled separately via Satori (see ADR-009)

## References

- [Astro sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Astro RSS guide](https://docs.astro.build/en/guides/rss/)
