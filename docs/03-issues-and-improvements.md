# Issues, Bugs & Improvement Roadmap

> Honest audit. Every item has: what it is, why it matters, and a concrete fix path.

---

## 🚨 Known Issues (fix before launch)

### 1. Tech Stack section shows missing icons
**Root cause:** Devicon classes reference a CDN we load in `BaseLayout.astro`. If the CDN is slow, icons render as empty squares.
**Fix:** Self-host via `npm install devicon` and import the CSS from `node_modules`.
```
pnpm add devicon
```
In `global.css`: `@import "../../node_modules/devicon/devicon.min.css";`

---

### 2. `/rss.xml` returns 404
**Root cause:** Footer links to `/rss.xml` but we never created the feed endpoint.
**Fix:** Install `@astrojs/rss` and create `src/pages/rss.xml.ts`:
```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const logs = await getCollection('logs');
  return rss({
    title: 'Harshit Sharma — Engineering Logs',
    description: 'Notes on systems, Rust, and distributed computing',
    site: context.site,
    items: logs.map(log => ({
      title: log.data.title,
      pubDate: new Date(log.data.date),
      link: `/logs/${log.id}`,
    })),
  });
}
```

---

### 3. No `[slug]` dynamic routes for project/algorithm detail pages
**Root cause:** We have list pages (`/projects`, `/algorithms`) but hitting `/algorithms/1-two-sum` returns 404 because no `[...slug].astro` page exists.
**Fix priority:** HIGH — links exist in the UI that go nowhere.

Files to create:
- `src/pages/projects/[slug].astro`
- `src/pages/algorithms/[slug].astro`
- `src/pages/logs/[slug].astro`

Pattern:
```astro
---
import { getCollection } from 'astro:content';
export async function getStaticPaths() {
  const entries = await getCollection('projects');
  return entries.map(e => ({ params: { slug: e.id }, props: { entry: e } }));
}
const { entry } = Astro.props;
const { Content } = await entry.render();
---
<Content />
```

---

### 4. Contact form is static HTML with no submission handler
**Root cause:** The form in `contact.astro` uses a `<form>` but there's no API route connected to it.
**Fix:** Create `src/pages/api/contact.ts` as a Cloudflare Worker (or Supabase insert) to handle `POST` requests. Then wire up a Preact island for state management (loading/success/error).

---

### 5. Projects section on homepage shows 0 cards (only 1 seed file, none are `featured:true`)
**Root cause:** Only `1-kv-store.md` exists and `featured: true` is set. But there's only 1, not 3.
**Fix:** Add 2 more seed projects to `src/data/projects/` to see the homepage grid render fully.

---

## 🟡 Improvements (post-launch)

### 6. Self-host fonts (eliminate Google Fonts CDN dependency)
**Impact:** LCP improvement of 100–300ms
**How:**
```
pnpm add @fontsource/inter @fontsource/jetbrains-mono
```
In `global.css`:
```css
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/jetbrains-mono/400.css";
```
Remove the `<link>` tags from `BaseLayout.astro`.

---

### 7. Active filter state in `/projects` and `/algorithms` is purely visual (no JS filter)
**Root cause:** The category/difficulty pill buttons are static HTML — clicking does nothing.
**Fix:** Wrap both pages in a Preact island that holds `activeFilter` state and filters the list client-side. Use `nanostores` to share filter state if needed.

---

### 8. No `astro:image` optimization on project images
**Root cause:** No images exist yet in content, but when they're added, raw `<img>` tags won't be optimized.
**Fix:** Use Astro's built-in `<Image />` component from `astro:assets` which auto-generates WebP variants and sets proper `width`/`height` to prevent CLS.

---

### 9. Missing `robots.txt`
**Fix:** Create `src/pages/robots.txt.ts`:
```ts
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: https://harshit.systems/sitemap-index.xml`);
}
```

---

### 10. No error boundaries in Preact islands
**Root cause:** If `TerminalHero` throws, the whole island crashes silently.
**Fix:** Wrap interactive islands in an error boundary:
```tsx
import { Component } from 'preact';
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div>Something went wrong.</div>;
    return this.props.children;
  }
}
```

---

## 🟢 Optimization Ideas (when you want 100/100 Lighthouse)

| Idea | Impact | Effort |
|------|--------|--------|
| Edge-rendered OG images (Satori) | High | High |
| View counter via CF KV | Medium | Medium |
| `loading="lazy"` on all non-hero images | Medium | Low |
| `<link rel="prefetch">` on hover | Low | Low |
| Service Worker for offline | Low | High |
