# Architecture Overview — Senior Perspective

> Written for an intermediate developer wanting to understand *why* these decisions were made, not just *what* was built.

---

## TL;DR

This is a **static-first, content-driven portfolio** built with Astro 5, Preact islands, and Tailwind CSS v4. It targets <1.5s LCP with 100/100 Lighthouse, deployed to Cloudflare's edge network.

---

## Core Architecture Decision: Why Astro?

Most portfolio tutorials use Next.js or plain React. That's the wrong tool here.

**The problem with full-client SPAs:**
- A portfolio is 98% static content (Markdown files, hardcoded stats).
- React ships ~40KB of runtime JS just to say "hello world".
- Google's Core Web Vitals penalises Time to Interactive (TTI) heavily.

**Astro's mental model: Zero JS by default**

> *"Ship HTML. Add JavaScript only where you need it."*

Astro builds `.astro` files into pure HTML at build time. JavaScript only ships when you annotate a component with a hydration directive.

```
page.astro → getCollection() pulls Markdown → renders to HTML
                                          ↓
                              only TerminalHero.tsx ships .js
```

This is called the **Islands Architecture**. Each interactive component is an isolated "island" of JS surrounded by static HTML.

---

## Why Preact instead of React?

| | React | Preact |
|---|---|---|
| Runtime size | ~40KB gzip | ~3KB gzip |
| API compatibility | React | 95% compatible |
| Astro integration | `@astrojs/react` | `@astrojs/preact` |

For a portfolio with 2-3 interactive components, Preact's 93% smaller bundle is a clear win. The API is identical (same hooks, same JSX).

**Rule:** Any interactive component in `src/components/interactive/` or `src/components/global/` uses Preact TSX. Static layout in `.astro`.

---

## Why Tailwind CSS v4?

Tailwind v4 drops the JS config file entirely. Configuration lives in CSS:

```css
@import "tailwindcss";
@theme {
  --color-background: #0d1117;
  --font-mono: 'JetBrains Mono', monospace;
}
```

This means:
- **One source of truth** — CSS variables = design tokens = Tailwind classes
- **No separate shadcn/ui** — our `Button.astro`, `Card.astro` etc. are custom but equally composable
- **Zero config drift** — `bg-background` in HTML maps directly to the `@theme` variable

---

## Data Architecture: Why Astro Content Layer?

The prototype had all data hardcoded in TSX components. The Content Layer API solves this cleanly:

```
src/data/projects/kv-store.md
  ↓ Zod schema validation at BUILD TIME
  ↓ getCollection('projects') in pages
  ↓ Type-safe EntryType — TypeScript knows the shape
```

**What Zod gives you:**
- If a Markdown file is missing `title:`, the build fails with a clear error.
- No runtime crashes. Every data shape is validated before deployment.

---

## Why Cloudflare Pages?

| Feature | Value |
|---|---|
| Latency | <50ms globally (200+ PoPs) |
| Price | Free tier generous |
| SSR support | Via Cloudflare Workers (future) |
| Build minutes | 500/month free |

The architecture is `output: "static"` — Cloudflare serves pre-built HTML from its CDN. No server runtime costs. If we add API routes later (contact form, view counter), they run as Cloudflare Workers (edge functions).

---

## 12-Factor App Compliance

This portfolio applies the [12-Factor methodology](https://12factor.net/) for production-grade deployments:

| Factor | How |
|---|---|
| I. Codebase | Single Git repo |
| II. Dependencies | `pnpm` lockfile, no system deps |
| III. Config | `.env.example` documented, `src/lib/env.ts` validates |
| IV. Backing services | Supabase URL/key in env, swappable |
| V. Build/Release/Run | `pnpm build` → `dist/` → deploy separately |
| VI. Processes | Stateless static files |

---

## Component Hydration Strategy Reference

| Component | Directive | Why |
|---|---|---|
| `Navbar.tsx` | `client:idle` | No data deps; defer until idle |
| `TerminalHero.tsx` | `client:load` | Above the fold; user sees it immediately |
| `Footer.tsx` | (static, no directive) | Zero interactivity |
| Future filter islands | `client:visible` | Only hydrate when scrolled into view |

**Rule:** Default to `client:visible`. Escalate only if the component is above the fold (hero content).

---

## What a Senior Would Change Next

1. **Self-host fonts** instead of Google Fonts CDN — eliminates a third-party DNS lookup per page load. Use `@fontsource` packages.
2. **Edge-rendered OG images** via Satori — dynamic per-page PNG generation without a build step.
3. **RSS feed** at `/rss.xml` using `@astrojs/rss` — already linked in Footer, currently 404.
4. **View counter** via Cloudflare KV or Supabase — shows PR count live instead of hardcoded.
5. **`pnpm astro check` in CI** — TypeScript errors caught before merge, not during review.
