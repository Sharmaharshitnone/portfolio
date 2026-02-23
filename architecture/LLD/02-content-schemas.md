# Low-Level Design — Content Collection Schemas

## Schema Definitions (`src/content.config.ts`)

All content collections use the Astro 5 Content Layer API with `glob()` loader and strict Zod schemas.

### Projects Collection

```typescript
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
  schema: z.object({
    // Required fields
    title: z.string().min(1).max(100),
    description: z.string().min(10).max(300),
    techStack: z.array(z.string()).min(1),
    githubUrl: z.string().url(),
    category: z.enum(['fullstack', 'backend', 'frontend', 'systems', 'mobile']),
    pubDate: z.coerce.date(),

    // Optional fields
    liveUrl: z.string().url().optional(),
    subdomain: z.string().optional(),
    thumbnail: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'archived', 'wip']).default('active'),

    // Case study fields (optional, for detailed project pages)
    problem: z.string().optional(),
    solution: z.string().optional(),
    architecture: z.string().optional(),
    challenges: z.array(z.string()).optional(),
    outcomes: z.array(z.string()).optional(),
  }),
});
```

**Example Markdown frontmatter:**
```yaml
---
title: "Vault Ledger"
description: "Full-stack financial management system with real-time transaction tracking"
techStack: ["React", "Node.js", "PostgreSQL", "Prisma", "JWT"]
githubUrl: "https://github.com/Sharmaharshitnone/vault-ledger"
liveUrl: "https://vault-ledger.harshit.systems"
subdomain: "vault-ledger"
category: "fullstack"
featured: true
status: "active"
pubDate: 2026-01-15
problem: "Small businesses need affordable financial tracking without enterprise complexity."
solution: "Built a role-based ledger system with JWT auth, transaction management, and real-time dashboards."
challenges:
  - "Implementing zero-trust checkout with idempotency keys"
  - "Optimizing N+1 queries in Prisma relations"
outcomes:
  - "100% test coverage on payment endpoints"
  - "Sub-200ms API response times"
---

## Architecture Overview

Vault Ledger follows a layered architecture...
```

---

### Algorithms Collection

```typescript
const algorithms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/algorithms' }),
  schema: z.object({
    title: z.string().min(1),
    platform: z.enum(['codeforces', 'leetcode', 'atcoder', 'cses', 'codechef']),
    problemUrl: z.string().url().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    rating: z.number().int().min(800).max(4000).optional(),
    tags: z.array(z.string()).min(1),
    timeComplexity: z.string(),     // e.g., "O(n log n)"
    spaceComplexity: z.string(),    // e.g., "O(n)"
    language: z.enum(['cpp', 'rust', 'python']).default('cpp'),
    executionTimeMs: z.number().optional(),
    memoryUsedKb: z.number().optional(),
    pubDate: z.coerce.date(),
  }),
});
```

**Example:**
```yaml
---
title: "Kth Largest Element in an Array"
platform: "leetcode"
problemUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/"
difficulty: "medium"
rating: 1800
tags: ["quickselect", "heap", "divide-and-conquer"]
timeComplexity: "O(n)"
spaceComplexity: "O(1)"
language: "cpp"
executionTimeMs: 4
memoryUsedKb: 9800
pubDate: 2026-02-20
---

## Approach: Quickselect (Hoare's Selection)

The key insight is...
```

---

### Logs Collection

```typescript
const logs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/logs' }),
  schema: z.object({
    title: z.string().min(1),
    type: z.enum(['daily', 'weekly', 'project', 'problem']),
    tags: z.array(z.string()),
    mood: z.enum(['productive', 'learning', 'struggling', 'breakthrough']).optional(),
    hoursWorked: z.number().optional(),
    pubDate: z.coerce.date(),
  }),
});
```

**Example daily log:**
```yaml
---
title: "Portfolio Architecture Deep Dive"
type: "daily"
tags: ["astro", "architecture", "portfolio"]
mood: "productive"
hoursWorked: 4
pubDate: 2026-02-22
---

## What I Did Today

- Researched Astro 5 Content Layer API
- Wrote 10 Architecture Decision Records
- Designed HLD diagrams using Mermaid.js
```

## Querying Collections

```typescript
// In any .astro page
import { getCollection, render } from 'astro:content';

// Get all projects, sorted by date
const projects = (await getCollection('projects'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

// Get featured projects only
const featured = projects.filter(p => p.data.featured);

// Render markdown content for a single entry
const { Content } = await render(project);
```
