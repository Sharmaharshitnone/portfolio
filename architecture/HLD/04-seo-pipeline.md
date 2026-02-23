# High-Level Design — SEO Pipeline

## SEO Architecture

```mermaid
graph TD
    subgraph BuildTime ["Build-Time SEO (Static)"]
        SM[Sitemap Generation]
        RSS[RSS Feed Generation]
        OG[OG Image Generation]
        JLD[JSON-LD Injection]
        META[Meta Tags per Page]
        RT[robots.txt]
    end

    subgraph Runtime ["Runtime SEO"]
        CF[Cloudflare Headers]
        PERF["Performance (Core Web Vitals)"]
    end

    subgraph Output ["SEO Output"]
        S1[/sitemap-index.xml]
        S2[/sitemap-0.xml]
        R1[/rss.xml]
        O1[/og/project-slug.png]
        H1[200 status codes]
        H2[Cache-Control headers]
    end

    SM --> S1
    SM --> S2
    RSS --> R1
    OG --> O1
    CF --> H1
    CF --> H2
```

## Meta Tags Architecture

Every page renders through `BaseHead.astro` which injects:

```astro
---
// src/components/global/BaseHead.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
}
const { title, description, image = '/og-default.png', type = 'website' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!-- Primary Meta Tags -->
<title>{title} | Harshit Sharma</title>
<meta name="title" content={`${title} | Harshit Sharma`} />
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.site)} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={canonicalURL} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={new URL(image, Astro.site)} />
```

## SEO Checklist (Pre-Launch)

| Check | Status | Tool |
|---|---|---|
| Sitemap accessible at `/sitemap-index.xml` | ☐ | Browser |
| RSS accessible at `/rss.xml` | ☐ | Browser |
| Lighthouse SEO score = 100 | ☐ | Chrome DevTools |
| Open Graph preview correct | ☐ | [opengraph.xyz](https://opengraph.xyz) |
| JSON-LD validates | ☐ | [Rich Results Test](https://search.google.com/test/rich-results) |
| `robots.txt` accessible | ☐ | Browser |
| All images have `alt` text | ☐ | Lighthouse |
| No broken internal links | ☐ | `astro check` |
| Google Search Console submitted | ☐ | GSC dashboard |
