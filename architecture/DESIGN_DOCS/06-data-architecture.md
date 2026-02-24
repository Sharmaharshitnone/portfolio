# Data Architecture & Astro Migration Map

> **Maps every hardcoded dataset in the DESIGN prototype to Astro Content Layer collections with Zod schemas.**

---

## Current State (React Prototype)

All data is hardcoded in TSX/TS files:

| Data | Location | Records | Fields |
|---|---|---|---|
| Projects | `ProjectsPage.tsx` inline | 8 | id, title, desc, longDesc, tech, stars, forks, github, live, featured, category |
| Problems | `problems-data.ts` | 10 | id, slug, title, platform, difficulty, tags, solved, rating, link, code, approach, complexity |
| Logs | `LogsPage.tsx` inline | 5 | id, hash, title, date, readTime, tags, excerpt, content |
| Stats | `HomePage.tsx` inline | 4 | label, value |
| Contact links | `ContactPage.tsx` inline | 4 | icon, label, value, href |
| Nav items | `Navbar.tsx` inline | 5 | to, label |
| Tech stack | `TechIcons.tsx` inline | 18 | key, label, iconClass (kept in `src/lib/constants.ts`; used per-project rather than homepage) |

---

## Target State (Astro Content Layer)

### Collection: `projects`

**Source:** `src/data/projects/*.md`

```typescript
// In content.config.ts
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    longDescription: z.string().optional(),
    techStack: z.array(z.string()),
    stars: z.number().default(0),
    forks: z.number().default(0),
    github: z.string().url().optional(),
    live: z.string().url().optional(),
    featured: z.boolean().default(false),
    category: z.enum(['systems', 'web', 'data', 'devops', 'tools']),
    order: z.number().default(0),
  }),
});
```

**Example markdown:**

```markdown
---
title: "Distributed KV Store"
description: "Raft-based distributed key-value store with consistent hashing."
longDescription: "A production-grade distributed key-value store implementing..."
techStack: ["Rust", "Raft", "gRPC", "Tokio", "RocksDB"]
stars: 234
forks: 45
github: "https://github.com/harshit/distributed-kv"
featured: true
category: "systems"
order: 1
---

Additional case study content here (rendered in project detail page).
```

---

### Collection: `algorithms`

**Source:** `src/data/algorithms/*.md`

```typescript
const algorithms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/algorithms' }),
  schema: z.object({
    title: z.string(),
    platform: z.enum(['CF', 'LC', 'AC']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()),
    solved: z.string().date(),
    rating: z.number().optional(),
    link: z.string().url(),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
  }),
});
```

**The markdown body contains:** Approach text + code solution (rendered with Shiki at build time).

---

### Collection: `logs`

**Source:** `src/data/logs/{daily,weekly,project}/*.md`

```typescript
const logs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/logs' }),
  schema: z.object({
    title: z.string(),
    date: z.string().date(),
    type: z.enum(['daily', 'weekly', 'project']),
    tags: z.array(z.string()),
    readTime: z.string().optional(),  // Auto-calculated in production
    hash: z.string().optional(),      // Git commit hash reference
  }),
});
```

**The markdown body is the full log content** — rendered natively by Astro's markdown pipeline with Shiki code highlighting.

---

## Static Data (No Collection Needed)

These datasets are small and static — keep as TypeScript constants:

| Data | Location in Astro |
|---|---|
| Stats (4 items) | `src/lib/constants.ts` |
| Contact links (4 items) | `src/lib/constants.ts` |
| Nav items (5 items) | `src/lib/constants.ts` |
| Tech stack (18 items) | `src/lib/constants.ts` (used for project badges; not shown on homepage) |
| Platform names map | `src/lib/constants.ts` |
| Difficulty labels map | `src/lib/constants.ts` |

---

## Migration Checklist

| # | Task | Files |
|---|---|---|
| 1 | Create `src/data/projects/` with 8 markdown files | 8 `.md` |
| 2 | Create `src/data/algorithms/` with 10 markdown files | 10 `.md` |
| 3 | Create `src/data/logs/` with 5 markdown files | 5 `.md` |
| 4 | Define collections in `content.config.ts` | 1 `.ts` |
| 5 | Create `src/lib/constants.ts` for static data | 1 `.ts` |
| 6 | Update pages to use `getCollection()` / `getEntry()` | 7 pages |
