# ADR-009: JSON-LD Structured Data

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

Structured data helps search engines understand content semantics, enabling rich snippets (knowledge panels, enhanced search results). Critical for a portfolio that is someone's **digital identity**.

## Decision

Implement **JSON-LD** structured data using Schema.org types: `Person` (global), `SoftwareApplication` (per project), and `Article` (per log entry).

### Person Schema (Global — `BaseLayout.astro`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Harshit Sharma",
  "url": "https://harshit.systems",
  "image": "https://harshit.systems/avatar.webp",
  "jobTitle": "Software Engineer",
  "description": "Full-stack engineer specializing in systems programming, competitive programming, and web architecture.",
  "sameAs": [
    "https://github.com/Sharmaharshitnone",
    "https://linkedin.com/in/YOUR_LINKEDIN",
    "https://x.com/YOUR_TWITTER"
  ],
  "knowsAbout": ["C++", "Rust", "TypeScript", "System Design", "Competitive Programming"],
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "YOUR_UNIVERSITY"
  }
}
</script>
```

### SoftwareApplication Schema (Per Project Page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Vault Ledger",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "A full-stack financial management system...",
  "url": "https://vault-ledger.harshit.systems",
  "screenshot": "https://harshit.systems/screenshots/vault-ledger.webp",
  "author": {
    "@type": "Person",
    "name": "Harshit Sharma"
  }
}
</script>
```

### Dynamic OG Image Generation

For social sharing, generate OG images at build time using Satori:

```typescript
// src/pages/api/og/[slug].png.ts
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((p) => ({ params: { slug: p.id } }));
}

export async function GET({ params }) {
  const svg = await satori(
    { type: 'div', props: { children: params.slug, /* JSX template */ } },
    { width: 1200, height: 630, fonts: [/* loaded font */] }
  );
  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
```

## Consequences

- JSON-LD placed in `<head>` via `BaseHead.astro` component
- Must keep structured data in sync with visible page content
- Validate with [Google Rich Results Test](https://search.google.com/test/rich-results) before launch
- OG images add build complexity but drastically improve social sharing CTR

## References

- [Schema.org Person](https://schema.org/Person)
- [Schema.org SoftwareApplication](https://schema.org/SoftwareApplication)
- [Google Structured Data guidelines](https://developers.google.com/search/docs/appearance/structured-data)
