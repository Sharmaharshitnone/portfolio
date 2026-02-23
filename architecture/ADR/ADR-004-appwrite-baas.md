# ADR-004: Appwrite Cloud as Headless BaaS

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

The portfolio needs two runtime features: **page view tracking** and a **contact form**. These require a server-side data store.

## Decision

Use **Appwrite Cloud** (student account) as a micro-backend exclusively for runtime data.

### Why Appwrite Over Alternatives

| Criteria | Appwrite Cloud | Supabase | Firebase | Self-Hosted |
|---|---|---|---|---|
| Free tier | ✅ Student account | ✅ Free tier | ✅ Spark plan | ❌ Requires server |
| Tables API (2025) | ✅ Relational-style | ✅ PostgreSQL | ❌ NoSQL only | Varies |
| Web SDK | ✅ `appwrite` npm | ✅ `@supabase/supabase-js` | ✅ `firebase` | N/A |
| Server SDK | ✅ Node SDK | ✅ Node SDK | ✅ Admin SDK | N/A |
| Auth needed? | ❌ Not for portfolio | Overkill | Overkill | Overkill |
| Vendor lock-in | Low (self-hostable) | Medium | High | None |

**Appwrite wins because:** Student account, simple Tables API for two tables, no auth overhead, self-hostable escape hatch.

### 2025 API Changes

Appwrite renamed its API in 2025:
- **Collections → Tables**
- **Documents → Rows**
- **Attributes → Columns**

All architecture docs use the new terminology.

### Scope Restriction

Appwrite is used **only** for:
1. `PageViews` table — slug + view count
2. `ContactMessages` table — name, email, message, timestamp

Everything else (projects, algorithms, logs) is static Markdown — NOT in Appwrite.

### Integration Pattern

```typescript
// src/lib/appwrite.ts
import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.PUBLIC_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const DB_ID = import.meta.env.PUBLIC_APPWRITE_DB_ID;
```

## Consequences

- Appwrite SDK adds ~15KB to island bundles that use it (ContactForm, ViewCounter)
- Environment variables must be prefixed with `PUBLIC_` for client-side access
- No auth — contact form is public-facing (rate-limited by Cloudflare WAF)
- If Appwrite is down, pages still load (static HTML); only views/contact fail gracefully

## References

- [Appwrite Web SDK docs](https://appwrite.io/docs/sdks)
- [Appwrite + Astro starter](https://github.com/appwrite/starter-for-astro)
