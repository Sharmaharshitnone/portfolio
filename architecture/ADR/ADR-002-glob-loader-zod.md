# ADR-002: `glob()` Loader + Zod Strict Schemas

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

Content collections need a data source strategy. Astro 5 offers:
- `glob()` — loads from file system using glob patterns
- `file()` — loads all entries from a single JSON/YAML file
- Custom loaders — fetch from external APIs/CMS

## Decision

Use `glob()` loader for all Markdown-based collections with **strict Zod schemas**.

### Why `glob()` Over `file()` or Custom Loaders

| Criteria | `glob()` | `file()` | Custom CMS Loader |
|---|---|---|---|
| One file per entry | ✅ Yes | ❌ All in one file | ✅ Yes |
| Git-friendly diffs | ✅ Individual file changes | ❌ Entire file changes | ❌ External |
| Auto `id` from filename | ✅ Yes | ❌ Manual `id` field | Varies |
| Markdown body support | ✅ Yes | ❌ Data only | Varies |
| Neovim workflow | ✅ Just create .md file | ❌ Edit JSON | ❌ Leave editor |
| Offline support | ✅ Full | ✅ Full | ❌ Needs network |

### Zod Schema Strategy

```typescript
// Strict: fails build if ANY field is missing or wrong type
schema: z.object({
  title: z.string().min(1),           // Required, non-empty
  pubDate: z.coerce.date(),           // Auto-parse date strings
  tags: z.array(z.string()),          // Required array
  featured: z.boolean().default(false), // Optional with default
  rating: z.number().optional(),       // Truly optional
})
```

**Rules:**
1. Every field that appears in templates MUST be in the schema
2. Use `.default()` for fields with sensible defaults
3. Use `.optional()` only for truly nullable fields
4. Use `z.enum()` for constrained values (prevents typos)
5. Use `z.coerce.date()` for date fields (handles ISO strings)

## Consequences

- All content files must have valid frontmatter or build fails
- Adding a new required field requires updating ALL existing .md files
- Schema changes require `astro sync` (or dev server `s + enter`)
- Migration: rename `slug` references to `id` throughout codebase

## References

- [Astro glob() loader reference](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader)
- [Zod documentation](https://zod.dev/)
