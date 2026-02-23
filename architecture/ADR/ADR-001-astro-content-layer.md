# ADR-001: Astro 5 with Content Layer API

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

The portfolio needs a framework that prioritizes:
- **Content delivery speed** (recruiters spend ~10 seconds on first impression)
- **Easy content updates** (daily/weekly Markdown workflows)
- **Type-safe content** (prevent broken builds from malformed frontmatter)
- **Minimal JavaScript** (no framework runtime for content pages)

## Decision

Use **Astro 5** with the **Content Layer API** (not legacy Content Collections).

### Why Astro 5 Over Next.js/Gatsby/Hugo

| Criteria | Astro 5 | Next.js 14 | Gatsby | Hugo |
|---|---|---|---|---|
| JS shipped (content page) | **0 KB** | ~80KB React runtime | ~60KB React runtime | 0 KB |
| Content validation | **Zod at build time** | Manual | GraphQL layer | None |
| Island hydration | **Built-in** | Full page hydration | Full page hydration | None |
| View Transitions | **Native ClientRouter** | Requires framer-motion | Plugin | None |
| Build speed (100 pages) | **~10s** | ~30s | ~60s | ~5s |
| TypeScript content types | **Auto-generated** | Manual | GraphQL codegen | None |
| Learning curve | **Low** (HTML + JS) | React required | React + GraphQL | Go templates |

### Why Content Layer API (Not Legacy)

```diff
- // Legacy (Astro < 5) — DEPRECATED
- // src/content/config.ts
- const blog = defineCollection({ type: 'content', schema: ... })

+ // Astro 5 Content Layer API
+ // src/content.config.ts  ← Note: file moved to project root of src/
+ import { glob } from 'astro/loaders';
+ const blog = defineCollection({
+   loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
+   schema: z.object({ ... })
+ });
```

**Key improvements:**
- **5x faster** Markdown builds, 2x faster MDX
- **25–50% less memory** during builds
- Content files can live **anywhere** (not locked to `src/content/`)
- `render()` imported from `astro:content` instead of `entry.render()`
- `id` replaces `slug` for consistent identification

## Consequences

- Must use `src/content.config.ts` (not `src/content/config.ts`)
- Must use `glob()` or `file()` loaders for all collections
- Must import `render` from `astro:content` to render Markdown
- All content files validated by Zod — broken frontmatter = build failure (this is desired)

## References

- [Astro Content Collections docs](https://docs.astro.build/en/guides/content-collections/)
- [Astro 5.0 Release Notes](https://astro.build/blog/astro-5/)
